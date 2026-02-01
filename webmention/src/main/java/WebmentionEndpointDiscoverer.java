import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpHeaders;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;
import java.util.regex.Pattern;

public class WebmentionEndpointDiscoverer {
    private final HttpClient httpClient;

    public WebmentionEndpointDiscoverer(HttpClient httpClient) {
        this.httpClient = Objects.requireNonNull(httpClient, "httpClient cannot be null");
    }

    Document parseHtml(String html) {
        if (html == null || html.isBlank()) {
            throw new IllegalArgumentException("html cannot be null or blank");
        }
        return Jsoup.parse(html);
    }

    protected Optional<String> findInHeaders(HttpHeaders httpHeaders) {
        return Objects.requireNonNull(httpHeaders, "httpHeaders cannot be null")
                .map()
                .entrySet()
                .stream()
                .filter(entry -> "link".equalsIgnoreCase(entry.getKey()))
                .map(Map.Entry::getValue)
                .flatMap(Collection::stream)
                .flatMap(header -> Arrays.stream(header.split(",")).map(String::trim))
                .filter(header -> {
                    var pattern = Pattern.compile("rel=\"?([^\";]+)\"?$");
                    var matcher = pattern.matcher(header);

                    if (matcher.find()) {
                        var value  = matcher.group(1);
                        var tokens = Arrays.asList(value.split("\\s+"));
                        return tokens.contains("webmention");
                    }

                    return false;
                })
                .findFirst()
                .map(header -> header.substring(header.indexOf("<") + 1, header.indexOf(">")));
    }

    protected Optional<String> findInHtml(Document document) {
        return Objects.requireNonNull(document, "document cannot be null")
                .select("a[rel*=webmention], link[rel*=webmention]")
                .stream()
                .filter(link -> {
                    var rel    = link.attr("rel").toLowerCase();
                    var tokens = Arrays.asList(rel.split("\\s+"));
                    return tokens.contains("webmention");
                })
                .map(link -> link.attr("href"))
                .findFirst();
    }

    public Optional<String> discover(String targetUrl) {
        var targetUri = URI.create(targetUrl);
        var httpRequest = HttpRequest.newBuilder()
                .uri(targetUri)
                .GET()
                .build();

        HttpResponse<String> httpResponse;
        try {
            httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
        } catch (IOException | InterruptedException e) {
            throw new RuntimeException("HTTP request to targetUrl " + targetUrl + " failed", e);
        }

        var contentType = httpResponse.headers()
                .map()
                .entrySet()
                .stream()
                .filter(entry -> "content-type".equalsIgnoreCase(entry.getKey()))
                .flatMap(entry -> entry.getValue().stream())
                .findFirst()
                .orElseThrow(() -> new RuntimeException("HTTP response from targetUrl " + targetUrl + " did not contain a Content-Type header"));
        if(!"text/html".equalsIgnoreCase(contentType)) {
            throw new UnexpectedContentTypeException(targetUrl, contentType);
        }

        return findInHeaders(httpResponse.headers())
                .or(() -> {
                    var document = parseHtml(httpResponse.body());
                    return findInHtml(document);
                })
                .map(webmentionEndpoint -> {
                    if (webmentionEndpoint.isBlank()) {
                        return targetUrl;
                    }

                    if(URI.create(webmentionEndpoint).isAbsolute()) {
                        return webmentionEndpoint;
                    }

                    return webmentionEndpoint.startsWith("/") ? targetUri.getScheme() + "://" + targetUri.getAuthority() + webmentionEndpoint : targetUrl + "/" + webmentionEndpoint;
                });
    }
}
