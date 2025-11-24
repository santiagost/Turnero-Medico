import React from "react";
import { motion, AnimatePresence } from "framer-motion";

import Spinner from "./Spinner";

const Button = ({
    text,
    variant = "primary",
    onClick,
    disable = false,
    isLoading = false,
    type,
    size = "big",
    icon,
}) => {
    const sizeVariants = () => {
        switch (size) {
            case "big":
                return "py-2 px-6 rounded-xl font-bold text-2xl min-h-[3rem]";
            case "medium":
                return "py-2 px-4 rounded-xl font-bold text-lg min-h-[2.75rem]";
            case "small":
                return "py-1 px-3 rounded-lg font-bold text-sm min-h-[2rem]";
            default:
                return "py-2 px-6 rounded-xl font-bold text-2xl";
        }
    };

    const isDisabled = disable || isLoading;

    const animationStyles = isDisabled
        ? "cursor-not-allowed opacity-70"
        : "hover:scale-105 active:scale-100 cursor-pointer";

    const baseStyles = `transition-all duration-200 ease-in-out transform flex flex-row items-center justify-center gap-2 ${animationStyles}`;

    const variants = {
        primary:
            "bg-custom-mid-dark-blue text-white hover:bg-custom-mid-light-blue active:bg-custom-mid-dark-blue",
        secondary:
            "bg-white text-custom-mid-dark-blue border-2 border-custom-mid-dark-blue hover:bg-custom-light-blue/25 active:bg-custom-light-blue",
        disabled:
            "bg-custom-light-gray text-custom-gray border-2 border-custom-mid-gray scale-100",
    };

    const currentVariantStyle = disable ? variants.disabled : variants[variant];

    return (
        <button
            className={`${sizeVariants()} ${baseStyles} ${currentVariantStyle}`}
            onClick={isDisabled ? undefined : onClick}
            disabled={isDisabled}
            type={type}
        >
            <AnimatePresence />
            <div className="flex items-center justify-center gap-2">
                {isLoading ? (
                    <Spinner />
                ) : (
                    <>
                        {icon && <span>{icon}</span>}
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                        >
                            {text}
                        </motion.span>
                    </>
                )}
            </div>
            <AnimatePresence />
        </button>
    );
};

export default Button;
