import React, { useState, useEffect } from "react";
import { addDays, startOfWeek, format } from "date-fns";

import { useAuth } from "../../../hooks/useAuth";

import Calendar from "../../ui/Calendar";
import WeeklySlots from "./WeeklySlots";
import RightSidebar from "../../ui/RightSidebar";
import StatusBadge from "../../ui/StatusBadge";
import Button from "../../ui/Button";

import { getFormattedDate, getFormattedTime } from "../../../utils/dateUtils";

import { mockDoctorAvailability, getMockDoctorSchedule } from "../../../utils/mockData";

import { useNavigate } from "react-router-dom";

const DoctorShifts = () => {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [doctorScheduleConfig, setDoctorScheduleConfig] = useState([]);

    // Inicializamos la semana seleccionada con la FECHA ACTUAL
    const [selectedWeek, setSelectedWeek] = useState({
        from: startOfWeek(new Date(), { weekStartsOn: 0 }),
        to: addDays(startOfWeek(new Date(), { weekStartsOn: 0 }), 6),
    });

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedSlotData, setSelectedSlotData] = useState(null);
    const [selectedShift, setSelectedShift] = useState(null);
    const [currentWeekShifts, setCurrentWeekShifts] = useState([]);

    useEffect(() => {
        if (user) {
            // TODO: Aquí harías un fetch al backend: api.get(`/doctors/${user.id}/availability`)
            setDoctorScheduleConfig(mockDoctorAvailability);
        }
    }, [user]);

    useEffect(() => {
        if (user && selectedWeek?.from) {
            const mondayDate = addDays(new Date(selectedWeek.from), 1);
            const shifts = getMockDoctorSchedule(mondayDate);
            setCurrentWeekShifts(shifts);
        }
    }, [user, selectedWeek]);

    // Este método se pasa al hijo (WeeklySlots)
    const handleSlotClickFromChild = (slotInfo) => {
        console.log("Click recibido en el padre:", slotInfo);
        setSelectedSlotData(slotInfo);
        setIsSidebarOpen(true);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
        setSelectedSlotData(null);
    };

    const handleGoToShiftAttention = () => {
        console.log("Redirigiendo a atender turno:", selectedSlotData.data.shiftId);
        navigate(`/doctor/home/${selectedSlotData.data.shiftId}`)
    };
    
    const handleGoToPatientHistory = () => {
        console.log("Redirigiendo a consulta del turno del paciente:", selectedSlotData.data.shiftId);        
        navigate(`/doctor/patients/${selectedSlotData.data.patient.patientId}`)
    };

    return (
        <div>

            <div className="my-4 mx-2 h-full">
                <div className="grid grid-cols-1 lg:grid-cols-4 m-4 gap-6">
                    <div className="mb-4 text-start flex flex-col">
                        <div className="col-span-1 flex flex-col gap-4 pt-2">
                            <p className="text-sm mt-2 font-semibold text-custom-dark-blue">
                                Por favor, seleccione una semana para ver los turnos
                            </p>
                            <Calendar
                                selectedWeek={selectedWeek}
                                setSelectedWeek={setSelectedWeek}
                            />
                        </div>
                    </div>

                    <div className="bg-white col-span-3 items-center justify-center flex rounded-xl">
                        <WeeklySlots
                            selectedWeek={selectedWeek}
                            selectedShift={selectedShift}
                            setSelectedShift={setSelectedShift}
                            existingShifts={currentWeekShifts}
                            doctorAvailability={doctorScheduleConfig}
                            role="doctor"
                            onSlotClick={handleSlotClickFromChild}
                        />
                    </div>
                </div>
            </div>

            <RightSidebar
                isOpen={isSidebarOpen}
                onClose={closeSidebar}
                title="Detalle de Turno"
            >
                {selectedSlotData && selectedSlotData.data ? (
                    <div className="flex flex-col gap-6">

                        {/* SECCIÓN 1: DATOS DEL PACIENTE */}
                        <div className="flex flex-col gap-1">
                            <h3 className="text-lg font-bold text-custom-dark-blue">Datos del Paciente</h3>
                            <div className="text-custom-dark-blue">
                                <span className="font-medium">Nombre: </span>
                                {selectedSlotData.data.patient.firstName}, {selectedSlotData.data.patient.lastName}
                            </div>
                        </div>

                        {/* SECCIÓN 2: MOTIVO */}
                        <div className="flex flex-col gap-1">
                            <h3 className="text-lg font-bold text-custom-dark-blue">Motivo de Consulta</h3>
                            <div className="text-custom-dark-blue">
                                <span className="font-medium text-custom-dark-blue">Motivo: </span>
                                {selectedSlotData.data.reason}
                            </div>
                        </div>

                        <div className="flex flex-col items-center">
                            <hr className='border text-custom-gray/25 w-[90%]' />
                        </div>

                        {/* SECCIÓN 3: DETALLES */}
                        <div className="flex flex-col gap-2">
                            <h3 className="text-lg font-bold text-custom-dark-blue mb-1">Detalles del Turno</h3>

                            <div className="flex flex-col gap-y-1 text-md mx-4">
                                <div className="flex flex-row gap-2 items-start text-custom-dark-blue">
                                    <li className="font-bold">Fecha: </li>
                                    <span className="font-regular">{getFormattedDate(selectedSlotData.data.startTime)}</span>
                                </div>
                                <div className="flex flex-row gap-2 items-start text-custom-dark-blue">
                                    <li className="font-bold">Especialidad: </li>
                                    <span className="font-regular">{profile?.specialty?.name || "General"}</span>
                                </div>
                                <div className="flex flex-row gap-2 items-start text-custom-dark-blue">
                                    <li className="font-bold">Médico: </li>
                                    <span className="font-regular">Dr. {user?.firstName} {user?.lastName}</span>
                                </div>
                                <div className="flex flex-row gap-2 items-start text-custom-dark-blue">
                                    <li className="font-bold">Hora: </li>
                                    <span className="font-regular">{getFormattedTime(selectedSlotData.data.startTime)}</span>
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN 4: ESTADO */}
                        <div className="flex flex-col gap-2">
                            <h3 className="text-lg font-bold text-custom-dark-blue">Estado del Turno</h3>
                            <div className="flex flex-row justify-between items-center">
                                <StatusBadge status={selectedSlotData.label} />
                            </div>
                        </div>

                        {/* SECCIÓN 5: ACCIONES */}
                        {selectedSlotData.label !== "Cancelado" && (
                            <>
                                <div className="flex flex-col items-center">
                                    <hr className='border text-custom-gray/25 w-[90%]' />
                                </div>
                                <div className="flex flex-col items-center text-center gap-4">
                                    <h3 className="text-xl font-bold text-custom-dark-blue">Consulta Asociada</h3>

                                    <p className="text-md text-custom-gray">
                                        {selectedSlotData.label === "Atendido"
                                            ? "La consulta ya fue realizada. Haz clic para ver el diagnóstico y las recetas en su Historial."
                                            : "Inicia la consulta para registrar diagnósticos y recetas."}
                                    </p>

                                    {selectedSlotData.label === "Atendido" ? (
                                        <Button
                                            text={"Ver Detalle de Consulta"}
                                            variant="primary"
                                            onClick={handleGoToPatientHistory}
                                        />
                                    ) : (
                                        <Button
                                            text={"Atender Paciente"}
                                            variant="primary"
                                            onClick={handleGoToShiftAttention}
                                        />
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-custom-gray">
                        <p>Cargando información...</p>
                    </div>
                )}
            </RightSidebar>
        </div>
    );
};

export default DoctorShifts;