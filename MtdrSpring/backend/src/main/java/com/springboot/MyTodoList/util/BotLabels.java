package com.springboot.MyTodoList.util;

public enum BotLabels {
	
	SHOW_MAIN_SCREEN("Show Main Screen"), 
	HIDE_MAIN_SCREEN("Hide Main Screen"),
	LIST_ALL_ITEMS("List All Items"), 
	ADD_NEW_ITEM("Add New Item"),
	MARK_DONE("DONE"),
	MARK_IN_PROGRESS("INPROGRESS"),
	MARK_TODO("TODO"),
	MARK_ACTIVE("ACTIVE"),
	MARK_PLANNED("PLANNED"),
	MARK_COMPLETED("COMPLETED"),
	DELETE("DELETE"),
	MY_TODO_LIST("MY TODO LIST:"),
	MY_SPRINT_LIST("SPRINT LIST:"),
	DASH("-"),
	LIST_ALL_DEVELOPERS("List All Developers"),
	LIST_ALL_SPRINTS("List All Sprints"),
	ADD_NEW_SPRINT("Add New Sprint"),
	ADD_NEW_PROJECT("Add New Project"),
	NO_ASSIGNEE("No Assignee"),
	SELECT_DEVELOPER("Select a Developer for the task: "),
	SELECT_SPRINT("Select a Task to asign to the sprint: "),
	LIST_ALL_KPIS("List All KPIs"),
	LIST_ALL_KPIS_SPRINTS("SPRINTS KPIS"),
	LIST_ALL_KPIS_DEVELOPER("DEVELOPERS KPIS");

	private String label;

	BotLabels(String enumLabel) {
		this.label = enumLabel;
	}

	public String getLabel() {
		return label;
	}

}
