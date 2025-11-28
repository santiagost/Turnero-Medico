import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch } from "react-icons/fa";
import { LiaUndoAltSolid, LiaPencilAltSolid, LiaTrashAltSolid } from "react-icons/lia";
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../../../../hooks/useToast';
import Input from '../../../ui/Input';
import Select from '../../../ui/Select';
import Button from '../../../ui/Button';
import IconButton from '../../../ui/IconButton';
import Spinner from '../../../ui/Spinner';


import { getSocialWorkOptions } from '../../../../../services/socialWork.service'
import { getAllPatientsWithFilters } from '../../../../../services/patient.service';

export const initialFiltersState = {
    dni: "",
    name: "",
    socialWork: "",
    order: "alpha_asc"
};


const AdminPatientFilterPanel = ({ patientToDelete, patientToEdit, viewMode = "detail", refreshTrigger }) => {
    const navigate = useNavigate();
    const toast = useToast();
    const [localFilters, setLocalFilters] = useState(initialFiltersState);
    const [searchResults, setSearchResults] = useState([]);
    const [searchMessage, setSearchMessage] = useState("Busca un paciente para ver en detalle.");
    const [hasSearched, setHasSearched] = useState(true);
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);

    const orderOptions = [
        { value: "alpha_asc", label: "Orden Alfabético (A-Z)" },
        { value: "alpha_desc", label: "Orden Alfabético (Z-A)" }
    ];

    const [socialWorkOptionsWithAll, setSocialWorkOptions] = useState([
            { value: "", label: "Todas" }
        ]);
    
        useEffect(() => {
            const fetchOptions = async () => {
                try {
                    const dataFromBackend = await getSocialWorkOptions();
    
                    setSocialWorkOptions([
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
        setLocalFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const performSearch = async () => {
        setIsLoadingSearch(true);
        setSearchResults([]);

        try {
            const filters = {
                dni: localFilters.dni || null,
                lastName: localFilters.name || null, 
                socialWorkId: localFilters.socialWork || null
            };

            let patients = await getAllPatientsWithFilters(filters);

            if (localFilters.order) {
                patients.sort((a, b) => {
                    const nameA = a.lastName ? a.lastName.toLowerCase() : "";
                    const nameB = b.lastName ? b.lastName.toLowerCase() : "";
                    
                    return localFilters.order === 'alpha_asc'
                        ? nameA.localeCompare(nameB)
                        : nameB.localeCompare(nameA);
                });
            }

            setSearchResults(patients);

            const hasActiveFilters = localFilters.dni || localFilters.name || localFilters.socialWork;
            if (patients.length === 0 && hasActiveFilters) {
                toast.warning("Búsqueda sin resultados.");
            }

        } catch (error) {
            console.error("Error buscando pacientes:", error);
            toast.error("Ocurrió un error al buscar pacientes.");
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

    const handleViewDetails = (patientId) => {
        console.log(`Redirigiendo a detalles del paciente ID: ${patientId}`);
        navigate(`/admin/patients/${patientId}`);
    };

    return (
        <div className="w-full p-4">
            <form
                className="grid grid-cols-5 items-start gap-4 bg-transparent w-full"
                onSubmit={handleSearchClick}
            >
                <Input
                    tittle="DNI"
                    name="dni"
                    type="text"
                    value={localFilters.dni}
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
                    tittle="Obra Social"
                    name="socialWork"
                    value={localFilters.socialWork}
                    onChange={handleChange}
                    options={socialWorkOptionsWithAll}
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


            <div className="mt-6 overflow-y-scroll custom-scrollbar max-h-[60vh]">
                {isLoadingSearch ? (
                    <div className="flex justify-center py-10 items-center text-custom-blue animate-pulse">
                        <Spinner />
                    </div>
                ) : searchResults.length > 0 ? (
                    <div className="flex flex-col gap-3 p-4">
                        <p className="text-sm text-custom-gray">{searchMessage}</p>
                        {searchResults.map(p => (
                            <motion.div
                                key={p.patientId}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex justify-between items-center p-3 px-6 bg-custom-mid-light-blue/30 rounded-lg shadow-sm 
                                    text-custom-dark-blue
                                "
                            >
                                <div className="flex items-center gap-6">
                                    <span className="font-semibold w-24">{p.dni}</span>
                                    <span className="font-bold text-lg w-48">{p.lastName}, {p.firstName}</span>
                                    <span className="text-sm w-36">{p.telephone}</span>
                                    <span className="text-sm w-48 truncate">{p?.user?.email}</span>
                                    <span className="text-sm w-24">{p.socialWork?.name || 'N/A'}</span>
                                </div>

                                {viewMode === 'admin' ? (
                                    <div className="flex items-center gap-3">
                                        <IconButton
                                            icon={<LiaPencilAltSolid size={24} />}
                                            onClick={() => patientToEdit(p.patientId)}
                                        />
                                        <IconButton
                                            icon={<LiaTrashAltSolid size={24} />}
                                            onClick={() => patientToDelete(p.patientId)}
                                        />
                                    </div>
                                ) : (
                                    <Button
                                        text="Más Detalle"
                                        variant="primary"
                                        size="small"
                                        onClick={() => handleViewDetails(p.patientId)}
                                    />
                                )}
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-custom-gray p-4">
                        {searchMessage}
                    </p>
                )}
            </div>
        </div>
    );
};

export default AdminPatientFilterPanel;