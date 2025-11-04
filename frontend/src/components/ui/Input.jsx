import React, { useState, useRef } from "react";
import { IoMdInformationCircle } from "react-icons/io";
import { useClickOutside } from "../../hooks/useClickOutside";

const TooltipDropdown = ({ text }) => {
    return (
        <div className="absolute top-full right-0 mt-2 w-60 bg-custom-light-blue rounded-lg shadow-xl border border-custom-mid-light-blue z-50 p-3">
            <p className="text-sm text-custom-dark-blue">{text || "No hay información disponible."}</p>
        </div>
    );
};

const Input = ({
    tittle, description, type, icon, useButton, disable = false,
    value, onChange, required, name, tooltip, tooltipText, size = "big",
    error, onBlur, multiline = false, rows = 4 }) => {

    const [isTooltipOpen, setIsTooltipOpen] = useState(false);
    const tooltipRef = useRef(null);

    useClickOutside(tooltipRef, () => {
        setIsTooltipOpen(false);
    });

    const handleTooltipToggle = (e) => {
        e.preventDefault();
        setIsTooltipOpen(prev => !prev);
    };

    const sizeVariants = {
        big: { container: `${icon ? "py-2" : "py-3"}`, button: "p-1" },
        small: { container: `${icon ? "py-1" : "py-2"}`, button: "p-0.5" },
    };

    const baseStyles = `
        border-2 rounded-lg 
        flex flex-row justify-between items-center px-4
        transition-colors duration-200 ease-in-out
        ${error ? "border-custom-red" : "border-custom-blue"}
        ${multiline
            ? "items-start py-2"
            : `${sizeVariants[size].container} items-center`
        }
    `;

    const variants = {
        active: error ? "bg-white" : "bg-white focus-within:border-custom-dark-blue hover:border-custom-dark-blue/70",
        disabled: "bg-custom-light-gray"
    };

    const variantStyles = disable ? variants.disabled : variants.active;

    const InputElement = multiline ? (
        <textarea
            className="text-custom-dark-blue bg-transparent outline-none w-full 
                       resize-none" // resize-none previene que el usuario lo agrande
            disabled={disable}
            value={value}
            onChange={onChange}
            required={required}
            name={name}
            onBlur={onBlur}
            rows={rows} // Usa la prop 'rows' para la altura
        />
    ) : (
        <input
            className="text-custom-dark-blue bg-transparent outline-none w-full"
            type={type}
            disabled={disable}
            value={value}
            onChange={onChange}
            required={required}
            name={name}
            onBlur={onBlur}
        />
    );

    return (
        <div className={`flex flex-col gap-1 w-full text-custom-dark-blue ${multiline ? 'h-full' : ''}`}>
            <div ref={tooltipRef} className="flex flex-row justify-between items-center relative">
                <p className="text-custom-mid-dark-blue font-medium text-start">{tittle}</p>
                {tooltip &&
                    <button
                        type="button"
                        onClick={handleTooltipToggle}
                        className="text-custom-mid-light-blue transition-all duration-200 ease-in-out transform hover:scale-105
                                   active:scale-100 hover:text-custom-blue active:text-custom-mid-dark-blue"
                    >
                        <IoMdInformationCircle size={25} />
                    </button>
                }
                {isTooltipOpen && tooltip && (
                    <TooltipDropdown text={tooltipText} />
                )}
            </div>

            <div className={`${baseStyles} ${variantStyles} ${multiline ? 'h-full flex-grow' : ''}`}>
                {InputElement}

                {icon &&
                    <button
                        type="button"
                        className={`text-custom-mid-dark-blue ${sizeVariants[size].button} rounded-xl 
                                    transition-all duration-200 ease-in-out
                                    hover:bg-custom-light-blue hover:scale-110 hover:text-white
                                    ${multiline ? 'mt-1' : ''}`}
                        onClick={useButton}>
                        {icon}
                    </button>
                }
            </div>

            {error ? (
                <p className="text-xs text-custom-red ml-1 text-left">{error}</p>
            ) : (
                <p className="text-xs text-custom-gray ml-1 text-left">
                    {description}
                </p>
            )}
        </div>
    );
};

export default Input;