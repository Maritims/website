package no.clueless.webmention_service;

import io.javalin.Javalin;
import no.clueless.webmention.WebmentionEndpointDiscoverer;
import no.clueless.webmention.http.SecureHttpClient;
import no.clueless.webmention.receiver.*;
import no.clueless.webmention_javalin.WebmentionPlugin;
import no.clueless.webmention.sender.WebmentionSender;

import java.time.Duration;
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
        final var connectTimeout     = Optional.ofNullable(System.getenv("CONNECTION_TIMEOUT_IN_MILLISECONDS")).map(Long::parseLong).map(Duration::ofMillis).orElse(Duration.ofMillis(5000));

        var httpClient                   = SecureHttpClient.newClient(connectTimeout, !testMode);
        var webmentionEndpointDiscoverer = WebmentionEndpointDiscoverer.newBuilder().httpClient(httpClient).build();
        var targetVerifier               = DefaultWebmentionTargetVerifier.newBuilder().supportedDomains(supportedDomains).httpClient(httpClient).endpointDiscoverer(webmentionEndpointDiscoverer).build();
        var requestVerifier              = WebmentionRequestVerifier.newBuilder().targetVerifier(targetVerifier).build();
        var receiver                     = WebmentionReceiver.newBuilder().httpClient(httpClient).requestVerifier(requestVerifier).build();
        var rateLimiter                  = WebmentionRateLimiter.newBuilder().maxEntries(5000).cooldownMillis(5).build();
        var webmentionProcessor          = WebmentionProcessor.newBuilder().rateLimiter(rateLimiter).receiver(receiver).build();
        var webmentionSender             = WebmentionSender.newBuilder().httpClient(httpClient).submissionPublisher(new SubmissionPublisher<>()).endpointDiscoverer(webmentionEndpointDiscoverer).build();

        webmentionProcessor.start();

        var javalin = Javalin.create(config -> config.registerPlugin(new WebmentionPlugin(plugin -> {
            plugin.setEndpoint(webmentionEndpoint);
            plugin.setProcessor(webmentionProcessor);
            plugin.setSender(webmentionSender);
            plugin.setTestMode(testMode);
        })));

        javalin.start(serverPort);
    }
}
