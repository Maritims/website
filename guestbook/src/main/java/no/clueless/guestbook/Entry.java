package no.clueless.guestbook;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;
import java.util.Objects;

@JsonIgnoreProperties(ignoreUnknown = true)
public final class Entry {
    private Integer       id;
    private boolean       isApproved;
    private String        name;
    private String        message;
    private LocalDateTime timestamp;

    @SuppressWarnings("unused")
    public Entry() {}

    Entry(Integer id, boolean isApproved, String name, String message, LocalDateTime timestamp) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("name cannot be null or blank");
        }
        if (message == null || message.isBlank()) {
            throw new IllegalArgumentException("message cannot be null or blank");
        }
        if (timestamp == null) {
            throw new IllegalArgumentException("timestamp cannot be null");
        }

        this.id         = id;
        this.isApproved = isApproved;
        this.name       = name;
        this.message    = message;
        this.timestamp  = timestamp;
    }

    public static Entry newEntry(String name, String message) {
        return new Entry(null, false, name, message, LocalDateTime.now());
    }

    public static Entry existingEntry(Integer id, boolean isApproved, String name, String message, LocalDateTime timestamp) {
        return new Entry(id, isApproved, name, message, timestamp);
    }

    public Integer getId() {
        return id;
    }

    public boolean isApproved() {
        return isApproved;
    }

    public String getName() {
        return name;
    }

    public String getMessage() {
        return message;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public void setApproved(boolean approved) {
        isApproved = approved;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Entry entry = (Entry) o;
        return isApproved == entry.isApproved && Objects.equals(id, entry.id) && Objects.equals(name, entry.name) && Objects.equals(message, entry.message) && Objects.equals(timestamp, entry.timestamp);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, isApproved, name, message, timestamp);
    }

    @Override
    public String toString() {
        return "Entry{" +
                "id=" + id +
                ", isApproved=" + isApproved +
                ", name='" + name + '\'' +
                ", message='" + message + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}
