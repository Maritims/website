package no.clueless.webmention_cli;

import no.clueless.webmention.event.WebmentionEvent;
import no.clueless.webmention.http.SecureHttpClient;
import no.clueless.webmention.receiver.WebmentionHtmlSourceScanner;
import no.clueless.webmention.sender.WebmentionSender;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.net.http.HttpClient;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

public class WebmentionCli {
    private static final Logger log = LoggerFactory.getLogger(WebmentionCli.class);
    private final WebmentionDirectoryWalker webmentionDirectoryWalker;
    private final WebmentionSender          webmentionSender;

    public WebmentionCli(WebmentionDirectoryWalker webmentionDirectoryWalker, WebmentionSender webmentionSender) {
        this.webmentionDirectoryWalker = Objects.requireNonNull(webmentionDirectoryWalker, "webmentionDirectoryWalker cannot be null");
        this.webmentionSender          = Objects.requireNonNull(webmentionSender, "webmentionSender cannot be null");
    }

    public WebmentionCli() {
        this(
                new WebmentionDirectoryWalker(new WebmentionHtmlSourceScanner()),
                new WebmentionSender(
                        new SecureHttpClient(HttpClient.newBuilder().build(),
                        1024 * 1024 * 1024),
                        null,
                        null
                )
        );
    }

    public Set<WebmentionEvent> findWebmentionEvents(URI baseUri, Path rootDir) {
        Objects.requireNonNull(baseUri, "baseUri cannot be null");
        Objects.requireNonNull(rootDir, "rootDir cannot be null");

        return webmentionDirectoryWalker.walk(baseUri, rootDir, new HashSet<>());
    }

    public void sendWebmention(WebmentionEvent webmentionEvent) {
        webmentionSender.send(webmentionEvent.sourceUrl(), webmentionEvent.targetUrl());
    }

    public void sendWebmentions(Set<WebmentionEvent> webmentionEvents) {
        webmentionEvents.forEach(webmentionEvent -> {
            try {
                sendWebmention(webmentionEvent);
            }
            catch (Exception e) {
                log.error("An exception occurred while sending webmention: {} -> {}", webmentionEvent.sourceUrl(), webmentionEvent.targetUrl(), e);
            }
        });
    }

    public void findAndSendWebmentions(URI baseUri, Path rootDir) {
        Objects.requireNonNull(baseUri, "baseUri cannot be null");
        Objects.requireNonNull(rootDir, "rootDir cannot be null");

        var webmentionEvents = findWebmentionEvents(baseUri, rootDir);
        sendWebmentions(webmentionEvents);
    }
}
