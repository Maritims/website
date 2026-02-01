import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;

import java.io.IOException;
import java.net.http.HttpClient;
import java.net.http.HttpHeaders;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Optional;
import java.util.concurrent.SubmissionPublisher;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SuppressWarnings("unchecked")
class WebmentionSenderTest {
    HttpClient                           httpClient;
    SubmissionPublisher<HttpResponse<?>> onReceiverNotifiedPublisher;
    WebmentionEndpointDiscoverer         webmentionEndpointDiscoverer;
    WebmentionSender                     sut;

    @BeforeEach
    void setUp() {
        httpClient                   = mock(HttpClient.class);
        onReceiverNotifiedPublisher  = mock(SubmissionPublisher.class);
        webmentionEndpointDiscoverer = mock(WebmentionEndpointDiscoverer.class);
        sut                          = spy(new WebmentionSender(httpClient, onReceiverNotifiedPublisher, webmentionEndpointDiscoverer));
    }

    public static Stream<Arguments> fetch_shouldThrow_whenContentTypeIsMissing_orWhenContentTypeIsNotTextHtml() {
        return Stream.of(
                Arguments.of((String) null),
                Arguments.of(""),
                Arguments.of(" "),
                Arguments.of("application/json")
        );
    }

    @Test
    void fetch_shouldThrow_whenStatusCodeIsNot200() throws IOException, InterruptedException {
        // arrange
        var httpResponse = mock(HttpResponse.class);
        when(httpResponse.statusCode()).thenReturn(201);

        try (var httpClient = mock(HttpClient.class)) {
            when(httpClient.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class))).thenReturn(httpResponse);

            var sut = new WebmentionSender(httpClient, new SubmissionPublisher<>(), mock(WebmentionEndpointDiscoverer.class));

            // act
            assertThrows(UnexpectedStatusCodeException.class, () -> sut.fetch("https://example.com"));
        }
    }

    @ParameterizedTest
    @MethodSource
    void fetch_shouldThrow_whenContentTypeIsMissing_orWhenContentTypeIsNotTextHtml(String contentType) throws IOException, InterruptedException {
        // arrange
        var httpHeaders = mock(HttpHeaders.class);
        when(httpHeaders.firstValue("Content-Type")).thenReturn(Optional.ofNullable(contentType));

        var httpResponse = mock(HttpResponse.class);
        when(httpResponse.statusCode()).thenReturn(200);
        when(httpResponse.headers()).thenReturn(httpHeaders);

        try (var httpClient = mock(HttpClient.class)) {
            when(httpClient.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class))).thenReturn(httpResponse);

            var sut = new WebmentionSender(httpClient, new SubmissionPublisher<>(), mock(WebmentionEndpointDiscoverer.class));

            // act
            assertThrows(UnexpectedContentTypeException.class, () -> sut.fetch("https://example.com"));
        }
    }

    @Test
    void send_shouldThrow_whenWebmentionEndpointIsMissing() {
        // arrange
        var httpResponse = mock(HttpResponse.class);
        doReturn(httpResponse).when(sut).fetch(anyString());

        // act & assert
        assertThrows(WebmentionEndpointNotFoundException.class, () -> sut.send("foo", "bar"));
    }

    @ParameterizedTest
    @ValueSource(ints = {199, 300})
    void notifyReceiver_shouldThrow_whenStatusCodeIsNot2xx(int statusCode) throws IOException, InterruptedException {
        // arrange
        var httpResponse = mock(HttpResponse.class);
        when(httpResponse.statusCode()).thenReturn(statusCode);
        when(httpClient.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class))).thenReturn(httpResponse);

        // act & assert
        assertThrows(UnexpectedStatusCodeException.class, () -> sut.notifyReceiver("https://example.com", "foo", "bar"));
    }

    @ParameterizedTest
    @ValueSource(ints = {200, 201, 202})
    void notifyReceiver_shouldPublishEvent_whenStatusCodeIs2xx(int statusCode) throws IOException, InterruptedException {
        var httpResponse = mock(HttpResponse.class);
        var httpHeaders  = mock(HttpHeaders.class);
        when(httpResponse.statusCode()).thenReturn(statusCode);
        when(httpResponse.headers()).thenReturn(httpHeaders);
        when(httpClient.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class))).thenReturn(httpResponse);

        // act
        sut.notifyReceiver("https://example.com", "foo", "bar");

        // assert
        verify(onReceiverNotifiedPublisher, times(1)).submit(eq(httpResponse));
    }
}