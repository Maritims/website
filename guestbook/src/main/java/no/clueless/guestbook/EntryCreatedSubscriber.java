package no.clueless.guestbook;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;
import java.util.concurrent.Flow;

public class EntryCreatedSubscriber implements Flow.Subscriber<Entry> {
    private static final Logger            log = LoggerFactory.getLogger(EntryCreatedSubscriber.class);
    private              Flow.Subscription subscription;
    private final        String            senderEmailAddress;
    private final        String            recipientEmailAddress;
    private final        ObjectMapper      jsonMapper;

    public EntryCreatedSubscriber(String senderEmailAddress, String recipientEmailAddress, ObjectMapper jsonMapper) {
        if (senderEmailAddress == null || senderEmailAddress.isBlank()) {
            throw new IllegalArgumentException("senderEmailAddress cannot be null or blank");
        }
        if (recipientEmailAddress == null || recipientEmailAddress.isBlank()) {
            throw new IllegalArgumentException("recipientEmailAddress cannot be null or blank");
        }
        if (jsonMapper == null) {
            throw new IllegalArgumentException("jsonMapper cannot be null");
        }

        this.senderEmailAddress    = senderEmailAddress;
        this.recipientEmailAddress = recipientEmailAddress;
        this.jsonMapper            = jsonMapper;
    }

    @Override
    public void onSubscribe(Flow.Subscription subscription) {
        this.subscription = subscription;
    }

    @Override
    public void onNext(Entry entry) {
        try (var httpClient = HttpClient.newHttpClient()) {
            var httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .header("Authorization", "Bearer " + System.getenv("RESEND_API_KEY"))
                    .header("Content-Type", "application/json")
                    .method("POST", HttpRequest.BodyPublishers.ofString(jsonMapper.writeValueAsString(Map.of(
                            "from", senderEmailAddress,
                            "to", recipientEmailAddress,
                            "subject",
                            "foobar",
                            "html",
                            "<p>Yikes!</p>"
                    ))))
                    .build();
            var httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            if (httpResponse.statusCode() != 200) {
                log.error("Failed to send email notification: {}", httpResponse.body());
            } else {
                log.info("Sent email notification");
            }
        } catch (IOException | InterruptedException e) {
            log.error("Failed to send email notification", e);
        }

        subscription.request(1);
    }

    @Override
    public void onError(Throwable throwable) {
        log.error("Error in guestbook subscription", throwable);
    }

    @Override
    public void onComplete() {
        log.info("Guestbook subscription completed");
    }
}
