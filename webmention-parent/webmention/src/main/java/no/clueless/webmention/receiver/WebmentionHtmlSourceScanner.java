package no.clueless.webmention.receiver;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Element;

import java.net.URI;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

public class WebmentionHtmlSourceScanner implements WebmentionSourceScanner {
    private String resolveText(Element element) {
        var tagName = element.tagName().toLowerCase();
        return switch (tagName) {
            case "a" -> element.text();
            case "img", "video" -> element.html();
            default -> throw new IllegalStateException("Unexpected value: " + tagName);
        };
    }

    @Override
    public Optional<String> findTargetUrlMention(String body, String targetUrl) {
        var document = Jsoup.parse(body);
        var elements = document.select("a[href=\"" + targetUrl + "\"], img[href=\"" + targetUrl + "\"], video[src=\"" + targetUrl + "\"]");
        return elements.stream()
                .map(this::resolveText)
                .findFirst();
    }

    public Map<URI, String> findAllMentions(String body) {
        var document = Jsoup.parse(body);
        var elements = document.select("a[href], img[href], video[src]");
        return elements.stream()
                .map(element -> {
                    var tagName = element.tagName().toLowerCase();
                    return switch (tagName) {
                        case "a", "img" -> {
                            var href = element.attr("href");
                            var html = element.html();
                            yield Map.entry(URI.create(href), html);
                        }
                        case "video" -> {
                            var src = element.attr("src");
                            var html = element.html();
                            yield Map.entry(URI.create(src), html);
                        }
                        default -> throw new IllegalStateException("Unexpected value: " + tagName);
                    };
                })
                .filter(entry -> entry.getKey().isAbsolute())
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }
}
