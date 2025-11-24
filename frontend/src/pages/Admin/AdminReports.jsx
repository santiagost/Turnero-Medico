import React, { useState, useEffect } from 'react';
import AnimatedPage from '../../components/layout/AnimatedPage';
import SectionCard from '../../components/ui/SectionCard';
import ShiftForDoctor from '../../components/features/reports/ShiftForDoctor';
import ShiftForSpecialty from '../../components/features/reports/ShiftForSpecialty';
import PatientVolume from '../../components/features/reports/PatientVolume';
import AttendanceAndAbsence from '../../components/features/reports/AttendanceAndAbsence';
import StatisticsList from '../../components/features/reports/StatisticsList';
import AdminReportsFilterPanel from '../../components/features/filterPanel/admin/AdminReportsFilterPanel';

const AdminReports = () => {
  const [filterData, setFiltersData] = useState({
    fromDate: "",
    toDate: ""
  });


  return (
    <AnimatedPage>
      <div className="px-8">
        <h1 className="text-2xl font-bold text-custom-dark-blue mb-6">
          Reportes y Estadisticas
        </h1>

        <h2 className='text-xl text-center underline font-bold text-custom-dark-blue mb-4'>
          Estadisticas de Hoy
        </h2>
        <StatisticsList />

        <h2 className='text-xl text-center underline font-bold text-custom-dark-blue mt-6'>
          Reportes Detallados
        </h2>
        {/* Filtro */}
        <SectionCard tittle={"Filtros"} content={<AdminReportsFilterPanel setFiltersData={setFiltersData} />} />
        {"Desde: " + filterData.fromDate + " | Hasta: " + filterData.toDate}
        <div className='grid grid-cols-2 '>
          {/* Graficos */}
          <div className='flex flex-col items-center justify-center m-6'>
            <ShiftForSpecialty />
          </div>

          <div className='flex flex-col items-center justify-center m-6'>
            <AttendanceAndAbsence />
          </div>
        </div>
        {/* Tablas */}
        <div className='flex flex-col items-center justify-center m-6'>
          <PatientVolume />
        </div>

        <div className='flex flex-col items-center justify-center m-6'>
          <ShiftForDoctor />
        </div>

      </div>
    </AnimatedPage>
  )
};

export default AdminReports;
