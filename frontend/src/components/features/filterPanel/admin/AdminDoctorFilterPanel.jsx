import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSearch } from "react-icons/fa";
import { LiaUndoAltSolid, LiaPencilAltSolid, LiaTrashAltSolid } from "react-icons/lia";
import { useNavigate, useLocation } from 'react-router-dom';

import Input from '../../../ui/Input';
import Select from '../../../ui/Select';
import Button from '../../../ui/Button';
import IconButton from '../../../ui/IconButton';

import { mockDoctors, specialtyOptions } from '../../../../utils/mockData';

export const initialFiltersState = {
    matricula: "",
    name: "",
    specialty: "",
    order: "alpha_asc"
};

const AdminDoctorFilterPanel = ({ doctorToDelete, doctorToEdit, viewMode = "detail" }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    const [localFilters, setLocalFilters] = useState(initialFiltersState);
    const [searchResults, setSearchResults] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);


    const orderOptions = [
        { value: "alpha_asc", label: "Orden Alfabético (A-Z)" },
        { value: "alpha_desc", label: "Orden Alfabético (Z-A)" }
    ];

    const specialtyOptionsWithAll = [
        { value: "", label: "Todas" },
        ...specialtyOptions
    ];


    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearchClick = (e) => {
        e.preventDefault();
        
        let foundDoctors = [...mockDoctors];

        // 1. Filtro por Matrícula
        if (localFilters.matricula) {
            foundDoctors = foundDoctors.filter(d => 
                d.licenseNumber.toLowerCase().includes(localFilters.matricula.toLowerCase())
            );
        }
        // 2. Filtro por Nombre
        if (localFilters.name) {
            const searchText = localFilters.name.toLowerCase();
            foundDoctors = foundDoctors.filter(d =>
                `${d.firstName} ${d.lastName}`.toLowerCase().includes(searchText)
            );
        }
        // 3. Filtro por Especialidad
        if (localFilters.specialty) {
            foundDoctors = foundDoctors.filter(d => 
                d.specialty.specialtyId === parseInt(localFilters.specialty)
            );
        }

        // 4. Orden
        foundDoctors.sort((a, b) =>
            localFilters.order === 'alpha_asc'
                ? a.lastName.localeCompare(b.lastName)
                : b.lastName.localeCompare(a.lastName)
        );

        setSearchResults(foundDoctors);
        setHasSearched(true);
    };

    const handleResetClick = () => {
        setLocalFilters(initialFiltersState);
        setSearchResults([]);
        setHasSearched(false);
    };

    const handleViewDetails = (doctorId) => {
        console.log(`Redirigiendo a detalles del doctor ID: ${doctorId}`);
        navigate(`/admin/doctors/${doctorId}`);
    };


    return (
        <div className="w-full p-4">
            <form
                className="grid grid-cols-5 items-start gap-4 bg-transparent w-full"
                onSubmit={handleSearchClick}
            >
                <Input
                    tittle="Matrícula"
                    name="matricula"
                    type="text"
                    value={localFilters.matricula}
                    onChange={handleChange}
                    size="small"
                />
                <Input
                    tittle="Nombre y Apellido"
                    name="name"
                    type="text"
                    value={localFilters.name}
                    onChange={handleChange}
                    size="small"
                />
                <Select
                    tittle="Especialidad"
                    name="specialty"
                    value={localFilters.specialty}
                    onChange={handleChange}
                    options={specialtyOptionsWithAll}
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
                    <motion.div whileTap={{ scale: 0.9, rotate: -180 }}>
                        <IconButton
                            icon={<LiaUndoAltSolid size={30} />}
                            type={"button"}
                            onClick={handleResetClick}
                        />
                    </motion.div>
                </div>
            </form>

            {/* --- RESULTADOS --- */}
            <div className="mt-6 overflow-y-scroll custom-scrollbar max-h-[60vh]">
                {hasSearched && searchResults.length === 0 ? (
                    <p className="text-center text-custom-gray p-4">
                        No se encontraron médicos con esos criterios.
                    </p>
                ) : searchResults.length > 0 ? (
                    <div className="flex flex-col gap-3 p-4">
                        <p className="text-sm text-custom-gray">
                            {searchResults.length} médico(s) encontrado(s).
                        </p>
                        {searchResults.map(doc => (
                            <motion.div
                                key={doc.doctorId}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="
                                    flex justify-between items-center p-3 px-6
                                    bg-custom-mid-light-blue/30 rounded-lg shadow-sm 
                                    text-custom-dark-blue
                                "
                            >
                                {/* Info del Médico */}
                                <div className="flex items-center gap-6">
                                    <span className="font-semibold w-24">{doc.licenseNumber}</span>
                                    <span className="font-bold text-lg w-48 truncate">Dr/a. {doc.lastName}, {doc.firstName}</span>
                                    <span className="text-sm w-36">{doc.telephone}</span>
                                    <span className="text-sm w-48 truncate">{doc.user.email}</span>
                                    <span className="text-sm w-36 truncate font-medium">{doc.specialty.name}</span>
                                </div>
                                
                                {viewMode === 'admin' ? (
                                    // VISTA 1: Página de Doctores (Editar/Eliminar)
                                    <div className="flex items-center gap-3">
                                        <IconButton
                                            icon={<LiaPencilAltSolid size={24} />}
                                            onClick={() => doctorToEdit(doc.doctorId)}
                                        />
                                        <IconButton
                                            icon={<LiaTrashAltSolid size={24} />}
                                            onClick={() => doctorToDelete(doc.doctorId)}
                                        />
                                    </div>
                                ) : (
                                    // VISTA 2: Dashboard/Home (Más Detalle)
                                    <Button
                                        text="Más Detalle"
                                        variant="primary"
                                        size="small"
                                        onClick={() => handleViewDetails(doc.doctorId)}
                                    />
                                )}
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-custom-gray p-4">
                        Busca un médico para ver sus detalles y agenda.
                    </p>
                )}
            </div>
        </div>
    );
};

export default AdminDoctorFilterPanel;