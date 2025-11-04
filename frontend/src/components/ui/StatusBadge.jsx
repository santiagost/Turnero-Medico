import React from "react";

const StatusBadge = ({ status }) => {
    let colors = "";
    switch (status) {
        case "Atendido":
            colors = "bg-custom-green/20 text-custom-green";
            break;
        case "Cancelado":
            colors = "bg-custom-red/20 text-custom-red";
            break;
        case "Pendiente":
        default:
            colors = "bg-custom-orange/20 text-custom-orange";
            break;
    }

    return (
        <div className={`px-3 py-1 font-medium rounded-lg text-sm ${colors}`}>
            {status}
        </div>
    );
};

export default StatusBadge;