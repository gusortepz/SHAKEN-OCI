package com.springboot.MyTodoList.controller;

import java.time.OffsetDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import org.mockito.Mock;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Message;
import org.telegram.telegrambots.meta.api.objects.Update;

import com.springboot.MyTodoList.model.DeveloperKPI;
import com.springboot.MyTodoList.model.KPI;
import com.springboot.MyTodoList.model.SprintKPI;
import com.springboot.MyTodoList.model.ToDoItem;
import com.springboot.MyTodoList.model.User;
import com.springboot.MyTodoList.service.AuthService;
import com.springboot.MyTodoList.service.KPIService;
import com.springboot.MyTodoList.service.ProjectService;
import com.springboot.MyTodoList.service.SprintService;
import com.springboot.MyTodoList.service.ToDoItemService;
import com.springboot.MyTodoList.service.UserService;
import com.springboot.MyTodoList.util.BotLabels;

public class ToDoItemBotControllerTest {

    @Mock
    private ToDoItemService toDoItemService;

    @Mock
    private SprintService sprintService;

    @Mock
    private KPIService kpiService;

    @Mock
    private ProjectService projectService;

    @Mock
    private UserService userService;

    @Mock
    private AuthService authService;

    private ToDoItemBotController spyBot;
    private ArgumentCaptor<SendMessage> captor;
    private Update update;
    private Message message;


    @BeforeEach
    public void setup() throws Exception {
        MockitoAnnotations.openMocks(this);

        spyBot = spy(new ToDoItemBotController(
                "dummyToken", "TestBot", toDoItemService, userService, authService, sprintService, kpiService, projectService));

        captor = ArgumentCaptor.forClass(SendMessage.class);

        doAnswer(invocation -> null).when(spyBot).execute(any(SendMessage.class));
        doReturn(new User()).when(spyBot).userAuthMiddleware(any(Update.class));

        update = new Update();
        message = mock(Message.class);
        update.setMessage(message);
    }


    @Test
    public void testStartCommandDoesNotSendRealMessage() throws Exception {
        when(message.hasText()).thenReturn(true);
        when(message.getText()).thenReturn("/start");
        when(message.getChatId()).thenReturn(123L);

        spyBot.onUpdateReceived(update);

        verify(spyBot).execute(captor.capture());

        SendMessage captured = captor.getValue();
        assertEquals("123", captured.getChatId());
        assertTrue(captured.getText().toLowerCase().contains("hello"));
    }

    @Test
    public void testAddItemCommandSendsInputPrompt() throws Exception {
        when(message.hasText()).thenReturn(true);
        when(message.getText()).thenReturn("/additem");
        when(message.getChatId()).thenReturn(456L);

        spyBot.onUpdateReceived(update);

        verify(spyBot).execute(captor.capture());

        SendMessage captured = captor.getValue();
        assertEquals("456", captured.getChatId());
        assertTrue(captured.getText().toLowerCase().contains("type"));
    }

    @Test
    public void testToDoListCommandShowsItems() throws Exception {
        when(message.hasText()).thenReturn(true);
        when(message.getText()).thenReturn("/todolist");
        when(message.getChatId()).thenReturn(789L);

        List<ToDoItem> fakeItems = List.of(
                new ToDoItem("Task 1", OffsetDateTime.now(), "DONE", "LOW", null, null, null, null, null, null, null),
                new ToDoItem("Task 2", OffsetDateTime.now(), "INPROGRESS", "HIGH", null, null, null, null, null, null, null)
        );
        fakeItems.get(0).setID(1);
        fakeItems.get(1).setID(2);

        when(toDoItemService.findAll()).thenReturn(fakeItems);
        when(userService.findByID(anyInt())).thenReturn(new User());

        spyBot.onUpdateReceived(update);

        verify(spyBot).execute(captor.capture());

        SendMessage captured = captor.getValue();
        assertEquals("789", captured.getChatId());
        assertNotNull(captured.getReplyMarkup());
    }

    @Test
    public void testCompletedTasksBySprintCommand() throws Exception {
        when(message.hasText()).thenReturn(true);
        when(message.getText()).thenReturn(BotLabels.COMPLETED_TASKS_SPRINT.getLabel() + " 5");
        when(message.getChatId()).thenReturn(111L);

        List<ToDoItem> fakeTasks = List.of(
            new ToDoItem("Fix bug", OffsetDateTime.now(), "DONE", "HIGH", 1L, null, null, 5L, null, null, null),
            new ToDoItem("Write tests", OffsetDateTime.now(), "DONE", "MEDIUM", 2L, null, null, 5L, null, null, null)
        );
        fakeTasks.get(0).setID(1);
        fakeTasks.get(1).setID(2);

        when(sprintService.getCompletedTasksBySprint(5L)).thenReturn(fakeTasks);

        spyBot.onUpdateReceived(update);

        verify(spyBot).execute(captor.capture());

        SendMessage captured = captor.getValue();
        assertEquals("111", captured.getChatId());
        assertTrue(captured.getText().contains("✅ Completed tasks in Sprint 5"));
        assertTrue(captured.getText().contains("Fix bug"));
        assertTrue(captured.getText().contains("Write tests"));
    }

    @Test
    public void testCompletedTasksByUserInSprintCommand() throws Exception {
        when(message.hasText()).thenReturn(true);
        when(message.getText()).thenReturn(BotLabels.COMPLETED_TASKS_USER.getLabel() +" 5 1");
        when(message.getChatId()).thenReturn(222L);

        List<ToDoItem> fakeTasks = List.of(
            new ToDoItem("Fix bug", OffsetDateTime.now(), "DONE", "HIGH", 1L, null, null, 5L, null, null, null)
        );
        fakeTasks.get(0).setID(3);

        when(sprintService.getCompletedTasksByUserInSprint(5L, 1L)).thenReturn(fakeTasks);

        spyBot.onUpdateReceived(update);

        verify(spyBot).execute(captor.capture());

        SendMessage captured = captor.getValue();
        assertEquals("222", captured.getChatId());
        assertTrue(captured.getText().contains("✅ Completed tasks by user 1 in Sprint 5"));
        assertTrue(captured.getText().contains("Fix bug"));
    }




}
