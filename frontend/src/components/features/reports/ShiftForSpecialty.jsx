import React, { useEffect, useState } from "react";
import { FaStethoscope } from "react-icons/fa6";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";

const BAR_COLORS = ['#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899'];


const generateMockData = () => {
    const data = [
        { name: 'Clínica Médica', turnos: 120 },
        { name: 'Pediatría', turnos: 98 },
        { name: 'Cardiología', turnos: 86 },
        { name: 'Traumatología', turnos: 65 },
        { name: 'Dermatología', turnos: 45 },
        { name: 'Ginecología', turnos: 30 },
    ];
    // IMPORTANTE: Siempre ordenar los datos para un gráfico de barras (Mayor a menor)
    return data.sort((a, b) => b.turnos - a.turnos);
};

const ShiftForSpecialty = ({ filters }) => {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        if (filters.fromDate && filters.toDate) {
            // AQUI VA LA LLAMADA AL BACKEND
            // 1. Fetch real: await fetchSpecialtyStats(filters);
            // 2. Mock data
            setChartData(generateMockData());
        }
    }, [filters]);

    if (!chartData.length) return null;

    return (
        <div className="bg-white p-6  rounded-lg w-full h-90">
            <h3 className="text-lg font-bold text-custom-dark-blue flex items-center gap-2">
               <FaStethoscope className="text-custom-blue"/> Turnos por Especialidad
            </h3>
            <p className="text-sm text-custom-gray mb-2">Ranking de especialidades más solicitadas.</p>

            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />

                    <XAxis
                        dataKey="name"
                        stroke="#6B7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
                    />

                    <YAxis
                        stroke="#6B7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                    />

                    <Tooltip
                        cursor={{ fill: '#F3F4F6' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />

                    <Bar
                        dataKey="turnos"
                        name="Turnos"
                        radius={[4, 4, 0, 0]}
                        animationDuration={1500}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ShiftForSpecialty;