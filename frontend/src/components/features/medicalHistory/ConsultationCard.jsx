import React, { useState, useEffect } from 'react';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import Button from '../../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../../hooks/useToast';

import { getRecetasByConsultaId, getRecetasPdfByConsultaId } from '../../../../services/medication.service';

const ConsultationCard = ({ consultation, type, forceOpen = false }) => {
    const [isExpanded, setIsExpanded] = useState(forceOpen);
    const [recetas, setRecetas] = useState([]);
    const [isLoadingRecetas, setIsLoadingRecetas] = useState(false);
    const toast = useToast();
    const [isDownloading, setIsDownloading] = useState(false);
    const consultationId = consultation?.consultationId;

    useEffect(() => {
        setIsExpanded(forceOpen);
    }, [forceOpen]);

    useEffect(() => {
        if (!consultationId || !isExpanded) {
            setRecetas([]);
            return;
        }

        const fetchRecetas = async () => {
            setIsLoadingRecetas(true);
            try {
                const data = await getRecetasByConsultaId(consultationId);
                setRecetas(data);
            } catch (error) {
                console.error(`Fallo al cargar recetas para consulta ${consultationId}`, error);
                setRecetas([]);
                toast.error("Error al cargar las recetas de la consulta.")
            } finally {
                setIsLoadingRecetas(false);
            }
        };

        fetchRecetas();

    }, [consultationId, isExpanded]);

    const toggleExpand = () => {
        setIsExpanded(prev => !prev);
    };

    const contentVariants = {
        hidden: { opacity: 0, height: 20, y: -10, transition: { duration: 0.2 } },
        visible: { opacity: 1, height: "auto", y: 0, transition: { duration: 0.3, delay: 0.1 } }
    };

    const renderPatientCompactView = () => (
        <motion.div
            key="compact-patient"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="flex justify-between items-center w-full"
        >
            <span className="font-semibold text-lg">
                {new Date(consultation.shift.startTime).toLocaleDateString()}
            </span>
            <span className="font-bold text-xl text-custom-dark-blue grow text-center">
                {consultation?.shift?.doctor?.specialty?.name}
            </span>
            <span className="text-custom-dark-blue">
                Dr/a. {consultation?.shift?.doctor?.firstName} {consultation?.shift?.doctor?.lastName}
            </span>
            <motion.div animate={{ rotate: 0 }}><IoIosArrowDown size={24} className="ml-2" /></motion.div>
        </motion.div>
    );


    const renderPatientExpandedView = () => {
        const handleDownloadReceta = async () => {
            if (isLoadingRecetas || isDownloading) {
                toast.warning("Por favor espera, la operación anterior está en curso.");
                return;
            }

            if (!consultationId) {
                toast.error("No se pudo obtener el detalle de la consulta.");
                return;
            }

            setIsDownloading(true);
            toast.info("Preparando descarga del PDF...");

            try {
                await getRecetasPdfByConsultaId(consultationId);
                toast.success("Descarga iniciada. Revisa tus archivos.");
            } catch (error) {
                console.error("Error al descargar el PDF de recetas:", error);
                toast.error("Fallo al generar o descargar el PDF de recetas.");
            } finally {
                setIsDownloading(false);
            }
        };

        return (
            <motion.div
                key="expanded-patient"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="flex flex-col w-full"
            >
                <div className="flex justify-between items-center w-full mb-4">
                    <span className="font-semibold text-lg">{new Date(consultation.consultationDate).toLocaleDateString()}</span>
                    <span className="font-bold text-xl text-custom-dark-blue grow text-center">{consultation?.shift?.doctor?.specialty.name}</span>
                    <span className="text-custom-dark-blue">Dr. {consultation?.shift?.doctor?.firstName} {consultation?.shift?.doctor?.lastName}</span>

                    <motion.div animate={{ rotate: 180 }}><IoIosArrowDown size={24} className="mx-2" /></motion.div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-custom-dark-blue mt-2 p-4 bg-blue-100 rounded-lg">
                    <div>
                        <h3 className="font-bold text-lg mb-2">{consultation?.shift?.doctor?.specialty?.name}</h3>
                        <p><span className="font-semibold">Médico:</span> Dr. {consultation?.shift?.doctor?.firstName} {consultation?.shift?.doctor?.lastName}</p>
                        <p><span className="font-semibold">Fecha de Consulta:</span> {new Date(consultation?.consultationDate).toLocaleDateString()}</p>
                        <p><span className="font-semibold">Motivo de consulta:</span> {consultation?.shift?.reason}</p>
                        <p className="mt-4"><span className="font-semibold">Diagnóstico:</span> {consultation?.diagnosis}</p>
                        <p><span className="font-semibold">Tratamiento:</span> {consultation?.treatment}</p>
                    </div>
                    <div>

                        {recetas.length > 0 && (
                            <div className='flex flex-row items-center justify-between'>
                                <h3 className="font-bold text-lg mb-2">Recetas:</h3>
                                <Button
                                    text={"Descargar Receta Digital"}
                                    size={"small"}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownloadReceta();
                                    }}
                                    type={"button"} /> { /* BOTON PARA DESCARGAR, ACA FALTA LA LOGICA DEL DOCUMENTO GENERADO */}
                            </div>
                        )}
                        {isLoadingRecetas ? (
                            <p className="text-sm text-custom-gray animate-pulse">Cargando recetas...</p>
                        ) : recetas.length > 0 ? (
                            recetas.map((med, index) => (
                                <div key={med.recetaId || index} className="mb-2">
                                    <p><span className="font-semibold">Medicamento:</span> {med.medication}</p>
                                    <p><span className="font-semibold">Dosis:</span> {med.dosage}</p>
                                    <p><span className="font-semibold">Instrucciones:</span> {med.instructions}</p>
                                </div>
                            ))
                        ) : (
                            <p>No hay medicamentos recetados.</p>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    }


    const renderDoctorCompactView = () => (
        <motion.div key="compact-doctor" variants={contentVariants} initial="hidden" animate="visible" exit="hidden" className="flex justify-between items-center w-full">
            <span className="font-semibold text-lg">{new Date(consultation.consultationDate).toLocaleDateString()}</span>
            <span className="font-bold text-xl text-custom-dark-blue grow text-center">{consultation?.shift?.doctor?.specialty?.name}</span>
            <span className="text-custom-dark-blue">Dr. {consultation?.shift?.doctor?.firstName} {consultation?.shift?.doctor?.lastName}</span>
            <motion.div animate={{ rotate: 0 }}><IoIosArrowDown size={24} className="ml-2" /></motion.div>
        </motion.div>
    );

    const renderDoctorExpandedView = () => (
        <motion.div key="expanded-doctor" variants={contentVariants} initial="hidden" animate="visible" exit="hidden" className="flex flex-col w-full">
            <div className="flex justify-between items-center w-full mb-4">
                <span className="font-semibold text-lg">{new Date(consultation.consultationDate).toLocaleDateString()}</span>
                <span className="font-bold text-xl text-custom-dark-blue grow text-center">{consultation?.shift?.doctor?.specialty?.name}</span>
                <span className="text-custom-dark-blue">Dr. {consultation?.shift?.doctor?.firstName} {consultation?.shift?.doctor?.lastName}</span>
                <div animate={{ rotate: 180 }}><IoIosArrowDown size={24} className="mx-2" /></div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-custom-dark-blue mt-2 p-4 bg-blue-100 rounded-lg">
                <div>
                    <h3 className="font-bold text-lg mb-2">{consultation?.shift?.doctor?.specialty?.name}</h3>
                    <p><span className="font-semibold">Médico:</span> Dr. {consultation?.shift?.doctor?.firstName} {consultation?.shift?.doctor?.lastName}</p>
                    <p><span className="font-semibold">Fecha de Consulta:</span> {new Date(consultation.consultationDate).toLocaleDateString()}</p>
                    <p><span className="font-semibold">Motivo de consulta:</span> {consultation?.shift?.reason}</p>
                    <p className="mt-4"><span className="font-semibold">Diagnóstico:</span> {consultation?.diagnosis}</p>
                    <p><span className="font-semibold">Tratamiento:</span> {consultation?.treatment}</p>
                    <p className="mt-4"><span className="font-semibold">Notas del médico:</span> {consultation?.personalNotes}</p>
                </div>
                <div>
                    <h3 className="font-bold text-lg mb-2">Recetas:</h3>
                    {isLoadingRecetas ? (
                        <p className="text-sm text-custom-gray animate-pulse">Cargando recetas...</p>
                    ) : recetas.length > 0 ? (
                        recetas.map((med, index) => (
                            <div key={med.recetaId || index} className="mb-2">
                                <p><span className="font-semibold">Medicamento:</span> {med.medication}</p>
                                <p><span className="font-semibold">Dosis:</span> {med.dosage}</p>
                                <p><span className="font-semibold">Instrucciones:</span> {med.instructions}</p>
                            </div>
                        ))
                    ) : (
                        <p>No hay medicamentos recetados.</p>
                    )}
                </div>
            </div>
        </motion.div>
    );

    const baseClasses = `
        rounded-xl bg-blue-200 p-4 m-2 flex flex-col items-center 
        text-custom-dark-blue shadow-md 
        ${type !== 'Admin' ? 'cursor-pointer' : ''}
        overflow-hidden
    `;

    return (
        <motion.div
            layout
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className={baseClasses}
            onClick={toggleExpand}
        >
            <AnimatePresence initial={false} mode="wait">
                {type === 'Patient' && (isExpanded ? renderPatientExpandedView() : renderPatientCompactView())}
                {type === 'Doctor' && (isExpanded ? renderDoctorExpandedView() : renderDoctorCompactView())}
            </AnimatePresence>
        </motion.div>
    );
};

export default ConsultationCard;