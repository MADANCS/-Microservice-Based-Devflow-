package com.devflow.auth.api.mapper;

import com.devflow.auth.api.dto.AuthDTOs;
import com.devflow.auth.domain.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "id",          expression = "java(user.getId().toString())")
    @Mapping(target = "role",        expression = "java(user.getRole().name())")
    @Mapping(target = "status",      expression = "java(user.getStatus().name())")
    @Mapping(target = "createdAt",   expression = "java(user.getCreatedAt().toString())")
    @Mapping(target = "lastLoginAt", expression = "java(user.getLastLoginAt() != null ? user.getLastLoginAt().toString() : null)")
    AuthDTOs.UserResponse toUserResponse(User user);
}
