package com.example.springrest.domain.user.model.dto;

import com.example.springrest.common.excel.ExcelColumn;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserExcelDto {
    @ExcelColumn(headerName = "ID", order = 1, width = 20)
    private String userId;

    @ExcelColumn(headerName = "이름", order = 2, width = 15)
    private String userName;

    @ExcelColumn(headerName = "이메일", order = 3, width = 30)
    private String userEmail;

    @ExcelColumn(headerName = "닉네임", order = 4, width = 15)
    private String userNick;

    @ExcelColumn(headerName = "사용여부", order = 5, width = 10)
    private String useYn;

    // Password field is optional in Excel. If present in upload, used.
    // In download, we probably shouldn't export password hash.
    @ExcelColumn(headerName = "비밀번호(업로드용)", order = 6, width = 20)
    private String userPwd;
}
