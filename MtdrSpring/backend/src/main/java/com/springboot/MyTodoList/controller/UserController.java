package com.springboot.MyTodoList.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

import com.springboot.MyTodoList.dto.UserResponse;
import com.springboot.MyTodoList.model.User;
import com.springboot.MyTodoList.service.UserService;

@RequestMapping("/api")
@RestController
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping(value = "/users")
    public List<UserResponse> getAllUsers() {
        return userService.findAll()
        .stream()
        .map(user -> new UserResponse(user.getID(), user.getUsername(), user.getRole()))
        .collect(Collectors.toList());
    }

    @GetMapping(value = "/users/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable int id) {
        try {
            User user = userService.findByID(id);
            if (user == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(new UserResponse(user.getID(), user.getUsername(), user.getRole()), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    
}
