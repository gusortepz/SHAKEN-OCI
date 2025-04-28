package com.springboot.MyTodoList.model;

public class DeveloperKPI {
    private Long assigneeId;
    private Long totalTasks;
    private Float totalEstimatedTime;
    private Float totalRealTime;
    private Integer totalStoryPoints;
    private Long completedTasks;
    private Double completionRate;

    public DeveloperKPI(Long assigneeId, Long totalTasks, Float totalEstimatedTime, Float totalRealTime,
                         Integer totalStoryPoints, Long completedTasks, Double completionRate) {
        this.assigneeId = assigneeId;
        this.totalTasks = totalTasks;
        this.totalEstimatedTime = totalEstimatedTime;
        this.totalRealTime = totalRealTime;
        this.totalStoryPoints = totalStoryPoints;
        this.completedTasks = completedTasks;
        this.completionRate = completionRate;
    }

    // Getter and Setter methods
    public Long getAssigneeId() {
        return assigneeId;
    }

    public void setAssigneeId(Long assigneeId) {
        this.assigneeId = assigneeId;
    }

    public Long getTotalTasks() {
        return totalTasks;
    }

    public void setTotalTasks(Long totalTasks) {
        this.totalTasks = totalTasks;
    }

    public Float getTotalEstimatedTime() {
        return totalEstimatedTime;
    }

    public void setTotalEstimatedTime(Float totalEstimatedTime) {
        this.totalEstimatedTime = totalEstimatedTime;
    }

    public Float getTotalRealTime() {
        return totalRealTime;
    }

    public void setTotalRealTime(Float totalRealTime) {
        this.totalRealTime = totalRealTime;
    }

    public Integer getTotalStoryPoints() {
        return totalStoryPoints;
    }

    public void setTotalStoryPoints(Integer totalStoryPoints) {
        this.totalStoryPoints = totalStoryPoints;
    }

    public Long getCompletedTasks() {
        return completedTasks;
    }

    public void setCompletedTasks(Long completedTasks) {
        this.completedTasks = completedTasks;
    }

    public Double getCompletionRate() {
        return completionRate;
    }

    public void setCompletionRate(Double completionRate) {
        this.completionRate = completionRate;
    }

    @Override
    public String toString() {
        return "DeveloperKPI{" +
                "assigneeId=" + assigneeId +
                ", totalTasks=" + totalTasks +
                ", totalEstimatedTime=" + totalEstimatedTime +
                ", totalRealTime=" + totalRealTime +
                ", totalStoryPoints=" + totalStoryPoints +
                ", completedTasks=" + completedTasks +
                ", completionRate=" + completionRate +
                '}';
    }
}
