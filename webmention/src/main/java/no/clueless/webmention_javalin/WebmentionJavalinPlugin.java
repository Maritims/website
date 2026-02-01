package no.clueless.webmention_javalin;

import io.javalin.config.JavalinConfig;
import io.javalin.http.BadRequestResponse;
import io.javalin.http.ContentType;
import io.javalin.http.Context;
import io.javalin.plugin.Plugin;
import no.clueless.webmention.WebmentionException;
import no.clueless.webmention.receiver.WebmentionReceiver;
import no.clueless.webmention.sender.WebmentionSender;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.function.Consumer;

public class WebmentionJavalinPlugin extends Plugin<WebmentionJavalinPlugin.WebmentionConfig> {
    private static final Logger log = LoggerFactory.getLogger(WebmentionJavalinPlugin.class);

    public static final class WebmentionConfig {
        private String             endpoint;
        private WebmentionReceiver webmentionReceiver;
        private WebmentionSender   sender;
        private boolean            testMode;

        public String getEndpoint() {
            return endpoint;
        }

        public void setEndpoint(String endpoint) {
            this.endpoint = endpoint;
        }

        public WebmentionReceiver getReceiver() {
            return webmentionReceiver;
        }

        public void setReceiver(WebmentionReceiver webmentionReceiver) {
            this.webmentionReceiver = webmentionReceiver;
        }

        public WebmentionSender getSender() {
            return sender;
        }

        public void setSender(WebmentionSender sender) {
            this.sender = sender;
        }

        public void setTestMode(boolean testMode) {
            this.testMode = testMode;
        }
    }

    public record WebmentionContext(Context ctx, WebmentionConfig config) {
        public WebmentionContext {
            Objects.requireNonNull(ctx, "ctx cannot be null");
            Objects.requireNonNull(config, "config cannot be null");
        }

        public void send(String source, String target) {
            Objects.requireNonNull(source, "source cannot be null");
            Objects.requireNonNull(target, "target cannot be null");
            config.sender.send(source, target);
        }
    }

    @NotNull
    @Override
    public String name() {
        return "Clueless Webmentions";
    }

    public WebmentionJavalinPlugin(@Nullable Consumer<WebmentionConfig> userConfig) {
        super(userConfig, new WebmentionConfig());
    }

    @Override
    public void onInitialize(@NotNull JavalinConfig config) {
        config.router.mount(router -> {
            if(pluginConfig.testMode) {
                log.info("Plugin is running in test mode. Test endpoints will be available!");

                router.get("/test-source-page", ctx -> ctx.status(200).contentType(ContentType.TEXT_HTML).html("""
                        <!DOCTYPE html>
                        <html>
                            <head>
                                <title>Webmention Test Source Page</title>
                            </head>
                            <body>
                                <a href="http://localhost:8080/test-target-page" rel="webmention">This is a link to the test target page.</a>
                            </body>
                        </html>
                        """));
                router.get("/test-target-page", ctx -> ctx.status(200).header("Link", "</webmention-endpoint>; rel=webmention").contentType(ContentType.TEXT_HTML));
            }

            router.get(pluginConfig.endpoint, ctx -> {
                ctx.status(200);
            });

            router.post(pluginConfig.endpoint, ctx -> {
                var source = ctx.formParam("source");
                var target = ctx.formParam("target");

                var success = false;

                try {
                    pluginConfig.webmentionReceiver.receive(source, target);
                } catch (WebmentionException e) {
                    throw new BadRequestResponse(e.getMessage());
                }

                // TODO: Support HTTP 201.
                ctx.status(success ? 202 : 422);
            });
        });
    }
}
