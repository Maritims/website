package no.clueless.webmention.receiver;

import java.util.Optional;

@FunctionalInterface
public interface WebmentionSourceScanner {
    Optional<String> scan(String body, String targetUrl);

    static WebmentionSourceScanner resolve(String contentType) {
        return switch (contentType.toLowerCase()) {
            case "text/html" -> new WebmentionHtmlSourceScanner();
            case "text/plain" -> new WebmentionTextSourceScanner();
            case "application/json" -> new WebmentionJsonSourceScanner();
            default -> throw new IllegalArgumentException("Unsupported content type: " + contentType);
        };
    }
}
