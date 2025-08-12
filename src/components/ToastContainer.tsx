import React, { useState, useCallback, useMemo } from "react";
import Toast from "./Toast";
import { ToastContext, type ToastData } from "./toast-context";

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((toast: Omit<ToastData, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (title: string, message?: string, duration?: number) => {
      addToast({ type: "success", title, message, duration });
    },
    [addToast]
  );

  const error = useCallback(
    (title: string, message?: string, duration?: number) => {
      addToast({ type: "error", title, message, duration });
    },
    [addToast]
  );

  const info = useCallback(
    (title: string, message?: string, duration?: number) => {
      addToast({ type: "info", title, message, duration });
    },
    [addToast]
  );

  const warning = useCallback(
    (title: string, message?: string, duration?: number) => {
      addToast({ type: "warning", title, message, duration });
    },
    [addToast]
  );

  const value = useMemo(
    () => ({
      addToast,
      removeToast,
      success,
      error,
      info,
      warning,
    }),
    [addToast, removeToast, success, error, info, warning]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast Container */}
      <div
        aria-live="assertive"
        className="fixed inset-0 flex items-end justify-end px-4 py-6 pointer-events-none sm:p-6 z-50"
      >
        <div className="w-full flex flex-col items-end space-y-4 sm:items-end">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              id={toast.id}
              type={toast.type}
              title={toast.title}
              message={toast.message}
              duration={toast.duration}
              onClose={removeToast}
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
