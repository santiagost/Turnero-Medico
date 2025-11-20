import React from "react";
import { format, addDays, isSameDay, parseISO, setHours, setMinutes, isBefore } from "date-fns";
import { es } from "date-fns/locale";


const TIME_SLOTS = [
    "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30",
    "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00",
];

const WeeklySlots = ({ selectedWeek, selectedShift, setSelectedShift, existingShifts = [], role = "patient" }) => {

    // Mensaje cuando no hay semana seleccionada
    if (!selectedWeek || !selectedWeek.from) {
        return (
            <div className="
                flex items-center justify-center h-40 text-custom-gray
                bg-custom-gray/5 rounded-xl border border-dashed border-custom-gray/30 p-4">
                <p>Selecciona una semana en el calendario para ver los turnos.</p>
            </div>
        );
    }

    // Arreglo de los 7 dias de la semana, iniciando en Lunes
    const startDayMonday = addDays(selectedWeek.from, 1);
    const weekDays = Array.from({ length: 7 }).map((_, index) =>
        addDays(startDayMonday, index)
    );


    const getSlotInfo = (dayDate, timeString) => {

        const [hours, minutes] = timeString.split(':').map(Number);

        const slotDateTime = setHours(setMinutes(new Date(dayDate), minutes), hours);
        const now = new Date();

        if (isBefore(slotDateTime, now)) {
            return {
                status: "expired",
                label: "No Disponible",
                color: "bg-custom-gray/30 text-custom-gray border-custom-gray/70 cursor-not-allowed"
            };
        }


        // 1. Buscar si hay un turno REAL en esta fecha y hora
        const foundShift = existingShifts.find(shift => {
            const shiftDate = parseISO(shift.startTime);
            const shiftTime = format(shiftDate, "HH:mm");
            return isSameDay(shiftDate, dayDate) && shiftTime === timeString;
        });

        // --- CASO 1: VISTA DOCTOR ---
        if (role === "doctor") {
            // Si no hay turno, celda vacía (Gris muy suave)
            if (!foundShift) {
                return {
                    status: "empty",
                    label: "-",
                    color: "bg-custom-gray/5 border-custom-gray/20 text-custom-gray/30"
                };
            }

            // Si hay turno, definimos color según el status.name
            let colorClass = "bg-custom-blue/20 text-custom-blue border-custom-blue/50"; // Default
            const statusName = foundShift.status.name;

            // ATENDIDO -> Verde
            if (statusName === "Atendido") {
                colorClass = "bg-custom-green/20 text-custom-green border-custom-green/50 font-semibold";
            }
            // CANCELADO -> Rojo
            if (statusName === "Cancelado") {
                colorClass = "bg-custom-red/10 text-custom-red border-custom-red/30 opacity-60";
            }
            // PENDIENTE -> Naranja
            if (statusName === "Pendiente") {
                colorClass = "bg-custom-orange/20 text-custom-orange border-custom-orange/50 font-semibold";
            }

            return {
                status: "occupied_doctor",
                label: statusName,
                color: colorClass,
                data: foundShift
            };
        }

        // --- CASO 2: VISTA PACIENTE ---

        // A. Ocupado (Rojo)
        if (foundShift && foundShift.status.name !== "Cancelado") {
            return {
                status: "occupied",
                label: "Ocupado",
                color: "bg-custom-red/30 text-custom-red border-custom-red/50 cursor-not-allowed opacity-50"
            };
        }

        // B. Seleccionado (Azul sólido)
        if (selectedShift && selectedShift.date &&
            isSameDay(selectedShift.date, dayDate) &&
            selectedShift.time === timeString) {
            return {
                status: "selected",
                label: "Seleccionado",
                color: "bg-custom-blue text-white border-custom-dark-blue ring-2 ring-custom-blue ring-offset-1 shadow-md"
            };
        }

        // C. Disponible (Verde)
        return {
            status: "available",
            label: "Disponible",
            color: "bg-custom-green/15 text-custom-green border-custom-green hover:bg-custom-green/50 cursor-pointer hover:-translate-y-0.5 transition-transform shadow-sm"
        };
    };

    // --- MANEJADOR DE CLICK ---
    const handleSlotClick = (dayDate, timeString, slotInfo) => {
        // Lógica existente para vista doctor
        if (role === "doctor") {
            if (slotInfo.data) {
                console.log("Info del turno:", slotInfo.data);
            }
            return;
        }

        // Si está ocupado o expirado, no hacemos nada
        if (slotInfo.status === "occupied" || slotInfo.status === "expired") return;

        // --- NUEVA LÓGICA: DESELECCIONAR ---
        // Verificamos si ya hay algo seleccionado Y si coincide fecha y hora con el click actual
        if (selectedShift &&
            isSameDay(selectedShift.date, dayDate) &&
            selectedShift.time === timeString
        ) {
            setSelectedShift(null); // <--- Esto quita la selección (vuelve a null)
            return;
        }

        // Si no era el mismo, seleccionamos el nuevo
        setSelectedShift({
            date: dayDate,
            time: timeString,
            displayDate: format(dayDate, "dd/MM/yyyy")
        });
    };

    return (
        <div className="py-4 w-full m-2 h-full overflow-y-scroll custom-scrollbar">
            <div className="grid grid-cols-7 gap-2">

                {weekDays.map((day, index) => {
                    if (index === 7) return null;

                    return (
                        <div key={index} className="flex flex-col gap-2">
                            {/* Cabecera de la tabla */}
                            <div className="text-center mb-2 border-b border-custom-gray/20 pb-2">
                                {/* Dia de la semana */}
                                <p className="font-bold text-custom-dark-blue capitalize">
                                    {format(day, 'EEEE', { locale: es })}
                                </p>
                                {/* Numero de dia y mes */}
                                <p className="text-xs text-custom-gray/80">
                                    {format(day, 'dd/MM')}
                                </p>
                            </div>

                            {/* Lista de Botones de Horarios */}
                            <div className="flex flex-col gap-2">
                                {TIME_SLOTS.map((time, timeIndex) => {
                                    const slotInfo = getSlotInfo(day, time);

                                    if (index === 6) return null;

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