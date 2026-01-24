package no.clueless.guestbook.web;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.HexFormat;
import java.util.Map;

import io.javalin.http.Context;

import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;

public class AltchaController {
    private static final String       HMAC_ALGORITHM     = "HmacSHA256";
    private static final String       RESPONSE_ALGORITHM = "SHA-256";
    private static final int          SALT_LENGTH        = 16;
    private static final int          MAX_RANDOM_NUMBER  = 100_000;
    private static final SecureRandom SECURE_RANDOM      = new SecureRandom();

    private final String altchaHmacKey;

    public AltchaController(String altchaHmacKey) {
        if (altchaHmacKey == null || altchaHmacKey.isBlank()) {
            throw new IllegalArgumentException("altchaHmacKey cannot be null or blank");
        }

        this.altchaHmacKey = altchaHmacKey;
    }

    public void getChallenge(Context ctx) {
        var secretKey = new SecretKeySpec(altchaHmacKey.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM);
        var saltBytes = new byte[SALT_LENGTH];
        SECURE_RANDOM.nextBytes(saltBytes);
        var salt   = HexFormat.of().formatHex(saltBytes);
        var number = SECURE_RANDOM.nextInt(MAX_RANDOM_NUMBER);

        var challenge = computeHmacHex(secretKey, salt + number);
        var signature = computeHmacHex(secretKey, challenge);

        ctx.json(Map.of(
                "algorithm", RESPONSE_ALGORITHM,
                "challenge", challenge,
                "salt", salt,
                "signature", signature
        ));
    }

    private static String computeHmacHex(Key secretKey, String data) {
        try {
            var mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(secretKey);
            byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bytes);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new IllegalStateException("Failed to compute HMAC for Altcha challenge", e);
        }
    }
}
