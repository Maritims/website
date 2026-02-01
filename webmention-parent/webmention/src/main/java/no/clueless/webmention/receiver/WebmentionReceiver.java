package no.clueless.webmention.receiver;

import no.clueless.webmention.UnexpectedStatusCodeException;
import no.clueless.webmention.WebmentionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Objects;

/**
 * A no.clueless.webmention.receiver.Webmention Receiver implementation.
 */
public class WebmentionReceiver {
    private static final Logger                    log = LoggerFactory.getLogger(WebmentionReceiver.class);
    private final        HttpClient                httpClient;
    private final        WebmentionRequestVerifier webmentionRequestVerifier;

    public WebmentionReceiver(HttpClient httpClient, WebmentionRequestVerifier webmentionRequestVerifier) {
        this.httpClient                = Objects.requireNonNull(httpClient, "httpClient cannot be null");
        this.webmentionRequestVerifier = Objects.requireNonNull(webmentionRequestVerifier, "requestVerifier cannot be null");
    }

    public void receive(String sourceUrl, String targetUrl) throws WebmentionException {
        if (!webmentionRequestVerifier.verify(sourceUrl, targetUrl)) {
            throw new WebmentionException("Request from sourceUrl " + sourceUrl + " to targetUrl " + targetUrl + " did not pass verification");
        }

        var                  httpRequest = HttpRequest.newBuilder().uri(URI.create(sourceUrl)).GET().build();
        HttpResponse<String> httpResponse;
        try {
            httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
        } catch (IOException | InterruptedException e) {
            throw new RuntimeException("HTTP request to sourceUrl " + sourceUrl + " failed", e);
        }

        if (httpResponse.statusCode() != 200) {
            throw new UnexpectedStatusCodeException(sourceUrl, httpResponse.statusCode());
        }

        var contentType = httpResponse.headers()
                .map()
                .entrySet()
                .stream()
                .filter(entry -> "content-type".equalsIgnoreCase(entry.getKey()))
                .flatMap(entry -> entry.getValue().stream())
                .findFirst()
                .orElseThrow(() -> new RuntimeException("HTTP request to sourceUrl " + sourceUrl + " did not return a Content-Type header"));

        var sourceScanner = WebmentionSourceScanner.resolve(contentType);
        var mention       = sourceScanner.scan(httpResponse.body(), targetUrl).orElseThrow(() -> new WebmentionException("The target URL " + targetUrl + " is not mentioned in the document at source URL " + sourceUrl));
        var webmention    = new Webmention(targetUrl, sourceUrl, mention);

        log.info(webmention.toString());
    }
}
