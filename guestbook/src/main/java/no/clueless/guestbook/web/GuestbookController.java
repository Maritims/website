package no.clueless.guestbook.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.javalin.http.Context;
import io.javalin.http.InternalServerErrorResponse;
import no.clueless.guestbook.Guestbook;
import org.altcha.altcha.Altcha;

public class GuestbookController {
    private final Guestbook guestbook;
    private final int       defaultPageSize;
    private final String    altchaHmacKey;

    public GuestbookController(Guestbook guestbook, ObjectMapper jsonMapper, int defaultPageSize, String altchaHmacKey) {
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

        this.guestbook       = guestbook;
        this.defaultPageSize = defaultPageSize;
        this.altchaHmacKey   = altchaHmacKey;
    }

    public void getEntries(Context ctx) {
        var pageNumber = ctx.queryParamAsClass("pageNumber", Integer.class).getOrDefault(0);
        var pageSize   = ctx.queryParamAsClass("pageSize", Integer.class).getOrDefault(defaultPageSize);
        ctx.json(guestbook.read(pageNumber, pageSize, "id", "desc"));
    }

    public void postEntry(Context ctx) {
        ctx.formParamAsClass("token", String.class).check(String::isBlank, "unable to process request").get();
        ctx.formParamAsClass("altcha", String.class).check(value -> {
            try {
                return Altcha.verifySolution(value, altchaHmacKey, true);
            } catch (Exception e) {
                throw new InternalServerErrorResponse("Failed to verify Altcha solution");
            }
        }, "verification failed").get();

        var name         = ctx.formParamAsClass("name", String.class).check(value -> !value.isBlank(), "name cannot be blank").get();
        var message      = ctx.formParamAsClass("message", String.class).check(value -> !value.isBlank(), "message cannot be blank").get();
        var createdEntry = guestbook.sign(name, message);
        ctx.json(createdEntry);
    }
}
