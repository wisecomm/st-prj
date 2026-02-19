package com.example.springrest.domain.auth.service;

import com.example.springrest.domain.auth.model.entity.AuthUser;
import java.util.Optional;

public interface UserDetailsProvider {
    Optional<AuthUser> findByUserId(String userId);
}
