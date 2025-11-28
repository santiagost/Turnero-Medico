import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch } from "react-icons/fa";
import { LiaUndoAltSolid, LiaPencilAltSolid, LiaTrashAltSolid } from "react-icons/lia";
import { useNavigate, useLocation } from 'react-router-dom';
import Spinner from '../../../ui/Spinner';
import Input from '../../../ui/Input';
import Select from '../../../ui/Select';
import Button from '../../../ui/Button';
import IconButton from '../../../ui/IconButton';
import { useToast } from '../../../../hooks/useToast';

import { getSpecialtyOptions } from '../../../../../services/specialty.service'
import { getAllDoctorsWithFilters } from '../../../../../services/doctor.service';

export const initialFiltersState = {
    licenseNumber: "",
    name: "",
    specialty: "",
    order: "alpha_asc"
};

const AdminDoctorFilterPanel = ({ doctorToDelete, doctorToEdit, viewMode = "detail", refreshTrigger}) => {
    const navigate = useNavigate();
    const toast = useToast();
    const [localFilters, setLocalFilters] = useState(initialFiltersState);
    const [searchResults, setSearchResults] = useState([]);
    const [hasSearched, setHasSearched] = useState(true);
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);


    const orderOptions = [
        { value: "alpha_asc", label: "Orden Alfabético (A-Z)" },
        { value: "alpha_desc", label: "Orden Alfabético (Z-A)" }
    ];

    const [specialtyOptionsWithAll, setSpecialtyOptions] = useState([
        { value: "", label: "Todas" }
    ]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const dataFromBackend = await getSpecialtyOptions();
                setSpecialtyOptions([
                    { value: "", label: "Todas" },
                    ...dataFromBackend
                ]);
            } catch (error) {
                console.error("No se pudieron cargar las opciones", error);
            }
        };
        fetchOptions();
    }, []);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalFilters(prev => ({ ...prev, [name]: value }));
    };


    const performSearch = async () => {
        setIsLoadingSearch(true);
        setSearchResults([]);

        try {
            const filters = {
                licenseNumber: localFilters.licenseNumber || null,
                lastName: localFilters.name || null, 
                specialtyId: localFilters.specialty || null
            };

            let doctors = await getAllDoctorsWithFilters(filters);

            if (localFilters.order) {
                doctors.sort((a, b) => {
                    const nameA = a.lastName ? a.lastName.toLowerCase() : "";
                    const nameB = b.lastName ? b.lastName.toLowerCase() : "";
                    
                    return localFilters.order === 'alpha_asc'
                        ? nameA.localeCompare(nameB)
                        : nameB.localeCompare(nameA);
                });
            }

            setSearchResults(doctors);

            const hasActiveFilters = 
                localFilters.licenseNumber || 
                localFilters.name || 
                localFilters.specialty;

            if (doctors.length === 0 && hasActiveFilters) {
                toast.warning("Búsqueda sin resultados.");
            }

        } catch (error) {
            console.error("Error buscando médicos:", error);
            toast.error("Ocurrió un error al buscar médicos.");
        } finally {
            setIsLoadingSearch(false);
        }
    };

    const handleSearchClick = (e) => {
        e.preventDefault();
        setHasSearched(true);
        performSearch();
    };

    useEffect(() => {
        performSearch();
    }, [refreshTrigger]);

    const handleResetClick = () => {
        setLocalFilters(initialFiltersState);
        setSearchResults([]);
        setHasSearched(true);
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
                    name="licenseNumber"
                    type="text"
                    value={localFilters.licenseNumber}
                    onChange={handleChange}
                    size="small"
                    placeholder={"Todos"}
                />
                <Input
                    tittle="Apellido"
                    name="name"
                    type="text"
                    value={localFilters.name}
                    onChange={handleChange}
                    size="small"
                    placeholder={"Todos"}
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
                {isLoadingSearch ? (
                    <div className="flex justify-center py-10 items-center text-custom-blue animate-pulse">
                        <Spinner />
                    </div>
                ) : hasSearched && searchResults.length === 0 ? (
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