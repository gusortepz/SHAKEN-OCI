package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.*;
import org.springframework.stereotype.Repository;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import java.util.ArrayList;
import java.util.List;

@Repository
public class KPIRepositoryImpl implements KPIRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public KPI getProjectKPI(Long projectId) {
        // This method can be removed or repurposed if no longer needed
        return null;
    }

    @Override
    public KPI getAllKPI() {
        // Get sprint KPIs for all sprints
        List<SprintKPI> sprintKPIs = getAllSprintKPIs();
        // Get developer KPIs for all developers
        List<DeveloperKPI> developerKPIs = getAllDeveloperKPIs();
        
        // Print the actual values of SprintKPIs and DeveloperKPIs
        System.out.println("Developer KPIs: ");
        for (DeveloperKPI developerKPI : developerKPIs) {
            System.out.println(developerKPI);  // This will use the overridden toString() method
        }
    
        System.out.println("Sprint KPIs: ");
        for (SprintKPI sprintKPI : sprintKPIs) {
            System.out.println(sprintKPI);  // This will use the overridden toString() method
        }
    
        return new KPI(sprintKPIs, developerKPIs);
    }

    private List<SprintKPI> getAllSprintKPIs() {
        String sql = "SELECT "
            + "s.ID, s.NAME, "
            + "COUNT(t.ID), "
            + "COUNT(CASE WHEN t.STATUS = 'DONE' THEN 1 END), "
            + "COALESCE(SUM(t.ESTIMATED_TIME), 0), "
            + "COALESCE(SUM(t.REAL_TIME), 0), "
            + "COALESCE(SUM(t.STORY_POINTS), 0) "
            + "FROM SPRINTS s "
            + "LEFT JOIN TODOITEM t ON s.ID = t.SPRINT_ID "
            + "GROUP BY s.ID, s.NAME, s.START_DATE "
            + "ORDER BY s.START_DATE";

        Query query = entityManager.createNativeQuery(sql);
        List<Object[]> results = query.getResultList();
        System.out.println("Results: " + results);
        
        // Check the contents of the results
        for (Object[] row : results) {
            for (int i = 0; i < row.length; i++) {
                System.out.println("Row " + i + ": " + row[i]);
            }
        }
        
        List<SprintKPI> kpis = new ArrayList<>();
        System.out.println("KPIS: " + kpis);
        
        // Process each row into SprintKPI objects
        for (Object[] row : results) {
            SprintKPI sprintKPI = new SprintKPI(
                    ((Number) row[0]).longValue(),   // Sprint ID
                    (String) row[1],                  // Sprint Name
                    ((Number) row[2]).longValue(),    // Total Tasks
                    ((Number) row[3]).longValue(),    // Completed Tasks
                    ((Number) row[4]).floatValue(),   // Total Estimated Time
                    ((Number) row[5]).floatValue(),   // Total Real Time
                    ((Number) row[6]).intValue()      // Total Story Points
            );
            kpis.add(sprintKPI);
        }
        
        System.out.println("KPIS: " + kpis);
        return kpis;
    }

    private List<DeveloperKPI> getAllDeveloperKPIs() {
        String sql = "SELECT "
                + "t.ASSIGNEE_ID, "
                + "COUNT(t.ID), "
                + "COALESCE(SUM(t.ESTIMATED_TIME), 0), "
                + "COALESCE(SUM(t.REAL_TIME), 0), "
                + "COALESCE(SUM(t.STORY_POINTS), 0), "
                + "SUM(CASE WHEN t.STATUS = 'DONE' THEN 1 ELSE 0 END) "
                + "FROM TODOITEM t "
                + "WHERE t.ASSIGNEE_ID IS NOT NULL "
                + "GROUP BY t.ASSIGNEE_ID";  // Removed projectId filter

        Query query = entityManager.createNativeQuery(sql);

        List<Object[]> results = query.getResultList();
        List<DeveloperKPI> kpis = new ArrayList<>();

        for (Object[] row : results) {
            Long totalTasks = ((Number) row[1]).longValue();
            Long completedTasks = ((Number) row[5]).longValue();
            double completionRate = totalTasks != 0 ? (completedTasks * 100.0 / totalTasks) : 0.0;

            kpis.add(new DeveloperKPI(
                    ((Number) row[0]).longValue(),   // Assignee (Developer) ID
                    totalTasks,                      // Total Tasks Assigned
                    ((Number) row[2]).floatValue(),  // Total Estimated Time
                    ((Number) row[3]).floatValue(),  // Total Real Time
                    ((Number) row[4]).intValue(),    // Total Story Points
                    completedTasks,                  // Completed Tasks
                    completionRate                   // Completion Rate (Percentage)
            ));
        }

        return kpis;
    }
}
