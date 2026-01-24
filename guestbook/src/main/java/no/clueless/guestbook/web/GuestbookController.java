package no.clueless.guestbook.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.javalin.http.Context;
import no.clueless.guestbook.Entry;
import no.clueless.guestbook.Guestbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Map;

public class GuestbookController {
    private final static Logger       log = LoggerFactory.getLogger(GuestbookController.class);
    private final        Guestbook    guestbook;
    private final        ObjectMapper jsonMapper;
    private final        int          defaultPageSize;
    private final        String       altchaHmacKey;
    private final        boolean      isAltchaVerificationEnabled;

    public GuestbookController(Guestbook guestbook, ObjectMapper jsonMapper, int defaultPageSize, String altchaHmacKey, boolean isAltchaVerificationEnabled) {
        if (guestbook == null) {
            throw new IllegalArgumentException("guestbook cannot be null");
        }
        if (jsonMapper == null) {
            throw new IllegalArgumentException("jsonMapper cannot be null");
        }
        if (defaultPageSize < 1) {
            throw new IllegalArgumentException("defaultPageSize must be greater than 0");
        }
        if (altchaHmacKey == null || altchaHmacKey.isBlank()) {
            throw new IllegalArgumentException("altchaHmacKey cannot be null or blank");
        }

        this.guestbook                   = guestbook;
        this.jsonMapper                  = jsonMapper;
        this.defaultPageSize             = defaultPageSize;
        this.altchaHmacKey               = altchaHmacKey;
        this.isAltchaVerificationEnabled = isAltchaVerificationEnabled;
    }

    /**
     * Verifies the Altcha payload provided in the HTTP request header.
     * The method validates the payload's signature and challenge using HMAC-SHA256
     * to ensure it adheres to the expected cryptographic requirements.
     *
     * @param ctx the HTTP request context that contains the "x-altcha" header.
     * @return true if the Altcha payload is successfully verified, or if Altcha verification
     *         is disabled; false if the payload is invalid or verification fails.
     */
    protected boolean isAltchaPayloadVerified(Context ctx) {
        if (!isAltchaVerificationEnabled) {
            return true;
        }

        var altchaPayload = ctx.header("x-altcha");
        if (altchaPayload == null || altchaPayload.isBlank()) {
            ctx.status(400).result("x-altcha header missing or blank");
            return false;
        }

        try {
            var decoded   = jsonMapper.readValue(Base64.getDecoder().decode(altchaPayload), Map.class);
            var algorithm = (String) decoded.get("algorithm");
            var challenge = (String) decoded.get("challenge");
            var salt      = (String) decoded.get("salt");
            var signature = (String) decoded.get("signature");
            var number    = ((Number) decoded.get("number")).intValue();

            if (!"SHA-256".equals(algorithm)) {
                ctx.status(400).result("Invalid Altcha algorithm");
                return false;
            }

            var mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(altchaHmacKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));

            // Verify signature
            var expectedSignature = HexFormat.of().formatHex(mac.doFinal(challenge.getBytes(StandardCharsets.UTF_8)));
            if (!expectedSignature.equals(signature)) {
                ctx.status(400).result("Invalid Altcha signature");
                return false;
            }

            // Verify the challenge
            var challengeBytes    = mac.doFinal((salt + number).getBytes(StandardCharsets.UTF_8));
            var expectedChallenge = HexFormat.of().formatHex(challengeBytes);
            if (!expectedChallenge.equals(challenge)) {
                ctx.status(400).result("Invalid Altcha challenge");
                return false;
            }

        } catch (Exception e) {
            log.error("Altcha verification failed", e);
            ctx.status(400).result("Altcha verification failed");
            return false;
        }

        return true;
    }

    public void getEntries(Context ctx) {
        var pageNumber = ctx.queryParamAsClass("pageNumber", Integer.class).getOrDefault(0);
        var pageSize   = ctx.queryParamAsClass("pageSize", Integer.class).getOrDefault(defaultPageSize);
        ctx.json(guestbook.read(pageNumber, pageSize, "id", "desc"));
    }

    public void postEntry(Context ctx) {
        if (!isAltchaPayloadVerified(ctx)) {
            return;
        }

        var bodyAsEntry = ctx.bodyValidator(Entry.class)
                .check(entry -> entry.getId() == null, "id must be null")
                .check(entry -> entry.getName() != null && !entry.getName().isBlank(), "name cannot be null or blank")
                .check(entry -> entry.getMessage() != null && !entry.getMessage().isBlank(), "message cannot be null or blank")
                .get();
        var createdEntry = guestbook.sign(bodyAsEntry.getName(), bodyAsEntry.getMessage());
        ctx.json(createdEntry);
    }
}
