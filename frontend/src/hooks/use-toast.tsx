"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastVariant = "default" | "destructive" | "success"

interface Toast {
    id: string
    title?: string
    description?: React.ReactNode
    variant?: ToastVariant
}

interface ToastContextType {
    toasts: Toast[]
    toast: (props: Omit<Toast, "id">) => void
    dismiss: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

// 전역에서 사용할 수 있는 Toast 함수 참조
let globalToastFn: ((props: Omit<Toast, "id">) => void) | null = null;

// React 컴포넌트 외부(예: api-client.ts)에서 호출하기 위한 래퍼 함수
export const globalToast = (props: Omit<Toast, "id">) => {
    if (globalToastFn) {
        globalToastFn(props);
    } else {
        console.warn("globalToast called before ToastProvider was initialized", props);
    }
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<Toast[]>([])
    const timeoutRefs = React.useRef<Map<string, NodeJS.Timeout>>(new Map())

    // Cleanup all timeouts on unmount
    React.useEffect(() => {
        const timeouts = timeoutRefs.current
        return () => {
            timeouts.forEach((timeout) => clearTimeout(timeout))
            timeouts.clear()
        }
    }, [])

    const toast = React.useCallback(({ title, description, variant = "default" }: Omit<Toast, "id">) => {
        const id = Math.random().toString(36).substring(2, 9)
        setToasts((prev) => [...prev, { id, title, description, variant }])

        // Auto dismiss after 5 seconds with cleanup tracking
        const timeoutId = setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
            timeoutRefs.current.delete(id)
        }, 5000)
        timeoutRefs.current.set(id, timeoutId)
    }, [])

    // Provider 마운트 시 globalToastFn에 참조 연결
    React.useEffect(() => {
        globalToastFn = toast;
        return () => {
            globalToastFn = null;
        }
    }, [toast])

    const dismiss = React.useCallback((id: string) => {
        // Clear timeout when manually dismissed
        const timeoutId = timeoutRefs.current.get(id)
        if (timeoutId) {
            clearTimeout(timeoutId)
            timeoutRefs.current.delete(id)
        }
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ toasts, toast, dismiss }}>
            {children}
            <ToastContainer toasts={toasts} dismiss={dismiss} />
        </ToastContext.Provider>
    )
}

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={cn(
                        "relative flex items-start gap-3 p-4 rounded-lg shadow-lg border backdrop-blur-sm",
                        "animate-in slide-in-from-bottom-5 fade-in duration-300",
                        toast.variant === "destructive" && "bg-red-500/90 text-white border-red-600",
                        toast.variant === "success" && "bg-green-500/90 text-white border-green-600",
                        toast.variant === "default" && "bg-slate-900/90 text-white border-slate-700 dark:bg-slate-800/90"
                    )}
                >
                    <div className="flex-1">
                        {toast.title && (
                            <p className="font-semibold text-sm">{toast.title}</p>
                        )}
                        {toast.description && (
                            <p className="text-sm opacity-90 mt-1">{toast.description}</p>
                        )}
                    </div>
                    <button
                        onClick={() => dismiss(toast.id)}
                        className="p-1 rounded-md hover:bg-white/20 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ))}
        </div>
    )
}

export function useToast() {
    const context = React.useContext(ToastContext)
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider")
    }
    return context
}
