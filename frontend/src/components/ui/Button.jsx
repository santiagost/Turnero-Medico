import React from "react";

const Button = ({ text, variant = "primary", onClick, disable = false, type }) => {

    const baseStyles = "py-2 px-6 rounded-xl font-bold text-2xl transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-100 flex justify-center items-center"

    const variants = {
        primary: "bg-custom-mid-dark-blue text-white hover:bg-custom-mid-light-blue active:bg-custom-mid-dark-blue",

        secondary: "bg-white text-custom-mid-dark-blue border-2 border-custom-mid-dark-blue hover:bg-custom-light-blue/25 active:bg-custom-light-blue",

        disabled: "bg-custom-light-gray text-custom-gray border-2 border-custom-mid-gray cursor-not-allowed hover:scale-100",
    };

    const variantStyles = disable ? variants.disabled : variants[variant];

    return (
        <button
            className={`${baseStyles} ${variantStyles}`}
            onClick={onClick}
            disabled={disable}
            type={type}
        >
            {text}
        </button>
    );
};


export default Button;