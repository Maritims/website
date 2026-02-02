package no.clueless.webmention_cli;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.Path;

public class Application {
    private static void printUsage() {
        System.out.println("""
                Usage: webmention-cli [options]
                Options:
                  -u, --uri <uri>    The base URI to use
                  -d, --dir <path>   The root directory to scan
                  --dry-run          Show what would happen without sending
                  -h, --help         Show this help message
                """);
    }

    public static void main(String[] args) {
        String  uriStr = null;
        String  dirStr = null;
        boolean dryRun = false;

        for (var i = 0; i < args.length; i++) {
            switch (args[i]) {
                case "--uri", "-u" -> {
                    if (++i < args.length) {
                        uriStr = args[i];
                    }
                }
                case "--dir", "-d" -> {
                    if (++i < args.length) {
                        dirStr = args[i];
                    }
                }
                case "--dry-run" -> dryRun = true;
                case "--help", "-h" -> {
                    printUsage();
                    return;
                }
                default -> {
                    System.err.println("Unknown argument: " + args[i]);
                    printUsage();
                    System.exit(1);
                }
            }
        }

        if (uriStr == null || dirStr == null) {
            System.err.println("Both --uri and --dir are required");
            printUsage();
            System.exit(1);
        }

        try {
            final var rootDir = Path.of(dirStr);
            final var baseUri = new URI(uriStr);

            new WebmentionCli().findAndSendWebmentions(baseUri, rootDir, dryRun);
        } catch (URISyntaxException e) {
            System.err.println("Invalid URI: " + uriStr);
            System.exit(1);
        } catch (IOException e) {
            System.err.println("Execution failed: " + e);
            System.exit(1);
        }
    }
}
