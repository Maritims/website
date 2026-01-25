package no.clueless.guestbook.web;

import io.javalin.http.Context;
import org.altcha.altcha.Altcha;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class AltchaController {
    private static final Logger log = LoggerFactory.getLogger(AltchaController.class);
    private final        String altchaHmacKey;

    public AltchaController(String altchaHmacKey) {
        if (altchaHmacKey == null || altchaHmacKey.isBlank()) {
            throw new IllegalArgumentException("altchaHmacKey cannot be null or blank");
        }

        this.altchaHmacKey = altchaHmacKey;
    }

    public void createChallenge(Context ctx) {
        var challengeOptions = new Altcha.ChallengeOptions()
                .setMaxNumber(100000L)
                .setHmacKey(altchaHmacKey)
                .setExpiresInSeconds(1000);
        try {
            var challenge = Altcha.createChallenge(challengeOptions);
            ctx.json(challenge);
        } catch (Exception e) {
            log.error("Failed to create Altcha challenge", e);
            ctx.status(500);
        }
    }
}
