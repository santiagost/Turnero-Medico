import React from 'react';
import MedicalShiftCard from './MedicalShiftCard';

const ShiftList = ({ shifts, type, onAttend, onCancel }) => {
    return (
        <div className="flex overflow-x-scroll py-4 gap-4 custom-scrollbar ">
            {shifts.map((shift) => (
                <div key={shift.id} className="min-w-[20vw] w-full max-h-[20vh] overflow-y-hidden">
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