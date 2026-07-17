package com.firealarm.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.firealarm.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    User findByUsernameAndPassword(
            String username,
            String password);

    User findByUsername(String username);

    User findByEmail(String email);

    boolean existsByEmail(String email);

    java.util.List<User> findByVerifiedTrue();

    @org.springframework.data.jpa.repository.Query("SELECT u.email FROM User u WHERE u.email IS NOT NULL")
    java.util.List<String> findAllEmails();
}