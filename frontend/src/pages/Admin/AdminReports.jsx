import React, { useState, useEffect } from 'react';
import AnimatedPage from '../../components/layout/AnimatedPage';
import SectionCard from '../../components/ui/SectionCard';
import ShiftForDoctor from '../../components/features/reports/ShiftForDoctor';
import ShiftForSpecialty from '../../components/features/reports/ShiftForSpecialty';
import PatientVolume from '../../components/features/reports/PatientVolume';
import AttendanceAndAbsence from '../../components/features/reports/AttendanceAndAbsence';
import StatisticsList from '../../components/features/reports/StatisticsList';
import AdminReportsFilterPanel from '../../components/features/filterPanel/admin/AdminReportsFilterPanel';

import { getDateRange } from '../../utils/dateUtils';

const AdminReports = () => {

  const initialRange = getDateRange('month');

  const [filterData, setFiltersData] = useState({
    fromDate: initialRange.from,
    toDate: initialRange.to
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


        <div className='flex flex-col items-center justify-center m-6'>
          <PatientVolume filters={filterData} />
        </div>

        {/* Graficos */}
        <div className='grid grid-cols-2 '>
          <div className='flex flex-col items-center justify-center m-6'>
            <ShiftForSpecialty filters={filterData} />
          </div>

          <div className='flex flex-col items-center justify-center m-6'>
            <AttendanceAndAbsence filters={filterData} />
          </div>
        </div>


        <div className='flex flex-col items-center justify-center m-6'>
          <ShiftForDoctor filters={filterData} />
        </div>

      </div>
    </AnimatedPage>
  )
};

export default AdminReports;
