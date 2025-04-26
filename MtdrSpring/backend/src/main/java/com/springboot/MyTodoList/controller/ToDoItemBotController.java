package com.springboot.MyTodoList.controller;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardRemove;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import com.springboot.MyTodoList.dto.LoginUserDto;
import com.springboot.MyTodoList.model.DeveloperKPI;
import com.springboot.MyTodoList.model.KPI;
import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.model.SprintKPI;
import com.springboot.MyTodoList.model.ToDoItem;
import com.springboot.MyTodoList.model.User;
import com.springboot.MyTodoList.service.AuthService;
import com.springboot.MyTodoList.service.KPIService;
import com.springboot.MyTodoList.service.SprintService;
import com.springboot.MyTodoList.service.ToDoItemService;
import com.springboot.MyTodoList.service.UserService;
import com.springboot.MyTodoList.util.BotCommands;
import com.springboot.MyTodoList.util.BotHelper;
import com.springboot.MyTodoList.util.BotLabels;
import com.springboot.MyTodoList.util.BotMessages;
import com.springboot.MyTodoList.util.TaskStatus;

public class ToDoItemBotController extends TelegramLongPollingBot {

	private static final Logger logger = LoggerFactory.getLogger(ToDoItemBotController.class);
	private ToDoItemService toDoItemService;
	private SprintService sprintService;
	private KPIService kpiService;
	private String botName;
	private UserService userService;
	private AuthService authService;

	private final Map<Long, Boolean> userWaitingForTodo = new ConcurrentHashMap<>();
	private final Map<Long, Boolean> userWaitingForDate = new ConcurrentHashMap<>();

	DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

	public ToDoItemBotController(String botToken, String botName, ToDoItemService toDoItemService, UserService userService, AuthService authService, SprintService sprintService, KPIService kpiService) {
		super(botToken);
		logger.info("Bot Token: " + botToken);
		logger.info("Bot name: " + botName);
		this.toDoItemService = toDoItemService;
		this.sprintService = sprintService;
		this.kpiService = kpiService;
		this.botName = botName;
		this.userService = userService;
		this.authService = authService;
	}

