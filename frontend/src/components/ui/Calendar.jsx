import React, { useState } from "react";
import { endOfWeek, startOfWeek } from "date-fns";
import { DayPicker, isDateInRange, getDefaultClassNames } from "react-day-picker";
import { es } from "react-day-picker/locale"


import "react-day-picker/style.css";

const Calendar = ({ selectedWeek, setSelectedWeek}) => {
    const defaultClassNames = getDefaultClassNames();

    return (
        <DayPicker
            locale={es}
            classNames={{
                root: `${defaultClassNames.root} p-5 bg-custom-light-blue/20 rounded-xl inline-block w-fit`,
                day: `${defaultClassNames.day} rounded-full w-10 h-10 hover:bg-custom-light-blue/30`,

                selected: "bg-custom-light-blue text-custom-dark-blue border-none hover:bg-custom-dark-blue/50 hover:text-white",
                range_middle: " border-custom-blue rounded-full",

                range_start: "!bg-custom-blue/80 rounded-full",
                range_end: "!bg-custom-blue/80 rounded-full",

                today: "text-custom-dark-blue bg-custom-dark-blue/10",
                outside: "text-custom-gray/80",

                caption_label: "text-lg font-bold text-custom-dark-blue capitalize",
                chevron: "!fill-custom-dark-blue",
                
                caption: `${defaultClassNames.caption} w-full flex justify-between items-center`,
                nav: `${defaultClassNames.nav} !text-custom-red`,
            }}

            showOutsideDays
            weekStartsOn={0}
            modifiers={{
                selected: selectedWeek,
                range_start: selectedWeek?.from,
                range_end: selectedWeek?.to,
                range_middle: (date) =>
                    selectedWeek
                        ? isDateInRange(date, selectedWeek, { excludeEnds: true })
                        : false,
            }}
            onDayClick={(day, modifiers) => {
                // Si el día ya está seleccionado, limpiamos la selección
                if (modifiers.selected) {
                    setSelectedWeek(undefined);
                    return;
                }

                // Establecemos el rango desde el inicio hasta el fin de esa semana
                setSelectedWeek({
                    from: startOfWeek(day),
                    to: endOfWeek(day),
                });
            }}
            footer={
                selectedWeek?.from && selectedWeek?.to &&
                <p className="my-2 text-custom-dark-blue">{`Semana del ${selectedWeek.from.toLocaleDateString()} al ${selectedWeek.to.toLocaleDateString()}`}</p>
            }
        />
    );
}

export default Calendar;