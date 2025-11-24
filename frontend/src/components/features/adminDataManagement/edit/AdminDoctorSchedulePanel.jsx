import React, { useState, useEffect } from 'react';
import { IoIosAdd, } from "react-icons/io";
import { LiaTrashAltSolid } from "react-icons/lia";

import Button from '../../../ui/Button';
import Modal from '../../../ui/Modal';
import PrincipalCard from '../../../ui/PrincipalCard';
import Input from '../../../ui/Input';
import IconButton from '../../../ui/IconButton';
import Select from '../../../ui/Select';

// Mock Data Inicial (si no hay datos previos)
import { mockDoctorAvailability } from '../../../../utils/mockData';
import { daysOptions } from '../../../../utils/dateUtils';
import { WEEKDAYS } from '../../../../utils/constants';
import { useToast } from '../../../../hooks/useToast';
import { adminDoctorScheduleSchema } from '../../../../validations/adminSchemas';

const START_HOUR_GRILLA = 7; // La grilla empieza a las 07:00
const END_HOUR_GRILLA = 22;  // La grilla termina a las 22:00
const PIXELS_PER_HOUR = 60;  // 1 hora = 60px de alto
const TOTAL_HOURS = END_HOUR_GRILLA - START_HOUR_GRILLA;
const TOTAL_HEIGHT = TOTAL_HOURS * PIXELS_PER_HOUR;


const initialFormState = {
    dayOfWeek: "",
    startTime: "",
    endTime: "",
    durationMinutes: "30"
};

