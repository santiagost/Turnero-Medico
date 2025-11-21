import React from "react";

const IconButton = ({ icon, disable = false, type = "button", onClick }) => {
    return (
        <button className="
            rounded-full p-1 text-custom-dark-blue
            bg-custom-light-blue  hover:bg-custom-mid-light-blue active:bg-custom-mid-dark-blue
            hover:scale-110 active:text-white
            transition-all duration-200 ease-in-out cursor-pointer"
            disabled={disable}
            type={type}
            onClick={onClick}>
            {icon}
        </button>
    );
};

export default IconButton;