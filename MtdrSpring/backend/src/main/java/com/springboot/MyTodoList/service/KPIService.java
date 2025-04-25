package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.KPI;
import com.springboot.MyTodoList.repository.KPIRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class KPIService {

    private final KPIRepository kpiRepository;

    @Autowired
    public KPIService(KPIRepository kpiRepository) {
        this.kpiRepository = kpiRepository;
    }

    // Get all KPI data for sprints and developers
    public KPI getAllKpis() {
        return kpiRepository.getAllKPI();
    }
}