const AdminDoctorSchedulePanel = ({ doctorId, onSaveSuccess }) => {
    const toast = useToast();
    // Estado de la disponibilidad (Array de horarios)
    const [schedule, setSchedule] = useState([]);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState(initialFormState);

    const daysOptionsWithAll = [{ value: "", label: "Seleccionar día" }, ...daysOptions];


    // Estados de Modales
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (doctorId) {
            // Mapeamos el mock data para asegurarnos de que cada elemento tenga un ID único.
            const sanitizedData = mockDoctorAvailability.map((item, index) => ({
                ...item,
                id: item.id || `slot-${index}-${Date.now()}`
            }));
            setSchedule(sanitizedData);
        }
    }, [doctorId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const rule = adminDoctorScheduleSchema[name];
        if (rule) {
            const error = rule(value, formData);
            setErrors(prevErrors => ({ ...prevErrors, [name]: error }));
        }
    };

    const handleAddSlot = () => {
        const newErrors = {};
        let isValid = true;

        Object.keys(adminDoctorScheduleSchema).forEach(key => {
            const error = adminDoctorScheduleSchema[key](formData[key], formData);
            if (error) {
                newErrors[key] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);

        if (isValid) {
            const existingSlot = schedule.find(s =>
                String(s.dayOfWeek) === String(formData.dayOfWeek)
            );

            if (existingSlot) {
                toast.warning("Ya existe un horario para este día. Elimínelo antes de agregar uno nuevo.");
                return;
            }

            const newSlot = {
                ...formData,
                dayOfWeek: Number(formData.dayOfWeek),
                id: Date.now() + Math.random()
            };

            setSchedule(prev => [...prev, newSlot]);
            setFormData(initialFormState);
            toast.success("Horario agregado a la grilla temporal.");
        } else {
            toast.warning("Por favor, verifique los horarios ingresados.");
        }
    };

    const handleDeleteSlot = (idToDelete) => {
        setSchedule(prev => prev.filter(item => item.id !== idToDelete));
        toast.info("Horario eliminado de la grilla.");
    };

    const handleConfirmSave = async () => {
        setIsSaving(true);
        if (onSaveSuccess) {
            await onSaveSuccess(schedule);
        }
        setIsSaving(false);
        setIsConfirmModalOpen(false);
    };

    const handleDiscard = () => {
        const sanitizedData = mockDoctorAvailability.map((item, index) => ({
            ...item,
            id: item.id || `slot-${index}-${Date.now()}`
        }));
        setSchedule(sanitizedData);
        setIsDiscardModalOpen(false);
        toast.info("Cambios descartados. Se restauró la configuración original.");
    };

    // --- LÓGICA DE POSICIONAMIENTO EN LA GRILLA ---
    const calculatePosition = (startTime, endTime) => {
        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);

        const startTotalMinutes = (startH * 60) + startM;
        const endTotalMinutes = (endH * 60) + endM;
        const gridStartMinutes = START_HOUR_GRILLA * 60;

        const top = ((startTotalMinutes - gridStartMinutes) / 60) * PIXELS_PER_HOUR;
        const height = ((endTotalMinutes - startTotalMinutes) / 60) * PIXELS_PER_HOUR;

        return { top, height };
    };

    const renderGridLines = () => {
        const lines = [];
        for (let i = 0; i < TOTAL_HOURS; i++) {
            lines.push(
                <div
                    key={i}
                    className="w-full border-b border-gray-100 absolute"
                    style={{ top: i * PIXELS_PER_HOUR, height: PIXELS_PER_HOUR }}
                >
                    <span className="text-xs text-gray-300 pl-1">
                        {(START_HOUR_GRILLA + i).toString().padStart(2, '0')}:00
                    </span>
                </div>
            );
        }
        return lines;
    };

    return (
        <div className="flex flex-col gap-6 m-3">

            {/* 1. PANEL DE INPUTS SUPERIOR */}
            <div className="flex flex-row gap-4 w-full">
                <Select
                    tittle="Dia de la Semana"
                    name="dayOfWeek"
                    value={formData.dayOfWeek}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.dayOfWeek}
                    options={daysOptionsWithAll}
                    size="small"
                    required
                />
                <Input
                    tittle="Horario de Inicio"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.startTime}
                    size="small"
                    required
                    type="time"
                />
                <Input
                    tittle="Horario de Fin"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.endTime}
                    size="small"
                    required
                    type="time"
                />
                <Input
                    tittle="Duracion de Turno (minutos)"
                    name="durationMinutes"
                    value={formData.durationMinutes}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.durationMinutes}
                    size="small"
                    required
                    type="number"
                />
                <div className='flex flex-col items-center justify-center'>
                    <IconButton
                        icon={<IoIosAdd size={30} />}
                        type="button"
                        onClick={handleAddSlot}
                    />
                </div>
            </div>

            {/* 2. GRILLA VERTICAL TIPO CALENDARIO */}
            <div className="bg-white rounded-xl border border-gray-200 w-full flex flex-col">

                {/* Header Días */}
                <div className="grid grid-cols-7 gap-2 p-2">
                    {WEEKDAYS.map((day, index) => (
                        <div key={index} className="flex flex-col gap-2">
                            <div className="text-center mb-2 border-b border-custom-blue/80 pb-2 sticky top-0 bg-white z-10">
                                <p className="font-bold text-custom-dark-blue capitalize text-md">
                                    {day}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Cuerpo del Calendario */}
                <div className="">
                    <div className={`grid grid-cols-7`} style={{ height: TOTAL_HEIGHT }}>
                        {WEEKDAYS.map((day, dayIndex) => (
                            <div key={dayIndex} className="relative border-r border-gray-100 last:border-r-0 h-full">
                                {renderGridLines()}
                                {schedule
                                    .filter(item => Number(item.dayOfWeek) === dayIndex)
                                    .map((slot) => {
                                        const { top, height } = calculatePosition(slot.startTime, slot.endTime);
                                        return (
                                            <div
                                                key={slot.id}
                                                style={{ top: `${top}px`, height: `${height}px` }}
                                                className="absolute left-1 right-1 rounded-lg bg-custom-mid-light-blue/80 border border-custom-blue p-2 flex flex-col justify-between overflow-hidden group hover:z-10 transition-all cursor-pointer hover:bg-custom-red hover:border-custom-red"
                                            >
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteSlot(slot.id);
                                                    }}
                                                    className="absolute inset-0 w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
                                                    title="Eliminar horario"
                                                >
                                                    <LiaTrashAltSolid size={40} className="text-white" />
                                                </button>
                                                <div className="flex justify-between items-start transition-opacity group-hover:opacity-0">
                                                    <span className="text-xs font-bold text-custom-mid-dark-blue leading-none">
                                                        {slot.startTime} hs
                                                    </span>
                                                </div>
                                                {height > 50 && (
                                                    <div className="text-xs text-custom-dark-blue text-center transition-opacity group-hover:opacity-0">
                                                        {slot.durationMinutes} min/turno
                                                    </div>
                                                )}
                                                <div className="text-xs font-bold text-custom-mid-dark-blue leading-none self-end transition-opacity group-hover:opacity-0">
                                                    {slot.endTime} hs
                                                </div>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. FOOTER */}
            <div className="flex flex-col items-center gap-4 mt-4">
                <h3 className="text-custom-dark-blue font-bold text-lg">Confirmar y registrar Horario del Médico</h3>
                <div className="flex gap-6">
                    <Button text="Descartar" variant="secondary" onClick={() => setIsDiscardModalOpen(true)} />
                    <Button text="Confirmar" variant="primary" onClick={() => setIsConfirmModalOpen(true)} />
                </div>
            </div>

            {/* Modales */}
            <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)}>
                <PrincipalCard
                    title="Confirmar Cambios"
                    content={
                        <div className="flex flex-col items-center gap-6 p-4">
                            <span className="text-center text-custom-dark-blue">
                                ¿Estás seguro de que deseas guardar la nueva disponibilidad horaria?
                            </span>
                            <div className="flex gap-4">
                                <Button text="Cancelar" variant="secondary" onClick={() => setIsConfirmModalOpen(false)} disable={isSaving} />
                                <Button text="Guardar Cambios" variant="primary" onClick={handleConfirmSave} isLoading={isSaving} />
                            </div>
                        </div>
                    }
                />
            </Modal>

            <Modal isOpen={isDiscardModalOpen} onClose={() => setIsDiscardModalOpen(false)}>
                <PrincipalCard
                    title="Descartar Cambios"
                    content={
                        <div className="flex flex-col items-center gap-6 p-4">
                            <span className="text-center text-custom-dark-blue">
                                ¿Deseas descartar los cambios no guardados?
                            </span>
                            <div className="flex gap-4">
                                <Button text="Cancelar" variant="secondary" onClick={() => setIsDiscardModalOpen(false)} />
                                <Button text="Descartar" variant="primary" onClick={handleDiscard} />
                            </div>
                        </div>
                    }
                />
            </Modal>
        </div>
    );
};

export default AdminDoctorSchedulePanel;