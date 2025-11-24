import React, { useEffect } from "react";

const AttendanceAndAbsence = ({ filters }) => {
    useEffect(() => {
        if (filters.fromDate && filters.toDate) {
            // Llamar al back con las fechas nuevas
            // fetchData(filters.fromDate, filters.toDate);
            return null;
        }
    }, [filters]);

    return (<div>Grafico comparativo de asistencias e inasistencias</div>);
};

export default AttendanceAndAbsence;