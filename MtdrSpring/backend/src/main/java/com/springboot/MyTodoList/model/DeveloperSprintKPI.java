package com.springboot.MyTodoList.model;

public class DeveloperSprintKPI {
    private Long assigneeId;
    private Long sprintId;
    private Long totalTasks;
    private float totalEstimatedTime;
    private float totalRealTime;
    private int totalStoryPoints;
    private Long completedTasks;
    private double completionRate;

    // Constructor, getters, and setters
    public DeveloperSprintKPI() {
    }

    public DeveloperSprintKPI(Long assigneeId, Long sprintId, Long totalTasks, float totalEstimatedTime, float totalRealTime, int totalStoryPoints, Long completedTasks, double completionRate) {
        this.assigneeId = assigneeId;
        this.sprintId = sprintId;
        this.totalTasks = totalTasks;
        this.totalEstimatedTime = totalEstimatedTime;
        this.totalRealTime = totalRealTime;
        this.totalStoryPoints = totalStoryPoints;
        this.completedTasks = completedTasks;
        this.completionRate = completionRate;
    }

    public Long getAssigneeId() {
        return assigneeId;
    }

    public void setAssigneeId(Long assigneeId) {
        this.assigneeId = assigneeId;
    }

    public Long getSprintId() {
        return sprintId;
    }

    public void setSprintId(Long sprintId) {
        this.sprintId = sprintId;
    }

    public Long getTotalTasks() {
        return totalTasks;
    }

    public void setTotalTasks(Long totalTasks) {
        this.totalTasks = totalTasks;
    }

    public float getTotalEstimatedTime() {
        return totalEstimatedTime;
    }

    public void setTotalEstimatedTime(float totalEstimatedTime) {
        this.totalEstimatedTime = totalEstimatedTime;
    }

    public float getTotalRealTime() {
        return totalRealTime;
    }

    public void setTotalRealTime(float totalRealTime) {
        this.totalRealTime = totalRealTime;
    }

    public int getTotalStoryPoints() {
        return totalStoryPoints;
    }

    public void setTotalStoryPoints(int totalStoryPoints) {
        this.totalStoryPoints = totalStoryPoints;
    }

    public Long getCompletedTasks() {
        return completedTasks;
    }

    public void setCompletedTasks(Long completedTasks) {
        this.completedTasks = completedTasks;
    }

    public double getCompletionRate() {
        return completionRate;
    }

    public void setCompletionRate(double completionRate) {
        this.completionRate = completionRate;
    }
}

