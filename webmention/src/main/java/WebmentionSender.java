import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.SubmissionPublisher;
import java.util.stream.Collectors;

/**
 * A Webmention Sender implementation.
 */
public class WebmentionSender {
    private static final Logger                               log = LoggerFactory.getLogger(WebmentionSender.class);
    private final        HttpClient                           httpClient;
    private final        SubmissionPublisher<HttpResponse<?>> onReceiverNotifiedPublisher;
    private final        WebmentionEndpointDiscoverer         webmentionEndpointDiscoverer;

    public WebmentionSender(HttpClient httpClient, SubmissionPublisher<HttpResponse<?>> onReceiverNotifiedPublisher, WebmentionEndpointDiscoverer webmentionEndpointDiscoverer) {
        this.httpClient                   = httpClient;
        this.onReceiverNotifiedPublisher  = Objects.requireNonNull(onReceiverNotifiedPublisher, "onReceiverNotifiedPublisher cannot be null");
        this.webmentionEndpointDiscoverer = webmentionEndpointDiscoverer;
    }

    /*public void subscribeToReceiverNotified(Flow.Subscriber<HttpResponse<?>> subscriber) {
        if (subscriber == null) {
            throw new IllegalArgumentException("subscriber cannot be null");
        }
        onReceiverNotifiedPublisher.subscribe(subscriber);
    }*/

    /**
     * Fetches a response from the target URL.
     *
     * @param targetUrl The target URL to fetch.
     * @return The HTTP response.
     * @throws RuntimeException when no Content-Type header is returned, or the Content-Type header is not text/html, or the HTTP status code is not 200.
     */
    HttpResponse<String> fetch(String targetUrl) {
        var                  httpRequest = HttpRequest.newBuilder(URI.create(targetUrl)).GET().build();
        HttpResponse<String> httpResponse;
        try {
            httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
        } catch (IOException | InterruptedException e) {
            throw new RuntimeException("HTTP request to targetUrl " + targetUrl + " failed", e);
        }

        if (httpResponse.statusCode() != 200) {
            throw new UnexpectedStatusCodeException(targetUrl, httpResponse.statusCode());
        }

        var contentType = httpResponse.headers().firstValue("Content-Type").orElse(null);
        if (!"text/html".equalsIgnoreCase(contentType)) {
            throw new UnexpectedContentTypeException(targetUrl, contentType);
        }

        return httpResponse;
    }


    void notifyReceiver(String webmentionEndpoint, String sourceUrl, String targetUrl) {
        var formData    = Map.of("source", sourceUrl, "target", targetUrl);
        var encodedForm = formData.entrySet().stream().map(entry -> entry.getKey() + "=" + URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8)).collect(Collectors.joining("&"));
        var httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(webmentionEndpoint))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(encodedForm))
                .build();

        HttpResponse<Void> postResponse;
        try {
            postResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.discarding());
        } catch (IOException | InterruptedException e) {
            throw new RuntimeException("HTTP request to webmentionEndpoint " + webmentionEndpoint + " failed", e);
        }

        if (postResponse.statusCode() < 200 || postResponse.statusCode() > 299) {
            throw new UnexpectedStatusCodeException(webmentionEndpoint, postResponse.statusCode());
        }

        if (postResponse.statusCode() == 201) {
            var location = postResponse.headers().firstValue("Location").orElse(null);
            log.debug("Location: {}", location);
        }

        onReceiverNotifiedPublisher.submit(postResponse);
    }

    public void send(String sourceUrl, String targetUrl) {
        var webmentionEndpoint = webmentionEndpointDiscoverer.discover(targetUrl).orElseThrow(() -> new WebmentionEndpointNotFoundException(targetUrl));
        notifyReceiver(webmentionEndpoint, sourceUrl, targetUrl);
    }
}