package no.clueless.webmention_javalin;

import io.javalin.http.Context;

import java.util.Objects;

public record WebmentionContext(Context ctx, WebmentionConfig config) {
    public WebmentionContext {
        Objects.requireNonNull(ctx, "ctx cannot be null");
        Objects.requireNonNull(config, "config cannot be null");
    }

    public void send(String source, String target) {
        Objects.requireNonNull(source, "source cannot be null");
        Objects.requireNonNull(target, "target cannot be null");
        config.getSender().send(source, target);
    }
}