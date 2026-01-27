package no.clueless.guestbook.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.javalin.Javalin;
import io.javalin.http.ForbiddenResponse;
import io.javalin.json.JavalinJackson;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Optional;
import java.util.Set;

public class JavalinServer {
    private static final Logger              log = LoggerFactory.getLogger(JavalinServer.class);
    private final        AltchaController    altchaController;
    private final        GuestbookController guestbookController;
    private final        Set<String>         allowedOrigin;
    private final        Set<String>         allowedReferrers;
    private final        ObjectMapper        jsonMapper;

    public JavalinServer(AltchaController altchaController, GuestbookController guestbookController, Set<String> allowedOrigin, Set<String> allowedReferrers, ObjectMapper jsonMapper) {
        this.allowedReferrers = allowedReferrers;
        if (altchaController == null) {
            throw new IllegalArgumentException("altchaController cannot be null");
        }
        if (guestbookController == null) {
            throw new IllegalArgumentException("guestbookController cannot be null");
        }
        if (allowedOrigin == null || allowedOrigin.isEmpty()) {
            throw new IllegalArgumentException("allowedOrigin cannot be null or empty");
        }
        if (allowedReferrers == null || allowedReferrers.isEmpty()) {
            throw new IllegalArgumentException("allowedReferrers cannot be null or empty");
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
                    var referer = ctx.header("Referer");
                    if (referer == null || !allowedReferrers.contains(referer)) {
                        log.warn("Received request without allowed referer ({}) from {}", referer, Optional.ofNullable(ctx.header("X-Real-IP")).filter(value -> !value.isBlank()).orElse(ctx.ip()));
                        throw new ForbiddenResponse();
                    }
                })
                .get("/altcha", altchaController::createChallenge)
                .get("/entries", guestbookController::getEntries)
                .post("/entries", guestbookController::postEntry);
    }
}
