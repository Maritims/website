package no.clueless.webmention_cli;

import no.clueless.webmention.event.WebmentionEvent;
import no.clueless.webmention.receiver.WebmentionHtmlSourceScanner;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class WebmentionDirectoryWalker {
    private static final Logger log = LoggerFactory.getLogger(WebmentionDirectoryWalker.class);

    private final WebmentionHtmlSourceScanner webmentionHtmlSourceScanner;

    public WebmentionDirectoryWalker(WebmentionHtmlSourceScanner webmentionHtmlSourceScanner) {
        this.webmentionHtmlSourceScanner = Objects.requireNonNull(webmentionHtmlSourceScanner, "webmentionHtmlSourceScanner");
    }

    String createSourceUrl(URI baseUri, Path rootDir, Path file) {
        Objects.requireNonNull(baseUri, "baseUri cannot be null");
        Objects.requireNonNull(rootDir, "rootDir cannot be null");
        Objects.requireNonNull(file, "file cannot be null");

        // Relativise the file: /var/www/site/foo/bar.html -> foo/bar.html
        var relative = rootDir.relativize(file);

        // Resolve against base: https://clueless.no/ + foo/bar.html
        // Ensure any backslashes (from Windows, for example) are replaced by forward slashes like in URLs.
        var base = baseUri.toString();
        if (!base.endsWith("/")) {
            base += "/";
        }
        var pathFragment = relative.toString().replace(file.getFileSystem().getSeparator(), "/");
        return URI.create(base).resolve(pathFragment).toString();
    }

    public Set<WebmentionEvent> walk(URI baseUri, Path rootDir, Set<WebmentionEvent> webmentionEvents) {
        Objects.requireNonNull(rootDir, "rootDir cannot be null");
        Objects.requireNonNull(webmentionEvents, "webmentionEvents cannot be null");

        if (!Files.exists(rootDir)) {
            log.error("{} does not exist", rootDir);
            return webmentionEvents;
        }

        if (!Files.isDirectory(rootDir)) {
            log.error("{} is not a directory", rootDir);
            return webmentionEvents;
        }

        try (var stream = Files.walk(rootDir)) {
            return stream.filter(Files::isRegularFile)
                    .flatMap(file -> {
                        try {
                            var body      = Files.readString(file);
                            var sourceUrl = createSourceUrl(baseUri, rootDir, file);
                            return webmentionHtmlSourceScanner.findAllMentions(body)
                                    .entrySet()
                                    .stream()
                                    .map(entry -> new WebmentionEvent(sourceUrl, entry.getKey().toString(), entry.getValue()));
                        } catch (IOException e) {
                            log.error("An exception occurred while processing file: {}", file, e);
                            return Stream.empty();
                        }
                    })
                    .collect(Collectors.toSet());
        } catch (IOException e) {
            log.error("An exception occurred while walking the directory", e);
        }
        return webmentionEvents;
    }
}
