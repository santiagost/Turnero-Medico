import React, { useEffect } from "react";

const ShiftForDoctor = ({ filters }) => {
    useEffect(() => {
        if (filters.fromDate && filters.toDate) {
            // Llamar al back con las fechas nuevas
            // fetchData(filters.fromDate, filters.toDate);
            return null;
        }
    }, [filters]);


    return (<div>listado de turno por medico en entre 2 fechas</div>);
};

export default ShiftForDoctor;