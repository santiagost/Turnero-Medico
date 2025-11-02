import React from "react";

const SectionCard = ({ tittle, complexHeader, content }) => {
    const headerToShow = complexHeader ? complexHeader : tittle;

    return (
        <div className="bg-custom-light-blue/15 rounded-2xl p-2 m-2">
            {headerToShow && (
                <div className="bg-white rounded-2xl w-full p-4 text-custom-dark-blue text-center font-bold text-2xl shadow-md shadow-custom-light-blue">
                    {headerToShow}
                </div>
            )}
            {content}
        </div>
    )
}

export default SectionCard;