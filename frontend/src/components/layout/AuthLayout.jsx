import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';

const animacion = {
    initial: {
        opacity: 0,
        scale: 0.40,
    },
    animate: {
        opacity: 1,
        scale: 1,
    },
    exit: {
        opacity: 0,
        scale: 0.40,
    },
    transition: {
        duration: 0.4,
        ease: "easeOut",
    },
};

export const AuthLayout = () => {
    const location = useLocation();

    return (
        <div className="relative min-h-screen overflow-x-hidden overflow-y-scroll custom-scrollbar">
            <div className="fixed inset-0 -z-10 bg-[url('/fondo.svg')] bg-cover" />
            <AnimatePresence mode="" initial={false}>
                <motion.div
                    key={location.pathname}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={animacion}
                    transition={animacion.transition}
                    className="absolute inset-0 z-10"
                >
                    <Outlet/>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};