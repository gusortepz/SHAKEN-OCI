package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.repository.SprintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SprintService {

    @Autowired
    private SprintRepository sprintRepository;

    public List<Sprint> findAllSprints() {
        
        return sprintRepository.findAll();
    }

    public ResponseEntity<Sprint> getSprintById(Integer id) {
        Optional<Sprint> sprintData = sprintRepository.findById(id);
        if (sprintData.isPresent()) {
            return new ResponseEntity<>(sprintData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    public Sprint addSprint(Sprint sprint) {
        return sprintRepository.save(sprint);
    }

    public Sprint updateSprint(Integer id, Sprint sprintDetails) {
        Optional<Sprint> existingSprint = sprintRepository.findById(id);
        if (existingSprint.isPresent()) {
            Sprint sprint = existingSprint.get();
            sprint.setProjectId(sprintDetails.getProjectId());
            sprint.setName(sprintDetails.getName());
            sprint.setStartDate(sprintDetails.getStartDate());
            sprint.setEndDate(sprintDetails.getEndDate());
            sprint.setStatus(sprintDetails.getStatus());
            return sprintRepository.save(sprint);
        } else {
            return null;
        }
    }

    public boolean deleteSprint(Integer id) {
        try {
            sprintRepository.deleteById(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
