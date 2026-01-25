package no.clueless.web;

import io.javalin.http.Context;
import no.clueless.guestbook.Guestbook;
import no.clueless.guestbook.web.GuestbookController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import io.javalin.validation.Validator;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;

import static org.mockito.Mockito.*;

class GuestbookControllerTest {

    private Guestbook guestbook;
    private GuestbookController controller;
    private Context ctx;

    @BeforeEach
    void setUp() {
        guestbook = mock(Guestbook.class);
        controller = new GuestbookController(guestbook, new ObjectMapper(), 10, "secret", 10);
        ctx = mock(Context.class);
    }

    @Test
    void getEntriesShouldNotOvershootWhenPageSizeIsLarge() {
        when(guestbook.getTotalEntries()).thenReturn(5L);
        
        // Mocking queryParamAsClass for pageNumber and pageSize
        Validator<Integer> pageNumberValidator = mock(Validator.class);
        when(ctx.queryParamAsClass("pageNumber", Integer.class)).thenReturn(pageNumberValidator);
        when(pageNumberValidator.getOrDefault(0)).thenReturn(0);

        Validator<Integer> pageSizeValidator = mock(Validator.class);
        when(ctx.queryParamAsClass("pageSize", Integer.class)).thenReturn(pageSizeValidator);
        when(pageSizeValidator.getOrDefault(10)).thenReturn(100);

        controller.getEntries(ctx);

        // Current behavior: maxPageNumber = (5-1)/100 = 0. pageNumber = Math.min(0, 0) = 0.
        // guestbook.read(0, 100, "id", "desc") is called.
        // It "overshoots" because it asks for 100 entries when there are only 5.
        verify(guestbook).read(eq(0), eq(5), anyString(), anyString());
    }

    @Test
    void getEntriesShouldHandleNegativePageNumber() {
        when(guestbook.getTotalEntries()).thenReturn(5L);
        
        Validator<Integer> pageNumberValidator = mock(Validator.class);
        when(ctx.queryParamAsClass("pageNumber", Integer.class)).thenReturn(pageNumberValidator);
        when(pageNumberValidator.getOrDefault(0)).thenReturn(-1);

        Validator<Integer> pageSizeValidator = mock(Validator.class);
        when(ctx.queryParamAsClass("pageSize", Integer.class)).thenReturn(pageSizeValidator);
        when(pageSizeValidator.getOrDefault(10)).thenReturn(10);

        controller.getEntries(ctx);

        verify(guestbook).read(eq(0), anyInt(), anyString(), anyString());
    }
}
