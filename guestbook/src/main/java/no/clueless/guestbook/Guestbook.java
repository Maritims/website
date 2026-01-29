package no.clueless.guestbook;

import no.clueless.guestbook.persistence.SqliteGuestbookRepository;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.Flow;
import java.util.concurrent.SubmissionPublisher;

public class Guestbook {
    private static final Logger                     log = LoggerFactory.getLogger(Guestbook.class);
    private final        SqliteGuestbookRepository  guestbookRepository;
    private final        SubmissionPublisher<Entry> entryCreatedPublisher;

    public Guestbook(SqliteGuestbookRepository guestbookRepository, SubmissionPublisher<Entry> entryCreatedPublisher) {
        if (guestbookRepository == null) {
            throw new IllegalArgumentException("guestbookRepository cannot be null");
        }
        if (entryCreatedPublisher == null) {
            throw new IllegalArgumentException("entryCreatedPublisher cannot be null");
        }

        this.guestbookRepository   = guestbookRepository;
        this.entryCreatedPublisher = entryCreatedPublisher;
    }

    public void subscribeToEntryCreated(Flow.Subscriber<Entry> subscriber) {
        if (subscriber == null) {
            throw new IllegalArgumentException("subscriber cannot be null");
        }
        entryCreatedPublisher.subscribe(subscriber);
    }

    public List<Entry> read(int pageNumber, int pageSize, String orderByColumn, String orderDirection) {
        if (pageNumber < 0) {
            throw new IllegalArgumentException("pageNumber must be greater than or equal to 0");
        }
        if (pageSize < 1) {
            throw new IllegalArgumentException("pageSize must be greater than 0");
        }
        if (orderByColumn == null || orderByColumn.isBlank()) {
            throw new IllegalArgumentException("orderByColumn cannot be null or blank");
        }
        if (orderDirection == null || !orderDirection.equalsIgnoreCase("asc") && !orderDirection.equalsIgnoreCase("desc")) {
            throw new IllegalArgumentException("orderDirection must be either asc or desc");
        }

        return guestbookRepository.getApprovedEntries(pageNumber, pageSize, orderByColumn, orderDirection);
    }

    public Long getTotalEntries() {
        return guestbookRepository.getNumberOfApprovedEntries();
    }

    /**
     * Sign the guestbook.
     *
     * @param name    The name of the author.
     * @param message The message from the author.
     * @return The created entry, or {@link Optional#empty()} if cleaning the name and/or message resulted in empty strings.
     */
    public Optional<Entry> sign(String name, String message) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("name cannot be null or blank");
        }
        if (message == null || message.isBlank()) {
            throw new IllegalArgumentException("message cannot be null or blank");
        }

        var cleanName = Jsoup.clean(name, Safelist.none());
        if (cleanName.isBlank()) {
            log.info("Cleaning name ({}) resulted in a blank string. Entry will not be created.", name);
            return Optional.empty();
        }

        var cleanMessage = Jsoup.clean(message, Safelist.none());
        if (cleanMessage.isBlank()) {
            log.info("Cleaning message ({}) resulted in a blank string. Entry will not be created.", message);
            return Optional.empty();
        }

        var createdEntry = guestbookRepository.createEntry(Entry.newEntry(cleanName, cleanMessage));
        entryCreatedPublisher.submit(createdEntry);
        return Optional.ofNullable(createdEntry);
    }
}