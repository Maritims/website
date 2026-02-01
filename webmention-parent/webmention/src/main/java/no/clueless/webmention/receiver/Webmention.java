package no.clueless.webmention.receiver;

import java.util.Objects;

public record Webmention(String targetUrl, String sourceUrl, String text) {
    public Webmention {
        Objects.requireNonNull(targetUrl, "targetUrl cannot be null");
        Objects.requireNonNull(sourceUrl, "sourceUrl cannot be null");
        Objects.requireNonNull(text, "text cannot be null");
    }
}
