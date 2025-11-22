import React, { useState, useEffect, useMemo } from 'react';
import AnimatedPage from '../../components/layout/AnimatedPage';
import ScheduleHeader from '../../components/features/schedule/ScheduleHeader'
import SectionCard from '../../components/ui/SectionCard'
import BigCalendar from '../../components/ui/BigCalendar';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAuth } from '../../hooks/useAuth';
import RightSidebar from '../../components/ui/RightSidebar';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal'; // IMPORTADO
import PrincipalCard from '../../components/ui/PrincipalCard'; // IMPORTADO

import { IoMdInformationCircleOutline, IoMdArrowBack } from "react-icons/io";

import { startOfMonth, endOfMonth, parseISO, isWithinInterval, startOfDay, endOfDay, format } from 'date-fns';
import { doctorScheduleMock, patientScheduleMock, doctorOptions, mockDoctorAvailability, } from '../../utils/mockData';

import WeekCalendar from '../../components/ui/WeekCalendar';

const AdminSchedule = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    doctor: "",
    view: "month"
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- ESTADOS PARA LA SIDEBAR ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarView, setSidebarView] = useState('list');
  const [dayShifts, setDayShifts] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);

  // --- ESTADOS PARA CANCELACIÓN (NUEVO) ---
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [shiftToCancel, setShiftToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState(""); // Motivo administrativo

  const [doctorScheduleConfig, setDoctorScheduleConfig] = useState([]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (filters.doctor) {
      setDoctorScheduleConfig(mockDoctorAvailability);
    } else {
      setDoctorScheduleConfig([]);
    }
  }, [filters.doctor]);

  useEffect(() => {
    if (user.role === 'Admin' && filters.doctor === "" && doctorOptions.length > 0) {
      setFilters(prev => ({ ...prev, doctor: doctorOptions[0].value }));
    }
  }, [user.role, filters.doctor]);

  useEffect(() => {
    if (user.role === 'Admin' && !filters.doctor) {
      setCalendarEvents([]);
      return;
    }

    setIsLoading(true);
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);

    const timer = setTimeout(() => {
      let rawData = [];

      if (user.role === 'Admin') {
        rawData = doctorScheduleMock.filter(shift =>
          String(shift.doctor.doctorId) === String(filters.doctor)
        );
      } else {
        rawData = patientScheduleMock;
      }

      const filteredShifts = rawData.filter((shift) => {
        const shiftDate = parseISO(shift.startTime);
        return isWithinInterval(shiftDate, {
          start: startOfDay(start),
          end: endOfDay(end)
        });
      });

      const groupedByDate = filteredShifts.reduce((acc, shift) => {
        const dateKey = format(parseISO(shift.startTime), 'yyyy-MM-dd');
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(shift);
        return acc;
      }, {});

      const mappedEvents = Object.keys(groupedByDate).map(dateKey => {
        const shiftsOnDay = groupedByDate[dateKey];
        shiftsOnDay.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

        return {
          id: dateKey,
          title: `${shiftsOnDay.length} Turnos`,
          date: dateKey, // Fix para BigCalendar
          start: parseISO(dateKey),
          end: parseISO(dateKey),
          allDay: true,
          resource: shiftsOnDay
        };
      });

      setCalendarEvents(mappedEvents);
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(timer);

  }, [currentDate, user.role, filters.doctor]);


  // --- MANEJO DE SIDEBAR ---
  const handleEventClick = (eventData) => {
    setDayShifts(eventData.resource);
    setSidebarView('list');
    setIsSidebarOpen(true);
  };

  const handleSelectShiftFromList = (shift) => {
    const processedShift = {
      id: shift.shiftId,
      patient: `${shift.patient.firstName} ${shift.patient.lastName}`,
      reason: shift.reason,
      fullDate: parseISO(shift.startTime),
      time: format(parseISO(shift.startTime), 'HH:mm'),
      specialty: shift.doctor.specialty.name,
      status: shift.status.name,
      doctor: `${shift.doctor.firstName} ${shift.doctor.lastName}`
    };

    setSelectedShift(processedShift);
    setSidebarView('detail');
  };

  const handleBackToList = () => {
    setSidebarView('list');
    setSelectedShift(null);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setDayShifts([]);
    setSelectedShift(null);
  };

  // --- LÓGICA DE CANCELACIÓN (NUEVO) ---
  const handleAttemptCancel = (id) => {
    setShiftToCancel(id);
    setCancelReason(""); // Resetear motivo
    setIsCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    setIsCancelModalOpen(false);
    setShiftToCancel(null);
    setCancelReason("");
  };

  const confirmCancel = () => {
    console.log(`Cancelando turno ${shiftToCancel} por motivo: ${cancelReason}`);

    // 1. Actualizar la vista de detalle actual
    if (selectedShift && selectedShift.id === shiftToCancel) {
      setSelectedShift(prev => ({ ...prev, status: 'Cancelado' }));
    }

    // 2. Actualizar la lista de turnos del día (para que se vea reflejado al volver)
    setDayShifts(prevShifts =>
      prevShifts.map(shift =>
        shift.shiftId === shiftToCancel
          ? { ...shift, status: { ...shift.status, name: 'Cancelado' } }
          : shift
      )
    );

    // 3. (Opcional) Aquí actualizarías calendarEvents si quisieras que persista al cerrar sidebar
    // o harías la llamada al backend.

    closeCancelModal();
  };

  const rawDoctorEvents = useMemo(() => {
    if (!filters.doctor) return [];
    return doctorScheduleMock.filter(shift =>
      String(shift.doctor.doctorId) === String(filters.doctor)
    ).map(t => ({
      ...t,
      date: t.startTime,
      // El admin necesita ver info del paciente o un "Ocupado"
      title: `${t.patient.firstName} ${t.patient.lastName}`
    }));
  }, [filters.doctor]);

  return (
    <AnimatedPage>
      <div className="px-8">
        <h1 className="text-2xl font-bold text-custom-dark-blue mb-6">
          Todos los Turnos
        </h1>
        <SectionCard
          complexHeader={
            <ScheduleHeader
              selectedDoctor={filters.doctor}
              selectedView={filters.view}
              onFilterChange={handleFilterChange}
              currentDate={currentDate}
              onDateChange={setCurrentDate} />
          }
          content={
            <div className="p-6">
              {!filters.doctor ? (
                <div className="h-96 flex flex-col items-center justify-center text-custom-gray/80 border-2 border-dashed border-custom-gray/50 rounded-xl">
                  <IoMdInformationCircleOutline size={48} className="mb-2" />
                  <p className="text-lg font-medium">Por favor, selecciona un médico</p>
                  <p className="text-sm">Elige un profesional del listado para ver su agenda.</p>
                </div>
              ) : (
                <>
                  {isLoading ? (
                    <div className="h-96 flex items-center justify-center text-custom-blue animate-pulse">
                      Cargando agenda...
                    </div>
                  ) : (
                    filters.view === 'month' ? (
                      <BigCalendar
                        currentDate={currentDate}
                        events={calendarEvents}
                        userRole={user.role}
                        onEventClick={handleEventClick}
                      />
                    ) : (
                      <WeekCalendar
                        currentDate={currentDate}
                        events={rawDoctorEvents}
                        userRole={user.role}
                        doctorAvailability={doctorScheduleConfig}
                        onEventClick={(event) => {
                          setDayShifts([]); // <--- CLAVE: Limpiamos la lista para que no salga el botón "Volver"
                          handleSelectShiftFromList(event);
                          setIsSidebarOpen(true);
                        }}
                      />
                    )
                  )}
                </>
              )}
            </div>
          }
        />

        <RightSidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          title={sidebarView === 'list' ? `Turnos del Día` : "Detalle del Turno"}
        >
          {/* --- VISTA 1: LISTA DE TURNOS --- */}
          {sidebarView === 'list' && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-custom-gray mb-2">
                Selecciona un turno para ver los detalles completos.
              </p>
              <div className="flex flex-col gap-3">
                {dayShifts.map((shift) => (
                  <div
                    key={shift.shiftId}
                    onClick={() => handleSelectShiftFromList(shift)}
                    className="flex flex-row items-center justify-between p-4 border border-custom-gray/20 rounded-lg cursor-pointer hover:bg-custom-light-blue/10 hover:border-custom-blue transition-all"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-custom-dark-blue text-lg">
                        {format(parseISO(shift.startTime), 'HH:mm')} hs
                      </span>
                      <span className="text-sm font-medium text-custom-gray">
                        {shift.patient.firstName} {shift.patient.lastName}
                      </span>
                    </div>
                    <StatusBadge status={shift.status.name} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- VISTA 2: DETALLE INDIVIDUAL --- */}
          {sidebarView === 'detail' && selectedShift && (
            <div className="flex flex-col gap-6 animate-fade-in-right">

              {/* Botón Volver */}
              {dayShifts.length > 0 && (
                <button
                  onClick={handleBackToList}
                  className="flex items-center gap-2 text-sm text-custom-blue font-bold hover:underline w-fit cursor-pointer"
                >
                  <IoMdArrowBack size={18} /> Volver al listado
                </button>
              )}

              {/* SECCIÓN 1: DATOS DEL PACIENTE */}
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold text-custom-dark-blue">Datos del Paciente</h3>
                <div className="text-custom-dark-blue">
                  <span className="font-medium">Nombre: </span>
                  {selectedShift.patient}
                </div>
              </div>

              {/* SECCIÓN 2: MOTIVO */}
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold text-custom-dark-blue">Motivo de Consulta</h3>
                <div className="text-custom-dark-blue">
                  <span className="font-medium">Motivo: </span>
                  <span className="italic">"{selectedShift.reason}"</span>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <hr className='border text-custom-gray/25 w-[90%]' />
              </div>

              {/* SECCIÓN 3: DETALLES TÉCNICOS */}
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
                  <div className="flex flex-row gap-2 items-start text-custom-dark-blue">
                    <li className="font-bold">Especialidad: </li>
                    <span className="font-regular">{selectedShift.specialty}</span>
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

              {/* SECCIÓN 5: ACCIONES (NUEVO) */}
              {selectedShift.status === 'Pendiente' && (
                <>
                  <div className="flex flex-col items-center">
                    <hr className='border text-custom-gray/25 w-[90%]' />
                  </div>
                  <div className="flex flex-col items-center text-center gap-4">
                    <h3 className="text-lg font-bold text-custom-dark-blue">Acciones Administrativas</h3>
                    <Button
                      text="Cancelar Turno"
                      variant="secondary"
                      onClick={() => handleAttemptCancel(selectedShift.id)}
                    />
                  </div>
                </>
              )}

            </div>
          )}
        </RightSidebar>
      </div>

      {/* --- MODAL DE CANCELACIÓN --- */}
      <Modal isOpen={isCancelModalOpen} onClose={closeCancelModal}>
        <PrincipalCard
          title="Confirmar Cancelación"
          content={
            <div className="flex flex-col items-center gap-6 p-2">
              <p className="text-center text-custom-dark-blue">
                ¿Estás seguro de que deseas cancelar este turno?
                Esta acción no se puede deshacer.
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

export default AdminSchedule;