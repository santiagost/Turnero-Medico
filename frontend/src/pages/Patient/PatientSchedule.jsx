import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { startOfMonth, endOfMonth, parseISO, isWithinInterval, startOfDay, endOfDay, format } from 'date-fns';
import { IoMdArrowBack } from "react-icons/io";
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';

import { getConsultationByShiftId } from '../../../services/consultation.service';
import { getPatientHistory } from '../../../services/shift.service';
import { cancelShiftById } from '../../../services/shift.service';

import AnimatedPage from '../../components/layout/AnimatedPage';
import SectionCard from '../../components/ui/SectionCard';
import PrincipalCard from '../../components/ui/PrincipalCard';
import RightSidebar from '../../components/ui/RightSidebar';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import ScheduleHeader from '../../components/features/schedule/ScheduleHeader';
import BigCalendar from '../../components/ui/BigCalendar';
import WeekCalendar from '../../components/ui/WeekCalendar';


const PatientSchedule = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [filters, setFilters] = useState({ view: "month" });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarView, setSidebarView] = useState('detail');
  const [dayShifts, setDayShifts] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  const [relatedConsultation, setRelatedConsultation] = useState(null);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [shiftToCancel, setShiftToCancel] = useState(null);
  const [loadingCancel, setLoadingCancel] = useState(false);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const fetchPatientShifts = async () => {
    if (!user || !profile || !profile.patientId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const patientId = profile.patientId;
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const startDateString = format(start, 'yyyy-MM-dd');
    const endDateString = format(end, 'yyyy-MM-dd');

    try {
      const shifts = await getPatientHistory(patientId, startDateString, endDateString);

      const groupedByDate = shifts.reduce((acc, shift) => {
        const dateKey = format(parseISO(shift.startTime), 'yyyy-MM-dd');
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(shift);
        return acc;
      }, {});

      let finalEvents = [];

      Object.keys(groupedByDate).forEach(dateKey => {
        const shiftsOnDay = groupedByDate[dateKey];
        shiftsOnDay.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

        if (shiftsOnDay.length >= 3) {
          finalEvents.push({
            id: `group-${dateKey}`,
            title: `+${shiftsOnDay.length} Turnos`,
            date: dateKey,
            start: parseISO(dateKey),
            end: parseISO(dateKey),
            allDay: true,
            resource: { type: 'cluster', shifts: shiftsOnDay }
          });
        } else {
          shiftsOnDay.forEach(shift => {
            const shiftDate = parseISO(shift.startTime);
            finalEvents.push({
              id: shift.shiftId,
              title: shift.doctor.specialty.name,
              date: dateKey,
              start: shiftDate,
              end: shiftDate,
              allDay: true,
              resource: { type: 'single', shift: shift }
            });
          });
        }
      });

      setCalendarEvents(finalEvents);

    } catch (error) {
      console.error("Error al cargar agenda:", error);
      toast.error("Error al cargar la agenda de turnos.");
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchPatientShifts();

  }, [currentDate, user, profile]);

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

  const handleEventClick = async (eventData) => {
    const { type, shifts, shift } = eventData.resource;
    setRelatedConsultation(null);

    if (type === 'cluster') {
      setDayShifts(shifts);
      setSidebarView('list');
      setSelectedShift(null);
    } else {
      const processed = processShiftForDetail(shift);
      setSelectedShift(processed);
      setDayShifts([]);
      setSidebarView('detail');

      if (processed.status === 'Atendido') {
        try {
          const consultation = await getConsultationByShiftId(processed.id);
          setRelatedConsultation(consultation);
        } catch (error) {
          console.error("No se encontró consulta para el turno atendido:", error);
        }
      }
    }
    setIsSidebarOpen(true);
  };

  const handleSelectShiftFromList = async (rawShift) => {
    const processed = processShiftForDetail(rawShift);
    setSelectedShift(processed);
    setSidebarView('detail');
    setRelatedConsultation(null);

    if (processed.status === 'Atendido') {
      try {
        const consultation = await getConsultationByShiftId(processed.id);
        setRelatedConsultation(consultation);
      } catch (error) {
        console.error("No se encontró consulta para el turno atendido:", error);
      }
    }
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

  const handleAttemptCancel = (id) => {
    const targetShift = calendarEvents.find(ev => ev.id === id)?.resource?.shift;
    if (targetShift && (targetShift.status.name === 'Cancelado' || targetShift.status.name === 'Atendido')) {
      toast.warning(`Este turno ya está ${targetShift.status.name.toLowerCase()} y no se puede cancelar.`);
      return;
    }
    setShiftToCancel(id);
    setIsCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    if (!loadingCancel) {
      setIsCancelModalOpen(false);
      setShiftToCancel(null);
    }
  };

  const confirmCancel = async () => {
    setLoadingCancel(true);

    // Aseguramos que tenemos el ID del turno a cancelar
    if (!shiftToCancel) {
      setLoadingCancel(false);
      closeCancelModal();
      toast.error("No se encontró el ID del turno para cancelar.");
      return;
    }

    try {
      const updatedShift = await cancelShiftById(shiftToCancel);
      const newStatusName = updatedShift.status.name;

      setCalendarEvents(prev => prev.map(ev => {
        if (ev.resource.type === 'single' && ev.resource.shift.shiftId === shiftToCancel) {
          return { ...ev, resource: { ...ev.resource, shift: updatedShift } };
        }
        if (ev.resource.type === 'cluster') {
          const updatedShifts = ev.resource.shifts.map(s =>
            s.shiftId === shiftToCancel ? updatedShift : s
          );
          return { ...ev, resource: { ...ev.resource, shifts: updatedShifts } };
        }
        return ev;
      }));

      if (selectedShift && selectedShift.id === shiftToCancel) {
        setSelectedShift(processShiftForDetail(updatedShift));
      }

      if (dayShifts.length > 0) {
        setDayShifts(prev => prev.map(s =>
          s.shiftId === shiftToCancel ? updatedShift : s
        ));
      }

      toast.success(`Turno (${shiftToCancel}) cancelado con éxito.`);

    } catch (error) {
      console.error("Error al cancelar turno:", error);
      toast.error("Ocurrió un error en el servidor. No se pudo cancelar el turno.");

    } finally {
      setLoadingCancel(false);
      closeCancelModal();
    }
  };

  const handleGoToPatientHistory = () => {
    navigate(`/patient/history/${relatedConsultation.consultationId}`)
  };

  const filteredEventsForWeek = useMemo(() => {
    return calendarEvents.flatMap(event => {
      if (event.resource.type === 'single') {
        const shift = event.resource.shift;
        return [{
          ...shift,
          date: shift.startTime,
          title: shift.doctor.specialty.name
        }];
      }
      return event.resource.type === 'cluster'
        ? event.resource.shifts.map(shift => ({
          ...shift,
          date: shift.startTime,
          title: shift.doctor.specialty.name
        }))
        : [];
    });
  }, [calendarEvents]);

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
                <>
                  {filters.view === 'month' ? (
                    <BigCalendar
                      currentDate={currentDate}
                      events={calendarEvents}
                      userRole={user.role}
                      onEventClick={handleEventClick}
                    />
                  ) : (
                    <WeekCalendar
                      currentDate={currentDate}
                      events={filteredEventsForWeek}
                      userRole={user.role}
                      onEventClick={(event) => {
                        setDayShifts([]);
                        handleSelectShiftFromList(event);
                        setIsSidebarOpen(true);
                      }}
                    />
                  )}
                </>
              )}
            </div>
          }
        />

        <RightSidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          title={sidebarView === 'list' ? "Mis Turnos del Día" : "Detalle del Turno"}
        >
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

          {sidebarView === 'detail' && selectedShift && (
            <div className="flex flex-col gap-6 animate-fade-in-right">
              {dayShifts.length > 0 && (
                <button
                  onClick={handleBackToList}
                  className="flex items-center gap-2 text-sm text-custom-blue font-bold hover:underline w-fit cursor-pointer"
                >
                  <IoMdArrowBack size={18} /> Volver a la lista del día
                </button>
              )}

              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold text-custom-dark-blue">Profesional</h3>
                <div className="flex flex-col text-custom-dark-blue">
                  <span className="text-xl font-bold text-custom-mid-dark-blue">{selectedShift.doctor}</span>
                  <span className="text-custom-gray text-sm">{selectedShift.specialty}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold text-custom-dark-blue">Motivo indicado</h3>
                <div className="text-custom-dark-blue">
                  <span className="italic">"{selectedShift.reason}"</span>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <hr className='border text-custom-gray/25 w-[90%]' />
              </div>

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

              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold text-custom-dark-blue">Estado del Turno</h3>
                <div className="flex flex-row justify-between items-center">
                  <StatusBadge status={selectedShift.status} />
                </div>
              </div>

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

      <Modal isOpen={isCancelModalOpen} onClose={closeCancelModal}>
        <PrincipalCard
          title="Confirmar Cancelación"
          content={
            <div className="flex flex-col items-center gap-6 p-2">
              <p className="text-center text-custom-dark-blue">
                ¿Estás seguro de que deseas cancelar este turno?
              </p>
              <div className="flex flex-row gap-10">
                <Button text="Volver" variant="secondary" onClick={closeCancelModal} disable={loadingCancel} />
                <Button text="Confirmar" variant="primary" onClick={confirmCancel} isLoading={loadingCancel} />
              </div>
            </div>
          }
        />
      </Modal>
    </AnimatedPage>
  );
}

export default PatientSchedule;