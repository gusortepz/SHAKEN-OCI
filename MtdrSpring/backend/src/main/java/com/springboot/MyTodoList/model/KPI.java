package com.springboot.MyTodoList.model;

import java.util.List;

public class KPI {
    private List<SprintKPI> sprintKpis;
    private List<DeveloperKPI> developerKpis;

    public KPI(List<SprintKPI> sprintKpis, List<DeveloperKPI> developerKpis) {
        this.sprintKpis = sprintKpis;
        this.developerKpis = developerKpis;
    }

    public List<SprintKPI> getSprintKpis() {
        return sprintKpis;
    }

    public void setSprintKpis(List<SprintKPI> sprintKpis) {
        this.sprintKpis = sprintKpis;
    }

    public List<DeveloperKPI> getDeveloperKpis() {
        return developerKpis;
    }

    public void setDeveloperKpis(List<DeveloperKPI> developerKpis) {
        this.developerKpis = developerKpis;
    }
}
