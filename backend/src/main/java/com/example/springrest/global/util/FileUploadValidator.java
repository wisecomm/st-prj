package com.example.springrest.global.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.unit.DataSize;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Arrays;

@Component
public class FileUploadValidator {

    private final Set<String> allowedExtensions;
    private final long maxFileSize;

    public FileUploadValidator(
            @Value("${app.file.allowed-extensions}") String allowedExtensions,
            @Value("${app.file.max-size}") DataSize maxFileSize) {
        this.allowedExtensions = Arrays.stream(allowedExtensions.split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .collect(Collectors.toSet());
        this.maxFileSize = maxFileSize.toBytes();
    }

    public String validateAndSanitize(MultipartFile file) {
        // 파일 크기 검증
        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException("File size exceeds limit");
        }

        // 확장자 검증
        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isEmpty()) {
            throw new IllegalArgumentException("Invalid file name");
        }
        String extension = getExtension(originalName).toLowerCase();

        if (!allowedExtensions.contains(extension)) {
            throw new IllegalArgumentException("File type not allowed: " + extension);
        }

        // 안전한 파일명 생성
        return UUID.randomUUID() + "." + extension;
    }

    private String getExtension(String filename) {
        int lastDot = filename.lastIndexOf('.');
        return lastDot > 0 ? filename.substring(lastDot + 1) : "";
    }
}
