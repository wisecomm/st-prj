package com.example.springrest.global.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
public class FileStore {

    @Value("${app.file.upload-dir}")
    private String fileDir;

    private final FileUploadValidator fileUploadValidator;

    public FileStore(FileUploadValidator fileUploadValidator) {
        this.fileUploadValidator = fileUploadValidator;
    }

    public record StoredFile(String originalName, String storedName, String filePath, long size, String extension) {}

    public String getFullPath(String filename) {
        return fileDir + filename;
    }

    public List<StoredFile> storeFiles(List<MultipartFile> multipartFiles, String subPath) throws IOException {
        List<StoredFile> storeFileResult = new ArrayList<>();
        if (multipartFiles == null || multipartFiles.isEmpty()) {
            return storeFileResult;
        }

        for (MultipartFile multipartFile : multipartFiles) {
            if (!multipartFile.isEmpty()) {
                storeFileResult.add(storeFile(multipartFile, subPath));
            }
        }
        return storeFileResult;
    }

    public StoredFile storeFile(MultipartFile multipartFile, String subPath) throws IOException {
        if (multipartFile.isEmpty()) {
            return null;
        }

        // Validate and get safe filename
        String storeFileName = fileUploadValidator.validateAndSanitize(multipartFile);
        String originalFilename = multipartFile.getOriginalFilename();
        
        if (subPath == null || subPath.isEmpty()) {
             subPath = "/common/";
        }

        // Ensure directory exists
        File uploadDir = new File(getFullPath(subPath));
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        multipartFile.transferTo(new File(getFullPath(subPath + storeFileName)));

        return new StoredFile(
                originalFilename,
                storeFileName,
                subPath,
                multipartFile.getSize(),
                extractExt(originalFilename)
        );
    }

    private String extractExt(String originalFilename) {
        int pos = originalFilename.lastIndexOf(".");
        return originalFilename.substring(pos + 1);
    }

    public Resource loadFileAsResource(String storedFileName) throws MalformedURLException {
        File file = new File(getFullPath(storedFileName));
        if (!file.exists()) {
            throw new RuntimeException("File not found: " + storedFileName);
        }
        java.net.URI fileUri = file.toURI();
        if (fileUri == null) {
            throw new RuntimeException("Could not resolve file URI: " + storedFileName);
        }
        Resource resource = new UrlResource(fileUri);
        if (resource.exists() || resource.isReadable()) {
            return resource;
        } else {
            throw new RuntimeException("Could not read file: " + storedFileName);
        }
    }
}
