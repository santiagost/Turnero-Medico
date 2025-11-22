import React, { useState } from "react";
import { useAuth } from '../../../hooks/useAuth';
import Select from '../../ui/Select';
import { doctorOptions } from "../../../utils/mockData";

import {
    format,
    addMonths,
    subMonths,
    addWeeks,
    subWeeks,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek
} from "date-fns";
import { es } from "date-fns/locale";

import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const viewOptions = [
    { value: "month", label: "Mensual", },
    { value: "week", label: "Semanal", }
]

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const ScheduleHeader = ({ selectedDoctor, selectedView, onFilterChange, currentDate, onDateChange }) => {
    const { user } = useAuth();

    const [filteredDoctorOptions, setFilteredDoctorOptions] = useState(doctorOptions);

    const handleChange = (e) => {
        const { name, value } = e.target;
        onFilterChange(name, value);
    };

    const handlePreMonth = () => {
        if (selectedView === 'week') {
            onDateChange(subWeeks(currentDate, 1));
        } else {
            onDateChange(subMonths(currentDate, 1));
        }
    };

    const handlePosMonth = () => {
        if (selectedView === 'week') {
            onDateChange(addWeeks(currentDate, 1));
        } else {
            onDateChange(addMonths(currentDate, 1));
        }
    };

    const startDate = selectedView === 'month'
        ? startOfMonth(currentDate)
        : startOfWeek(currentDate, { weekStartsOn: 1 });

    const endDate = selectedView === 'month'
        ? endOfMonth(currentDate)
        : endOfWeek(currentDate, { weekStartsOn: 1 });

    const dateData = {
        day: format(currentDate, "d"),
        month: capitalize(format(currentDate, "MMMM", { locale: es })),
        monthAlias: capitalize(format(currentDate, "MMM", { locale: es })).replace('.', ''),
        year: format(currentDate, "yyyy"),
        from: format(startDate, "MMM d, yyyy", { locale: es }),
        to: format(endDate, "MMM d, yyyy", { locale: es })
    };

    return (
        <div className="flex flex-row items-center justify-between">
            <div className="flex flex-row items-center">
                <div className="flex flex-col items-center justify-center border rounded-2xl border-custom-blue">
                    <p className="text-custom-blue bg-custom-light-blue/25 font-bold px-5 text-2xl border-b border-custom-blue">{dateData.monthAlias}</p>
                    <p className="text-custom-dark-blue bg-white font-black text-3xl pb-2">{dateData.day}</p>
                </div>
                <div className="flex flex-col mx-6 items-start justify-center">
                    <span className="text-custom-dark-blue font-black text-3xl">{dateData.month} {dateData.year}</span>
                    <span className="text-custom-dark-blue text-md">{dateData.from} - {dateData.to}</span>
                </div>
                <div className="flex flex-row gap-2 text-custom-dark-blue">
                    <button
                        className="cursor-pointer hover:scale-120 transition-all ease-in-out duration-200" title="Anterior"
                        onClick={handlePreMonth}
                    >
                        <IoIosArrowBack size={25} />
                    </button>
                    <button
                        className="cursor-pointer hover:scale-120 transition-all ease-in-out duration-200" title="Siguiente"
                        onClick={handlePosMonth}
                    >
                        <IoIosArrowForward size={25} />
                    </button>
                </div>
            </div>
            <div className="flex flex-row gap-4">
                {user.role === "Admin" && (
                    <>
                        <div className="w-full">
                            <Select
                                tittle="Médico"
                                name="doctor"
                                value={selectedDoctor}
                                onChange={handleChange}
                                options={filteredDoctorOptions}
                                size={"small"}
                            />
                        </div>
                    </>
                )}
                <div className="w-full">
                    <Select
                        tittle="Vista"
                        name="view"
                        value={selectedView}
                        onChange={handleChange}
                        options={viewOptions}
                        size={"small"}
                    />
                </div>
            </div>
        </div>
    );
};

export default ScheduleHeader;