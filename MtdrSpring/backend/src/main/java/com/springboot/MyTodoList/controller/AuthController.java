package com.springboot.MyTodoList.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.springboot.MyTodoList.dto.LoginUserDto;
import com.springboot.MyTodoList.dto.RegisterUserDto;
import com.springboot.MyTodoList.dto.UserResponse;
import com.springboot.MyTodoList.model.User;
import com.springboot.MyTodoList.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginUserDto user) {
        System.out.println("Login: " + user);
        try{
        User loggedUser = authService.validateUser(user) ;
            String token = authService.generateToken(loggedUser);
            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            return ResponseEntity.ok(response);
    }catch (Exception e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Usuario o contraseña incorrectos");
    }
    }

    @PostMapping("/register")
    public UserResponse register(@RequestBody RegisterUserDto registerUserDto) {
        System.out.println("Register: " + registerUserDto);
        User user = authService.registerUser(registerUserDto);
        return new UserResponse(user.getUsername(), user.getRole());
    }
}

