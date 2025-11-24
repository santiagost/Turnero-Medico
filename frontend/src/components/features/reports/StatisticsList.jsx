import React, { useState, useEffect } from "react";
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

    return (
        <div className='grid grid-cols-4 gap-4 items-center justify-around w-full'>
            <SectionCard complexHeader={
                <div className="flex flex-row items-center justify-center gap-8">
                    <p className='text-custom-dark-blue text-center font-bold text-2xl '>Turnos Totales<br />de Hoy</p>
                    <FaRegClock size={40} className="text-custom-orange"/>
                </div>
            }
                content={<p className='text-6xl text-custom-dark-blue font-bold text-center m-5'>{statistics.totalShifts}</p>} />
            <SectionCard complexHeader={
                <div className="flex flex-row items-center justify-center gap-8">
                    <p className='text-custom-dark-blue text-center font-bold text-2xl '>Pacientes <br />Atendidos</p>
                    <RiMentalHealthFill size={40} className="text-custom-green"/>
                </div>
            }
                content={<p className='text-6xl text-custom-dark-blue font-bold text-center m-5'>{statistics.patientsTreated}</p>} />
            <SectionCard complexHeader={
                <div className="flex flex-row items-center justify-center gap-8">
                    <p className=' text-custom-dark-blue text-center font-bold text-2xl '>Turnos Cancelados <br />de Hoy</p>
                    <TbCalendarCancel size={40} className="text-custom-red" />
                </div>
            }
                content={<p className='text-6xl text-custom-dark-blue font-bold text-center m-5'>{statistics.cancelledShifts}</p>} />
            <SectionCard complexHeader={
                <div className="flex flex-row items-center justify-center gap-8">
                    <p className=' text-custom-dark-blue text-center font-bold text-2xl '>Nuevos Pacientes <br />Registrados</p>
                    <GrUserNew size={40} className="text-custom-blue"/>
                </div>
            }
                content={<p className='text-6xl text-custom-dark-blue font-bold text-center m-5'>{statistics.newPatientsRegistered}</p>} />
        </div>
    );
};
export default StatisticsList;