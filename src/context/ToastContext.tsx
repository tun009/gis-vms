import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

interface ToastItem {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextValue {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).slice(2);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    }, []);

    const icons: Record<ToastType, string> = {
        success: '✓',
        info: 'ℹ',
        warning: '⚠',
        error: '✕',
    };

    const colors: Record<ToastType, string> = {
        success: 'border-y-[#2a2d35] border-r-[#2a2d35] border-l-[#27a644] bg-[#1e2025]',
        info: 'border-y-[#2a2d35] border-r-[#2a2d35] border-l-[#5e6ad2] bg-[#1e2025]',
        warning: 'border-y-[#2a2d35] border-r-[#2a2d35] border-l-[#f59e0b] bg-[#1e2025]',
        error: 'border-y-[#2a2d35] border-r-[#2a2d35] border-l-[#ef4444] bg-[#1e2025]',
    };

    const iconColors: Record<ToastType, string> = {
        success: 'text-[#27a644]',
        info: 'text-[#5e6ad2]',
        warning: 'text-[#f59e0b]',
        error: 'text-[#ef4444]',
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast container */}
            <div className="fixed top-20 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-l-[4px]
                            shadow-dialog
                            text-sm font-medium animate-fade-in
                            ${colors[toast.type]}`}
                        style={{ minWidth: 260 }}
                    >
                        <span className={`text-[18px] leading-none font-bold ${iconColors[toast.type]}`}>{icons[toast.type]}</span>
                        <span className="text-gray-100">{toast.message}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}
