package no.clueless.guestbook;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import no.clueless.guestbook.persistence.SqliteGuestbookRepository;
import no.clueless.guestbook.web.AltchaController;
import no.clueless.guestbook.web.GuestbookController;
import no.clueless.guestbook.web.JavalinServer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Optional;
import java.util.concurrent.SubmissionPublisher;

public class Application {
    private static final Logger log = LoggerFactory.getLogger(Application.class);

    public static void main(String[] args) {
        final var serverPort                  = Optional.ofNullable(System.getenv("SERVER_PORT")).filter(property -> !property.isBlank()).map(Integer::parseInt).orElse(8080);
        final var connectionString            = Optional.ofNullable(System.getenv("CONNECTION_STRING")).filter(property -> !property.isBlank()).orElse("jdbc:sqlite:guestbook.db");
        final var defaultPageSize             = Optional.ofNullable(System.getenv("DEFAULT_PAGE_SIZE")).filter(property -> !property.isBlank()).map(Integer::parseInt).orElse(10);
        final var altchaHmacKey               = Optional.ofNullable(System.getenv("ALTCHA_HMAC_KEY")).filter(property -> !property.isBlank()).orElseThrow(() -> new IllegalStateException("ALTCHA_HMAC_KEY must be set"));
        final var senderEmailAddress          = Optional.ofNullable(System.getenv("SENDER_EMAIL_ADDRESS")).filter(property -> !property.isBlank()).orElseThrow(() -> new IllegalStateException("SENDER_EMAIL_ADDRESS must be set"));
        final var recipientEmailAddress       = Optional.ofNullable(System.getenv("RECIPIENT_EMAIL_ADDRESS")).filter(property -> !property.isBlank()).orElseThrow(() -> new IllegalStateException("RECIPIENT_EMAIL_ADDRESS must be set"));
        final var isAltchaVerificationEnabled = Optional.ofNullable(System.getenv("IS_ALTCHA_VERIFICATION_ENABLED")).filter(property -> !property.isBlank()).map(Boolean::parseBoolean).orElse(false);
        final var jsonMapper                  = new ObjectMapper().registerModule(new JavaTimeModule());

        log.info("Starting application with settings:");
        log.info("SERVER_PORT: {}", serverPort);
        log.info("DEFAULT_PAGE_SIZE: {}", defaultPageSize);
        log.info("SENDER_EMAIL_ADDRESS: {}", senderEmailAddress);
        log.info("RECIPIENT_EMAIL_ADDRESS: {}", recipientEmailAddress);


        var entrySubmissionPublisher = new SubmissionPublisher<Entry>();
        var guestbookRepository      = new SqliteGuestbookRepository(connectionString);
        var guestbook                = new Guestbook(guestbookRepository, entrySubmissionPublisher);
        var guestbookController      = new GuestbookController(guestbook, jsonMapper, defaultPageSize, altchaHmacKey, isAltchaVerificationEnabled);
        var altchaController         = new AltchaController(altchaHmacKey);
        var javalinServer            = new JavalinServer(altchaController, guestbookController);

        guestbookRepository.initialize();
        guestbook.subscribeToEntryCreated(new EntryCreatedSubscriber(senderEmailAddress, recipientEmailAddress, jsonMapper));
        javalinServer.create().start(serverPort);
    }
}