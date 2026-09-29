import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-2 ${
              isSuccess
                ? 'bg-slate-900/95 border-emerald-500/30 text-emerald-300'
                : isWarning
                ? 'bg-slate-900/95 border-amber-500/30 text-amber-300'
                : isError
                ? 'bg-slate-900/95 border-rose-500/30 text-rose-300'
                : 'bg-slate-900/95 border-indigo-500/30 text-indigo-300'
            }`}
          >
            <div className="mt-0.5">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {isWarning && <AlertTriangle className="w-4 h-4 text-amber-400" />}
              {isError && <XCircle className="w-4 h-4 text-rose-400" />}
              {!isSuccess && !isWarning && !isError && <Info className="w-4 h-4 text-indigo-400" />}
            </div>

            <div className="flex-1 text-xs">
              <p className="font-semibold text-slate-100">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-slate-400">{toast.description}</p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
