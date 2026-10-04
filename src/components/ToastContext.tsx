import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, title?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info', title?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type, title }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full px-4 sm:px-0 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-[6px] shadow-[0_12px_30px_rgba(8,38,49,0.25)] border text-sm transition-all duration-300 animate-in slide-in-from-bottom-2 ${
              toast.type === 'success'
                ? 'bg-[#123f47] border-[#1f5963] text-white'
                : toast.type === 'error'
                ? 'bg-[#7f1d1d] border-[#991b1b] text-white'
                : toast.type === 'warning'
                ? 'bg-[#854d0e] border-[#a16207] text-white'
                : 'bg-[#082631] border-[#194048] text-[#f7f6f2]'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#eb6a32]" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-[#fca5a5]" />}
              {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-[#fde047]" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-[#f6a47f]" />}
            </div>
            <div className="flex-1">
              {toast.title && (
                <div className="font-['Manrope'] font-bold text-sm tracking-tight mb-0.5 text-white">
                  {toast.title}
                </div>
              )}
              <div className="text-xs leading-relaxed opacity-95">{toast.message}</div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-white/70 hover:text-white p-0.5 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
