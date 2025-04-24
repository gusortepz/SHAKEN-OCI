package com.springboot.MyTodoList.model;

public class SprintKPI {
    private Long sprintId;
    private String sprintName;
    private Long totalTasks;
    private Long completedTasks;
    private Float totalEstimatedTime;
    private Float totalRealTime;
    private Integer totalStoryPoints;

    public SprintKPI(Long sprintId, String sprintName, Long totalTasks, Long completedTasks,
                          Float totalEstimatedTime, Float totalRealTime, Integer totalStoryPoints) {
        this.sprintId = sprintId;
        this.sprintName = sprintName;
        this.totalTasks = totalTasks;
        this.completedTasks = completedTasks;
        this.totalEstimatedTime = totalEstimatedTime;
        this.totalRealTime = totalRealTime;
        this.totalStoryPoints = totalStoryPoints;
    }
    // Getter and Setter methods
    public Long getId() {
        return sprintId;
    }

    public void setId(Long id) {
        this.sprintId = id;
    }

    public String getName() {
        return sprintName;
    }

    public void setName(String name) {
        this.sprintName = name;
    }

    public Long getTotalTasks() {
        return totalTasks;
    }

    public void setTotalTasks(Long totalTasks) {
        this.totalTasks = totalTasks;
    }

    public Long getCompletedTasks() {
        return completedTasks;
    }

    public void setCompletedTasks(Long completedTasks) {
        this.completedTasks = completedTasks;
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
    @Override
    public String toString() {
        return "SprintKPI{" +
                "   id=" + sprintId+
                ", name='" + sprintName + '\'' +
                ", totalTasks=" + totalTasks +
                ", completedTasks=" + completedTasks +
                ", totalEstimatedTime=" + totalEstimatedTime +
                ", totalRealTime=" + totalRealTime +
                ", totalStoryPoints=" + totalStoryPoints +
                '}';
    }
}
