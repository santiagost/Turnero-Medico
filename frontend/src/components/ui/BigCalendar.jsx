import React from "react";
import { WEEKDAYS } from "../../utils/constants";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay, parseISO, } from 'date-fns';

const BigCalendar = ({ currentDate, events = [], userRole, onEventClick }) => {
    const monthStart = startOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const monthEnd = endOfMonth(currentDate);
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const daysInGrid = eachDayOfInterval({ start: startDate, end: endDate });
    const today = new Date();

    
    const renderDayCell = (dayStr) => {
        const currentDayObj = parseISO(dayStr);

        const dayEvents = events.filter((event) => {
            // Asumimos que event.date viene como string 'yyyy-MM-dd' del backend
            return isSameDay(parseISO(event.date), currentDayObj);
        });

        const isToday = isSameDay(currentDayObj, today);
        const isCurrentMonth = isSameMonth(currentDayObj, currentDate);

        let cellClasses = "min-h-[120px] border border-custom-light-blue p-2 flex flex-col relative transition-colors ";
        cellClasses += isCurrentMonth ? "bg-white text-custom-dark-blue" : "bg-custom-gray/15 text-custom-dark-blue/80";

        return (
            <div key={dayStr} className={cellClasses}>
                {/* Número del día */}
                <div className="flex justify-between items-start mb-1">
                    <span className={`font-semibold text-lg ${isToday ? 'bg-custom-blue text-white rounded-full w-8 h-8 flex items-center justify-center -mt-1 -ml-1' : ''}`}>
                        {format(currentDayObj, 'd')}
                    </span>
                </div>

                {/* Contenedor de eventos */}
                <div className="flex flex-col gap-1 overflow-y-auto max-h-[90px] pr-1">
                    {dayEvents.map((event) => (
                        <div
                            key={event.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                onEventClick(event);
                            }}
                            className="bg-custom-blue text-white text-xs rounded px-2 py-1 truncate font-medium shadow-sm cursor-pointer"
                        >
                            {userRole === 'Admin' ? (
                                // Vista Admin: Solo la especialidad
                                <span>{event.title}</span>
                            ) : (
                                // Vista Paciente: Hora y especialidad
                                <span>{event.title}</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };


    return (
        <div className="w-full border-t border-b border-custom-mid-light-blue rounded-lg overflow-hidden">
            {/* Cabecera de los días de la semana */}
            <div className="grid grid-cols-7 bg-custom-light-blue/15">
                {WEEKDAYS.map((day) => (
                    <div key={day} className="p-4 text-center font-bold text-custom-mid-dark-blue text-lg border-r border-l  border-custom-mid-light-blue uppercase tracking-wide">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7">
                {daysInGrid.map((day) => {
                    const dayStr = format(day, 'yyyy-MM-dd');
                    return renderDayCell(dayStr)
                })}
            </div>
        </div>
    );
};


export default BigCalendar;