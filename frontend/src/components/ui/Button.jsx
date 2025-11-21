import React from "react";

const Button = ({ text, variant = "primary", onClick, disable = false, type, size = "big", icon }) => {

    const sizeVariants = () => {
        switch (size) {
            case "big":
                return "py-2 px-6 rounded-xl font-bold text-2xl"
            case "medium":
                return "py-2 px-4 rounded-xl font-bold text-lg"
            case "small":
                return "py-1 px-3 rounded-lg font-bold text-sm"
            default:
                return "py-2 px-6 rounded-xl font-bold text-2xl"
        }
    }
    
    const baseStyles = "transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-100 flex flex-row items-center justify-center gap-2 cursor-pointer"

    const variants = {
        primary: "bg-custom-mid-dark-blue text-white hover:bg-custom-mid-light-blue active:bg-custom-mid-dark-blue",

        secondary: "bg-white text-custom-mid-dark-blue border-2 border-custom-mid-dark-blue hover:bg-custom-light-blue/25 active:bg-custom-light-blue",

        disabled: "bg-custom-light-gray text-custom-gray border-2 border-custom-mid-gray cursor-not-allowed hover:scale-100",
    };

    const variantStyles = disable ? variants.disabled : variants[variant];

    return (
        <button
            className={`${sizeVariants()} ${baseStyles} ${variantStyles}`}
            onClick={onClick}
            disabled={disable}
            type={type}
        >
            {icon}
            {text}
        </button>
    );
};


export default Button;