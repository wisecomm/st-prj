package com.example.springrest.domain.user.service;

import com.example.springrest.domain.user.entity.User;
import com.example.springrest.domain.user.mapper.UserMapper;
import com.example.springrest.global.exception.BusinessException;
import com.example.springrest.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Log4j2
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public User findByUsername(String username) {
        User user = userMapper.findByUsername(username);
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }
        return user;
    }

    public User findById(Long id) {
        User user = userMapper.findById(id);
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }
        return user;
    }

    @Transactional
    public void createUser(User user) {
        if (userMapper.findByUsername(user.getUsername()) != null) {
            throw new BusinessException(ErrorCode.DUPLICATE_USERNAME);
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userMapper.insert(user);
    }
}
