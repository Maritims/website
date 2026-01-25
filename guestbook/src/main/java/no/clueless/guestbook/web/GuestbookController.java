package no.clueless.guestbook.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.util.NaiveRateLimit;
import no.clueless.guestbook.Guestbook;
import org.altcha.altcha.Altcha;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;
import java.util.concurrent.TimeUnit;

public class GuestbookController {
    private static final Logger log = LoggerFactory.getLogger(GuestbookController.class);
    private final Guestbook guestbook;
    private final int       defaultPageSize;
    private final String    altchaHmacKey;
    private final int       maximumSubmissionsPerUserPerMinute;

    public GuestbookController(Guestbook guestbook, ObjectMapper jsonMapper, int defaultPageSize, String altchaHmacKey, int maximumSubmissionsPerUserPerMinute) {
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
        if (maximumSubmissionsPerUserPerMinute < 1) {
            throw new IllegalArgumentException("maximumSubmissionsPerUserPerMinute must be greater than 0");
        }

        this.guestbook                          = guestbook;
        this.defaultPageSize                    = defaultPageSize;
        this.altchaHmacKey                      = altchaHmacKey;
        this.maximumSubmissionsPerUserPerMinute = maximumSubmissionsPerUserPerMinute;
    }

    public void getEntries(Context ctx) {
        var totalEntries = guestbook.getTotalEntries();
        var page         = ctx.queryParamAsClass("page", Integer.class).getOrDefault(0);
        var totalPages   = Math.ceil((double) totalEntries / defaultPageSize);
        var entries      = guestbook.read(page, defaultPageSize, "id", "desc");

        ctx.json(Map.of(
                "entries", entries,
                "totalEntries", totalEntries,
                "totalPages", totalPages,
                "currentPage", page,
                "size", defaultPageSize
        ));
    }

    public void postEntry(Context ctx) {
        NaiveRateLimit.requestPerTimeUnit(ctx, maximumSubmissionsPerUserPerMinute, TimeUnit.MINUTES);

        var postEntryrequest = ctx.bodyValidator(PostEntryRequest.class)
                .check(request -> request.token() == null || request.token().isEmpty(), "unable to process request")
                .check(request -> request.name() != null && !request.name().isBlank(), "name cannot be null or blank")
                .check(request -> request.message() != null && !request.message().isBlank(), "message cannot be null or blank")
                .check(request -> request.altcha() != null && !request.altcha().isBlank(), "altcha cannot be null or blank")
                .check(request -> {
                    try {
                        var result = Altcha.verifySolution(request.altcha(), altchaHmacKey, true);
                        if(!result) {
                            log.warn("Altcha solution was invalid. Someone is trying to spoof the guestbook.");
                        }
                        return result;
                    } catch (Exception e) {
                        log.error("An exception occurred while verifying the Altcha solution", e);
                        throw new BadRequestResponse("unable to process request");
                    }
                }, "unable to process request")
                .get();

        var createdEntry = guestbook.sign(postEntryrequest.name(), postEntryrequest.message());
        ctx.json(createdEntry);
    }

    public record PostEntryRequest(String name, String message, String altcha, String token) {
        public PostEntryRequest {
            if (name == null || name.isBlank()) {
                throw new IllegalArgumentException("name cannot be null or blank");
            }
            if (message == null || message.isBlank()) {
                throw new IllegalArgumentException("message cannot be null or blank");
            }
            if (altcha == null || altcha.isBlank()) {
                throw new IllegalArgumentException("altcha cannot be null or blank");
            }
            if (token != null && !token.isBlank()) {
                throw new IllegalArgumentException("token must be null or blank");
            }
        }
    }
}
