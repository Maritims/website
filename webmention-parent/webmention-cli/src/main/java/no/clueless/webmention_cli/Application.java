package no.clueless.webmention_cli;

import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.Path;

public class Application {
    private static void printUsage() {
        System.out.println("""
                Expected 1 argument: <base_uri> <root_dir>
                
                Example:
                  java -jar app.jar https://clueless.no /home/user/documents
                  java -jar app.jar https://clueless.no C:\\Users\\Desktop
                """);
    }

    public static void main(String[] args) {
        if (args.length != 2) {
            printUsage();
            System.exit(1);
        }

        final var rootDir = Path.of(args[1]);
        final URI baseUri;
        try {
            baseUri = new URI(args[0]);
        } catch (URISyntaxException e) {
            System.err.println(args[0] + " is not a valid URI!");
            System.exit(1);
            return;
        }

        final var webmentionCli = new WebmentionCli();
        webmentionCli.findAndSendWebmentions(baseUri, rootDir);
    }
}
