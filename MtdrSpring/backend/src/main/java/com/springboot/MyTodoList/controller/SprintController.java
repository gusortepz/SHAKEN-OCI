package com.springboot.MyTodoList.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.service.SprintService;

@RequestMapping("/api")
@RestController
public class SprintController {

    @Autowired
    private SprintService sprintService;

    @GetMapping(value = "/sprint")
    public List<Sprint> getAllSprints() {
        return sprintService.findAllSprints();
    }

    @GetMapping(value = "/sprint/{id}")
    public ResponseEntity<Sprint> getSprintById(@PathVariable Integer id) {
        try {
            ResponseEntity<Sprint> responseEntity = sprintService.getSprintById(id);
            return new ResponseEntity<>(responseEntity.getBody(), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping(value = "/sprint")
    public ResponseEntity<Void> addSprint(@RequestBody Sprint sprint) {
        Sprint savedSprint = sprintService.addSprint(sprint);

        HttpHeaders headers = new HttpHeaders();
        headers.set("location", String.valueOf(savedSprint.getID()));
        headers.set("Access-Control-Expose-Headers", "location");

        return ResponseEntity.ok()
                .headers(headers)
                .build();
    }

    @PutMapping(value = "/sprint/{id}")
    public ResponseEntity<Sprint> updateSprint(@PathVariable Integer id, @RequestBody Sprint sprint) {
        try {
            Sprint updated = sprintService.updateSprint(id, sprint);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping(value = "/sprint/{id}")
    public ResponseEntity<Boolean> deleteSprint(@PathVariable Integer id) {
        try {
            boolean flag = sprintService.deleteSprint(id);
            return new ResponseEntity<>(flag, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(false, HttpStatus.NOT_FOUND);
        }
    }
}
