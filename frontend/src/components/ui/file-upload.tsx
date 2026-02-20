"use client";

import * as React from "react";
import { Paperclip, X, File as FileIcon, ChevronUp, Download, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// 기본 허용 확장자 (보안상 위험한 파일 제외)
const DEFAULT_ALLOWED_EXTENSIONS = [
    // 문서
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.rtf', '.csv',
    // 이미지
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg',
    // 압축
    '.zip', '.rar', '.7z', '.tar', '.gz',
    // 기타
    '.json', '.xml',
];

// 차단 확장자 (보안상 위험한 실행 파일)
const BLOCKED_EXTENSIONS = [
    '.exe', '.bat', '.cmd', '.sh', '.ps1', '.vbs', '.js', '.jar', '.msi', '.dll', '.scr', '.com',
];

interface FileValidationError {
    fileName: string;
    reason: 'size' | 'extension' | 'blocked';
    message: string;
}

interface FileUploadProps {
    files: File[];
    onFilesChange: (files: File[]) => void;
    existingFiles?: { fileId: number; orgFileNm: string; fileSize: number }[];
    onDeleteExisting?: (fileId: number) => void;
    onDownloadExisting?: (fileId: number) => void;
    maxSize?: number; // in bytes, default 500MB
    accept?: string;
    allowedExtensions?: string[]; // 허용 확장자 목록 (예: ['.pdf', '.jpg'])
    className?: string;
}

export function FileUpload({
    files,
    onFilesChange,
    existingFiles = [],
    onDeleteExisting,
    onDownloadExisting,
    maxSize = 500 * 1024 * 1024,
    accept,
    allowedExtensions,
    className,
}: FileUploadProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [validationErrors, setValidationErrors] = React.useState<FileValidationError[]>([]);

    // 5초 후 에러 메시지 자동 제거
    React.useEffect(() => {
        if (validationErrors.length > 0) {
            const timer = setTimeout(() => {
                setValidationErrors([]);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [validationErrors]);

    /**
     * 파일 확장자 추출
     */
    const getFileExtension = (fileName: string): string => {
        const lastDot = fileName.lastIndexOf('.');
        return lastDot !== -1 ? fileName.slice(lastDot).toLowerCase() : '';
    };

    /**
     * 파일 검증
     */
    const validateFile = (file: File): FileValidationError | null => {
        const extension = getFileExtension(file.name);

        // 1. 차단된 확장자 체크 (보안)
        if (BLOCKED_EXTENSIONS.includes(extension)) {
            return {
                fileName: file.name,
                reason: 'blocked',
                message: `보안상 위험한 파일 형식입니다 (${extension})`,
            };
        }

        // 2. 허용된 확장자 체크
        const allowed = allowedExtensions || DEFAULT_ALLOWED_EXTENSIONS;
        if (!allowed.includes(extension)) {
            return {
                fileName: file.name,
                reason: 'extension',
                message: `허용되지 않는 파일 형식입니다 (${extension})`,
            };
        }

        // 3. 파일 크기 체크
        if (file.size > maxSize) {
            return {
                fileName: file.name,
                reason: 'size',
                message: `파일 크기가 너무 큽니다 (${formatSize(file.size)} > ${formatSize(maxSize)})`,
            };
        }

        return null;
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            addFiles(Array.from(e.target.files));
        }
        // Reset input so same file can be selected again if needed
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const addFiles = (newFiles: File[]) => {
        const errors: FileValidationError[] = [];
        const validFiles: File[] = [];

        newFiles.forEach((file) => {
            const error = validateFile(file);
            if (error) {
                errors.push(error);
            } else {
                validFiles.push(file);
            }
        });

        if (errors.length > 0) {
            setValidationErrors(errors);
        }

        if (validFiles.length > 0) {
            onFilesChange([...files, ...validFiles]);
        }
    };

    const removeFile = (index: number) => {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        onFilesChange(newFiles);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            addFiles(Array.from(e.dataTransfer.files));
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)) + " " + sizes[i];
    };

    const totalSize = files.reduce((acc, file) => acc + file.size, 0)
        + existingFiles.reduce((acc, file) => acc + file.fileSize, 0);

    const totalCount = files.length + existingFiles.length;

    return (
        <div
            className={cn("w-full border rounded-lg bg-background relative", className)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Header */}
            <div className="flex items-center gap-2 p-3 font-bold text-sm text-foreground">
                <Paperclip className="w-4 h-4" />
                파일 업로드
            </div>

            {/* File List or Empty State */}
            {totalCount > 0 ? (
                <div className="w-full bg-background border rounded-md overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b">
                        <span className="text-sm font-bold text-foreground">첨부파일 ({totalCount})</span>
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <ul className="divide-y divide-border">
                        {/* Existing Files */}
                        {existingFiles.map((file) => (
                            <li key={`existing-${file.fileId}`} className="flex items-center justify-between px-4 py-3 text-sm hover:bg-muted/20 transition-colors bg-muted/5">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <FileIcon className="w-8 h-8 text-muted-foreground/70 shrink-0" strokeWidth={1.5} />
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-medium truncate pr-4 text-foreground">{file.orgFileNm}</span>
                                        <span className="text-xs text-muted-foreground">{formatSize(file.fileSize)} (저장됨)</span>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    {onDownloadExisting && (
                                        <button
                                            type="button"
                                            onClick={() => onDownloadExisting(file.fileId)}
                                            className="text-muted-foreground hover:text-primary transition-colors p-1 hover:bg-muted rounded ml-2 shrink-0"
                                            title="다운로드"
                                        >
                                            <Download className="w-5 h-5" />
                                        </button>
                                    )}
                                    {onDeleteExisting && (
                                        <button
                                            type="button"
                                            onClick={() => onDeleteExisting(file.fileId)}
                                            className="text-muted-foreground hover:text-destructive transition-colors p-1 hover:bg-muted rounded ml-1 shrink-0"
                                            title="파일 삭제"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}

                        {/* New Files */}
                        {files.map((file, index) => (
                            <li key={`new-${index}`} className="flex items-center justify-between px-4 py-3 text-sm hover:bg-muted/20 transition-colors">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <FileIcon className="w-8 h-8 text-blue-500/80 shrink-0" strokeWidth={1.5} />
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-medium truncate pr-4 text-foreground">{file.name}</span>
                                        <span className="text-xs text-muted-foreground">{formatSize(file.size)}</span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className="text-muted-foreground hover:text-destructive transition-colors p-1 hover:bg-muted rounded ml-2 shrink-0"
                                    title="파일 삭제"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div
                    className={cn(
                        "flex flex-col items-center justify-center py-12 transition-colors border-2 border-dashed border-muted-foreground/25 rounded-lg",
                        isDragging ? "bg-primary/5 border-primary" : "hover:bg-muted/50"
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <div className="p-3 bg-muted rounded-full">
                            <Paperclip className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-foreground">
                                파일을 드래그하여 업로드
                            </p>
                            <p className="text-xs mt-1">
                                또는 하단의 파일 추가 버튼을 클릭하세요
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Validation Error Messages */}
            {validationErrors.length > 0 && (
                <div className="mx-3 mb-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium text-destructive">
                                {validationErrors.length}개 파일을 업로드할 수 없습니다
                            </p>
                            <ul className="text-xs text-destructive/80 space-y-0.5">
                                {validationErrors.map((error, index) => (
                                    <li key={index} className="truncate">
                                        • {error.fileName}: {error.message}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <button
                            type="button"
                            onClick={() => setValidationErrors([])}
                            className="text-destructive/60 hover:text-destructive shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Empty state drag overlay if files exist */}
            {totalCount > 0 && (
                <div
                    className={cn(
                        "absolute inset-0 flex flex-col items-center justify-center bg-background/90 transition-opacity pointer-events-none z-10 rounded-lg border-2 border-primary border-dashed",
                        isDragging ? "opacity-100" : "opacity-0"
                    )}
                >
                    <p className="text-lg font-bold text-primary">파일을 여기에 놓으세요</p>
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between p-3 border-t bg-muted/20">
                <div className="flex gap-2">
                    <input
                        type="file"
                        multiple
                        ref={inputRef}
                        className="hidden"
                        onChange={handleFileSelect}
                        accept={accept}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => inputRef.current?.click()}
                        className="bg-white hover:bg-gray-50 text-foreground border-gray-300 h-8 text-xs"
                    >
                        파일 추가
                    </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{formatSize(totalSize)}</span> / {formatSize(maxSize)}
                </div>
            </div>
        </div>
    );
}
