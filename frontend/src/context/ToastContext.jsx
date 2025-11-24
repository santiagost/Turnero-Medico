import React, { createContext, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import ToastItem from "../components/ui/ToastItem";


export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Función para agregar un toast
  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now(); // ID único basado en tiempo
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  // Función para eliminar un toast
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Helpers para llamar directamente toast.success("Hola")
  const toast = {
    success: (msg, duration) => addToast(msg, "success", duration),
    error: (msg, duration) => addToast(msg, "error", duration),
    warning: (msg, duration) => addToast(msg, "warning", duration),
    info: (msg, duration) => addToast(msg, "info", duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Renderizamos el Portal aquí mismo */}
      {createPortal(
        <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
          <AnimatePresence>
            {toasts.map((t) => (
              <ToastItem key={t.id} {...t} onClose={() => removeToast(t.id)} />
            ))}
          </AnimatePresence>
        </div>,
        document.getElementById("toast-root")
      )}
    </ToastContext.Provider>
  );
};