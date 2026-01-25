package no.clueless.guestbook;

import no.clueless.guestbook.persistence.SqliteGuestbookRepository;

import java.util.List;
import java.util.concurrent.Flow;
import java.util.concurrent.SubmissionPublisher;

public class Guestbook {
    private final SqliteGuestbookRepository  guestbookRepository;
    private final SubmissionPublisher<Entry> entryCreatedPublisher;

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

    public Entry sign(String name, String message) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("name cannot be null or blank");
        }
        if (message == null || message.isBlank()) {
            throw new IllegalArgumentException("message cannot be null or blank");
        }

        var createdEntry = guestbookRepository.createEntry(Entry.newEntry(name, message));
        entryCreatedPublisher.submit(createdEntry);
        return createdEntry;
    }
}