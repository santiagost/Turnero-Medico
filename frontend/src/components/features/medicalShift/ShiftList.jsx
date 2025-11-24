import React from 'react';
import { isBefore, startOfDay, parseISO } from 'date-fns';
import MedicalShiftCard from './MedicalShiftCard';

const ShiftList = ({ shifts, type, onAttend, onCancel }) => {
    const todayStart = startOfDay(new Date());
    const futureShifts = shifts.filter((shift) => {
        const dateString = shift.date || shift.startTime;
        if (!dateString) return false;
        const shiftDate = typeof dateString === 'string'
            ? parseISO(dateString)
            : dateString;
        return !isBefore(shiftDate, todayStart);
    });

    if (futureShifts.length === 0) {
        return <p className="text-custom-gray w-full text-center text-sm py-4">No hay turnos próximos.</p>;
    }

    return (
        <div className="flex flex-row overflow-x-auto py-4 gap-4 custom-scrollbar px-2">
            {futureShifts.map((shift) => (
                <div
                    key={shift.shiftId}
                    className="shrink-0 w-80 md:w-96" 
                >
                    <MedicalShiftCard
                        type={type}
                        medicalShift={shift}
                        onCancel={onCancel}
                        onAttend={onAttend}
                    />
                </div>
            ))}
        </div>
    );
};

export default ShiftList;