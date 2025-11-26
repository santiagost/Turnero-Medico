import React, { useState, useEffect } from 'react';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import Button from '../../ui/Button';
import IconButton from '../../ui/IconButton'
import { motion } from 'framer-motion';

import { FaSearch } from "react-icons/fa";
import { LiaUndoAltSolid } from "react-icons/lia";

import { getDoctorOptions } from '../../../../services/doctor.service';
import { getSpecialtyOptions } from '../../../../services/specialty.service';

export const initialFiltersState = {
    specialty: "",
    doctor: "",
    attentionDate: "",
    order: "date_desc"
};

const ConsultationFilterPanel = ({ onSearch }) => {
    const [localFilters, setLocalFilters] = useState(initialFiltersState);

    const [specialtyOptionsWithAll, setSpecialtyOptions] = useState([{ value: "", label: "Todas" }]);
    const [doctorOptionsWithAll, setDoctorOptions] = useState([{ value: "", label: "Todos" }]);

    const orderOptions = [
        { value: "date_desc", label: "Más reciente" },
        { value: "date_asc", label: "Más antiguo" },
        { value: "alpha_asc", label: "Orden Alfabético (A-Z)" },
        { value: "alpha_desc", label: "Orden Alfabético (Z-A)" }
    ];

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [specialtyBackend, doctorBackend] = await Promise.all([
                    getSpecialtyOptions(),
                    getDoctorOptions()
                ]);

                setSpecialtyOptions([{ value: "", label: "Todas" }, ...specialtyBackend]);
                setDoctorOptions([{ value: "", label: "Todos" }, ...doctorBackend]);
            } catch (error) {
                console.error("No se pudieron cargar las opciones", error);
            }
        };
        fetchOptions();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearchClick = (e) => {
        e.preventDefault();
        onSearch(localFilters);
    };

    const handleResetClick = () => {
        setLocalFilters(initialFiltersState);
        onSearch(initialFiltersState);
    };

    return (
        <form
            className="grid grid-cols-5 items-start m-2 gap-4 bg-transparent w-full"
            onSubmit={handleSearchClick}
        >
            <Select
                tittle="Por Especialidad"
                name="specialty"
                value={localFilters.specialty}
                onChange={handleChange}
                options={specialtyOptionsWithAll}
                size="small"
            />

            <Select
                tittle="Por Médico"
                name="doctor"
                value={localFilters.doctor}
                onChange={handleChange}
                options={doctorOptionsWithAll}
                size="small"
            />

            <Input
                tittle="Por Fecha"
                type="date"
                name="attentionDate"
                value={localFilters.attentionDate}
                onChange={handleChange}
                size="small"
            />

            <Select
                tittle="Orden"
                name="order"
                value={localFilters.order}
                onChange={handleChange}
                options={orderOptions}
                size="small"
            />

            <div className='flex flex-row items-center justify-center h-full gap-5 text-white'>
                <Button text={"Buscar"} icon={<FaSearch />} variant={"primary"} type={"submit"} size={"big"} />
                <motion.div
                    whileTap={{ scale: 0.9, rotate: -180 }}
                >
                    <IconButton
                        icon={<LiaUndoAltSolid size={30} />}
                        type={"button"}
                        onClick={handleResetClick}
                    />
                </motion.div>
            </div>
        </form>
    );
};

export default ConsultationFilterPanel;