import React from 'react';

const PrincipalCard = ({ title, content }) => {
    return (
        <div className="bg-white rounded-lg p-3 2xl:p-5 shadow-xl">
            <div className='flex flex-col items-center justify-center p-2 2xl:p-5 mb-2 2xl:mb-5 rounded-xl'>
                <h2 className="text-custom-dark-blue font-extrabold text-3xl 2xl:text-4xl">{title}</h2>
            </div>
            <hr className='border text-custom-mid-light-blue' />

            <div className='m-5'>
                {content}
            </div>
        </div>
    );
};

export default PrincipalCard;
