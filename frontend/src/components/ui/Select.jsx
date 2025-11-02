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

const Select = ({
    tittle, description, options, disable = false, value, onChange,
    placeholder, name, required, onBlur, error,
    size = "big", tooltip, tooltipText }) => {

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
        big: { container: "py-3" },
        small: { container: "py-2" },
    };

    const baseStyles = `
        border-2 rounded-lg 
        flex flex-row justify-between items-center pl-4 pr-6
        transition-colors duration-200 ease-in-out
        ${sizeVariants[size].container}
        ${error ? "border-custom-red" : "border-custom-blue"}
    `;

    const variants = {
        active: error ? "" : "focus-within:border-custom-dark-blue hover:border-custom-dark-blue/70",
        disabled: "bg-custom-light-gray"
    };

    const variantStyles = disable ? variants.disabled : variants.active;

    const textColor = (value === "")
        ? "text-gray-400"
        : "text-custom-dark-blue";

    return (
        <div className="flex flex-col gap-1 w-full text-custom-dark-blue">

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

            <div className={`${baseStyles} ${variantStyles}`}>
                <select
                    className={`${textColor} bg-transparent outline-none w-full`}
                    disabled={disable}
                    value={value}
                    onChange={onChange}
                    name={name}
                    required={required}
                    onBlur={onBlur}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}

                    {options && options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                            className="text-custom-dark-blue"
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {error ? (
                <p className="text-xs text-custom-red ml-1 text-left">{error}</p>
            ) : (
                description && <p className="text-xs text-custom-gray ml-1 text-left">{description}</p>
            )}
        </div>
    );
};

export default Select;