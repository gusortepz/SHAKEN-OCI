package com.springboot.MyTodoList.security;

import java.io.IOException;
import java.util.Collections;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import com.springboot.MyTodoList.model.User;
import com.springboot.MyTodoList.service.AuthService;

public class JwtFilter extends OncePerRequestFilter {

    private final AuthService authService;

    @Autowired
    public JwtFilter(AuthService authService) {
        this.authService = authService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            User user = authService.validateToken(token);
            if (user != null) {
                System.out.println("Usuario autenticado: " + user.getUsername());
                
                // Guarda la autenticación en el contexto de seguridad
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        user, null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN"))
                );

                SecurityContextHolder.getContext().setAuthentication(authentication);
            } else {
                System.out.println("Token inválido o expirado");
            }
        } else {
            System.out.println("Usuario no autenticado");
        }

        filterChain.doFilter(request, response);
    }
}

