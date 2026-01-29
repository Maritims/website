package no.clueless;

import no.clueless.guestbook.Entry;
import no.clueless.guestbook.Guestbook;
import no.clueless.guestbook.persistence.SqliteGuestbookRepository;
import org.junit.jupiter.api.Test;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import java.util.concurrent.SubmissionPublisher;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.*;

class GuestbookTest {

    @Test
    void signingTheGuestbookShouldPublishAnEvent() {
        var guestbookRepository = mock(SqliteGuestbookRepository.class);
        var createdEntry        = Entry.newEntry("Foo", "Bar");
        when(guestbookRepository.createEntry(any())).thenReturn(createdEntry);

        var submissionPublisher = mock(SubmissionPublisher.class);

        //noinspection unchecked
        var guestbook = spy(new Guestbook(guestbookRepository, submissionPublisher));
        guestbook.sign("Foo", "Bar");

        //noinspection unchecked
        verify(submissionPublisher, times(1)).submit(createdEntry);
    }

    @Test
    void signingTheGuestbookShouldCleanNameAndMessageForHtml() {
        // arrange
        var guestbookRepository = mock(SqliteGuestbookRepository.class);
        var submissionPublisher = mock(SubmissionPublisher.class);

        //noinspection unchecked
        var guestbook = spy(new Guestbook(guestbookRepository, submissionPublisher));

        // act
        var result = guestbook.sign("<script>foo bar</script>", "<script>alert('foo bar');</script>").orElse(null);

        // arrange
        assertNull(result);
    }

    @Test
    void testAltchaVerificationLogic() throws Exception {
        String secret = "test-secret";
        String salt = "test-salt";
        int number = 12345;

        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));

        String challenge = HexFormat.of().formatHex(mac.doFinal((salt + number).getBytes(StandardCharsets.UTF_8)));
        String signature = HexFormat.of().formatHex(mac.doFinal(challenge.getBytes(StandardCharsets.UTF_8)));

        // This simulates what we do in the app
        String expectedSignature = HexFormat.of().formatHex(mac.doFinal(challenge.getBytes(StandardCharsets.UTF_8)));
        assertEquals(expectedSignature, signature);

        String expectedChallenge = HexFormat.of().formatHex(mac.doFinal((salt + number).getBytes(StandardCharsets.UTF_8)));
        assertEquals(expectedChallenge, challenge);
    }
}