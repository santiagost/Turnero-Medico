import React, { useMemo } from "react";
import { startOfWeek, addDays, format, setHours, setMinutes, isSameDay, parseISO, getDay } from 'date-fns';
import { es } from "date-fns/locale";

const DEFAULT_START = 8;
const DEFAULT_END = 20;
const INTERVAL = 30;

const WeekCalendar = ({ currentDate, events = [], userRole, onEventClick, doctorAvailability = [] }) => {

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

    const timeSlots = useMemo(() => {
        let startHour = DEFAULT_START;
        let endHour = DEFAULT_END;

        const slots = [];
        let current = setMinutes(setHours(new Date(), startHour), 0);
        const end = setMinutes(setHours(new Date(), endHour), 0);

        while (current < end) {
            slots.push(format(current, 'HH:mm'));
            current = setMinutes(current, current.getMinutes() + INTERVAL);
        }
        return slots;
    }, []);

    const isWorkingHour = (dayDate, timeStr) => {
        if (!doctorAvailability || doctorAvailability.length === 0) return true;

        const dayIndex = getDay(dayDate);
        const dayConfig = doctorAvailability.find(d => d.dayOfWeek === dayIndex);

        if (!dayConfig) return false;
        return timeStr >= dayConfig.startTime && timeStr < dayConfig.endTime;
    };

    const findEventInSlot = (dayDate, timeStr) => {
        return events.find(event => {
            const eventDate = parseISO(event.startTime || event.date);
            if (!isSameDay(eventDate, dayDate)) return false;
            const slotTime = format(eventDate, 'HH:mm');
            return slotTime === timeStr;
        });
    };

    return (
        <div className="bg-white rounded-xl py-4 w-full m-2 h-full overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-7 gap-2 px-2">
                {weekDays.map((day, index) => (
                    <div key={index} className="flex flex-col gap-2">
                        <div className="text-center mb-2 border-b border-custom-blue/80 pb-2 sticky top-0 bg-white z-10">
                            <p className="font-bold text-custom-dark-blue capitalize text-md">
                                {format(day, "EEEE", { locale: es })}
                            </p>
                            <p className="text-sm text-custom-gray/80">
                                {format(day, "dd/MM")}
                            </p>
                        </div>

                        <div className="flex flex-col gap-2">
                            {timeSlots.map((time, timeIndex) => {
                                const event = findEventInSlot(day, time);
                                const isWork = isWorkingHour(day, time);

                                if (event) {
                                    const labelContent = userRole === 'Admin'
                                        ? (event.resource?.patient ? `${event.resource.patient.firstName} ${event.resource.patient.lastName}` : event.title)
                                        : (event.title || "Consulta");

                                    return (
                                        <button
                                            key={`${index}-${timeIndex}`}
                                            onClick={() => onEventClick(event)}
                                            className="bg-custom-blue text-white rounded-lg p-1 h-14 w-full flex flex-col items-center justify-center text-sm transition-all duration-200 hover:scale-[1.02] cursor-pointer shadow-sm overflow-hidden"
                                            title={`${time} - ${labelContent}`}
                                        >
                                            <span className="text-xs font-bold">{time}</span>
                                            <span className="font-bold text-xs truncate w-full px-1 text-center">{labelContent}</span>
                                        </button>
                                    );
                                }

                                if (isWork) {
                                    return (
                                        <div
                                            key={`${index}-${timeIndex}`}
                                            className="h-14 w-full border border-dashed border-custom-blue/30 bg-custom-light-blue/15 rounded-lg flex items-center justify-center"
                                            title="Disponible"
                                        >
                                            <span className="text-xs text-custom-dark-blue/50">{time}</span>
                                        </div>
                                    );
                                }

                                return (
                                    <div
                                        key={`${index}-${timeIndex}`}
                                        className="h-14 w-full bg-custom-gray/5 rounded-lg border border-transparent flex items-center justify-center"
                                        title="Fuera de horario"
                                    >
                                        <span className="text-custom-gray/20 text-lg select-none">•</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WeekCalendar;