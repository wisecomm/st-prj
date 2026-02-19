package com.example.springrest.common.excel;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 엑셀 컬럼 매핑을 위한 어노테이션
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
public @interface ExcelColumn {

    /**
     * 엑셀 헤더 이름
     */
    String headerName();

    /**
     * 컬럼 순서 (낮을수록 왼쪽)
     */
    int order() default 0;

    /**
     * 컬럼 너비 (픽셀 단위 256 = 1글자 대략)
     * -1이면 자동 조절 시도
     */
    int width() default -1;
}
