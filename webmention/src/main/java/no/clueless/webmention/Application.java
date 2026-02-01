package no.clueless.webmention;

import io.javalin.Javalin;
import no.clueless.webmention.receiver.DefaultWebmentionTargetVerifier;
import no.clueless.webmention.receiver.WebmentionReceiver;
import no.clueless.webmention.receiver.WebmentionRequestVerifier;
import no.clueless.webmention_javalin.WebmentionJavalinPlugin;
import no.clueless.webmention.sender.WebmentionSender;

import java.net.http.HttpClient;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Optional;
import java.util.concurrent.SubmissionPublisher;

public class Application {
    public static void main(String[] args) {
        final var serverPort         = Optional.ofNullable(System.getenv("SERVER_PORT")).filter(property -> !property.isBlank()).map(Integer::parseInt).orElse(8080);
        final var webmentionEndpoint = Optional.ofNullable(System.getenv("WEBMENTION_ENDPOINT")).orElseThrow(() -> new IllegalStateException("WEBMENTION_ENDPOINT must be set"));
        final var supportedDomains   = Optional.ofNullable(System.getenv("SUPPORTED_DOMAINS")).map(value -> new HashSet<>(Arrays.asList(value.split(",")))).orElseThrow(() -> new IllegalStateException("SUPPORTED_DOMAINS must be set"));
        final var testMode           = Optional.ofNullable(System.getenv("TEST_MODE")).map("true"::equalsIgnoreCase).orElse(false);

        var javalin = Javalin.create(config -> config.registerPlugin(new WebmentionJavalinPlugin(plugin -> {
            plugin.setEndpoint(webmentionEndpoint);
            plugin.setReceiver(new WebmentionReceiver(HttpClient.newBuilder().build(), new WebmentionRequestVerifier(new DefaultWebmentionTargetVerifier(
                    supportedDomains,
                    HttpClient.newBuilder().build(),
                    new WebmentionEndpointDiscoverer(HttpClient.newBuilder().build())
            ))));
            plugin.setSender(new WebmentionSender(HttpClient.newBuilder().build(), new SubmissionPublisher<>(), new WebmentionEndpointDiscoverer(HttpClient.newBuilder().build())));
            plugin.setTestMode(testMode);
        })));
        javalin.start(serverPort);
    }
}
