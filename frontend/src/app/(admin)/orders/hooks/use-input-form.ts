import { useEffect } from "react";
import { useForm, UseFormReturn, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { OrderDetail } from "../types";

export const orderFormSchema = z.object({
    orderId: z.string().min(1, "주문 번호는 필수입니다."),
    custNm: z.string().min(1, "고객명은 필수입니다."),
    orderNm: z.string().min(1, "주문명은 필수입니다."),
    orderStatus: z.string().min(1, "주문 상태는 필수입니다."),
    orderAmt: z.coerce.number().min(0, "주문 금액은 0 이상이어야 합니다."),
    orderDate: z.string().min(1, "주문 일시는 필수입니다."),
    useYn: z.string().min(1),
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;

export interface UseInputFormProps {
    item?: OrderDetail | null;
    onSubmit: (data: Partial<OrderDetail>) => Promise<void>;
}

export interface UseInputFormReturn {
    form: UseFormReturn<OrderFormValues>;
    handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
    isEdit: boolean;
}

const defaultValues: OrderFormValues = {
    orderId: "",
    custNm: "",
    orderNm: "",
    orderStatus: "ORDERED",
    orderAmt: 0,
    orderDate: new Date().toISOString(),
    useYn: "1",
};

export function useInputForm({ item, onSubmit }: UseInputFormProps): UseInputFormReturn {
    const isEdit = !!item;

    const form = useForm<OrderFormValues>({
        resolver: zodResolver(orderFormSchema) as Resolver<OrderFormValues>,
        defaultValues,
    });

    useEffect(() => {
        if (item) {
            form.reset({
                orderId: item.orderId || "",
                custNm: item.custNm || "",
                orderNm: item.orderNm || "",
                orderStatus: item.orderStatus || "ORDERED",
                orderAmt: item.orderAmt || 0,
                orderDate: item.orderDate || new Date().toISOString(),
                useYn: item.useYn || "1",
            });
        } else {
            form.reset({ ...defaultValues, orderDate: new Date().toISOString() });
        }
    }, [item, form]);

    const onFormSubmit = async (data: OrderFormValues) => {
        await onSubmit(data);
    };

    return {
        form,
        handleSubmit: form.handleSubmit(onFormSubmit),
        isEdit,
    };
}
