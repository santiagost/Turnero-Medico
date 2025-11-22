import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { startOfMonth, endOfMonth, parseISO, isWithinInterval, startOfDay, endOfDay, format } from 'date-fns';
import { IoMdArrowBack } from "react-icons/io";

import { useAuth } from '../../hooks/useAuth';
import { patientScheduleMock, getConsultationByShiftId } from '../../utils/mockData';

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
  const { user } = useAuth();
  const navigate = useNavigate();

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

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    setIsLoading(true);
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);

    const timer = setTimeout(() => {
      let myPersonalTurns = patientScheduleMock;
      if (user && user.userId) {
        myPersonalTurns = patientScheduleMock.filter(
          shift => shift.patient.user.userId === user.userId
        );
      }

      const filteredShifts = myPersonalTurns.filter((shift) => {
        const shiftDate = parseISO(shift.startTime);
        return isWithinInterval(shiftDate, {
          start: startOfDay(start),
          end: endOfDay(end)
        });
      });

      const groupedByDate = filteredShifts.reduce((acc, shift) => {
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
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [currentDate, user]);

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

  const handleEventClick = (eventData) => {
    const { type, shifts, shift } = eventData.resource;

    if (type === 'cluster') {
      setDayShifts(shifts);
      setSidebarView('list');
    } else {
      const processed = processShiftForDetail(shift);
      setSelectedShift(processed);
      const consultation = getConsultationByShiftId(processed.id);
      setRelatedConsultation(consultation);
      setDayShifts([]);
      setSidebarView('detail');
    }
    setIsSidebarOpen(true);
  };

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

  const handleAttemptCancel = (id) => {
    setShiftToCancel(id);
    setIsCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    setIsCancelModalOpen(false);
    setShiftToCancel(null);
  };

  const confirmCancel = () => {
    setCalendarEvents(prev => prev.map(ev => {
      if (ev.resource.type === 'single' && ev.resource.shift.shiftId === shiftToCancel) {
        return { ...ev, resource: { ...ev.resource, shift: { ...ev.resource.shift, status: { name: 'Cancelado' } } } };
      }
      if (ev.resource.type === 'cluster') {
        const updatedShifts = ev.resource.shifts.map(s =>
          s.shiftId === shiftToCancel ? { ...s, status: { name: 'Cancelado' } } : s
        );
        return { ...ev, resource: { ...ev.resource, shifts: updatedShifts } };
      }
      return ev;
    }));

    if (selectedShift && selectedShift.id === shiftToCancel) {
      setSelectedShift(prev => ({ ...prev, status: 'Cancelado' }));
    }

    if (dayShifts.length > 0) {
      setDayShifts(prev => prev.map(s =>
        s.shiftId === shiftToCancel ? { ...s, status: { name: 'Cancelado' } } : s
      ));
    }

    closeCancelModal();
  };

  const handleGoToPatientHistory = () => {
    navigate(`/patient/history/${relatedConsultation.consultationId}`)
  };

  const filteredEventsForWeek = useMemo(() => {
    let myTurns = user && user.userId
      ? patientScheduleMock.filter(s => s.patient.user.userId === user.userId)
      : patientScheduleMock;

    return myTurns.map(t => ({
      ...t,
      date: t.startTime,
      title: t.doctor.specialty.name
    }));
  }, [user]);

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