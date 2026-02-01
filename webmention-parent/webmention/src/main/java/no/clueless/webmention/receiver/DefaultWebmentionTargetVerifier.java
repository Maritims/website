package no.clueless.webmention.receiver;

import no.clueless.webmention.WebmentionEndpointDiscoverer;
import no.clueless.webmention.WebmentionException;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Objects;
import java.util.Set;

public class DefaultWebmentionTargetVerifier implements WebmentionTargetVerifier {
    private final Set<String>                  supportedDomains;
    private final HttpClient                   httpClient;
    private final WebmentionEndpointDiscoverer discoverer;

    public DefaultWebmentionTargetVerifier(Set<String> supportedDomains, HttpClient httpClient, WebmentionEndpointDiscoverer discoverer) {
        this.supportedDomains = Objects.requireNonNull(supportedDomains, "supportedDomains cannot be null");
        if (supportedDomains.isEmpty()) {
            throw new IllegalArgumentException("supportedDomains cannot be empty");
        }
        this.httpClient = Objects.requireNonNull(httpClient, "httpClient cannot be null");
        this.discoverer = Objects.requireNonNull(discoverer, "discoverer cannot be null");
    }

    private HttpResponse<String> fetch(URI uri) throws WebmentionException {
        var httpRequest = HttpRequest.newBuilder()
                .uri(uri)
                .GET()
                .build();

        HttpResponse<String> httpResponse;
        try {
            httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
        } catch (IOException | InterruptedException e) {
            throw new WebmentionException("HTTP request to URL " + uri + " failed", e);
        }

        if (httpResponse.statusCode() != 200) {
            throw new WebmentionException("URL " + uri + " returned an unexpected status code: " + httpResponse.statusCode());
        }

        return httpResponse;
    }

    @Override
    public boolean verify(URI targetUri) throws WebmentionException {
        if (!supportedDomains.contains(targetUri.getHost())) {
            throw new WebmentionException("Target host " + targetUri.getHost() + " is not supported");
        }

        var httpResponse = fetch(targetUri);
        discoverer.discover(targetUri, httpResponse).orElseThrow(() -> new WebmentionException("Target URL " + targetUri + " does not accept webmentions"));

        return true;
    }
}
