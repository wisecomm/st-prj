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
    sysInsertDtm?: string;
    sysUpdateDtm?: string;
}
