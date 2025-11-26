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

import { getPatientVolume } from "../../../../services/report.service";

const PatientVolume = ({ filters }) => {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPatientVolume = async () => {
      // 1. Si no hay fechas seleccionadas, no hacemos la petición
      if (!filters.fromDate || !filters.toDate) {
        setChartData([]);
        return;
      }

      setIsLoading(true);
      try {
        const data = await getPatientVolume(filters.fromDate, filters.toDate);
        setChartData(data);
      } catch (error) {
        console.error("Error al cargar volumen de pacientes:", error);
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientVolume();
  }, [filters]);

  // Renderizado condicional del contenido del gráfico
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="h-full flex items-center justify-center text-custom-blue font-medium">
          Cargando datos...
        </div>
      );
    }

    if (!filters.fromDate || !filters.toDate) {
      return (
        <div className="h-full flex items-center justify-center text-custom-gray italic">
          Seleccione un rango de fechas para ver la evolución.
        </div>
      );
    }

    if (chartData.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-custom-gray">
          No hay datos registrados en este período.
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorPacientes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4c99f7" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#4c99f7" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />

          {/* CORRECCIÓN: dataKey="label" (según tu mapper) */}
          <XAxis
            dataKey="label"
            stroke="#131048"
            fontSize={12}
            tickMargin={10}
            tickFormatter={(value) => {
              // Opcional: Si la fecha es muy larga, mostrar solo día/mes
              // return value.substring(5); 
              return value;
            }}
          />

          <YAxis stroke="#131048" fontSize={12} />

          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            // CORRECCIÓN: El valor viene en 'payload[0].value', el formatter recibe el valor
            formatter={(value) => [`${value}`, "Pacientes"]}
            labelStyle={{ color: "#131048", marginBottom: "0.5rem", fontWeight: "bold" }}
          />

          {/* CORRECCIÓN: dataKey="value" (según tu mapper) */}
          <Area
            type="monotone"
            dataKey="value"
            stroke="#3a81dc"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorPacientes)"
            animationDuration={1500}
            name="Pacientes"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  return (
    // CORRECCIÓN: h-96 asegura una altura fija (h-100 a veces falla en Tailwind sin config)
    <div className="bg-white p-6 rounded-lg w-full h-96 shadow-sm flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-custom-dark-blue flex items-center gap-2">
          <PiHandHeart className="text-custom-blue" /> Evolución de Pacientes
        </h3>
        <p className="text-sm text-custom-gray">
          Histórico diario de pacientes atendidos.
        </p>
      </div>

      <div className="flex-1 w-full min-h-0">
        {renderContent()}
      </div>
    </div>
  );
};

export default PatientVolume;