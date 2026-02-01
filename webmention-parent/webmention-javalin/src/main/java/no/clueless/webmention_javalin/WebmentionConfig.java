package no.clueless.webmention_javalin;

import no.clueless.webmention.receiver.WebmentionReceiver;
import no.clueless.webmention.sender.WebmentionSender;

public class WebmentionConfig {
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

    public boolean isTestMode() {
        return testMode;
    }

    public void setTestMode(boolean testMode) {
        this.testMode = testMode;
    }
}
