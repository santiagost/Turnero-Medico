import React, { useEffect } from "react";

const PatientVolume = ({ filters }) => {
    useEffect(() => {
        if (filters.fromDate && filters.toDate) {
            // Llamar al back con las fechas nuevas
            // fetchData(filters.fromDate, filters.toDate);
            return null;
        }
    }, [filters]);

    return (<div>Volumen de pacientes atendidos entre 2 fechas</div>);
};

export default PatientVolume;