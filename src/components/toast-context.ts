import { createContext } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export interface ToastContextType {
  addToast: (toast: Omit<ToastData, "id">) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string, duration?: number) => void;
  error: (title: string, message?: string, duration?: number) => void;
  info: (title: string, message?: string, duration?: number) => void;
  warning: (title: string, message?: string, duration?: number) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(
  undefined
);
