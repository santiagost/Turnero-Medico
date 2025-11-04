import React from "react";
import { IoClose } from "react-icons/io5";
import StatusBadge from "../../ui/StatusBadge";
import Button from "../../ui/Button"

import { estimateDate, getFormattedDate, getFormattedTime } from "../../../utils/utilities";

const MedicalShiftCard = ({ type, medicalShift, onCancel, onAttend }) => {
    const { 
        shiftId, 
        doctor, 
        patient, 
        reason, 
        startTime, // 'date' y 'time' ahora vienen de 'startTime'
        status     // 'status' es un objeto, no un string
    } = medicalShift;

    const displayDate = getFormattedDate(startTime);
    const displayTime = getFormattedTime(startTime);

    if (type === "Doctor") {
        return (
            <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-4 flex flex-col gap-3 h-full">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-custom-dark-blue">{patient.lastName}, {patient.firstName}</h3>
                    <button onClick={() => onCancel(shiftId)} className="text-gray-400 hover:text-custom-dark-blue">
                        <IoClose size={24} />
                    </button>
                </div>

                <p className="text-gray-600 text-sm w-3/4 wrap-break-word line-clamp-2 h-full">
                    {reason}
                </p>

                <div className="flex flex-row items-center justify-between gap-3">
                    <div className="flex flex-row items-center gap-1">
                        {status.name === "Pendiente" && <Button text={"Atender"} size={"small"} onClick={() => onAttend(shiftId)} />}
                        <StatusBadge status={status.name} />
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-bold text-custom-dark-blue">{estimateDate(displayDate)}</p>
                        <p className="text-lg font-bold text-custom-dark-blue">{displayTime}</p>
                    </div>
                </div>
            </div>
        );
    }

    // --- Versión para PACIENTE (Imagen 1) ---
    return (
        <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-4 flex flex-col gap-3 h-full">
            {/* Fila 1: Especialidad + Botón de Cancelar */}
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    {/* 3. Usa los datos desestructurados */}
                    <h3 className="text-xl font-bold text-custom-dark-blue">{doctor.specialty.name}</h3>
                    <p className="text-sm text-gray-500">Dr/a. {doctor.firstName} {doctor.lastName}</p>
                </div>
                <button onClick={() => onCancel(shiftId)} className="text-gray-400 hover:text-custom-dark-blue">
                    <IoClose size={24} />
                </button>
            </div>

            {/* Fila 2: Estado + Hora */}
            <div className="flex justify-between items-end">
                <StatusBadge status={status.name} />
                <div className="text-right">
                    <p className="text-lg font-bold text-custom-dark-blue">{estimateDate(displayDate)}</p>
                    <p className="text-lg font-bold text-custom-dark-blue">{displayTime}</p>
                </div>
            </div>
        </div>
    );
};

export default MedicalShiftCard;