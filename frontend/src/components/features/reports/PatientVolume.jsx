import React, { useEffect, useState } from "react";
import { PiHandHeart } from "react-icons/pi"; // Icono Pacientes
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// --- HELPER: Generador de datos simulados (Borrar al conectar con Backend) ---
// Esto crea un array de datos entre fechaInicio y fechaFin
const generateMockData = (startStr, endStr) => {
  if (!startStr || !endStr) return [];
  
  const data = [];
  let currentDate = new Date(startStr);
  const endDate = new Date(endStr);

  while (currentDate <= endDate) {
    // Formato corto para el eje X (ej: "23/11")
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    
    data.push({
      dateFull: currentDate.toISOString().split('T')[0], // Para tooltip
      dateLabel: `${day}/${month}`, // Para eje X
      pacientes: Math.floor(Math.random() * 50) + 10, // Número aleatorio entre 10 y 60
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return data;
};

const PatientVolume = ({ filters }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (filters.fromDate && filters.toDate) {
      console.log("Generando gráfico para:", filters.fromDate, "hasta", filters.toDate);
      
      // 1. AQUÍ IRÍA TU FETCH REAL AL BACKEND
      // const data = await fetchVolume(filters);
      
      // 2. POR AHORA USAMOS DATOS FALSOS:
      const mock = generateMockData(filters.fromDate, filters.toDate);
      setChartData(mock);
    }
  }, [filters]);

  // Si no hay filtros o datos, mostramos estado de carga o vacío
  if (!chartData.length) {
    return <div className="h-64 flex items-center justify-center text-custom-gray">Selecciona un rango de fechas</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg w-full h-100">
      <h3 className="text-lg font-bold text-custom-dark-blue flex items-center gap-2">
        <PiHandHeart className="text-custom-blue"/> Evolución de Pacientes Atendidos
      </h3>
      <p className="text-sm text-custom-gray mb-2">Histórico diario de pacientes atendidos.</p>
      
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorPacientes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4c99f7" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#4c99f7" stopOpacity={0}/>
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          
          <XAxis 
            dataKey="dateLabel" 
            stroke="#131048" 
            fontSize={12}
            tickMargin={10}
          />
          
          <YAxis 
            stroke="#131048" 
            fontSize={12} 
          />
          
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value) => [`${value} Pacientes`, "Volumen"]}
            labelStyle={{ color: '#131048', marginBottom: '0.5rem' }}
          />
          
          <Area 
            type="monotone"
            dataKey="pacientes" 
            stroke="#3a81dc"
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorPacientes)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PatientVolume;