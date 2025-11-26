import React, { useEffect, useState } from "react";
import { FaUserCheck } from "react-icons/fa";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

import { getAttendanceVsAbsence } from "../../../../services/report.service";

// Colores semánticos: Verde para Asistencia, Rojo suave para Inasistencia
const COLORS = ['#75e653', '#e6536c'];

const AttendanceAndAbsence = ({ filters }) => {
    const [chartData, setChartData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchAttendanceData = async () => {
            if (!filters.fromDate || !filters.toDate) {
                setChartData([]);
                return;
            }

            setIsLoading(true);
            try {
                // 1. Obtenemos datos del servicio (que usa el mapper corregido)
                const data = await getAttendanceVsAbsence(filters.fromDate, filters.toDate);

                // data será algo como: [{ attended: 14, absent: 3 }]

                if (data && data.length > 0) {
                    // 2. Sumamos (aunque sea un solo item, esto es seguro)
                    const totalAttended = data.reduce((acc, curr) => acc + (curr.attended || 0), 0);
                    const totalAbsent = data.reduce((acc, curr) => acc + (curr.absent || 0), 0);

                    // 3. Verificamos que no sean ambos cero
                    if (totalAttended === 0 && totalAbsent === 0) {
                        setChartData([]);
                    } else {
                        // 4. Formateamos para el PieChart de Recharts
                        setChartData([
                            { name: 'Asistencias', value: totalAttended },
                            { name: 'Inasistencias', value: totalAbsent },
                        ]);
                    }
                } else {
                    setChartData([]);
                }

            } catch (error) {
                console.error("Error cargando datos:", error);
                setChartData([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAttendanceData();
    }, [filters]);

    // Calcular total para porcentajes en la leyenda
    const totalTurnos = chartData.reduce((sum, item) => sum + item.value, 0);

    const renderLegendText = (value, entry) => {
        const { payload } = entry;
        const percent = totalTurnos > 0 ? ((payload.value / totalTurnos) * 100).toFixed(0) : 0;
        return (
            <span className="text-gray-700 font-medium ml-2">
                {value} <span className="text-gray-400 font-normal">({percent}%)</span>
            </span>
        );
    };

    // Renderizado condicional del contenido
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="h-full flex items-center justify-center text-custom-blue font-medium">
                    Calculando tasas...
                </div>
            );
        }

        if (!filters.fromDate || !filters.toDate) {
            return (
                <div className="h-full flex items-center justify-center text-custom-gray italic">
                    Seleccione un rango de fechas.
                </div>
            );
        }

        if (chartData.length === 0) {
            return (
                <div className="h-full flex items-center justify-center text-custom-gray">
                    No hay datos de asistencia en este período.
                </div>
            );
        }

        return (
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={false}
                        outerRadius={100}
                        innerRadius={60} // Efecto Donut
                        dataKey="value"
                        paddingAngle={5}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value) => [`${value} Turnos`, "Cantidad"]}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={renderLegendText}
                    />
                </PieChart>
            </ResponsiveContainer>
        );
    };

    return (
        <div className="bg-white p-6 rounded-lg w-full h-96 shadow-sm flex flex-col">
            <div className="mb-4">
                <h3 className="text-lg font-bold text-custom-dark-blue flex items-center gap-2">
                    <FaUserCheck className="text-custom-blue" /> Tasa de Asistencia
                </h3>
                <p className="text-sm text-custom-gray">
                    Porcentaje de cumplimiento de turnos.
                </p>
            </div>

            <div className="flex-1 w-full min-h-0">
                {renderContent()}
            </div>
        </div>
    );
};

export default AttendanceAndAbsence;