package com.springboot.MyTodoList.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import static org.springframework.security.config.Customizer.withDefaults;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.springboot.MyTodoList.service.AuthService;


@Configuration
@EnableWebSecurity
public class WebSecurityConfiguration extends WebSecurityConfigurerAdapter {
    @Autowired
    private AuthService authService;
    
    @Override
    protected void configure(HttpSecurity httpSecurity) throws Exception {
        httpSecurity
                .cors(withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(management -> management.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeRequests(requests -> requests
                        .antMatchers("/", "/index.html", "/static/**", "/manifest.json", "/favicon.ico", "/assets/**", "/vite.svg").permitAll()
                        .antMatchers("/api/auth/**").permitAll()  // Permitir login
                        .antMatchers("/api/**").authenticated()
                        .anyRequest().permitAll()) // Permitir todas las demás solicitudes
                .addFilterBefore(new JwtFilter(authService), UsernamePasswordAuthenticationFilter.class);
    }
}
