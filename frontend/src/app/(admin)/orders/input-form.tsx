import * as React from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { OrderDetail, OrderStatusLabels } from "./types";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

import { DateInput } from "@/components/common";

const formSchema = z.object({
    orderId: z.string().min(1, "주문 번호를 입력하세요"),
    custNm: z.string().min(1, "고객명을 입력하세요"),
    orderNm: z.string().min(1, "주문명을 입력하세요"),
    orderStatus: z.string(),
    orderAmt: z.coerce.number().min(0, "금액은 0 이상이어야 합니다"),
    orderDate: z.string().optional(),
});

export interface InputFormProps {
    item?: OrderDetail | null;
    onSubmit: (data: Partial<OrderDetail>) => Promise<void>;
    onCancel: () => void;
}

export function InputForm({ item, onSubmit, onCancel }: InputFormProps) {
    const isEdit = !!item;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as Resolver<z.infer<typeof formSchema>>,
        defaultValues: {
            orderId: item?.orderId || "",
            custNm: item?.custNm || "",
            orderNm: item?.orderNm || "",
            orderStatus: item?.orderStatus || "ORDERED",
            orderAmt: item?.orderAmt || 0,
            orderDate: item?.orderDate || new Date().toISOString(), // Date string from backend usually ISO
        },
    });

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        await onSubmit(values);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="px-6 py-6 space-y-5">
                <FormField
                    control={form.control}
                    name="orderId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="block text-xs font-bold text-muted-foreground dark:text-muted-foreground mb-1.5">
                                주문 번호 <span className="text-primary">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input
                                    className="block w-full sm:text-sm border-border dark:border-border dark:bg-input rounded-md py-2.5 placeholder:text-muted-foreground"
                                    placeholder="ORD-001"
                                    {...field}
                                    disabled={isEdit}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex gap-4">
                    <FormField
                        control={form.control}
                        name="custNm"
                        render={({ field }) => (
                            <FormItem className="w-1/2">
                                <FormLabel className="block text-xs font-bold text-muted-foreground dark:text-muted-foreground mb-1.5">
                                    고객명 <span className="text-primary">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        className="block w-full sm:text-sm border-border dark:border-border dark:bg-input rounded-md py-2.5 placeholder:text-muted-foreground"
                                        placeholder="홍길동"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="orderAmt"
                        render={({ field }) => (
                            <FormItem className="w-1/2">
                                <FormLabel className="block text-xs font-bold text-muted-foreground dark:text-muted-foreground mb-1.5">
                                    주문 금액
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        className="block w-full sm:text-sm border-border dark:border-border dark:bg-input rounded-md py-2.5 placeholder:text-muted-foreground"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="orderNm"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="block text-xs font-bold text-muted-foreground dark:text-muted-foreground mb-1.5">
                                주문명 <span className="text-primary">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input
                                    className="block w-full sm:text-sm border-border dark:border-border dark:bg-input rounded-md py-2.5 placeholder:text-muted-foreground"
                                    placeholder="상품명 또는 주문 설명"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex gap-4">
                    <FormField
                        control={form.control}
                        name="orderStatus"
                        render={({ field }) => (
                            <FormItem className="w-1/2">
                                <FormLabel className="block text-xs font-bold text-muted-foreground dark:text-muted-foreground mb-1.5">
                                    주문 상태
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="상태 선택" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.entries(OrderStatusLabels).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="orderDate"
                        render={({ field }) => (
                            <FormItem className="w-1/2">
                                <FormLabel className="block text-xs font-bold text-muted-foreground dark:text-muted-foreground mb-1.5">
                                    주문 일자
                                </FormLabel>
                                <FormControl>
                                    <DateInput
                                        className="h-10"
                                        placeholder="주문 일시 선택"
                                        value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ""}
                                        onChange={(value) => {
                                            const date = new Date(value);
                                            // Ensure valid date before setting
                                            if (!isNaN(date.getTime())) {
                                                field.onChange(date.toISOString());
                                            }
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="bg-background dark:bg-card border-t border-border dark:border-border pt-4 flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                        disabled={form.formState.isSubmitting}
                        className="px-4 py-2 bg-background dark:bg-card text-muted-foreground dark:text-muted-foreground border border-border dark:border-border rounded-md text-sm font-bold hover:bg-muted dark:hover:bg-muted"
                    >
                        취소
                    </Button>
                    <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        className="px-6 py-2 bg-primary border border-transparent rounded-md shadow-sm text-sm font-bold text-white hover:opacity-90 hover:bg-primary disabled:opacity-50"
                    >
                        {form.formState.isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                저장 중...
                            </>
                        ) : (
                            "저장"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
