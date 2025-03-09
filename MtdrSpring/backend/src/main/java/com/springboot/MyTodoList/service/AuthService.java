package com.springboot.MyTodoList.service;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
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

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    private final String SECRET_KEY = "my-secret-key"; // Clave para los tokens

    public String generateToken(User user) {
        System.out.println("Generando token para: " + user.getUsername());
        return Jwts.builder()
                .setSubject(user.getUsername())
                .claim("role", user.getRole())
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

            return userRepository.findByUsername(username);
        } catch (ExpiredJwtException | SignatureException | MalformedJwtException e) {
            return null; // Token inválido o expirado
        }
    }

    public User registerUser(User user) {
        if (userRepository.findByUsername(user.getUsername()) != null) {
            return null; // Ya existe el usuario
        }
        System.out.println("Registrando usuario: " + user);
        user = new User(user.getUsername(), passwordEncoder.encode(user.getPasswordHash()), user.getRole()); //Change this xd
        return userRepository.save(user);
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public boolean validateUser(User user) {
        User userDB = userRepository.findByUsername(user.getUsername());
        return userDB != null && passwordEncoder.matches(user.getPasswordHash(), userDB.getPasswordHash());
    }
}

