import { useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MenuInfo } from "../types";

export const menuFormSchema = z.object({
    menuId: z.string().min(2, "Menu ID must be at least 2 characters."),
    menuName: z.string().min(1, "Menu name is required."),
    menuLvl: z.number().min(0),
    menuUri: z.string().optional().or(z.literal("")),
    menuImgUri: z.string().optional().or(z.literal("")),
    upperMenuId: z.string().min(1),
    menuDesc: z.string().optional().or(z.literal("")),
    menuSeq: z.number().min(0).optional(),
    useYn: z.string().min(1),
});

export type MenuFormValues = z.infer<typeof menuFormSchema>;

export interface UseInputFormProps {
    item?: MenuInfo | null;
    onSubmit: (data: Partial<MenuInfo>) => Promise<void>;
}

export interface UseInputFormReturn {
    form: UseFormReturn<MenuFormValues>;
    handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
    isEdit: boolean;
}

const defaultValues: MenuFormValues = {
    menuId: "",
    menuName: "",
    menuLvl: 1,
    menuUri: "",
    menuImgUri: "",
    upperMenuId: "none",
    menuDesc: "",
    menuSeq: 0,
    useYn: "1",
};

export function useInputForm({ item, onSubmit }: UseInputFormProps): UseInputFormReturn {
    const isEdit = !!(item && item.menuId);

    const form = useForm<MenuFormValues>({
        resolver: zodResolver(menuFormSchema),
        defaultValues,
    });

    useEffect(() => {
        if (item) {
            form.reset({
                menuId: item.menuId,
                menuName: item.menuName,
                menuLvl: item.menuLvl,
                menuUri: item.menuUri || "",
                menuImgUri: item.menuImgUri || "",
                upperMenuId: item.upperMenuId || "none",
                menuDesc: item.menuDesc || "",
                menuSeq: item.menuSeq || 0,
                useYn: item.useYn,
            });
        } else {
            form.reset(defaultValues);
        }
    }, [item, form]);

    const onFormSubmit = async (data: MenuFormValues) => {
        const sanitizedData: Partial<MenuInfo> = {
            ...data,
            upperMenuId: data.upperMenuId === "none" ? null : data.upperMenuId,
            menuUri: data.menuUri === "" ? null : data.menuUri,
            menuImgUri: data.menuImgUri === "" ? null : data.menuImgUri,
            menuDesc: data.menuDesc === "" ? null : data.menuDesc,
        };
        await onSubmit(sanitizedData);
    };

    return {
        form,
        handleSubmit: form.handleSubmit(onFormSubmit),
        isEdit,
    };
}