	@Override
	public void onUpdateReceived(Update update) {

		if (update.hasMessage() && update.getMessage().hasText()) {

			System.out.println("Current users waiting for todo" + userWaitingForTodo.toString());

			long chatId = update.getMessage().getChatId();
			String messageTextFromTelegram = update.getMessage().getText();
			User user = userAuthMiddleware(update);
			if (user == null) {
				return;
			}
			

			if (messageTextFromTelegram.equals(BotCommands.START_COMMAND.getCommand())
					|| messageTextFromTelegram.equals(BotLabels.SHOW_MAIN_SCREEN.getLabel())) {

				SendMessage messageToTelegram = new SendMessage();
				messageToTelegram.setChatId(chatId);
				messageToTelegram.setText(BotMessages.HELLO_MYTODO_BOT.getMessage());

				ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
				List<KeyboardRow> keyboard = new ArrayList<>();
				KeyboardRow row = new KeyboardRow();
				// first row
				row.add(BotLabels.LIST_ALL_DEVELOPERS.getLabel());
				keyboard.add(row);		
				// second row
				row = new KeyboardRow();
				row.add(BotLabels.LIST_ALL_ITEMS.getLabel());
				row.add(BotLabels.LIST_ALL_KPIS.getLabel());
				row.add(BotLabels.LIST_ALL_SPRINTS.getLabel());
				row.add(BotLabels.ADD_NEW_ITEM.getLabel());
				row.add(BotLabels.ADD_NEW_SPRINT.getLabel());
				// Add the first row to the keyboard
				keyboard.add(row);

				// third row
				row = new KeyboardRow();
				row.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
				row.add(BotLabels.HIDE_MAIN_SCREEN.getLabel());
				keyboard.add(row);

				// Set the keyboard
				keyboardMarkup.setKeyboard(keyboard);

				// Add the keyboard markup
				messageToTelegram.setReplyMarkup(keyboardMarkup);

				try {
					execute(messageToTelegram);
				} catch (TelegramApiException e) {
					logger.error(e.getLocalizedMessage(), e);
				}

			} else if(messageTextFromTelegram.equals(BotLabels.LIST_ALL_KPIS.getLabel())){
				ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
				List<KeyboardRow> keyboard = new ArrayList<>();

				KeyboardRow mainScreenRowTop = new KeyboardRow();
				mainScreenRowTop.add(BotLabels.LIST_ALL_KPIS_SPRINTS.getLabel());
				keyboard.add(mainScreenRowTop);
				KeyboardRow firstRow = new KeyboardRow();
				firstRow.add(BotLabels.LIST_ALL_KPIS_DEVELOPER.getLabel());
				keyboard.add(firstRow);

				// command back to main screen
				KeyboardRow mainScreenRowBottom = new KeyboardRow();
				mainScreenRowBottom.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
				keyboard.add(mainScreenRowBottom);

				keyboardMarkup.setKeyboard(keyboard);
				SendMessage messageToTelegram = new SendMessage();
				messageToTelegram.setChatId(chatId);
				messageToTelegram.setText(BotLabels.LIST_ALL_KPIS.getLabel());
				messageToTelegram.setReplyMarkup(keyboardMarkup);
				try {
					execute(messageToTelegram);
				} catch (TelegramApiException e) {
					logger.error(e.getLocalizedMessage(), e);
				}


			} else if(messageTextFromTelegram.equals(BotLabels.LIST_ALL_KPIS_SPRINTS.getLabel())){

				ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
				List<KeyboardRow> keyboard = new ArrayList<>();
			
				KeyboardRow mainScreenRowBottom = new KeyboardRow();
				mainScreenRowBottom.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
				keyboard.add(mainScreenRowBottom);
				KeyboardRow firstRow = new KeyboardRow();
				firstRow.add(BotLabels.LIST_ALL_KPIS.getLabel());
				keyboard.add(firstRow);
				keyboardMarkup.setKeyboard(keyboard);
			
				KPI allItems = kpiService.getAllKpis();
				StringBuilder messageBuilder = new StringBuilder();
				messageBuilder.append("📊 *Sprint KPIs Overview*\n\n");
			
				for (SprintKPI sprint : allItems.getSprintKpis()) {
					messageBuilder.append("🔹 *")
						.append(sprint.getName()).append("*\n")
						.append("🧩 Tasks: ").append(sprint.getCompletedTasks()).append("/").append(sprint.getTotalTasks()).append("\n")
						.append("⏱ Estimated Time: ").append(sprint.getTotalEstimatedTime()).append("h\n")
						.append("⏳ Real Time: ").append(sprint.getTotalRealTime()).append("h\n")
						.append("⭐ Story Points: ").append(sprint.getTotalStoryPoints()).append("\n\n");
				}
			
				SendMessage messageToTelegram = new SendMessage();
				messageToTelegram.setChatId(chatId);
				messageToTelegram.setText(messageBuilder.toString());
				messageToTelegram.setParseMode("Markdown"); // or "HTML" if you prefer HTML tags
				messageToTelegram.setReplyMarkup(keyboardMarkup);
			
				try {
					execute(messageToTelegram);
				} catch (TelegramApiException e) {
					logger.error(e.getLocalizedMessage(), e);
				}


			} else if(messageTextFromTelegram.equals(BotLabels.LIST_ALL_KPIS_DEVELOPER.getLabel())){

				ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
				List<KeyboardRow> keyboard = new ArrayList<>();
				
				KeyboardRow mainScreenRowBottom = new KeyboardRow();
				mainScreenRowBottom.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
				keyboard.add(mainScreenRowBottom);
				
				KeyboardRow firstRow = new KeyboardRow();
				firstRow.add(BotLabels.LIST_ALL_KPIS.getLabel());
				keyboard.add(firstRow);
				keyboardMarkup.setKeyboard(keyboard);
				
				KPI allItems = kpiService.getAllKpis();
				StringBuilder messageBuilder = new StringBuilder();
				messageBuilder.append("👨‍💻 *Developer KPIs Overview*\n\n");
				
				for (DeveloperKPI dev : allItems.getDeveloperKpis()) {
					try {
						User userKpi = userService.findByID(dev.getAssigneeId().intValue());
						messageBuilder.append("🧑‍💼 *")
							.append(userKpi.getUsername()).append(" (ID: ").append(dev.getAssigneeId()).append(")*\n")
							.append("🧩 Tasks: ").append(dev.getCompletedTasks()).append("/").append(dev.getTotalTasks()).append("\n")
							.append("⏱ Estimated Time: ").append(dev.getTotalEstimatedTime()).append("h\n")
							.append("⏳ Real Time: ").append(dev.getTotalRealTime()).append("h\n")
							.append("⭐ Story Points: ").append(dev.getTotalStoryPoints()).append("\n")
							.append("📈 Completion Rate: ").append(String.format("%.1f", dev.getCompletionRate())).append("%\n\n");
					} catch (Exception e) {
						logger.warn("Could not find user for assigneeId: " + dev.getAssigneeId(), e);
					}
				}
				
				SendMessage messageToTelegram = new SendMessage();
				messageToTelegram.setChatId(chatId);
				messageToTelegram.setText(messageBuilder.toString());
				messageToTelegram.setParseMode("Markdown");
				messageToTelegram.setReplyMarkup(keyboardMarkup);
				
				try {
					execute(messageToTelegram);
				} catch (TelegramApiException e) {
					logger.error(e.getLocalizedMessage(), e);
				}
				


			} else if(messageTextFromTelegram.equals(BotLabels.LIST_ALL_DEVELOPERS.getLabel())){
				List<User> allUsers = userService.findAll();
				ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
				List<KeyboardRow> keyboard = new ArrayList<>();

				// command back to main screen
				KeyboardRow mainScreenRowTop = new KeyboardRow();
				mainScreenRowTop.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
				keyboard.add(mainScreenRowTop);

				System.out.println("All Users: " + allUsers.toString());
				for (User userC : allUsers) {
					if ("DEVELOPER".equals(userC.getRole())) {
						KeyboardRow currentRow = new KeyboardRow();
						currentRow.add(userC.getID() + BotLabels.DASH.getLabel() + userC.getUsername() + " Role: " + userC.getRole());
						keyboard.add(currentRow);
					} 
					if ("ADMIN".equals(userC.getRole())) {
						KeyboardRow currentRow = new KeyboardRow();
						currentRow.add(userC.getID() + BotLabels.DASH.getLabel() + userC.getUsername() + " Role: " + userC.getRole());
						keyboard.add(currentRow);
					} 
				}

				keyboardMarkup.setKeyboard(keyboard);

				SendMessage messageToTelegram = new SendMessage();
				messageToTelegram.setChatId(chatId);
				messageToTelegram.setText(BotLabels.LIST_ALL_DEVELOPERS.getLabel());
				messageToTelegram.setReplyMarkup(keyboardMarkup);

				try {
					execute(messageToTelegram);
				} catch (TelegramApiException e) {
					logger.error(e.getLocalizedMessage(), e);
				}
			} else if(messageTextFromTelegram.matches("^\\d+-.*Role: DEVELOPER$") || messageTextFromTelegram.matches("^\\d+-.*Role: ADMIN$")) {
				List<User> allUsers = userService.findAll();


				ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
				List<KeyboardRow> keyboard = new ArrayList<>();
				KeyboardRow mainScreenRowTop = new KeyboardRow();
				mainScreenRowTop.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
				keyboard.add(mainScreenRowTop);

				System.out.println("Entramos o si");
				String[] parts = messageTextFromTelegram.split("-"); // Split the string by "-" to get the user ID
				String userIdStr = parts[0]; // The first part is the user ID (e.g., "2")
				
				// Parse the user ID to an integer
				int userId = Integer.parseInt(userIdStr);

				// Fetch all tasks from TodoItemService
				List<ToDoItem> allToDoItems = toDoItemService.findAll(); // Assuming you have a method that retrieves all tasks
				
				// Filter tasks by assigneeId matching the userId
				List<ToDoItem> userTasks = allToDoItems.stream()
												.filter(task -> task.getAssignee() == userId)
												.collect(Collectors.toList());

				// Build a response message
				StringBuilder tasksList = new StringBuilder();
				if (!userTasks.isEmpty()) {
					tasksList.append("Tasks for Developer ID " + userId + ":\n");
					for (ToDoItem task : userTasks) {
						tasksList.append(task.getDescription())
								.append(" - Status: ").append(task.getStatus())
								.append("\n");
					}
				} else {
					tasksList.append("No tasks assigned to this developer.");
				}
				for (User userC : allUsers) {
					if ("DEVELOPER".equals(userC.getRole())) {
						KeyboardRow currentRow = new KeyboardRow();
						currentRow.add(userC.getID() + BotLabels.DASH.getLabel() + userC.getUsername() + " Role: " + userC.getRole());
						keyboard.add(currentRow);
					} 
					if ("ADMIN".equals(userC.getRole())) {
						KeyboardRow currentRow = new KeyboardRow();
						currentRow.add(userC.getID() + BotLabels.DASH.getLabel() + userC.getUsername() + " Role: " + userC.getRole());
						keyboard.add(currentRow);
					} 
				}

				keyboardMarkup.setKeyboard(keyboard);

				// Send the tasks as a separate message
				SendMessage messageToTelegram = new SendMessage();
				messageToTelegram.setChatId(update.getMessage().getChatId()); 
				messageToTelegram.setText(tasksList.toString());
				messageToTelegram.setReplyMarkup(keyboardMarkup);


				try {
					execute(messageToTelegram);
				} catch (TelegramApiException e) {
					logger.error(e.getLocalizedMessage(), e);
				}
				
			}else if (messageTextFromTelegram.endsWith(BotLabels.MARK_DONE.getLabel())) {
				String done = messageTextFromTelegram.substring(0,
						messageTextFromTelegram.indexOf(BotLabels.DASH.getLabel()));
				Integer id = Integer.valueOf(done);

				try {

					ToDoItem item = toDoItemService.getItemById(id);
					item.setStatus("DONE");
					toDoItemService.updateToDoItem(id, item);
					BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_DONE.getMessage(), this);

				} catch (Exception e) {
					logger.error(e.getLocalizedMessage(), e);
				}

			} else if (messageTextFromTelegram.endsWith(BotLabels.MARK_TODO.getLabel())) {

				String undo = messageTextFromTelegram.substring(0,
						messageTextFromTelegram.indexOf(BotLabels.DASH.getLabel()));
				Integer id = Integer.valueOf(undo);

				try {

					ToDoItem item = toDoItemService.getItemById(id);
					item.setStatus("TODO");
					toDoItemService.updateToDoItem(id, item);
					BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_UNDONE.getMessage(), this);

				} catch (Exception e) {
					logger.error(e.getLocalizedMessage(), e);
				}

			} else if (messageTextFromTelegram.indexOf(BotLabels.DELETE.getLabel()) != -1) {

				String delete = messageTextFromTelegram.substring(0,
						messageTextFromTelegram.indexOf(BotLabels.DASH.getLabel()));
				Integer id = Integer.valueOf(delete);

				try {

					toDoItemService.deleteToDoItem(id);
					BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_DELETED.getMessage(), this);

				} catch (Exception e) {
					logger.error(e.getLocalizedMessage(), e);
				}

			} else if (messageTextFromTelegram.equals(BotCommands.HIDE_COMMAND.getCommand())
				|| messageTextFromTelegram.equals(BotLabels.HIDE_MAIN_SCREEN.getLabel())) {

				BotHelper.sendMessageToTelegram(chatId, BotMessages.BYE.getMessage(), this);

			} else if (messageTextFromTelegram.equals(BotCommands.TODO_LIST.getCommand()) 
				|| messageTextFromTelegram.equals(BotLabels.LIST_ALL_ITEMS.getLabel()) 
				|| messageTextFromTelegram.equals(BotLabels.MY_TODO_LIST.getLabel())) {

				List<ToDoItem> allItems = toDoItemService.findAll();
				ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
				List<KeyboardRow> keyboard = new ArrayList<>();

				// command back to main screen
				KeyboardRow mainScreenRowTop = new KeyboardRow();
				mainScreenRowTop.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
				keyboard.add(mainScreenRowTop);

				KeyboardRow firstRow = new KeyboardRow();
				firstRow.add(BotLabels.ADD_NEW_ITEM.getLabel());
				keyboard.add(firstRow);

				KeyboardRow myTodoListTitleRow = new KeyboardRow();
				myTodoListTitleRow.add(BotLabels.MY_TODO_LIST.getLabel());
				keyboard.add(myTodoListTitleRow);

				System.out.println("All items: BOT" + allItems.toString());
				

				List<ToDoItem> activeItems = allItems.stream().filter(item -> "INPROGRESS".equals(item.getStatus()))
						.collect(Collectors.toList());

				System.out.println("Active items: " + activeItems.toString());

				for (ToDoItem item : activeItems) {
					String assignee = "No Assignee";
					if (item.getAssignee() != null) {
						int id = item.getAssignee().intValue();
						assignee = userService.findByID(id).getUsername();
					}

					KeyboardRow currentRow = new KeyboardRow();
					currentRow.add(item.getID() + BotLabels.DASH.getLabel() + item.getDescription());
					currentRow.add(item.getID() + BotLabels.DASH.getLabel() + item.getStatus());
					currentRow.add(item.getID() + BotLabels.DASH.getLabel() + BotLabels.DELETE.getLabel());
					currentRow.add(item.getID() + BotLabels.DASH.getLabel() + assignee);
					keyboard.add(currentRow);
				}

				List<ToDoItem> doneItems = allItems.stream().filter(item -> "DONE".equals(item.getStatus()))
						.collect(Collectors.toList());

				System.out.println("Done items: " + doneItems.toString());

				for (ToDoItem item : doneItems) {
					String assignee = "No Assignee";
					if (item.getAssignee() != null) {
						int id = item.getAssignee().intValue();
						assignee = userService.findByID(id).getUsername();
					}
					KeyboardRow currentRow = new KeyboardRow();
					currentRow.add(item.getID() + BotLabels.DASH.getLabel() + item.getDescription());
					currentRow.add(item.getID() + BotLabels.DASH.getLabel() + BotLabels.MARK_TODO.getLabel());
					currentRow.add(item.getID() + BotLabels.DASH.getLabel() + BotLabels.DELETE.getLabel());
					currentRow.add(item.getID() + BotLabels.DASH.getLabel() + assignee);

					keyboard.add(currentRow);
				}

				List<ToDoItem> todoItems = allItems.stream().filter(item -> "TODO".equals(item.getStatus()))
				.collect(Collectors.toList());

				System.out.println("Todo items: " + todoItems.toString());

				for (ToDoItem item : todoItems) {
					String assignee = "No Assignee";
					if (item.getAssignee() != null) {
						int id = item.getAssignee().intValue();
						assignee = userService.findByID(id).getUsername();
					}
					KeyboardRow currentRow = new KeyboardRow();
					currentRow.add(item.getID() + BotLabels.DASH.getLabel() + item.getDescription());
					currentRow.add(item.getID() + BotLabels.DASH.getLabel() + BotLabels.MARK_DONE.getLabel());
					currentRow.add(item.getID() + BotLabels.DASH.getLabel() + BotLabels.DELETE.getLabel());
					currentRow.add(item.getID() + BotLabels.DASH.getLabel() + assignee);

					keyboard.add(currentRow);
				}
				// command back to main screen
				KeyboardRow mainScreenRowBottom = new KeyboardRow();
				mainScreenRowBottom.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
				keyboard.add(mainScreenRowBottom);

				keyboardMarkup.setKeyboard(keyboard);

				SendMessage messageToTelegram = new SendMessage();
				messageToTelegram.setChatId(chatId);
				messageToTelegram.setText(BotLabels.MY_TODO_LIST.getLabel());
				messageToTelegram.setReplyMarkup(keyboardMarkup);

				try {
					execute(messageToTelegram);
				} catch (TelegramApiException e) {
					logger.error(e.getLocalizedMessage(), e);
				}

			} else if (messageTextFromTelegram.equals(BotCommands.SPRING_LIST.getCommand()) 
				|| messageTextFromTelegram.equals(BotLabels.LIST_ALL_SPRINTS.getLabel())) {

				List<Sprint> allItems = sprintService.findAllSprints();
				ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
				List<KeyboardRow> keyboard = new ArrayList<>();

				// command back to main screen
				KeyboardRow mainScreenRowTop = new KeyboardRow();
				mainScreenRowTop.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
				keyboard.add(mainScreenRowTop);

				KeyboardRow firstRow = new KeyboardRow();
				firstRow.add(BotLabels.ADD_NEW_SPRINT.getLabel());
				keyboard.add(firstRow);

				KeyboardRow SprintTitleRow = new KeyboardRow();
				SprintTitleRow.add(BotLabels.MY_SPRINT_LIST.getLabel());
				keyboard.add(SprintTitleRow);

				System.out.println("All items: " + allItems.toString());

				List<Sprint> activeItems = allItems.stream().filter(item -> "ACTIVE".equals(item.getStatus()))
						.collect(Collectors.toList());

				// System.out.println("Active items: " + activeItems.toString());

				for (Sprint item : activeItems) {

					KeyboardRow currentRow = new KeyboardRow();
					currentRow.add("SPRINT: " + item.getID() + BotLabels.DASH.getLabel() + item.getName());
					currentRow.add(item.getID() + BotLabels.DASH.getLabel() + item.getStatus());
					// currentRow.add(item.getID() + BotLabels.DASH.getLabel() + BotLabels.DELETE.getLabel());

					keyboard.add(currentRow);
				}

				List<Sprint> doneItems = allItems.stream().filter(item -> "COMPLETED".equals(item.getStatus()))
						.collect(Collectors.toList());

				// System.out.println("Done items: " + doneItems.toString());

				for (Sprint item : doneItems) {
					KeyboardRow currentRow = new KeyboardRow();
					currentRow.add("SPRINT: " + item.getID() + BotLabels.DASH.getLabel() + item.getName());
					currentRow.add(item.getID() + BotLabels.DASH.getLabel() + item.getStatus());
					// currentRow.add(item.getID() + BotLabels.DASH.getLabel() + BotLabels.DELETE.getLabel());
					keyboard.add(currentRow);
				}

				List<Sprint> todoItems = allItems.stream().filter(item -> "PLANNED".equals(item.getStatus()))
				.collect(Collectors.toList());

				// System.out.println("Done items: " + todoItems.toString());

				for (Sprint item : todoItems) {
					KeyboardRow currentRow = new KeyboardRow();
					currentRow.add("SPRINT: " + item.getID() + BotLabels.DASH.getLabel() + item.getName());
					currentRow.add(item.getID() + BotLabels.DASH.getLabel() + item.getStatus());
					// currentRow.add(item.getID() + BotLabels.DASH.getLabel() + BotLabels.DELETE.getLabel());
					keyboard.add(currentRow);
				}
				// // command back to main screen
				KeyboardRow mainScreenRowBottom = new KeyboardRow();
				mainScreenRowBottom.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
				keyboard.add(mainScreenRowBottom);

				keyboardMarkup.setKeyboard(keyboard);

				SendMessage messageToTelegram = new SendMessage();
				messageToTelegram.setChatId(chatId);
				messageToTelegram.setText(BotLabels.MY_SPRINT_LIST.getLabel());
				messageToTelegram.setReplyMarkup(keyboardMarkup);

				try {
					execute(messageToTelegram);
				} catch (TelegramApiException e) {
					logger.error(e.getLocalizedMessage(), e);
				}

			} else if (messageTextFromTelegram.equals(BotCommands.ADD_ITEM.getCommand())
				|| messageTextFromTelegram.equals(BotLabels.ADD_NEW_ITEM.getLabel())) {

					userWaitingForTodo.put(chatId, true);
				try {
					
					SendMessage messageToTelegram = new SendMessage();
					messageToTelegram.setChatId(chatId);
					messageToTelegram.setText(BotMessages.TYPE_NEW_TODO_ITEM.getMessage());
					// hide keyboard
					ReplyKeyboardRemove keyboardMarkup = new ReplyKeyboardRemove(true);
					messageToTelegram.setReplyMarkup(keyboardMarkup);

					// send message
					execute(messageToTelegram);
					return;

				} catch (Exception e) {
					logger.error(e.getLocalizedMessage(), e);
				}

			} else if(messageTextFromTelegram.endsWith(BotLabels.NO_ASSIGNEE.getLabel())){
				String noAssignee = messageTextFromTelegram.substring(0,
				messageTextFromTelegram.indexOf(BotLabels.DASH.getLabel()));
				Integer id = Integer.valueOf(noAssignee);
				ToDoItem selectedTask = toDoItemService.getItemById(id);

				SendMessage messageToTelegram = new SendMessage();
				messageToTelegram.setChatId(chatId);
				messageToTelegram.setText(BotLabels.SELECT_DEVELOPER.getLabel() + selectedTask.getDescription());


				ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
				List<KeyboardRow> keyboard = new ArrayList<>();


				List<User> allUsers = userService.findAll();

				// command back to main screen
				KeyboardRow mainScreenRowTop = new KeyboardRow();
				mainScreenRowTop.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
				keyboard.add(mainScreenRowTop);

				System.out.println("All items: " + allUsers.toString());
				for (User userC : allUsers) {
					KeyboardRow currentRow = new KeyboardRow();
					currentRow.add(selectedTask.getID() + " User: " + userC.getID() + BotLabels.DASH.getLabel() + userC.getUsername() + " Role: " + userC.getRole());
					keyboard.add(currentRow);
				}

				keyboardMarkup.setKeyboard(keyboard);

				// Add the keyboard markup
				messageToTelegram.setReplyMarkup(keyboardMarkup);

				try {
					execute(messageToTelegram);
				} catch (TelegramApiException e) {
					logger.error(e.getLocalizedMessage(), e);
				}

			} 
			// else if(messageTextFromTelegram.endsWith("DEVELOPER") || messageTextFromTelegram.endsWith("ADMIN")){

			// 	Pattern taskIdPattern = Pattern.compile("^(\\d+)");
			// 	Matcher taskIdMatcher = taskIdPattern.matcher(messageTextFromTelegram);
			// 	Integer taskID = null;
				
			// 	if (taskIdMatcher.find()) {
			// 		taskID = Integer.parseInt(taskIdMatcher.group(1));
			// 	}
				
			// 	// Extract user ID using "User: "
			// 	Pattern userIdPattern = Pattern.compile("User: (\\d+)");
			// 	Matcher userIdMatcher = userIdPattern.matcher(messageTextFromTelegram);
			// 	Integer userId = null;
				
			// 	if (userIdMatcher.find()) {
			// 		userId = Integer.parseInt(userIdMatcher.group(1));
			// 	}

			// 	System.out.println("Task ID: " + taskID);
			// 	System.out.println("User ID: " + userId);

			// 	ToDoItem oldItem = toDoItemService.getItemById(taskID);

			// 	System.out.println("********Old item: " + oldItem.toString());
			// 	ToDoItem newItem = new ToDoItem();
			// 	newItem.setDescription(oldItem.getDescription());
			// 	newItem.setCreation_ts(oldItem.getCreation_ts());
			// 	newItem.setCreatedBy(oldItem.getCreatedBy());
			// 	newItem.setStatus(oldItem.getStatus());
			// 	newItem.setPriority(oldItem.getPriority());
			// 	newItem.setEstimatedTime(oldItem.getEstimatedTime());
			// 	newItem.setAssignee(Long.valueOf(userId));

	
				
			// 	try {
			// 		toDoItemService.updateToDoItem(taskID, newItem);
			// 		BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_ASSIGNEE_CHANGED.getMessage(), this);
			// 	} catch (Exception e) {
			// 		logger.error(e.getLocalizedMessage(), e);
			// 	}


			// } 
			else if (messageTextFromTelegram.equals(BotLabels.ADD_NEW_SPRINT.getLabel())) {
				
				userWaitingForDate.put(chatId, true);
				try {
					SendMessage messageToTelegram = new SendMessage();
					messageToTelegram.setChatId(chatId);
					messageToTelegram.setText(BotMessages.TYPE_NEW_SPRING.getMessage());
					// hide keyboard
					ReplyKeyboardRemove keyboardMarkup = new ReplyKeyboardRemove(true);
					messageToTelegram.setReplyMarkup(keyboardMarkup);

					// send first message
					execute(messageToTelegram);

				} catch (Exception e) {
					logger.error(e.getLocalizedMessage(), e);
				}
				
			} else if(messageTextFromTelegram.startsWith("SPRINT:")){
				Pattern sprintS = Pattern.compile("SPRINT: (\\d+)-");
				Matcher sprintIdMatcher = sprintS.matcher(messageTextFromTelegram);
				final Integer sprintId;

				if (sprintIdMatcher.find()) {
					sprintId = Integer.parseInt(sprintIdMatcher.group(1));
					System.out.println("Sprint ID: " + sprintId);
				} else {
					System.out.println("Sprint id not found");
					return; // Ensure sprintId is always initialized
				}

				Sprint sprintSelected = sprintService.getSprintById(sprintId).getBody();

				List<ToDoItem> allTasks = toDoItemService.findAll();
				
				// Tasks not assigned to any sprint
				List<ToDoItem> noTasksSprint = allTasks.stream()
					.filter(item -> item.getSprintId() == null)
					.collect(Collectors.toList());
				
				// Tasks assigned to the selected sprint
				List<ToDoItem> sprintTasks = allTasks.stream()
					.filter(item -> item.getSprintId() != null && item.getSprintId().equals(Long.valueOf(sprintId)))
					.collect(Collectors.toList());
				
				String sprintMessage = "No tasks assigned to this sprint.";
				
				if (!sprintTasks.isEmpty()) {
					sprintMessage = "Tasks in this sprint:\n" +
						sprintTasks.stream()
							.map(ToDoItem::getDescription)
							.collect(Collectors.joining("\n"));
				}

				SendMessage messageToTelegram = new SendMessage();
				messageToTelegram.setChatId(chatId);
				messageToTelegram.setText(sprintMessage + "\n" + BotLabels.SELECT_SPRINT.getLabel() + sprintSelected.getName());


				ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
				List<KeyboardRow> keyboard = new ArrayList<>();



				// command back to main screen
				KeyboardRow mainScreenRowTop = new KeyboardRow();
				mainScreenRowTop.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
				keyboard.add(mainScreenRowTop);


				KeyboardRow title = new KeyboardRow();
				mainScreenRowTop.add("AVAILABLE TASKS:");
				keyboard.add(title);

				for (ToDoItem task : noTasksSprint) {
					KeyboardRow currentRow = new KeyboardRow();
					currentRow.add("Selected SPRINT: " + sprintId + "TASK: " + task.getID() + BotLabels.DASH.getLabel() + task.getDescription());
					// currentRow.add(task.getID() + BotLabels.DASH.getLabel() + task.getStatus());
					keyboard.add(currentRow);
				}

				keyboardMarkup.setKeyboard(keyboard);
				// Add the keyboard markup
				messageToTelegram.setReplyMarkup(keyboardMarkup);
				try {
					execute(messageToTelegram);
				} catch (TelegramApiException e) {
					logger.error(e.getLocalizedMessage(), e);
				}
			} else if(messageTextFromTelegram.startsWith("Selected SPRINT:")){

				// Extract SPRINT ID
				Pattern sprintPattern = Pattern.compile("SPRINT: (\\d+)");
				Matcher sprintMatcher = sprintPattern.matcher(messageTextFromTelegram);
				Integer sprintId = null;
				
				if (sprintMatcher.find()) {
					sprintId = Integer.parseInt(sprintMatcher.group(1));
				}
				
				// Extract TASK ID
				Pattern taskPattern = Pattern.compile("TASK:\\s*(\\d+)");
				Matcher taskMatcher = taskPattern.matcher(messageTextFromTelegram);
				Integer taskId = null;
				
				if (taskMatcher.find()) {
					taskId = Integer.parseInt(taskMatcher.group(1));
				}
				
				ToDoItem oldItem = toDoItemService.getItemById(taskId);
				ToDoItem newItem = new ToDoItem();
				newItem.setDescription(oldItem.getDescription());
				newItem.setCreation_ts(oldItem.getCreation_ts());
				newItem.setCreatedBy(oldItem.getCreatedBy());
				newItem.setStatus(oldItem.getStatus());
				newItem.setPriority(oldItem.getPriority());
				newItem.setEstimatedTime(oldItem.getEstimatedTime());
				newItem.setAssignee(oldItem.getAssignee());
				newItem.setSprintId(Long.valueOf(sprintId));

				try {
					toDoItemService.updateToDoItem(taskId, newItem);
					BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_SPRINT_CHANGED.getMessage(), this);
				} catch (Exception e) {
					logger.error(e.getLocalizedMessage(), e);
				}
				
			}

			if (userWaitingForTodo.getOrDefault(chatId, false)) {
				System.out.println("User is waiting for todo");
				
				try {
					String[] parts = messageTextFromTelegram.split(" ");
					if (parts.length < 4 ) {

						BotHelper.sendMessageToTelegram(chatId, "❌ Uso incorrecto. Por favor escribe: <descripción> <estado(TODO|INPROGRESS|DONE)> <tiempoEstimado(hr)>", this);
						return;
					}
					
					if (!TaskStatus.isValidStatus(parts[1])) {
						System.out.println("Estado:-" + parts[1] + "-");
						BotHelper.sendMessageToTelegram(chatId, "❌ El estado debe ser TODO, INPROGRESS o DONE.", this);
						return;
					}
					try {
						Float.parseFloat(parts[2]);
						if (Float.parseFloat(parts[2]) > 4) {
							BotHelper.sendMessageToTelegram(chatId, "❌ El tiempo estimado debe ser de máximo 4 horas!", this);
							return;
						}
					} catch (NumberFormatException e) {
						BotHelper.sendMessageToTelegram(chatId, "❌ El tiempo estimado debe ser un número válido.", this);
						return;
					}
					Long assigneeID = null;
					if (parts[3] != null) {
						try {
							int assigneeId = Integer.parseInt(parts[3]);
							if (userService.findByID(assigneeId) == null) {
								BotHelper.sendMessageToTelegram(chatId, "❌ El desarrollador no existe.", this);
								return;
							} else {
								assigneeID = Long.parseLong(parts[3]);
							}
						} catch (NumberFormatException e) {
							BotHelper.sendMessageToTelegram(chatId, "❌ El ID del desarrollador debe ser un número entero.", this);
							return;
						}
					}
					String description = parts[0];
					String status = parts[1];
					float estimatedTime = Float.parseFloat(parts[2]);

					ToDoItem newItem = new ToDoItem();
					newItem.setDescription(description);
					newItem.setCreation_ts(OffsetDateTime.now());
					//setDone
					newItem.setCreatedBy((long) user.getID());
					newItem.setStatus(status);
					newItem.setPriority("LOW");
					newItem.setEstimatedTime(estimatedTime);
					if(assigneeID != null){
						newItem.setAssignee(assigneeID);
					}

					ToDoItem entity = toDoItemService.addToDoItem(newItem);

					SendMessage messageToTelegram = new SendMessage();
					messageToTelegram.setChatId(chatId);
					messageToTelegram.setText(BotMessages.NEW_ITEM_ADDED.getMessage());

					execute(messageToTelegram);
					userWaitingForTodo.put(chatId, false);
				} catch (Exception e) {
					logger.error(e.getLocalizedMessage(), e);
				}
			}

			if (userWaitingForDate.getOrDefault(chatId, false)){
				System.out.println("User is waiting for date");

				try{
					String[] parts = messageTextFromTelegram.split(" ");
					if (parts.length < 5) {
						BotHelper.sendMessageToTelegram(chatId, "❌ Uso incorrecto. Por favor escribe: <nombre> <fechaInicio> <fechaFin>", this);
						return;
					}
					String name = parts[0];
					String startDate1 = parts[1];
					String startDate2 = parts[2];
					String endDate1 = parts[3];
					String endDate2 = parts[4];

					String startDateInput = startDate1 + " " + startDate2;
					String endDateInput = endDate1 + " " + endDate2;
					LocalDateTime localDateTime = LocalDateTime.parse(startDateInput, formatter);
					OffsetDateTime startDate = localDateTime.atOffset(ZoneOffset.UTC);
					LocalDateTime localDateTime2 = LocalDateTime.parse(endDateInput, formatter);
					OffsetDateTime endDate = localDateTime2.atOffset(ZoneOffset.UTC);
					Sprint newSprint = new Sprint();
					System.out.println("Name: " + name);
					System.out.println("Start date: " + startDate);
					System.out.println("End date: " + endDate);
					newSprint.setName(name);
					newSprint.setStartDate(startDate);
					newSprint.setEndDate(endDate);
					newSprint.setStatus("PLANNED");

					Sprint entity = sprintService.addSprint(newSprint);


					SendMessage messageToTelegram = new SendMessage();
					messageToTelegram.setChatId(chatId);
					messageToTelegram.setText(BotMessages.NEW_SPRINT_ADDED.getMessage());

					execute(messageToTelegram);
					userWaitingForDate.put(chatId, false);

				} catch (Exception e) {
					logger.error(e.getLocalizedMessage(), e);
				}
			}
		}
	}

	public User userAuthMiddleware(Update update) {
		long chatId = update.getMessage().getChatId();
		User user = userService.findByTelegramId(chatId);
		String messageTextFromTelegram = update.getMessage().getText();
		// if (user == null) {
		// 	BotHelper.sendMessageToTelegram(chatId, BotMessages.USER_NOT_AUTHENTICATED.getMessage(), this);
		// }


		if (user == null) {
			if (messageTextFromTelegram.startsWith("/login")) {
				String[] parts = messageTextFromTelegram.split(" ");
				if (parts.length < 3) {
					BotHelper.sendMessageToTelegram(chatId, "❌ Uso incorrecto. Escribe: /login <usuario> <contraseña>", this);
					return user;
				}
			
				String username = parts[1];
				String password = parts[2]; // ⚠️ En un caso real, deberíamos hashear esto antes de comparar
			
				//user = userService.findByUsername(username);
				LoginUserDto loginUserDto = new LoginUserDto();
				loginUserDto.setUsername(username);
				loginUserDto.setPassword(password);
				user = authService.validateUser(loginUserDto);
				if (user == null ) {
					BotHelper.sendMessageToTelegram(chatId, "❌ Usuario o contraseña incorrectos.", this);
					return user;
				}
			
				// Guardar el chatId del usuario
				user.setTelegramId(chatId);
				userService.saveUser(user);
			
				BotHelper.sendMessageToTelegram(chatId, "✅ Has iniciado sesión correctamente.", this);
				return user;
			} else {
				BotHelper.sendMessageToTelegram(chatId, "🔒 Debes iniciar sesión con /login para usar el bot.", this);
				return user;
			}
		} else {
			if (messageTextFromTelegram.startsWith("/logout")) {
				user = authService.logoutUser(user.getUsername());
				userWaitingForTodo.remove(chatId);
				BotHelper.sendMessageToTelegram(chatId, "✅ Has cerrado sesión correctamente.", this);
				return null; // No queremos seguir procesando mensajes de un usuario no autenticado
			}
		}
		return user;
	}

	@Override
	public String getBotUsername() {		
		return botName;
	}
}