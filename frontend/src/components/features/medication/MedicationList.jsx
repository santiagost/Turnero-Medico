import React from "react";
import MedicationCard from "./MedicationCard";


const MedicationList = ({ medications, onDelete }) => {
    return (
        <div className="flex flex-row gap-2">
            {medications.map((medication, index) => (
                <div key={index}>
                    <MedicationCard 
                        name={medication.name}
                        onDelete={() => onDelete(index)}
                    />
                </div>
            ))}
        </div>
    );
};

export default MedicationList;