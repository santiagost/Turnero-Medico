import React, { useEffect } from "react";

const ShiftForSpecialty = ({ filters }) => {
    useEffect(() => {
        if (filters.fromDate && filters.toDate) {
            // Llamar al back con las fechas nuevas
            // fetchData(filters.fromDate, filters.toDate);
            return null;
        }
    }, [filters]);

    return (<div>grafico de barras de cantidad de turnos por especialidad</div>);
};

export default ShiftForSpecialty;