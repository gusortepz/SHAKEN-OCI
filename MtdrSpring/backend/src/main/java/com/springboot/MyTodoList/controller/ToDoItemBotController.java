package com.springboot.MyTodoList.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.Set;
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
import com.springboot.MyTodoList.model.Project;
import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.model.SprintKPI;
import com.springboot.MyTodoList.model.ToDoItem;
import com.springboot.MyTodoList.model.User;
import com.springboot.MyTodoList.service.AuthService;
import com.springboot.MyTodoList.service.KPIService;
import com.springboot.MyTodoList.service.ProjectService;
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
	private ProjectService projectService;
	private String botName;
	private UserService userService;
	private AuthService authService;

	private final Map<Long, Boolean> userWaitingForTodo = new ConcurrentHashMap<>();
	private final Map<Long, Boolean> userWaitingForDate = new ConcurrentHashMap<>();
	private static class UserSession {
		boolean waitingForProject;
		String projectName;
		String projectDescription;
		LocalDate projectStartDate;

		boolean waitingForSprint;
		Long  sprintProjectId;
		String sprintName;
		LocalDate sprintStartDate;
		LocalDate sprintEndDate;
		String sprintStatus;

		boolean waitingForItem;
		Long    itemProjectId;
		Long    itemSprintId;
		Long    itemAssigneeId;
		String  itemDescription;
		String  itemStatus;
		String  itemPriority;
		Integer itemStoryPoints;
		Float   itemEstimatedTime;
	}
	private Map<Long, UserSession> sessions = new ConcurrentHashMap<>();
	DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

	public ToDoItemBotController(String botToken, String botName, ToDoItemService toDoItemService, UserService userService, AuthService authService, SprintService sprintService, KPIService kpiService, ProjectService projectService) {
		super(botToken);
		logger.info("Bot Token: " + botToken);
		logger.info("Bot name: " + botName);
		this.toDoItemService = toDoItemService;
		this.sprintService = sprintService;
		this.kpiService = kpiService;
		this.projectService = projectService;
		this.botName = botName;
		this.userService = userService;
		this.authService = authService;
	}

	@Override
	public void onUpdateReceived(Update update) {

		if (update.hasMessage() && update.getMessage().hasText()) {
			
			System.out.println("Current users waiting for todo" + userWaitingForTodo.toString());

			long chatId = update.getMessage().getChatId();
			UserSession session = sessions.computeIfAbsent(chatId, id -> new UserSession());
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
				row.add(BotLabels.LIST_ALL_PROJECTS.getLabel());
				keyboard.add(row);
				row = new KeyboardRow();
				row.add(BotLabels.LIST_ALL_KPIS.getLabel());
				row.add(BotLabels.LIST_ALL_SPRINTS.getLabel());
				keyboard.add(row);

				row = new KeyboardRow();
				row.add(BotLabels.ADD_NEW_ITEM.getLabel());
				row.add(BotLabels.ADD_NEW_SPRINT.getLabel());
				row.add(BotLabels.ADD_NEW_PROJECT.getLabel());
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

			} else if (messageTextFromTelegram.equals(BotLabels.LIST_ALL_PROJECTS.getLabel())) {
				// fetch all projects and all sprints
				List<Project> allProjects = projectService.findAllProjects();

				ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
				List<KeyboardRow> keyboard = new ArrayList<>();

				// — top “back to main” button
				KeyboardRow mainScreenTop = new KeyboardRow();
				mainScreenTop.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
				keyboard.add(mainScreenTop);

				// — “add new project” button
				KeyboardRow addProjRow = new KeyboardRow();
				addProjRow.add(BotLabels.ADD_NEW_PROJECT.getLabel());
				keyboard.add(addProjRow);

				// — header
				KeyboardRow header = new KeyboardRow();
				header.add(BotLabels.MY_PROJECT_LIST.getLabel());
				keyboard.add(header);

				// — for each project, print its line and then its sprints
				for (Project proj : allProjects) {
					// project row
					KeyboardRow projRow = new KeyboardRow();
					projRow.add("PROJECT: " 
						+ proj.getID() 
						+ BotLabels.DASH.getLabel() 
						+ proj.getName());
					keyboard.add(projRow);

				}

				// — bottom “back to main” button
				KeyboardRow mainScreenBot = new KeyboardRow();
				mainScreenBot.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
				keyboard.add(mainScreenBot);

				keyboardMarkup.setKeyboard(keyboard);

				SendMessage reply = new SendMessage();
				reply.setChatId(chatId);
				reply.setText(BotLabels.MY_PROJECT_LIST.getLabel());
				reply.setReplyMarkup(keyboardMarkup);

				try {
					execute(reply);
				} catch (TelegramApiException e) {
					logger.error(e.getLocalizedMessage(), e);
				}
			} else if (messageTextFromTelegram.startsWith("PROJECT:")) {
				// 1) Extract project ID
				Pattern projectPattern = Pattern.compile("PROJECT: (\\d+)-");
				Matcher matcher = projectPattern.matcher(messageTextFromTelegram);
				if (!matcher.find()) {
					// could send a warning message instead of just returning
					return;
				}
				Long projectId = Long.valueOf(matcher.group(1));
				Project project = projectService.getProjectById(projectId.intValue()).getBody();

				// 2) Filter sprints by project
				List<Sprint> allSprints = sprintService.findAllSprints();
				List<Sprint> projectSprints = allSprints.stream()
					.filter(s -> s.getProjectId().equals(projectId))
					.collect(Collectors.toList());

				// 3) Build the reply text
				StringBuilder sb = new StringBuilder();
				sb.append("🏷️ Sprints for Project ").append(project.getName()).append(":\n\n");
				if (projectSprints.isEmpty()) {
					sb.append("No sprints found for this project.");
				} else {
					for (Sprint s : projectSprints) {
						sb.append(s.getName())
						.append(" — ")
						.append(s.getStatus())
						.append("\n");
					}
				}

				// 4) Send as a normal Telegram message
				SendMessage reply = new SendMessage();
				reply.setChatId(chatId);
				reply.setText(sb.toString());
				try {
					execute(reply);
				} catch (TelegramApiException e) {
					logger.error("Failed to send sprint list for project " + projectId, e);
				}
			} else if(messageTextFromTelegram.equals(BotLabels.ADD_NEW_PROJECT.getLabel())){
				session.waitingForProject = true;
				session.projectName = null;
				session.projectDescription = null;
				session.projectStartDate = null;
				SendMessage reply = new SendMessage();
				String sb = "🆕 Great! Let’s create a new Project.\nPlease enter the *project name*:";

				reply.setChatId(chatId);
				reply.setText(sb.toString());
				try {
					execute(reply);
				} catch (TelegramApiException e) {
					logger.error("Failed to send message for adding new project", e);
				}
				return;
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
				
			}else if (messageTextFromTelegram.endsWith(BotLabels.MARK_DONE.getLabel()) &&  session.waitingForItem == false) {
				String done = messageTextFromTelegram.substring(0,
						messageTextFromTelegram.indexOf(BotLabels.DASH.getLabel()));
				Integer id = Integer.valueOf(done);

				try {

					ToDoItem item = toDoItemService.getItemById(id);
					item.setStatus("TODO");
					toDoItemService.updateToDoItem(id, item);
					BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_DONE.getMessage(), this);

				} catch (Exception e) {
					logger.error(e.getLocalizedMessage(), e);
				}

			} else if (messageTextFromTelegram.endsWith(BotLabels.MARK_TODO.getLabel()) && session.waitingForItem == false) {

				String undo = messageTextFromTelegram.substring(0,
						messageTextFromTelegram.indexOf(BotLabels.DASH.getLabel()));
				Integer id = Integer.valueOf(undo);

				try {

					ToDoItem item = toDoItemService.getItemById(id);
					item.setStatus("INPROGRESS");
					toDoItemService.updateToDoItem(id, item);
					BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_UNDONE.getMessage(), this);

				} catch (Exception e) {
					logger.error(e.getLocalizedMessage(), e);
				}

			} else if (messageTextFromTelegram.endsWith(BotLabels.MARK_IN_PROGRESS.getLabel()) && session.waitingForItem == false) {

				String undo = messageTextFromTelegram.substring(0,
						messageTextFromTelegram.indexOf(BotLabels.DASH.getLabel()));
				Integer id = Integer.valueOf(undo);

				try {

					ToDoItem item = toDoItemService.getItemById(id);
					item.setStatus("DONE");
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
					currentRow.add(item.getID() + BotLabels.DASH.getLabel() + item.getStatus());
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
					currentRow.add(item.getID() + BotLabels.DASH.getLabel() + item.getStatus());
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

			} else if (messageTextFromTelegram.startsWith(BotLabels.COMPLETED_TASKS_SPRINT.getLabel())) {
				try {
				Long sprintId = Long.parseLong(messageTextFromTelegram.split(" ")[1]);
				List<ToDoItem> completed = sprintService.getCompletedTasksBySprint(sprintId);

				StringBuilder builder = new StringBuilder("✅ Completed tasks in Sprint " + sprintId + ":\n\n");
				for (ToDoItem item : completed) {
					builder.append("• ").append(item.getDescription()).append("\n");
				}

				SendMessage msg = new SendMessage();
				msg.setChatId(chatId);
				msg.setText(builder.toString());
				execute(msg);
				} catch (Exception e) {
					logger.error(e.getLocalizedMessage(), e);
				}
			}

			else if (messageTextFromTelegram.startsWith(BotLabels.COMPLETED_TASKS_USER.getLabel())) {
				try {
				String[] parts = messageTextFromTelegram.split(" ");
				Long sprintId = Long.parseLong(parts[1]);
				Long userId = Long.parseLong(parts[2]);

				List<ToDoItem> completed = sprintService.getCompletedTasksByUserInSprint(sprintId, userId);

				StringBuilder builder = new StringBuilder("✅ Completed tasks by user " + userId + " in Sprint " + sprintId + ":\n\n");
				for (ToDoItem item : completed) {
					builder.append("• ").append(item.getDescription()).append("\n");
				}

				SendMessage msg = new SendMessage();
				msg.setChatId(chatId);
				msg.setText(builder.toString());
				execute(msg);
				} catch (Exception e) {
					logger.error(e.getLocalizedMessage(), e);
				}
			}
			else if (messageTextFromTelegram.equals(BotLabels.ADD_NEW_ITEM.getLabel())) {
				session.waitingForItem     = true;
				session.itemProjectId      = null;
				session.itemSprintId       = null;
				session.itemAssigneeId     = null;
				session.itemDescription    = null;
				session.itemStatus         = null;
				session.itemPriority       = null;
				session.itemStoryPoints    = null;
				session.itemEstimatedTime  = null;

				// List all projects
				List<Project> projects = projectService.findAllProjects();
				if (projects.isEmpty()) {
					sendText(chatId, "⚠️ No projects found. Please create a project first.");
					session.waitingForItem = false;
				} else {
					StringBuilder sb = new StringBuilder("📋 *Available Projects:*\n\n");
					for (Project p : projects) {
						sb.append("• ID ")
						.append(p.getID())
						.append(": ")
						.append(p.getName())
						.append("\n");
					}
					sb.append("\nSend me the *Project ID* for this task:");
					sendText(chatId, sb.toString());
				}
				return;
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

			} else if (messageTextFromTelegram.equals(BotLabels.ADD_NEW_SPRINT.getLabel())) {
				
				// 1) Mark that we’re in sprint-creation mode
				session.waitingForSprint    = true;
				session.sprintProjectId     = null;
				session.sprintName          = null;
				session.sprintStartDate     = null;
				session.sprintEndDate       = null;
				session.sprintStatus        = null;

				// 2) Fetch all projects and build the listing
				List<Project> allProjects = projectService.findAllProjects();
				if (allProjects.isEmpty()) {
					sendText(chatId, "⚠️ No projects found. Please create a project first.");
					session.waitingForSprint = false;
				} else {
					StringBuilder sb = new StringBuilder();
					sb.append("📋 *Available Projects:*\n\n");
					for (Project p : allProjects) {
						sb.append("• ID ")
						.append(p.getID())
						.append(": ")
						.append(p.getName())
						.append("\n");
					}
					sb.append("\nPlease send me the *Project ID* to attach this sprint to:");
					sendText(chatId, sb.toString());
				}
				return;
				
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

			if (session.waitingForItem) {
				// a) Project ID
				if (session.itemProjectId == null) {
					try {
						session.itemProjectId = Long.parseLong(messageTextFromTelegram.trim());
					} catch (NumberFormatException e) {
						sendText(chatId, "That doesn’t look like a number. Please send a valid *Project ID*:");
						return;
					}
					// List sprints for that project
					List<Sprint> sprints = sprintService.findAllSprints().stream()
						.filter(s -> s.getProjectId().equals(session.itemProjectId))
						.collect(Collectors.toList());
					if (sprints.isEmpty()) {
						sendText(chatId, "⚠️ No sprints for that project. Create a sprint first.");
						session.waitingForItem = false;
					} else {
						StringBuilder sb = new StringBuilder("📋 *Sprints in Project " + session.itemProjectId + ":*\n\n");
						for (Sprint s : sprints) {
							sb.append("• ID ").append(s.getID())
							.append(BotLabels.DASH.getLabel())
							.append(s.getName())
							.append(" (").append(s.getStatus()).append(")\n");
						}
						sb.append("\nSend me the *Sprint ID* for this task:");
						sendText(chatId, sb.toString());
					}
					return;
				}

				// b) Sprint ID
				if (session.itemSprintId == null) {
					try {
						session.itemSprintId = Long.parseLong(messageTextFromTelegram.trim());
					} catch (NumberFormatException e) {
						sendText(chatId, "Invalid number. Please send a valid *Sprint ID*:");
						return;
					}
					// List developers for assignment
					List<User> users = userService.findAll();
					if (users.isEmpty()) {
						sendText(chatId, "⚠️ No users found in the system.");
						session.waitingForItem = false;
					} else {
						StringBuilder sb = new StringBuilder("📋 *Available Users:*\n\n");
						for (User u : users) {
							sb.append("• ID ")
							.append(u.getID())
							.append(": ")
							.append(u.getUsername())
							.append(" (").append(u.getRole()).append(")\n");
						}
						sb.append("\nSend me the *Assignee ID* for this task:");
						sendText(chatId, sb.toString());
					}
					return;
				}

				// c) Assignee ID
				if (session.itemAssigneeId == null) {
					try {
						session.itemAssigneeId = Long.parseLong(messageTextFromTelegram.trim());
					} catch (NumberFormatException e) {
						sendText(chatId, "Please send a valid *Assignee ID* (number):");
						return;
					}
					sendText(chatId, "Great. Now send me the *task description*:");
					return;
				}

				// d) Description
				if (session.itemDescription == null) {
					session.itemDescription = messageTextFromTelegram.trim();
					sendText(chatId, "Whats the *status*? (e.g. TODO, INPROGRESS, DONE)");
					return;
				}

				// e) Status
				if (session.itemStatus == null) {
					session.itemStatus = messageTextFromTelegram.trim();
					sendText(chatId, "Priority? (LOW, MEDIUM, HIGH)");
					return;
				}

				// f) Priority
				if (session.itemPriority == null) {
					session.itemPriority = messageTextFromTelegram.trim().toUpperCase();
					sendText(chatId, "Send *story points* (integer):");
					return;
				}

				// g) Story points
				if (session.itemStoryPoints == null) {
					try {
						session.itemStoryPoints = Integer.parseInt(messageTextFromTelegram.trim());
					} catch (NumberFormatException e) {
						sendText(chatId, "Invalid number. Please send *story points* as an integer:");
						return;
					}
					sendText(chatId, "Finally, send the *estimated time* (hours as decimal, e.g. 3.5):");
					return;
				}

				// h) Estimated time
				if (session.itemEstimatedTime == null) {
					try {
						session.itemEstimatedTime = Float.parseFloat(messageTextFromTelegram.trim());
					} catch (NumberFormatException e) {
						sendText(chatId, "Invalid format. Please send *estimated time* as a decimal number:");
						return;
					}

					// — all data collected, build & save —
					ToDoItem item = new ToDoItem();
					item.setProjectId(session.itemProjectId);
					item.setSprintId(session.itemSprintId);
					item.setAssignee(session.itemAssigneeId);
					item.setDescription(session.itemDescription);
					item.setStatus(session.itemStatus);
					item.setPriority(session.itemPriority);
					item.setStoryPoints(session.itemStoryPoints);
					item.setEstimatedTime(session.itemEstimatedTime);
					item.setCreatedBy(1L);  // hard-coded for now

					toDoItemService.addToDoItem(item);

					// confirm
					sendText(chatId,
						"✅ Task created!\n" +
						"• ID: "   + item.getID() + "\n" +
						"• Project: " + session.itemProjectId + "\n" +
						"• Sprint: "  + session.itemSprintId + "\n" +
						"• Assignee: " + session.itemAssigneeId + "\n" +
						"• Desc: " + item.getDescription() + "\n" +
						"• Status: " + item.getStatus() + "\n" +
						"• Priority: " + item.getPriority() + "\n" +
						"• SP: " + item.getStoryPoints() + "\n" +
						"• EstTime: " + item.getEstimatedTime()
					);

					// clear session
					sessions.remove(chatId);

					ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
					List<KeyboardRow> keyboard = new ArrayList<>();

					// Row: List All SPRINTS
					KeyboardRow listRow = new KeyboardRow();
					listRow.add(BotLabels.LIST_ALL_ITEMS.getLabel());
					keyboard.add(listRow);

					// Row: Add New SPRINTS
					KeyboardRow addRow = new KeyboardRow();
					addRow.add(BotLabels.ADD_NEW_ITEM.getLabel());
					keyboard.add(addRow);

					// Row: Show Main Screen
					KeyboardRow mainRow = new KeyboardRow();
					mainRow.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
					keyboard.add(mainRow);

					keyboardMarkup.setKeyboard(keyboard);
					keyboardMarkup.setResizeKeyboard(true);    // optional: makes it more compact
					keyboardMarkup.setOneTimeKeyboard(true);   // optional: hide after selection

					// 2) Send the keyboard along with a follow-up prompt
					SendMessage followUp = SendMessage.builder()
						.chatId(chatId)
						.text("What would you like to do next?")
						.replyMarkup(keyboardMarkup)
						.build();

					try {
						execute(followUp);
					} catch (TelegramApiException e) {
						logger.error("Error sending post-create keyboard", e);
					}
					return;
				}
			}

			if (session.waitingForSprint) {
				// 1) project ID
				if (session.sprintProjectId == null) {
					try {
						session.sprintProjectId = Long.parseLong(messageTextFromTelegram.trim());
						sendText(chatId, "Got it. Now send me the *Sprint name*:");
					} catch (NumberFormatException ex) {
						sendText(chatId, "That didn’t look like a number. Please send a valid *Project ID*:");
					}
					return;
				}
				// 2) sprint name
				if (session.sprintName == null) {
					session.sprintName = messageTextFromTelegram.trim();
					sendText(chatId, "Great. Enter the *start date* (YYYY-MM-DD):");
					return;
				}
				// 3) start date
				if (session.sprintStartDate == null) {
					try {
						session.sprintStartDate = LocalDate.parse(messageTextFromTelegram.trim());
						sendText(chatId, "Start date set. Now the *end date* (YYYY-MM-DD):");
					} catch (DateTimeParseException ex) {
						sendText(chatId, "Invalid date format. Please send *start date* as YYYY-MM-DD:");
					}
					return;
				}
				// 4) end date
				if (session.sprintEndDate == null) {
					try {
						session.sprintEndDate = LocalDate.parse(messageTextFromTelegram.trim());
						sendText(chatId, "Almost there! Send me the *status* (PLANNED, ACTIVE or COMPLETED):");
					} catch (DateTimeParseException ex) {
						sendText(chatId, "Invalid date. Please send *end date* as YYYY-MM-DD:");
					}
					return;
				}
				// 5) status
				if (session.sprintStatus == null) {
					String st = messageTextFromTelegram.trim().toUpperCase();
					if (!Set.of("PLANNED","ACTIVE","COMPLETED").contains(st)) {
						sendText(chatId, "Status must be PLANNED, ACTIVE or COMPLETED. Try again:");
						return;
					}
					session.sprintStatus = st;

					// — all pieces collected: build & save
					Sprint sp = new Sprint();
					sp.setProjectId(session.sprintProjectId);
					sp.setName(session.sprintName);
					sp.setStartDate(session.sprintStartDate.atStartOfDay().atOffset(ZoneOffset.UTC));
					sp.setEndDate(session.sprintEndDate.atStartOfDay().atOffset(ZoneOffset.UTC));
					sp.setStatus(session.sprintStatus);

					sprintService.addSprint(sp);

					// confirm to user
					sendText(chatId,
						"✅ Sprint created!\n" +
						"• ID: "   + sp.getID()   + "\n" +
						"• Name: " + sp.getName() + "\n" +
						"• From: " + session.sprintStartDate +
						"  To: "   + session.sprintEndDate +
						"\n• Status: " + sp.getStatus()
					);

					// clear session
					sessions.remove(chatId);
					ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
					List<KeyboardRow> keyboard = new ArrayList<>();

					// Row: List All SPRINTS
					KeyboardRow listRow = new KeyboardRow();
					listRow.add(BotLabels.LIST_ALL_SPRINTS.getLabel());
					keyboard.add(listRow);

					// Row: Add New SPRINTS
					KeyboardRow addRow = new KeyboardRow();
					addRow.add(BotLabels.ADD_NEW_SPRINT.getLabel());
					keyboard.add(addRow);

					// Row: Show Main Screen
					KeyboardRow mainRow = new KeyboardRow();
					mainRow.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
					keyboard.add(mainRow);

					keyboardMarkup.setKeyboard(keyboard);
					keyboardMarkup.setResizeKeyboard(true);    // optional: makes it more compact
					keyboardMarkup.setOneTimeKeyboard(true);   // optional: hide after selection

					// 2) Send the keyboard along with a follow-up prompt
					SendMessage followUp = SendMessage.builder()
						.chatId(chatId)
						.text("What would you like to do next?")
						.replyMarkup(keyboardMarkup)
						.build();

					try {
						execute(followUp);
					} catch (TelegramApiException e) {
						logger.error("Error sending post-create keyboard", e);
					}
					return;
				}
			}

			if (session.waitingForProject) {
				// 1) Name not set → this must be the name
				if (session.projectName == null) {
					session.projectName = messageTextFromTelegram.trim();
					sendText(chatId, "Got it. Now send me the *project description*:");
					return;
				}
				// 2) Description not set → this is the description
				if (session.projectDescription == null) {
					session.projectDescription = messageTextFromTelegram.trim();
					sendText(chatId, "Perfect. Finally, what’s the *start date*? (YYYY-MM-DD)");
					return;
				}
				// 3) Start date not set → parse and finish
				if (session.projectStartDate == null) {
					try {
						session.projectStartDate = LocalDate.parse(messageTextFromTelegram.trim());
					} catch (DateTimeParseException ex) {
						sendText(chatId, "Hmm, that date didn’t parse. Please use YYYY-MM-DD:");
						return;
					}

					// → all fields collected! build and save:
					Project p = new Project();
					p.setName(session.projectName);
					p.setDescription(session.projectDescription);
					// assuming your entity uses OffsetDateTime
					p.setStartDate(session.projectStartDate.atStartOfDay().atOffset(ZoneOffset.UTC));
					// createdBy = 1
					p.setCreatedBy(1L);

					projectService.addProject(p);

					sendText(chatId,
						"✅ Project created!\n" +
						"• ID: " + p.getID() + "\n" +
						"• Name: " + p.getName() + "\n" +
						"• Starts: " + session.projectStartDate
					);

					// clear session	
					sessions.remove(chatId);

					// 1) Build a fresh keyboard
					ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
					List<KeyboardRow> keyboard = new ArrayList<>();

					// Row: List All Projects
					KeyboardRow listRow = new KeyboardRow();
					listRow.add(BotLabels.LIST_ALL_PROJECTS.getLabel());
					keyboard.add(listRow);

					// Row: Add New Project
					KeyboardRow addRow = new KeyboardRow();
					addRow.add(BotLabels.ADD_NEW_PROJECT.getLabel());
					keyboard.add(addRow);

					// Row: Show Main Screen
					KeyboardRow mainRow = new KeyboardRow();
					mainRow.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
					keyboard.add(mainRow);

					keyboardMarkup.setKeyboard(keyboard);
					keyboardMarkup.setResizeKeyboard(true);    // optional: makes it more compact
					keyboardMarkup.setOneTimeKeyboard(true);   // optional: hide after selection

					// 2) Send the keyboard along with a follow-up prompt
					SendMessage followUp = SendMessage.builder()
						.chatId(chatId)
						.text("What would you like to do next?")
						.replyMarkup(keyboardMarkup)
						.build();

					try {
						execute(followUp);
					} catch (TelegramApiException e) {
						logger.error("Error sending post-create keyboard", e);
					}
					return;
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

	private void sendText(Long chatId, String text) {
    SendMessage msg = SendMessage.builder()
        .chatId(chatId.toString())
        .text(text)
        .parseMode("Markdown")
        .build();
    try {
        execute(msg);
    } catch (TelegramApiException e) {
        logger.error("Failed to send msg", e);
    }
}
}