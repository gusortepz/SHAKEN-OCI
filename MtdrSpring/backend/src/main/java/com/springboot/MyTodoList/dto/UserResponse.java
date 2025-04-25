package com.springboot.MyTodoList.dto;

public class UserResponse {
    private int id;
    private String username;
    private String role;

    public UserResponse(int id, String username, String role) {
        this.id = id;
        this.username = username;
        this.role = role;
    }

    public String getUsername() {
        return username;
    }

    public String getRole() {
        return role;
    }

    public int getId() {
        return id;
    }
}
