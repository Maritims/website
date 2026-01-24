package no.clueless.guestbook.web;

import io.javalin.Javalin;
import io.javalin.http.ForbiddenResponse;

import java.util.Arrays;
import java.util.Set;

public class JavalinServer {
    private final AltchaController    altchaController;
    private final GuestbookController guestbookController;
    private final Set<String>         allowedOrigin;

    public JavalinServer(AltchaController altchaController, GuestbookController guestbookController, Set<String> allowedOrigin) {
        if (altchaController == null) {
            throw new IllegalArgumentException("altchaController cannot be null");
        }
        if (guestbookController == null) {
            throw new IllegalArgumentException("guestbookController cannot be null");
        }
        if (allowedOrigin == null || allowedOrigin.isEmpty()) {
            throw new IllegalArgumentException("allowedOrigin cannot be null or empty");
        }

        this.altchaController    = altchaController;
        this.guestbookController = guestbookController;
        this.allowedOrigin       = allowedOrigin;
    }

    public Javalin create() {
        return Javalin.create(config -> config.bundledPlugins.enableCors(cors -> cors.addRule(rule -> allowedOrigin.forEach(rule::allowHost))))
                .before(ctx -> {
                    var origin = ctx.header("Origin");
                    if (origin == null || !allowedOrigin.contains(origin)) {
                        throw new ForbiddenResponse();
                    }
                })
                .get("/altcha", altchaController::getChallenge)
                .get("/entries", guestbookController::getEntries)
                .post("/entries", guestbookController::postEntry);
    }
}
