package com.springboot.MyTodoList.util;

public enum BotMessages {
	
	HELLO_MYTODO_BOT(
	"Hello! I'm MyTodoList Bot!\nType a new todo item below and press the send button (blue arrow), or select an option below:"),
	BOT_REGISTERED_STARTED("Bot registered and started succesfully!"),
	ITEM_DONE("Item done! Select /todolist to return to the list of todo items, or /start to go to the main screen."), 
	ITEM_UNDONE("Item undone! Select /todolist to return to the list of todo items, or /start to go to the main screen."), 
	ITEM_DELETED("Item deleted! Select /todolist to return to the list of todo items, or /start to go to the main screen."),
	TYPE_NEW_TODO_ITEM("Type a new todo item below and press the send button (blue arrow) on the rigth-hand side. Send <description> <status(TODO|INPROGRESS|DONE)> <estimatedTime> <developerID(optional)>to add a new todo item."),
	NEW_ITEM_ADDED("New item added! Select /todolist to return to the list of todo items, or /start to go to the main screen."),
	TYPE_NEW_SPRING("\nType a new sprint below and press the send button (blue arrow) on the right-hand side.\n" +
    "Send <name> <startDate> <endDate> to add a new sprint.\n\n" +
    "📅 Please enter the dates in the format: \nDD/MM/YYYY HH:mm \n(e.g., 05/04/2025 14:30)"),
	NEW_SPRINT_ADDED("New sprint added! Select /sprintlist to return to the list of sprints, or /start to go to the main screen."),
	BYE("Bye! Select /start to resume!"),
	ITEM_ASSIGNEE_CHANGED("The task developer was succesfully asigned! Select /todolist to return to the list of todo items, or /start to go to the main screen."),
	ITEM_SPRINT_CHANGED("The task sprint was succesfully asigned! Select /todolist to return to the list of todo items, or /start to go to the main screen.");

	private String message;

	BotMessages(String enumMessage) {
		this.message = enumMessage;
	}

	public String getMessage() {
		return message;
	}

}
