import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaTimesCircle, 
  FaInfoCircle, 
  FaTimes 
} from "react-icons/fa";

const variants = {
  success: {
    icon: <FaCheckCircle className="w-6 h-6" />,
    style: "bg-white border-l-4 border-green-500 text-gray-800 shadow-lg",
    iconColor: "text-green-500"
  },
  error: {
    icon: <FaTimesCircle className="w-6 h-6" />,
    style: "bg-white border-l-4 border-red-500 text-gray-800 shadow-lg",
    iconColor: "text-red-500"
  },
  warning: {
    icon: <FaExclamationCircle className="w-6 h-6" />,
    style: "bg-white border-l-4 border-yellow-500 text-gray-800 shadow-lg",
    iconColor: "text-yellow-500"
  },
  info: {
    icon: <FaInfoCircle className="w-6 h-6" />,
    style: "bg-white border-l-4 border-blue-500 text-gray-800 shadow-lg",
    iconColor: "text-blue-500"
  },
};

const ToastItem = ({ id, message, type, duration, onClose }) => {
  const currentVariant = variants[type] || variants.info;

  // Auto-cierre
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <motion.div
      layout // Ayuda a que los otros toasts se muevan suavemente cuando uno desaparece
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`pointer-events-auto flex items-center justify-between p-4 rounded-lg shadow-xl min-w-[300px] overflow-hidden ${currentVariant.style}`}
    >
      <div className="flex items-center gap-3">
        <span className={currentVariant.iconColor}>{currentVariant.icon}</span>
        <p className="font-medium text-sm">{message}</p>
      </div>
      
      <button 
        onClick={onClose} 
        className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <FaTimes />
      </button>
    </motion.div>
  );
};

export default ToastItem;