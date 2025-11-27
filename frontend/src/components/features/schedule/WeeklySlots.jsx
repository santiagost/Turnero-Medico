import React, { useMemo, useState } from "react";
import { format, addDays, isSameDay, parseISO, setHours, setMinutes, isBefore, getDay } from "date-fns";
import { es } from "date-fns/locale";

import { generateMasterGrid } from "../../../utils/dateUtils";


const WeeklySlots = ({ selectedWeek, selectedShift, setSelectedShift, existingShifts = [], doctorAvailability = [], role = "patient", onSlotClick }) => {

    // 1. Validaciones Tempranas
    if (!selectedWeek || !selectedWeek.from) {
        return (
            <div className="flex items-center justify-center h-40 text-custom-gray bg-custom-gray/5 rounded-xl border border-dashed border-custom-gray/30 p-4">
                <p>Selecciona una semana en el calendario para ver los turnos.</p>
            </div>
        );
    }

    // 2. Configuracion de dias de la semana
    const startDayMonday = addDays(selectedWeek.from, 1);

    const weekDays = Array.from({ length: 7 }).map((_, index) =>
        addDays(startDayMonday, index)
    );

    // Generamos la grilla una sola vez cuando cambia la disponibilidad
    const masterSlots = useMemo(
        () => generateMasterGrid(doctorAvailability),
        [doctorAvailability]
    );

    // 3. Lógica Auxiliar (Helpers)
    // Verifica si un horario específico está dentro del rango de trabajo de un día
    const isWorkingHour = (dayConfig, time) => {
        if (!dayConfig) return false;
        return time >= dayConfig.startTime && time < dayConfig.endTime;
    };

    // Determina el estado, color y etiqueta de un slot
    const getSlotInfo = (dayDate, timeString) => {
        const [hours, minutes] = timeString.split(":").map(Number);
        const slotDateTime = setHours(setMinutes(new Date(dayDate), minutes), hours);
        const now = new Date();


        // A. Slot Expirado (Pasado)
        const isExpired = isBefore(slotDateTime, now);

        // B. Buscar Turno Existente en Backend
        const foundShift = existingShifts.find((shift) => {
            const shiftDate = parseISO(shift.startTime);
            const shiftTime = format(shiftDate, "HH:mm");
            return isSameDay(shiftDate, dayDate) && shiftTime === timeString;
        });

        // --- VISTA DOCTOR (Prioridad Alta) ---
        if (role === "doctor") {

            // CASO 1: Existe un turno (sea pasado o futuro) -> Mostrar estado real
            if (foundShift) {
                let colorClass = "bg-custom-blue/20 text-custom-blue border-custom-blue/50";
                const statusName = foundShift.status.name;

                if (statusName === "Atendido") {
                    colorClass = "bg-custom-green/20 text-custom-green border-custom-green/50 font-semibold";
                } else if (statusName === "Cancelado") {
                    colorClass = "bg-custom-red/10 text-custom-red border-custom-red/30 opacity-60";
                } else if (statusName === "Pendiente") {
                    colorClass = "bg-custom-orange/20 text-custom-orange border-custom-orange/50 font-semibold";
                }

                return {
                    status: "occupied_doctor",
                    label: statusName,
                    color: colorClass,
                    data: foundShift,
                };
            }

            // CASO 2: No hay turno Y es pasado -> Slot vacío del pasado (Gris claro/deshabilitado)
            if (isExpired) {
                return {
                    status: "empty_past",
                    label: "Expirado",
                    color: "bg-gray-100 border-transparent text-gray-400 cursor-default" // Estilo muy sutil para el pasado vacío
                };
            }

            // CASO 3: No hay turno Y es futuro -> Slot vacío disponible para asignar (si hubiera funcionalidad)
            return {
                status: "empty",
                label: "Libre", // O "Libre"
                color: "bg-white border-gray-200 text-gray-500 transition-colors"
            };
        }

        // --- VISTA PACIENTE (Lógica original) ---

        // B. Slot Expirado (Solo afecta al paciente si NO hay turno que él deba ver)
        if (isExpired) {
            return {
                status: "expired",
                label: "Expirado",
                color: "bg-custom-gray/30 text-custom-gray border-custom-gray/70 cursor-not-allowed",
            };
        }

        // 2. Slot con Turno Existente:
        if (foundShift) {
            const statusName = foundShift.status.name;

            if (statusName === "Cancelado" || statusName === "Ausente") {
            } else {
                return {
                    status: "occupied",
                    label: "Ocupado",
                    color: "bg-custom-red/30 text-custom-red border-custom-red/50 cursor-not-allowed opacity-80",
                };
            }
        }

        if (
            selectedShift &&
            selectedShift.date &&
            isSameDay(selectedShift.date, dayDate) &&
            selectedShift.time === timeString
        ) {
            return {
                status: "selected",
                label: "Seleccionado",
                color: "bg-custom-blue text-white border-custom-dark-blue ring-2 ring-custom-blue ring-offset-1 shadow-md",
            };
        }

        // 4. Slot Disponible (Libre para reservar)
        return {
            status: "available",
            label: "Disponible",
            color: "bg-custom-green/15 text-custom-green border-custom-green hover:bg-custom-green/50 cursor-pointer hover:-translate-y-0.5 transition-transform shadow-sm",
        };
    };


    // 4. Handlers
    const handleSlotClick = (dayDate, timeString, slotInfo) => {
        if (role === "doctor") {
            if (slotInfo.status === "empty" || slotInfo.status === "empty_past") return;
            if (onSlotClick) {
                onSlotClick(slotInfo);
            }
            return;
        }

        if (slotInfo.status === "occupied" || slotInfo.status === "expired") return;

        // Lógica de deselección si clickea el mismo
        if (selectedShift && isSameDay(selectedShift.date, dayDate) && selectedShift.time === timeString) {
            setSelectedShift(null);
            return;
        }

        // Nueva selección
        setSelectedShift({ date: dayDate, time: timeString, displayDate: format(dayDate, "dd/MM/yyyy"), });
    };

    // 5. Render
    return (
        <div className={`py-4 w-full m-2 h-full ${role === "patient" && "overflow-y-scroll custom-scrollbar"}`}>
            <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, index) => {
                    if (index === 7) return null;

                    const dayOfWeekIndex = getDay(day);
                    const dayConfig = doctorAvailability.find(
                        (config) => config.dayOfWeek === dayOfWeekIndex
                    );

                    return (
                        <div key={index} className="flex flex-col gap-2">
                            {/* Cabecera de Columna (Día) */}
                            <div className="text-center mb-2 border-b border-custom-gray/20 pb-2">
                                <p className="font-bold text-custom-dark-blue capitalize">
                                    {format(day, "EEEE", { locale: es })}
                                </p>
                                <p className="text-xs text-custom-gray/80">
                                    {format(day, "dd/MM")}
                                </p>
                            </div>

                            {/* Lista de Horarios (Usando Master Grid para alineación) */}
                            <div className="flex flex-col gap-2">
                                {masterSlots.map((time, timeIndex) => {
                                    // A. ¿El médico trabaja HOY a ESTA hora?
                                    const worksAtThisTime = isWorkingHour(dayConfig, time);

                                    if (worksAtThisTime) {
                                        // Renderizar Botón
                                        const slotInfo = getSlotInfo(day, time);

                                        return (
                                            <button
                                                key={`${index}-${timeIndex}`}
                                                onClick={() => handleSlotClick(day, time, slotInfo)}
                                                disabled={(role === "patient" && slotInfo.status === "occupied") || slotInfo.status === "expired"}
                                                type="button"
                                                className={`
                                                    ${slotInfo.color}
                                                    border rounded-lg p-1 h-14 w-full
                                                    flex flex-col items-center justify-center
                                                    text-sm transition-all duration-200
                                                    focus:outline-none
                                                    `}
                                            >
                                                <span className="text-[10px] font-medium opacity-80 mb-0.5">
                                                    {time} hs
                                                </span>
                                                <span className="font-bold text-xs truncate w-full px-1 text-center">
                                                    {slotInfo.label}
                                                </span>
                                            </button>
                                        );
                                    } else {
                                        // B. Renderizar Espacio Vacío
                                        return (
                                            <div
                                                key={`${index}-${timeIndex}`}
                                                className="h-14 w-full"
                                            />
                                        );
                                    }
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WeeklySlots;