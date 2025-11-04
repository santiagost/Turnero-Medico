import React from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";

const Modal = ({ isOpen, onClose, children }) => {
    return ReactDOM.createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <motion.div
                        onClick={(e) => e.stopPropagation()} 
                        initial={{ y: 50, scale: 0.9, opacity: 0 }}
                        animate={{ y: 0, scale: 1, opacity: 1 }}
                        exit={{ y: 50, scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        
                        className="relative bg-white rounded-xl shadow-2xl overflow-hidden"
                    >
                        {/* Botón de 'X' opcional */}
                        <button 
                            onClick={onClose} 
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-800 z-10"
                        >
                            <IoClose size={28} />
                        </button>
                        
                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.getElementById("modal-root")
    );
};

export default Modal;