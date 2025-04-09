package com.springboot.MyTodoList.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

import com.springboot.MyTodoList.model.User;
import com.springboot.MyTodoList.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private final UserRepository userRepository;

    
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User findByTelegramId(Long telegramId) {
        return userRepository.findByTelegramId(telegramId);
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User findByID(Integer id) {
        return userRepository.findById(id).orElse(null);
    }
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }
}

