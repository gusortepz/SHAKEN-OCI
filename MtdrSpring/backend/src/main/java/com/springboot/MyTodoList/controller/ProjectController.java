package com.springboot.MyTodoList.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.springboot.MyTodoList.model.Project;
import com.springboot.MyTodoList.service.ProjectService;


@RequestMapping("/api")
@RestController
public class ProjectController {
    
    @Autowired
    private ProjectService projectService;

    @GetMapping(value = "/project")
    public List<Project> getAllProjects() {
        return projectService.findAllProjects();
    }

    @GetMapping(value = "/project/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Integer id) {
        try{
            ResponseEntity<Project> responseEntity = projectService.getProjectById(id);
            return new ResponseEntity<>(responseEntity.getBody(), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping(value = "/project")
    public ResponseEntity<Void> addProject(@RequestBody Project project) {
        Project savedProject = projectService.addProject(project);
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("location", String.valueOf(savedProject.getID()));
        headers.set("Access-Control-Expose-Headers", "location");
        return ResponseEntity.status(HttpStatus.CREATED)
                .headers(headers)
                .build();
    }

    @PutMapping(value = "/project/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable Integer id, @RequestBody Project project) {
        try {
            Project updated = projectService.updateProject(id, project);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping(value = "/project/{id}")
    public ResponseEntity<Boolean> deleteProject(@PathVariable Integer id) {
        try{
            boolean isDeleted = projectService.deleteProject(id);
            return new ResponseEntity<>(isDeleted, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(false, HttpStatus.NOT_FOUND);
        }
    }
}
