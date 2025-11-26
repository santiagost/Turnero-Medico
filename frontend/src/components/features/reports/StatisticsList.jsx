import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SectionCard from "../../ui/SectionCard";

// Iconos
import { FaRegClock, FaCheckCircle, FaUserTimes, FaHourglassHalf } from "react-icons/fa";
import { RiMentalHealthFill } from "react-icons/ri";
import { TbCalendarCancel } from "react-icons/tb";

import { getDailySummary } from "../../../../services/report.service";

const StatisticsList = () => {
    // Estado inicial con las 6 métricas
    const [statistics, setStatistics] = useState({
        totalShifts: 0,
        attendedPatients: 0,
        attendedShifts: 0,
        canceledShifts: 0,
        pendingShifts: 0,
        missedShifts: 0,
    });

    const fetchStatistics = async () => {
        try {
            const data = await getDailySummary();
            if (data) setStatistics(data);
        } catch (error) {
            console.error("Error fetching statistics");
        }
    };

    useEffect(() => {
        fetchStatistics();
        // Actualización automática cada 60 segundos
        const intervalId = setInterval(fetchStatistics, 60000);
        return () => clearInterval(intervalId);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0, 
            transition: { type: "spring", stiffness: 100, damping: 12 } 
        }
    };

    // Configuración de las 6 Tarjetas
    const statsConfig = [
        {
            label: <>Turnos Totales de Hoy</>,
            value: statistics.totalShifts,
            icon: <FaRegClock size={40} className="text-custom-blue" />, // Azul general
            borderColor: "border-l-4 border-custom-blue"
        },
        {
            label: <>Turnos Atendidos</>,
            value: statistics.attendedShifts,
            icon: <FaCheckCircle size={40} className="text-green-500" />, // Verde éxito
             borderColor: "border-l-4 border-green-500"
        },
        {
            label: <>Pacientes Atendidos</>,
            value: statistics.attendedPatients,
            icon: <RiMentalHealthFill size={40} className="text-teal-500" />, // Teal/Turquesa
             borderColor: "border-l-4 border-teal-500"
        },
        {
            label: <>Turnos Pendientes</>,
            value: statistics.pendingShifts,
            icon: <FaHourglassHalf size={40} className="text-orange-400" />, // Naranja espera
             borderColor: "border-l-4 border-orange-400"
        },
        {
            label: <>Turnos Cancelados</>,
            value: statistics.canceledShifts,
            icon: <TbCalendarCancel size={40} className="text-red-500" />, // Rojo error
             borderColor: "border-l-4 border-red-500"
        },
        {
            label: <>Turnos Ausentes</>,
            value: statistics.missedShifts,
            icon: <FaUserTimes size={40} className="text-gray-500" />, // Gris ausencia
             borderColor: "border-l-4 border-gray-500"
        }
    ];

    return (
        <motion.div
            className='grid grid-cols-3 gap-6 w-full px-4'
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {statsConfig.map((stat, index) => (
                <motion.div key={index} variants={cardVariants} className="w-full">
                    <SectionCard
                        complexHeader={
                            <div className="flex flex-row items-center justify-around gap-4 w-full px-4">
                                <p className='text-custom-dark-blue font-bold text-2xl leading-tight text-left'>
                                    {stat.label}
                                </p>
                                <div className="p-2">
                                    {stat.icon}
                                </div>
                            </div>
                        }
                        content={
                            <p className='text-5xl text-custom-dark-blue font-extrabold text-center my-4'>
                                {stat.value}
                            </p>
                        }
                    />
                </motion.div>
            ))}
        </motion.div>
    );
};

export default StatisticsList;