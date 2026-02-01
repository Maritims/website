package no.clueless.webmention.receiver;

@FunctionalInterface
public interface WebmentionPersistence {
    Webmention persist(Webmention webmention);
}
