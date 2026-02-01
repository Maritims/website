package no.clueless.webmention;

import java.io.IOException;
import java.net.*;
import java.net.http.HttpClient;
import java.time.Duration;
import java.util.List;

public class WebmentionHttpClientBuilder {
    private static boolean isRestricted(URI uri) {
        if (uri.getHost() == null || uri.getHost().isBlank()) {
            return false;
        }

        InetAddress address;
        try {
            address = InetAddress.getByName(uri.getHost());
        } catch (UnknownHostException e) {
            return true;
        }

        return address.isLoopbackAddress() || address.isSiteLocalAddress() || address.isLinkLocalAddress();
    }

    public static HttpClient.Builder newBuilder(boolean blockRestricted, Duration connectTimeout) {
        return HttpClient.newBuilder()
                .connectTimeout(connectTimeout)
                .followRedirects(HttpClient.Redirect.NORMAL)
                .version(HttpClient.Version.HTTP_2)
                .proxy(new ProxySelector() {
                    @Override
                    public List<Proxy> select(URI uri) {
                        if (blockRestricted && isRestricted(uri)) {
                            throw new UnsupportedOperationException("Loopback addresses are blocked");
                        }
                        return List.of(Proxy.NO_PROXY);
                    }

                    @Override
                    public void connectFailed(URI uri, SocketAddress sa, IOException ioe) {
                    }
                });
    }
}
