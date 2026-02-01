import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.io.IOException;
import java.net.http.HttpClient;
import java.net.http.HttpHeaders;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Optional;
import java.util.concurrent.SubmissionPublisher;

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

    @Test
    void send_shouldThrow_whenWebmentionEndpointIsNotDiscovered() {
        when(webmentionEndpointDiscoverer.discover("https://example.com/target")).thenReturn(Optional.empty());
        assertThrows(WebmentionEndpointNotFoundException.class, () -> sut.send("https://example.com/source", "https://example.com/target"));
    }
}