import React from "react";
import { IoIosClose } from "react-icons/io"; 

const MedicationCard = ({ name, onDelete }) => {
    return (
        <button 
            type="button"
            onClick={onDelete}
            className="
                group relative 
                bg-custom-mid-light-blue text-custom-dark-blue text-md p-2 rounded-2xl text-center font-medium
                hover:bg-custom-red hover:border-custom-red hover:text-white hover:cursor-pointer
                transition-colors duration-150
                w-auto
            "
        >
            <span 
                className="
                    flex items-center justify-center
                    transition-opacity duration-150
                    opacity-100 group-hover:opacity-0
                "
            >
                {name}
            </span>

            <span 
                className="
                    absolute inset-0 flex items-center justify-center
                    transition-opacity duration-150
                    opacity-0 group-hover:opacity-100
                "
            >
                <IoIosClose size={28} />
            </span>
        </button>
    );
};

export default MedicationCard;