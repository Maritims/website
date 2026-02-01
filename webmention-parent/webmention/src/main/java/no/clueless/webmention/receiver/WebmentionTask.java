package no.clueless.webmention.receiver;

public record WebmentionTask(String source, String target) {
    public WebmentionTask {
        if (source == null) {
            throw new IllegalArgumentException("source cannot be null");
        }
        if (target == null) {
            throw new IllegalArgumentException("target cannot be null");
        }
    }
}
