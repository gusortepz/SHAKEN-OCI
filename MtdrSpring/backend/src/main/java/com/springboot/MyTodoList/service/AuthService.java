package com.springboot.MyTodoList.service;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.springboot.MyTodoList.model.User;
import com.springboot.MyTodoList.repository.UserRepository;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.SignatureException;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    private final String SECRET_KEY = "my-secret-key"; // Clave para los tokens

    public String generateToken(String username) {
        System.out.println("Generando token para: " + username);
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60)) // 1 hora
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .compact();
    }

    public User validateToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(SECRET_KEY)
                    .parseClaimsJws(token)
                    .getBody();
            String username = claims.getSubject();

            return new User(username, "ADMIN");//userRepository.findByUsername(username);
        } catch (ExpiredJwtException | SignatureException | MalformedJwtException e) {
            return null; // Token inválido o expirado
        }
    }

    public User registerUser(String username) {
        if (userRepository.findByUsername(username) != null) {
            return null; // Ya existe el usuario
        }
        User user = new User(username, "USER");
        return userRepository.save(user);
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }
}

