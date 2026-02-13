package com.example.springrest.domain.user.entity;

import com.example.springrest.global.common.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class User extends BaseEntity {

    private String username;

    @JsonIgnore
    private String password;

    private String email;
    private String role;

    @Override
    public String toString() {
        return "User(username=" + username + ", email=" + email + ", role=" + role + ", id=" + getId() + ")";
    }
}
