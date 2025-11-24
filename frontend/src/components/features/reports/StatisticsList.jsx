import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SectionCard from "../../ui/SectionCard";
import { FaRegClock } from "react-icons/fa";
import { RiMentalHealthFill } from "react-icons/ri";
import { TbCalendarCancel } from "react-icons/tb";
import { GrUserNew } from "react-icons/gr";

const StatisticsList = () => {
    const [statistics, setStatistics] = useState({
        totalShifts: 60,
        patientsTreated: 15,
        cancelledShifts: 7,
        newPatientsRegistered: 5
    });

    const fetchStatistics = () => {
        console.log("Buscando estadísticas actualizadas...");
        // En un futuro, aquí harías tu llamada a la API:
        // try {
        //   const response = await fetch('/api/admin/statistics');
        //   const data = await response.json();
        //   setStatistics(data);
        // } catch (error) {
        //   console.error("Error al cargar estadísticas:", error);
        // }
    };

    useEffect(() => {
        fetchStatistics();
        const intervalId = setInterval(() => {
            fetchStatistics();
        }, 60000);
        return () => {
            clearInterval(intervalId);
        };
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const cardVariants = {
        hidden: {
            opacity: 0,
            y: 20
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 12
            }
        }
    };

    const statsConfig = [
        {
            label: <>Turnos Totales<br />de Hoy</>,
            value: statistics.totalShifts,
            icon: <FaRegClock size={40} className="text-custom-orange" />
        },
        {
            label: <>Pacientes <br />Atendidos</>,
            value: statistics.patientsTreated,
            icon: <RiMentalHealthFill size={40} className="text-custom-green" />
        },
        {
            label: <>Turnos Cancelados <br />de Hoy</>,
            value: statistics.cancelledShifts,
            icon: <TbCalendarCancel size={40} className="text-custom-red" />
        },
        {
            label: <>Nuevos Pacientes <br />Registrados</>,
            value: statistics.newPatientsRegistered,
            icon: <GrUserNew size={40} className="text-custom-blue" />
        }
    ];

    return (
        <motion.div
            className='grid grid-cols-4 gap-4 items-center justify-around w-full'
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {statsConfig.map((stat, index) => (
                <motion.div key={index} variants={cardVariants}>
                    <SectionCard
                        complexHeader={
                            <div className="flex flex-row items-center justify-center gap-8">
                                <p className='text-custom-dark-blue text-center font-bold text-2xl '>
                                    {stat.label}
                                </p>
                                {stat.icon}
                            </div>
                        }
                        content={
                            <p className='text-6xl text-custom-dark-blue font-bold text-center m-5'>
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