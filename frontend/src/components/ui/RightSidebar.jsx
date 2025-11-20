import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";

const RightSidebar = ({ isOpen, onClose, title, children }) => {
    // Evita que el scroll del body funcione cuando el sidebar está abierto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const sidebarRoot = document.getElementById("sidebar-root");
    if (!sidebarRoot) return null;

    return ReactDOM.createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* 1. Backdrop (Fondo Oscuro) */}
                    <motion.div
                        className="fixed inset-0 bg-black/30 z-40"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    {/* 2. Sidebar (Deslizante) */}
                    <motion.div
                        className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl flex flex-col"
                        initial={{ x: "100%" }}
                        animate={{ x: "0%" }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 ">
                            <h2 className="text-2xl font-bold text-custom-dark-blue">
                                {title}
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-800 z-10"
                            >
                                <IoClose size={28} />
                            </button>
                        </div>
                        <div className="flex flex-col items-center">
                            <hr className='border text-custom-mid-light-blue w-[90%]' />
                        </div>

                        {/* Contenido Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        sidebarRoot
    );
};

export default RightSidebar;