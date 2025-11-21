import React from "react";

const SectionCard = ({ tittle, complexHeader, content }) => {
    return (
        <div className="bg-custom-light-blue/15 rounded-2xl p-2 m-2">

            {/* 1. ¿Hay complexHeader? Muestra eso (Prioridad) */}
            {complexHeader ? (
                <div className="bg-white rounded-2xl w-full p-4 text-custom-dark-blue shadow-md shadow-custom-light-blue">
                    {complexHeader}
                </div>

                // 2. Si no, ¿Hay tittle? Muestra el título
            ) : tittle ? (
                <div className="bg-white rounded-2xl w-full p-4 text-custom-dark-blue text-center font-bold text-2xl shadow-md shadow-custom-light-blue">
                    {tittle}
                </div>

                // 3. Si no hay ninguno, renderiza null (no muestra nada)
            ) : null}

            {content}
        </div>
    )
}

export default SectionCard;