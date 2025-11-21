import React, { useState, useEffect } from 'react';
import AnimatedPage from '../../components/layout/AnimatedPage';
import ScheduleHeader from '../../components/features/schedule/ScheduleHeader'
import SectionCard from '../../components/ui/SectionCard'
import BigCalendar from '../../components/ui/BigCalendar';
import { useAuth } from '../../hooks/useAuth';

import StatusBadge from '../../components/ui/StatusBadge';
import RightSidebar from '../../components/ui/RightSidebar';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import PrincipalCard from '../../components/ui/PrincipalCard';

import { IoMdArrowBack } from "react-icons/io"; // Importamos la flecha

import { startOfMonth, endOfMonth, parseISO, isWithinInterval, startOfDay, endOfDay, format } from 'date-fns';
import { patientScheduleMock, getConsultationByShiftId } from '../../utils/mockData';
import { useNavigate } from 'react-router-dom';

const PatientSchedule = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ view: "month" });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);



  // --- ESTADOS DE NAVEGACIÓN (SIDEBAR) ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarView, setSidebarView] = useState('detail'); // 'list' | 'detail'
  const [dayShifts, setDayShifts] = useState([]); // Para la lista de turnos
  const [selectedShift, setSelectedShift] = useState(null); // Para el detalle único
  const [relatedConsultation, setRelatedConsultation] = useState(null);

  // --- ESTADOS PARA CANCELACIÓN ---
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [shiftToCancel, setShiftToCancel] = useState(null);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // -----------------------------------------------------------------------
  // 1. LÓGICA DE CARGA Y AGRUPACIÓN HÍBRIDA
  // -----------------------------------------------------------------------
  useEffect(() => {
    setIsLoading(true);
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);

    const timer = setTimeout(() => {
      // 1. Filtrar por usuario
      let myPersonalTurns = patientScheduleMock;
      if (user && user.userId) {
        myPersonalTurns = patientScheduleMock.filter(
          shift => shift.patient.user.userId === user.userId
        );
      }

      // 2. Filtrar por mes actual
      const filteredShifts = myPersonalTurns.filter((shift) => {
        const shiftDate = parseISO(shift.startTime);
        return isWithinInterval(shiftDate, {
          start: startOfDay(start),
          end: endOfDay(end)
        });
      });

      // 3. Agrupar por día
      const groupedByDate = filteredShifts.reduce((acc, shift) => {
        const dateKey = format(parseISO(shift.startTime), 'yyyy-MM-dd');
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(shift);
        return acc;
      }, {});

      // 4. Generar Eventos (Lógica Condicional)
      let finalEvents = [];

      Object.keys(groupedByDate).forEach(dateKey => {
        const shiftsOnDay = groupedByDate[dateKey];
        shiftsOnDay.sort((a, b) => new Date(a.startTime) - new Date(b.startTime)); // Ordenar por hora

        // CONDICIÓN: ¿Son 3 o más?
        if (shiftsOnDay.length >= 3) {
          // OPCIÓN A: MODO "CLUSTER" (Lista)
          finalEvents.push({
            id: `group-${dateKey}`,
            title: `+${shiftsOnDay.length} Turnos`, // Título del bloque
            date: dateKey,
            start: parseISO(dateKey),
            end: parseISO(dateKey),
            allDay: true,
            resource: { type: 'cluster', shifts: shiftsOnDay } // Guardamos todos
          });
        } else {
          // OPCIÓN B: MODO INDIVIDUAL (Como estaba antes)
          shiftsOnDay.forEach(shift => {
            const shiftDate = parseISO(shift.startTime);
            finalEvents.push({
              id: shift.shiftId,
              title: shift.doctor.specialty.name, // Mostramos especialidad en el calendario
              date: dateKey,
              start: shiftDate, // Hora exacta para que se acomode si es vista semanal/diaria
              end: shiftDate,
              allDay: true, // O false si usas vista semanal con horas
              resource: { type: 'single', shift: shift } // Guardamos solo este
            });
          });
        }
      });

      setCalendarEvents(finalEvents);
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [currentDate, user]);


  // -----------------------------------------------------------------------
  // 2. MANEJO DE CLICKS INTELIGENTE
  // -----------------------------------------------------------------------
  const handleEventClick = (eventData) => {
    const { type, shifts, shift } = eventData.resource;

    if (type === 'cluster') {
      // Si es un grupo (+3 turnos), mostramos la lista
      setDayShifts(shifts); // Array de turnos originales
      setSidebarView('list');
    } else {
      // Si es un turno individual, vamos directo al detalle
      const processed = processShiftForDetail(shift);
      setSelectedShift(processed);
      const consultation = getConsultationByShiftId(processed.id);
      setRelatedConsultation(consultation);
      setDayShifts([]);
      setSidebarView('detail');
    }
    setIsSidebarOpen(true);
  };

  // Helper para formatear el turno al objeto que usa tu vista de detalle
  const processShiftForDetail = (shift) => ({
    id: shift.shiftId,
    date: format(parseISO(shift.startTime), 'yyyy-MM-dd'),
    time: format(parseISO(shift.startTime), 'HH:mm'),
    fullDate: parseISO(shift.startTime),
    specialty: shift.doctor.specialty.name,
    doctor: `Dr/a. ${shift.doctor.firstName} ${shift.doctor.lastName}`,
    status: shift.status.name,
    reason: shift.reason
  });

  const handleSelectShiftFromList = (rawShift) => {
    const processed = processShiftForDetail(rawShift);
    setSelectedShift(processed);
    const consultation = getConsultationByShiftId(processed.id);
    setRelatedConsultation(consultation);
    setSidebarView('detail');
  };

  const handleBackToList = () => {
    setSidebarView('list');
    setSelectedShift(null);
    setRelatedConsultation(null);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedShift(null);
    setDayShifts([]);
  };

  // --- LÓGICA DE CANCELACIÓN ---
  const handleAttemptCancel = (id) => {
    setShiftToCancel(id);
    setIsCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    setIsCancelModalOpen(false);
    setShiftToCancel(null);
  };

  const confirmCancel = () => {
    // Actualizar eventos (simplificado para demo visual)
    setCalendarEvents(prev => prev.map(ev => {
      // Si es individual
      if (ev.resource.type === 'single' && ev.resource.shift.shiftId === shiftToCancel) {
        return { ...ev, resource: { ...ev.resource, shift: { ...ev.resource.shift, status: { name: 'Cancelado' } } } };
      }
      // Si es cluster
      if (ev.resource.type === 'cluster') {
        const updatedShifts = ev.resource.shifts.map(s =>
          s.shiftId === shiftToCancel ? { ...s, status: { name: 'Cancelado' } } : s
        );
        return { ...ev, resource: { ...ev.resource, shifts: updatedShifts } };
      }
      return ev;
    }));

    // Actualizar estado visual seleccionado
    if (selectedShift && selectedShift.id === shiftToCancel) {
      setSelectedShift(prev => ({ ...prev, status: 'Cancelado' }));
    }

    // Actualizar lista del sidebar si está abierta
    if (dayShifts.length > 0) {
      setDayShifts(prev => prev.map(s =>
        s.shiftId === shiftToCancel ? { ...s, status: { name: 'Cancelado' } } : s
      ));
    }

    closeCancelModal();
  };

  const handleGoToPatientHistory = () => {
    console.log("Redirigiendo a consulta del turno del paciente:", relatedConsultation.consultationId);
    navigate(`/patient/history/${relatedConsultation.consultationId}`)
  };


  return (
    <AnimatedPage>
      <div className="px-8">
        <h1 className="text-2xl font-bold text-custom-dark-blue mb-6">
          Mi Agenda de Turnos
        </h1>
        <SectionCard
          complexHeader={
            <ScheduleHeader
              selectedView={filters.view}
              onFilterChange={handleFilterChange}
              currentDate={currentDate}
              onDateChange={setCurrentDate} />
          }
          content={
            <div className="p-6">
              {isLoading ? (
                <div className="h-96 flex items-center justify-center text-custom-blue animate-pulse">
                  Cargando agenda...
                </div>
              ) : (
                <BigCalendar
                  currentDate={currentDate}
                  events={calendarEvents}
                  userRole={user.role}
                  onEventClick={handleEventClick}
                />
              )}
            </div>
          }
        />

        <RightSidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          title={sidebarView === 'list' ? "Mis Turnos del Día" : "Detalle del Turno"}
        >

          {/* --- VISTA 1: LISTA DE TURNOS (Solo si venimos de un grupo) --- */}
          {sidebarView === 'list' && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <p className="text-sm text-custom-gray mb-2">
                Tienes {dayShifts.length} turnos programados para este día.
              </p>
              <div className="flex flex-col gap-3">
                {dayShifts.map((shift) => (
                  <div
                    key={shift.shiftId}
                    onClick={() => handleSelectShiftFromList(shift)}
                    className="flex flex-row items-center justify-between p-3 border border-custom-gray/20 rounded-lg cursor-pointer hover:bg-custom-light-blue/10 hover:border-custom-blue transition-all"
                  >
                    {/* INFO RELEVANTE PARA PACIENTE: Hora y Especialidad */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-custom-dark-blue text-lg">
                          {format(parseISO(shift.startTime), 'HH:mm')}
                        </span>
                        <span className="text-xs bg-custom-light-blue/50 px-2 py-0.5 rounded-full text-custom-dark-blue">
                          {shift.doctor.specialty.name}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-custom-gray">
                        Dr/a. {shift.doctor.lastName}
                      </span>
                    </div>
                    <StatusBadge status={shift.status.name} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- VISTA 2: DETALLE (Tu diseño original) --- */}
          {sidebarView === 'detail' && selectedShift && (
            <div className="flex flex-col gap-6 animate-fade-in-right">

              {/* Botón Volver (Solo si hay una lista detrás) */}
              {dayShifts.length > 0 && (
                <button
                  onClick={handleBackToList}
                  className="flex items-center gap-2 text-sm text-custom-blue font-bold hover:underline w-fit cursor-pointer"
                >
                  <IoMdArrowBack size={18} /> Volver a la lista del día
                </button>
              )}

              {/* SECCIÓN 1: PROFESIONAL */}
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold text-custom-dark-blue">Profesional</h3>
                <div className="flex flex-col text-custom-dark-blue">
                  <span className="text-xl font-bold text-custom-mid-dark-blue">{selectedShift.doctor}</span>
                  <span className="text-custom-gray text-sm">{selectedShift.specialty}</span>
                </div>
              </div>

              {/* SECCIÓN 2: MOTIVO */}
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold text-custom-dark-blue">Motivo indicado</h3>
                <div className="text-custom-dark-blue">
                  <span className="italic">"{selectedShift.reason}"</span>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <hr className='border text-custom-gray/25 w-[90%]' />
              </div>

              {/* SECCIÓN 3: DETALLES */}
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold text-custom-dark-blue mb-1">Detalles del Turno</h3>
                <div className="flex flex-col gap-y-1 text-md mx-4">
                  <div className="flex flex-row gap-2 items-start text-custom-dark-blue">
                    <li className="font-bold">Fecha: </li>
                    <span className="font-regular">
                      {selectedShift.fullDate && !isNaN(new Date(selectedShift.fullDate))
                        ? format(selectedShift.fullDate, 'dd/MM/yyyy')
                        : 'Fecha no válida'}
                    </span>
                  </div>
                  <div className="flex flex-row gap-2 items-start text-custom-dark-blue">
                    <li className="font-bold">Hora: </li>
                    <span className="font-regular">{selectedShift.time} hs</span>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 4: ESTADO */}
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold text-custom-dark-blue">Estado del Turno</h3>
                <div className="flex flex-row justify-between items-center">
                  <StatusBadge status={selectedShift.status} />
                </div>
              </div>

              {/* SECCIÓN 5: ACCIONES */}
              {selectedShift.status === 'Pendiente' && (
                <>
                  <div className="flex flex-col items-center">
                    <hr className='border text-custom-gray/25 w-[90%]' />
                  </div>
                  <div className="flex flex-col items-center text-center gap-4">
                    <h3 className="text-lg font-bold text-custom-dark-blue">Acciones</h3>
                    <Button
                      text="Cancelar Turno"
                      variant="secondary"
                      onClick={() => handleAttemptCancel(selectedShift.id)}
                    />
                  </div>
                </>
              )}
              {selectedShift.status === 'Atendido' && relatedConsultation && (
                <>
                  <div className="flex flex-col items-center">
                    <hr className='border text-custom-gray/25 w-[90%]' />
                  </div>
                  <div className="flex flex-col items-center text-center gap-4">
                    <h3 className="text-lg font-bold text-custom-dark-blue">Acciones</h3>
                    <Button
                      text={"Ver Detalle de Consulta"}
                      variant="primary"
                      onClick={handleGoToPatientHistory}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </RightSidebar>
      </div>

      {/* MODAL DE CONFIRMACIÓN */}
      <Modal isOpen={isCancelModalOpen} onClose={closeCancelModal}>
        <PrincipalCard
          title="Confirmar Cancelación"
          content={
            <div className="flex flex-col items-center gap-6 p-2">
              <p className="text-center text-custom-dark-blue">
                ¿Estás seguro de que deseas cancelar este turno?
              </p>
              <div className="flex flex-row gap-10">
                <Button text="Volver" variant="secondary" onClick={closeCancelModal} />
                <Button text="Confirmar" variant="primary" onClick={confirmCancel} />
              </div>
            </div>
          }
        />
      </Modal>

    </AnimatedPage>
  );
}

export default PatientSchedule;