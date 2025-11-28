import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch } from "react-icons/fa";
import { LiaUndoAltSolid, LiaPencilAltSolid, LiaTrashAltSolid } from "react-icons/lia";
import { getAllSpecialtyWithFilters } from '../../../../../services/specialty.service';

import Input from '../../../ui/Input';
import Button from '../../../ui/Button';
import IconButton from '../../../ui/IconButton';
import { useToast } from '../../../../hooks/useToast';
import Spinner from '../../../ui/Spinner';


export const initialFiltersState = {
    name: ""
};

const AdminSpecialtyFilterPanel = ({ specialtyToDelete, specialtyToEdit, refreshTrigger }) => {
    const toast = useToast();
    const [localFilters, setLocalFilters] = useState(initialFiltersState);
    const [searchResults, setSearchResults] = useState([]);
    const [hasSearched, setHasSearched] = useState(true);
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalFilters(prev => ({ ...prev, [name]: value }));
    };

    const performSearch = async () => {
        setIsLoadingSearch(true);
        setSearchResults([]);

        try {
            const specialties = await getAllSpecialtyWithFilters({
                name: localFilters.name
            });
            setSearchResults(specialties);

            if (specialties.length === 0 && localFilters.name) {
                toast.warning("Búsqueda sin resultados.");
            }
        } catch (error) {
            console.error("Error", error);
            toast.error("Error al actualizar lista.");
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


    return (
        <div className="w-full p-4">
            <form
                className="grid grid-cols-4 items-end gap-4 bg-transparent w-full"
                onSubmit={handleSearchClick}
            >
                <div className="col-span-2">
                    <Input
                        tittle="Nombre"
                        name="name"
                        type="text"
                        value={localFilters.name}
                        onChange={handleChange}
                        size="small"
                        placeholder={"Todas"}
                    />
                </div>


                <div className='col-start-4 flex flex-row items-center justify-end h-full gap-5 text-white'>
                    <Button
                        text={"Buscar"}
                        icon={<FaSearch />}
                        variant={"primary"}
                        type={"submit"}
                        size={"medium"}
                    />
                    <motion.div whileTap={{ scale: 0.9, rotate: -180 }}>
                        <IconButton
                            icon={<LiaUndoAltSolid size={30} />}
                            type={"button"}
                            onClick={handleResetClick}
                        />
                    </motion.div>
                </div>
            </form>

            {/* --- 8. Adapta los Resultados --- */}
            <div className="mt-6 flex flex-col gap-3 overflow-y-scroll custom-scrollbar max-h-[30vh]">
                {isLoadingSearch ? (
                    <div className="flex justify-center py-6 items-center text-custom-blue animate-pulse">
                        <Spinner />
                    </div>
                ) : hasSearched && searchResults.length === 0 ? (
                    <p className="text-center text-custom-gray py-4">
                        No se encontraron Especialidades con ese nombre.
                    </p>
                ) : searchResults.length > 0 ? (
                    searchResults.map(sp => (
                        <motion.div
                            key={sp.specialtyId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-row items-center justify-between p-3 px-6 bg-custom-mid-light-blue/30 rounded-lg shadow-sm text-custom-dark-blue"
                        >
                            <div className="flex-1 flex items-center gap-6">
                                <span className="w-1/3 font-bold text-lg">{sp.name}</span>
                                <span className="w-2/3 text-sm">{sp.description}</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <IconButton
                                    icon={<LiaPencilAltSolid size={24} />}
                                    onClick={() => specialtyToEdit(sp.specialtyId)}
                                />
                                <IconButton
                                    icon={<LiaTrashAltSolid size={24} />}
                                    onClick={() => specialtyToDelete(sp.specialtyId)}
                                />
                            </div>
                        </motion.div>
                    ))
                ) : (
                    !hasSearched && (
                        <p className="text-center text-custom-gray py-2">
                            Utiliza el filtro de nombre para buscar especialidades.
                        </p>
                    )
                )}
            </div>
        </div >
    );
};

export default AdminSpecialtyFilterPanel;