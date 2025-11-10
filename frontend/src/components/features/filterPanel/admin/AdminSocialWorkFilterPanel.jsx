import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSearch } from "react-icons/fa";
import { LiaUndoAltSolid, LiaPencilAltSolid, LiaTrashAltSolid  } from "react-icons/lia";


import Input from '../../../ui/Input';
import Button from '../../../ui/Button';
import IconButton from '../../../ui/IconButton';

import { mockSocialWorks } from '../../../../utils/mockData';

export const initialFiltersState = {
    name: "",
    cuit: ""
};

const AdminSocialWorkFilterPanel = () => {
    const [allSocialWorks, setAllSocialWorks] = useState(mockSocialWorks);
    
    const [localFilters, setLocalFilters] = useState(initialFiltersState);
    const [searchResults, setSearchResults] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearchClick = (e) => {
        e.preventDefault();
        
        let foundSocialWorks = [...allSocialWorks];

        if (localFilters.name) {
            foundSocialWorks = foundSocialWorks.filter(sw =>
                sw.name.toLowerCase().includes(localFilters.name.toLowerCase())
            );
        }
        if (localFilters.cuit) {
            foundSocialWorks = foundSocialWorks.filter(sw => sw.cuit.includes(localFilters.cuit));
        }

        setSearchResults(foundSocialWorks);
        setHasSearched(true);
    };

    const handleResetClick = () => {
        setLocalFilters(initialFiltersState);
        setSearchResults([]);
        setHasSearched(false);
    };

    const handleEdit = (id) => {
        alert(`Abrir modal de edición para Obra Social ID: ${id}`);
        // Aquí abrirías un modal de edición
    };

    const handleDelete = (id) => {
        alert(`Abrir modal de confirmación para eliminar Obra Social ID: ${id}`);
        // Aquí abrirías un modal de confirmación
    };

    return (
        <div className="w-full p-4">
            <form
                className="grid grid-cols-4 items-end gap-4 bg-transparent w-full"
                onSubmit={handleSearchClick}
            >
                <Input
                    tittle="Nombre"
                    name="name"
                    type="text"
                    value={localFilters.name}
                    onChange={handleChange}
                    size="small"
                />
                <Input
                    tittle="CUIT"
                    name="cuit"
                    type="text"
                    value={localFilters.cuit}
                    onChange={handleChange}
                    size="small"
                />
                
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

            <div className="mt-6 flex flex-col gap-3 overflow-y-scroll custom-scrollbar max-h-[30vh]">
                {hasSearched && searchResults.length === 0 ? (
                    <p className="text-center text-custom-gray py-4">
                        No se encontraron Obras Sociales con esos criterios.
                    </p>
                ) : (
                    searchResults.map(sw => (
                        <motion.div 
                            key={sw.socialWorkId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="
                                flex flex-row items-center justify-between p-3 px-6
                                bg-custom-mid-light-blue/30 rounded-lg shadow-sm 
                                text-custom-dark-blue
                            "
                        >
                            <div className="flex-1 flex items-center gap-6">
                                <span className="w-48 font-bold text-lg">{sw.name}</span>
                                <span className="w-36 font-medium">{sw.cuit}</span>
                                <span className="w-36">{sw.telephone}</span>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <IconButton 
                                    icon={<LiaPencilAltSolid size={24} />}
                                    onClick={() => handleEdit(sw.socialWorkId)}
                                />
                                <IconButton 
                                    icon={<LiaTrashAltSolid size={24} />}
                                    onClick={() => handleDelete(sw.socialWorkId)}
                                />
                            </div>
                        </motion.div>
                    ))
                )}
                
                {!hasSearched && (
                    <p className="text-center text-custom-gray py-2">
                        Utiliza los filtros para buscar Obras Sociales.
                    </p>
                )}
            </div>
        </div>
    );
};

export default AdminSocialWorkFilterPanel;