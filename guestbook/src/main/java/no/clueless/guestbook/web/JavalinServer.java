package no.clueless.guestbook.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.javalin.Javalin;
import io.javalin.http.ForbiddenResponse;
import io.javalin.json.JavalinJackson;

import java.util.Set;

public class JavalinServer {
    private final AltchaController    altchaController;
    private final GuestbookController guestbookController;
    private final Set<String>         allowedOrigin;
    private final ObjectMapper        jsonMapper;

    public JavalinServer(AltchaController altchaController, GuestbookController guestbookController, Set<String> allowedOrigin, ObjectMapper jsonMapper) {
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
        this.jsonMapper          = jsonMapper;
    }

    public Javalin create() {
        return Javalin.create(config -> {
                    if (jsonMapper != null) {
                        config.jsonMapper(new JavalinJackson(jsonMapper, true));
                    }
                    config.bundledPlugins.enableCors(cors -> cors.addRule(rule -> allowedOrigin.forEach(rule::allowHost)));
                })
                .before(ctx -> {
                    var origin = ctx.header("Origin");
                    if (origin == null || !allowedOrigin.contains(origin)) {
                        throw new ForbiddenResponse();
                    }
                })
                .get("/altcha", altchaController::createChallenge)
                .get("/entries", guestbookController::getEntries)
                .post("/entries", guestbookController::postEntry);
    }
}
