package com.springboot.MyTodoList.util;


public enum TaskStatus {
    TODO,
    INPROGRESS,
    DONE;

    public static boolean isValidStatus(String status) {
        try {
            TaskStatus.valueOf(status);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
