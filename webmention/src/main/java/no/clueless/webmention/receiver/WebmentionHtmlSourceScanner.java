package no.clueless.webmention.receiver;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Element;

import java.util.Optional;

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
    public Optional<String> scan(String body, String targetUrl) {
        var document = Jsoup.parse(body);
        var elements = document.select("a[href=\"" + targetUrl + "\"], img[href=\"" + targetUrl + "\"], video[src=\"" + targetUrl + "\"]");
        return elements.stream()
                .map(this::resolveText)
                .findFirst();
    }
}
