package com.example.springrest.domain.user.service;

import com.example.springrest.domain.auth.model.entity.AuthUser;
import com.example.springrest.domain.auth.service.UserDetailsProvider;
import com.example.springrest.domain.user.model.entity.UserInfo;
import com.example.springrest.domain.user.repository.UserInfoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserDetailsProviderImpl implements UserDetailsProvider {

    private final UserInfoMapper userInfoMapper;

    @Override
    @Transactional(readOnly = true)
    public Optional<AuthUser> findByUserId(String userId) {
        UserInfo user = userInfoMapper.findById(userId);
        if (user == null) {
            return Optional.empty();
        }
        return Optional.of(toAuthUser(user));
    }

    private AuthUser toAuthUser(UserInfo user) {
        return AuthUser.builder()
                .userId(user.getUserId())
                .userPwd(user.getUserPwd())
                .userName(user.getUserName())
                .email(user.getUserEmail())
                .userProvider(user.getUserProvider())
                .roles(user.getRoles() != null ? new ArrayList<>(user.getRoles()) : new ArrayList<>())
                // .lastLoginDt() // UserInfo doesn't seem to have lastLoginDt in the shown
                // file, ignoring for now or mapping if available
                .build();
    }
}
