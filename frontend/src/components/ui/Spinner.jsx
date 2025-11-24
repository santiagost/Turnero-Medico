import React from "react";
import { motion } from "framer-motion";

const Spinner = () => (
    <motion.div
        className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
        animate={{ rotate: [0, 360] }}
        transition={{
            duration: 1,
            ease: "linear",
            repeat: Infinity,
        }}
    />
);

export default Spinner;