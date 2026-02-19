package com.example.springrest.common.excel;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.multipart.MultipartFile;
import org.apache.poi.xssf.streaming.SXSSFSheet;

import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.*;

/**
 * 엑셀 처리 유틸리티
 */
public class ExcelUtils {

    /**
     * 리스트 데이터를 엑셀 워크북으로 변환
     */
    public static <T> Workbook toExcel(List<T> data, Class<T> clazz) {
        // SXSSFWorkbook for memory efficiency with large datasets
        SXSSFWorkbook workbook = new SXSSFWorkbook();
        Sheet sheet = workbook.createSheet("Sheet1");

        // Get annotated fields securely
        List<Field> fields = getExcelFields(clazz);

        // Header Style
        CellStyle headerStyle = createHeaderStyle(workbook);

        // Date Style
        CellStyle dateStyle = workbook.createCellStyle();
        CreationHelper createHelper = workbook.getCreationHelper();
        dateStyle.setDataFormat(createHelper.createDataFormat().getFormat("yyyy-MM-dd HH:mm:ss"));

        // Create Header Row
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < fields.size(); i++) {
            Field field = fields.get(i);
            ExcelColumn annotation = field.getAnnotation(ExcelColumn.class);
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(annotation.headerName());
            cell.setCellStyle(headerStyle);

            // ...

            // Set width
            if (annotation.width() > 0) {
                sheet.setColumnWidth(i, annotation.width() * 256);
            } else {
                if (sheet instanceof SXSSFSheet) {
                    ((SXSSFSheet) sheet).trackAllColumnsForAutoSizing();
                }
                sheet.autoSizeColumn(i);
            }
        }

        // Create Data Rows
        int rowIndex = 1;
        for (T item : data) {
            Row row = sheet.createRow(rowIndex++);
            for (int i = 0; i < fields.size(); i++) {
                Field field = fields.get(i);
                field.setAccessible(true);
                Cell cell = row.createCell(i);

                try {
                    Object value = field.get(item);
                    setCellValue(cell, value, dateStyle);
                } catch (IllegalAccessException e) {
                    throw new RuntimeException("Failed to access field value: " + field.getName(), e);
                }
            }
        }

        return workbook;
    }

    /**
     * 엑셀 파일을 리스트로 변환
     */
    public static <T> List<T> fromExcel(MultipartFile file, Class<T> clazz) throws IOException {
        List<T> list = new ArrayList<>();
        
        try (InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {
            
            Sheet sheet = workbook.getSheetAt(0);
            List<Field> fields = getExcelFields(clazz);

            // Skip header row
            Iterator<Row> rowIterator = sheet.iterator();
            if (rowIterator.hasNext()) {
                rowIterator.next();
            }

            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                try {
                    T instance = clazz.getDeclaredConstructor().newInstance();
                    boolean isEmptyRow = true;

                    for (int i = 0; i < fields.size(); i++) {
                        Field field = fields.get(i);
                        field.setAccessible(true);
                        Cell cell = row.getCell(i);

                        if (cell != null && cell.getCellType() != CellType.BLANK) {
                            isEmptyRow = false;
                            setFieldValue(instance, field, cell);
                        }
                    }

                    if (!isEmptyRow) {
                        list.add(instance);
                    }

                } catch (Exception e) {
                    throw new RuntimeException("Error parsing excel row " + row.getRowNum(), e);
                }
            }
        }

        return list;
    }

    private static List<Field> getExcelFields(Class<?> clazz) {
        List<Field> fields = new ArrayList<>();
        for (Field field : clazz.getDeclaredFields()) {
            if (field.isAnnotationPresent(ExcelColumn.class)) {
                fields.add(field);
            }
        }
        // Sort by order
        fields.sort(Comparator.comparingInt(f -> f.getAnnotation(ExcelColumn.class).order()));
        return fields;
    }

    private static CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        return style;
    }

    private static void setCellValue(Cell cell, Object value, CellStyle dateStyle) {
        if (value == null) {
            cell.setBlank();
            return;
        }

        if (value instanceof Number) {
            cell.setCellValue(((Number) value).doubleValue());
        } else if (value instanceof Boolean) {
            cell.setCellValue((Boolean) value);
        } else if (value instanceof LocalDateTime) {
            cell.setCellValue((LocalDateTime) value);
            cell.setCellStyle(dateStyle);
        } else if (value instanceof Date) {
            cell.setCellValue((Date) value);
            cell.setCellStyle(dateStyle);
        } else {
            cell.setCellValue(value.toString());
        }
    }

    private static void setFieldValue(Object instance, Field field, Cell cell) throws IllegalAccessException {
        Class<?> type = field.getType();

        if (type == String.class) {
            field.set(instance, getCellValueAsString(cell));
        } else if (type == int.class || type == Integer.class) {
            field.set(instance, (int) cell.getNumericCellValue());
        } else if (type == long.class || type == Long.class) {
            field.set(instance, (long) cell.getNumericCellValue());
        } else if (type == double.class || type == Double.class) {
            field.set(instance, cell.getNumericCellValue());
        } else if (type == boolean.class || type == Boolean.class) {
            field.set(instance, cell.getBooleanCellValue());
        }
        // Add more type conversions as needed
    }

    private static String getCellValueAsString(Cell cell) {
        if (cell == null)
            return "";
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                return String.valueOf((long) cell.getNumericCellValue()); // Integer로 가정
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return "";
        }
    }
}
