package com.springboot.MyTodoList.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "USERS")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int ID;

    @Column(name = "USERNAME", unique = true)
    String username;

    @Column(name = "PASSWORD_HASH")
    String passwordHash;

    @Column(name = "ROLE")
    String role;

    @Column(name = "TELEGRAM_ID", nullable = true, length = 255)
    private Long telegramId;

    public User() {
    }

    public User(String username, String passwordHash, String role, Long telegramId) {
        this.username = username;
        this.passwordHash = passwordHash;
        this.role = role;
        this.telegramId = telegramId;
    }

    public User(String username, String passwordHash, String role) {
        this.username = username;
        this.passwordHash = passwordHash;
        this.role = role;
    }

    public int getID() {
        return ID;
    }

    public void setID(int ID) {
        this.ID = ID;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public Long getTelegramId() {
        return telegramId;
    }

    public void setTelegramId(Long telegramId){
        this.telegramId = telegramId;
    }


    @Override
    public String toString() {
        return "User{" +
                "ID=" + ID +
                ", username='" + username + '\'' +
                ", role='" + role + '\'' +
                '}';
    }
}
