package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.KPI;

public interface KPIRepository {
    KPI getProjectKPI(Long projectId);  // Existing method
    KPI getAllKPI();                    // Add this method to the interface
}
