import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'info' | 'success' | 'error';
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full px-2">
      {toasts.map((toast) => {
        let bg = 'bg-slate-900/95 border-slate-700 text-slate-100';
        let icon = <Info className="w-4 h-4 text-indigo-400 shrink-0" />;

        if (toast.type === 'success') {
          bg = 'bg-emerald-950/95 border-emerald-700/60 text-emerald-100';
          icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
        } else if (toast.type === 'error') {
          bg = 'bg-rose-950/95 border-rose-700/60 text-rose-100';
          icon = <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-3 rounded-2xl border text-xs font-medium shadow-xl backdrop-blur-md transition-all duration-300 flex items-center justify-between gap-3 ${bg}`}
          >
            <div className="flex items-center gap-2">
              {icon}
              <span className="leading-snug">{toast.text}</span>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white p-0.5"
              aria-label="Fechar notificação"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
