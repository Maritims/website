package no.clueless.guestbook.web;

import io.javalin.Javalin;
import io.javalin.plugin.bundled.CorsPluginConfig;

public class JavalinServer {
    private final AltchaController    altchaController;
    private final GuestbookController guestbookController;

    public JavalinServer(AltchaController altchaController, GuestbookController guestbookController) {
        if (altchaController == null) {
            throw new IllegalArgumentException("altchaController cannot be null");
        }
        if (guestbookController == null) {
            throw new IllegalArgumentException("guestbookController cannot be null");
        }

        this.altchaController    = altchaController;
        this.guestbookController = guestbookController;
    }

    public Javalin create() {
        return Javalin.create(config -> config.bundledPlugins.enableCors(cors -> cors.addRule(CorsPluginConfig.CorsRule::anyHost)))
                .get("/altcha", altchaController::getChallenge)
                .get("/entries", guestbookController::getEntries)
                .post("/entries", guestbookController::postEntry);
    }
}
