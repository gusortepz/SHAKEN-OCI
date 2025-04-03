package com.springboot.MyTodoList.model;


import java.time.OffsetDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

/*
    representation of the TODOITEM table that exists already
    in the autonomous database
 */
@Entity
@Table(name = "TODOITEM")
public class ToDoItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int ID;

    @Column(name = "DESCRIPTION", nullable = false, length = 500)
    private String description;

    @Column(name = "CREATION_TS")
    private OffsetDateTime creation_ts;

    @Column(name = "STATUS", nullable = false, length = 20)
    private String status;

    @Column(name = "PRIORITY", nullable = false, length = 10)
    private String priority;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CREATED_BY", nullable = false)
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ASSIGNEE_ID")
    private User assignee;

    @Column(name = "PROJECT_ID")
    private Long projectId;

    @Column(name = "SPRINT_ID")
    private Long sprintId;

    @Column(name = "STORY_POINTS")
    private Integer storyPoints;

    @Column(name = "ESTIMATED_TIME")
    private Float estimatedTime;

    @Column(name = "REAL_TIME")
    private Float realTime;

    public ToDoItem() {}

    public ToDoItem(String description, OffsetDateTime creation_ts, String status, String priority,
                    User createdBy, User assignee, Long projectId, Long sprintId,
                    Integer storyPoints, Float estimatedTime, Float realTime) {
        this.description = description;
        this.creation_ts = creation_ts;
        this.status = status;
        this.priority = priority;
        this.createdBy = createdBy;
        this.assignee = assignee;
        this.projectId = projectId;
        this.sprintId = sprintId;
        this.storyPoints = storyPoints;
        this.estimatedTime = estimatedTime;
        this.realTime = realTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public int getID() {
        return ID;
    }

    public void setID(int ID) {
        this.ID = ID;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public OffsetDateTime getCreation_ts() {
        return creation_ts;
    }

    public void setCreation_ts(OffsetDateTime creation_ts) {
        this.creation_ts = creation_ts;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    @Override
    public String toString() {
        return "ToDoItem{" +
                "ID=" + ID +
                ", description='" + description + '\'' +
                ", creation_ts=" + creation_ts +
                '}';
    }
}
