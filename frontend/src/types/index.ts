export interface ApiResponse<T> {
    code: string;
    message: string;
    data: T | null;
}

export interface PageResponse<T> {
    list: T[];
    total: number;
    pageNum: number;
    pageSize: number;
    pages: number;
}export interface UserDetail {
    userId: string;
    userEmail: string;
    userMobile: string;
    userName: string;
    userNick: string;
    userMsg?: string;
    userDesc?: string;
    userStatCd: string;
    userSnsid?: string;
    useYn: string;
    roleIds?: string[];
    sysInsertDtm?: string;
    sysUpdateDtm?: string;
}

export interface UserInfo {
    userId: string;
    userName: string;
    userEmail: string;
    roles: string[];
    createdAt?: string;
    lastLoginAt?: string;
}

export interface LoginData {
    token: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    user: UserInfo;
}

export interface MenuInfo {
    menuId: string;
    menuLvl: number;
    menuUri?: string | null;
    menuImgUri?: string | null;
    menuName: string;
    upperMenuId?: string | null;
    menuDesc?: string | null;
    menuSeq?: number | null;
    useYn: string;
    adminMenuYn?: string;
    personalDataYn?: string;
    leftMenuYn?: string;
    sysInsertDtm?: string;
    sysUpdateDtm?: string;
}

export interface RoleInfo {
    roleId: string;
    roleName: string;
    roleDesc?: string;
    menuIds?: string[];
    useYn: string;
    sysInsertDtm?: string;
    sysUpdateDtm?: string;
    sysInsertUserId?: string;
}

export interface Schedule {
    uid: number;
    beanName: string;
    beanParam?: string;
    used: boolean;
    dupStop: boolean;
    cron: string;
    comment?: string;
    createTime?: string;
    creator?: string;
    updateTime?: string;
    updater?: string;
}

export interface ScheduleRequest {
    beanName: string;
    beanParam?: string;
    used: boolean;
    dupStop: boolean;
    cron: string;
    comment?: string;
    creator?: string;
    updater?: string;
}

export interface ScheduleLog {
    uid: number;
    corpCode?: string;
    beanName: string;
    method: string;
    result: string;
    message?: string;
    startTime?: string;
    endTime?: string;
    worker?: string;
}

