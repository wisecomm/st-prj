package com.example.springrest.global.util;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;

@Component
public class SortValidator {

    private static final Map<String, Set<String>> ALLOWED_COLUMNS = Map.of(
            "users", Set.of("user_id", "user_name", "user_email", "user_nick", "sys_insert_dtm", "sys_update_dtm"),
            "boards", Set.of("board_id", "title", "hit_cnt", "sys_insert_dtm", "sys_update_dtm", "view_count"),
            "orders", Set.of("order_id", "cust_nm", "order_nm", "order_amt", "order_date", "sys_insert_dtm"));

    public String validateAndConvert(String table, String column, String direction) {
        if (column == null || column.isEmpty()) {
            return null;
        }

        String snakeCase = camelToSnake(column);
        if ("view_count".equals(snakeCase) && "boards".equals(table)) {
            snakeCase = "hit_cnt";
        }

        Set<String> allowed = ALLOWED_COLUMNS.get(table);

        if (allowed == null || !allowed.contains(snakeCase)) {
            throw new IllegalArgumentException("Invalid sort column: " + column);
        }

        // Default to ASC if direction is invalid, or strictly validate
        String dir = "desc".equalsIgnoreCase(direction) ? "desc" : "asc";
        return snakeCase + " " + dir;
    }

    private String camelToSnake(String str) {
        return str.replaceAll("([a-z])([A-Z]+)", "$1_$2").toLowerCase();
    }
}
