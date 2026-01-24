package no.clueless.guestbook.web;

public record CreateEntryDto(String name, String message, String token) {
    public CreateEntryDto {
        if(name == null || name.isBlank()) {
            throw new IllegalArgumentException("name cannot be null or blank");
        }
        if(message == null || message.isBlank()) {
            throw new IllegalArgumentException("message cannot be null or blank");
        }
        if(token != null) {
            throw new IllegalArgumentException("token cannot be set");
        }
    }
}
