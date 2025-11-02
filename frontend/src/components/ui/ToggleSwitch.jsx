import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ToggleSwitch = ({ isOn, onToggle }) => {
    const [internalIsOn, setInternalIsOn] = useState(true);

    const active = isOn !== undefined ? isOn : internalIsOn;
    const setActive = onToggle !== undefined ? onToggle : setInternalIsOn;

    const spring = {
        type: "spring",
        stiffness: 700,
        damping: 30
    };

    return (
        <div 
            className="w-14 h-8 flex items-center p-1 cursor-pointer rounded-full
                       transition-colors duration-200 ease-in-out
                       bg-gray-300 data-[ison=true]:bg-custom-mid-dark-blue
                       data-[ison=true]:justify-end data-[ison=false]:justify-start"
            data-ison={active}
            onClick={() => setActive(!active)}
        >
            <motion.div 
                className="w-6 h-6 bg-white rounded-full shadow-md" 
                layout
                transition={spring}
            />
        </div>
    );
};

export default ToggleSwitch;