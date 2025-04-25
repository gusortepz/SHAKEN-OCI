package com.springboot.MyTodoList.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.springboot.MyTodoList.model.KPI;
import com.springboot.MyTodoList.repository.KPIRepository;


@RestController
@RequestMapping("/api/kpi")
public class KPIController {

    private final KPIRepository kpiRepository;

    @Autowired
    public KPIController(KPIRepository kpiRepository) {
        this.kpiRepository = kpiRepository;
    }

    @GetMapping("/all")
    public ResponseEntity<KPI> getAllKPI() {
        try {
            // Get KPI data
            KPI kpiData = kpiRepository.getAllKPI();
            
            // Print for debugging
            System.out.println("KPI Data: " + kpiData);
            
            // Return the KPI data wrapped in ResponseEntity with HTTP status 200 (OK)
            return ResponseEntity.ok(kpiData);
        } catch (Exception e) {
            // Log the error and return a bad request if there's an issue
            System.err.println("Error occurred: " + e.getMessage());
            return ResponseEntity.status(500).build();  // Internal Server Error
        }
    }
}

