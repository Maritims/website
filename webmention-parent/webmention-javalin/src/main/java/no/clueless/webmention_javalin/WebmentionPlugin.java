package no.clueless.webmention_javalin;

import io.javalin.config.JavalinConfig;
import io.javalin.http.ContentType;
import io.javalin.plugin.Plugin;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.function.Consumer;

public class WebmentionPlugin extends Plugin<WebmentionConfig> {
    private static final Logger log = LoggerFactory.getLogger(WebmentionPlugin.class);

    @NotNull
    @Override
    public String name() {
        return "Clueless Webmention Javalin Plugin";
    }

    public WebmentionPlugin(@Nullable Consumer<WebmentionConfig> userConfig) {
        super(userConfig, new WebmentionConfig());
    }

    @Override
    public void onInitialize(@NotNull JavalinConfig config) {
        config.router.mount(router -> {
            if (pluginConfig.isTestMode()) {
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

            router.get(pluginConfig.getEndpoint(), ctx -> ctx.status(200));

            router.post(pluginConfig.getEndpoint(), ctx -> {
                var source = ctx.formParam("source");
                var target = ctx.formParam("target");
                pluginConfig.getProcessor().queue(source, target);
                ctx.status(202);
            });
        });
    }
}
