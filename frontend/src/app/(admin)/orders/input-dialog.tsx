import * as React from "react";
import { OrderDetail } from "./types";
import { ShoppingCart } from "lucide-react";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { InputForm } from "./input-form";

interface InputDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    order?: OrderDetail | null;
    onSubmit: (data: Partial<OrderDetail>) => Promise<void>;
}

export function InputDialog({ open, onOpenChange, order, onSubmit }: InputDialogProps) {
    const isEdit = !!order;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-background dark:bg-card rounded-xl border-none shadow-2xl">
                <div className="bg-background dark:bg-card px-6 py-5 border-b border-border dark:border-border flex items-center justify-between">
                    <h3 className="text-lg font-bold leading-6 text-foreground dark:text-foreground flex items-center gap-2">
                        <ShoppingCart className="text-primary w-6 h-6" />
                        {isEdit ? "주문 수정" : "주문 추가"}
                    </h3>
                </div>

                <InputForm
                    item={order}
                    onSubmit={onSubmit}
                    onCancel={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
