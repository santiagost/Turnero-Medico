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

// --- CONFIGURACIÓN ---
const COLORS = ['#75e653', '#e6536c'];

const generateMockData = () => {
    const asistencias = Math.floor(Math.random() * 50) + 50;
    const inasistencias = Math.floor(Math.random() * 20) + 5;

    return [
        { name: 'Asistencias', value: asistencias },
        { name: 'Inasistencias', value: inasistencias },
    ];
};

const AttendanceAndAbsence = ({ filters }) => {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        if (filters.fromDate && filters.toDate) {
            setChartData(generateMockData());
        }
    }, [filters]);

    if (!chartData.length) return null;

    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    const renderLegendText = (value, entry) => {
        const { payload } = entry;
        const percent = total > 0 ? ((payload.value / total) * 100).toFixed(0) : 0;
        return (
            <span className="text-gray-700 font-medium ml-2">
                {value} <span className="text-gray-400 font-normal">({percent}%)</span>
            </span>
        );
    };

    return (
        <div className="bg-white p-6 w-full rounded-lg h-90 flex flex-col">
            <h3 className="text-lg font-bold text-custom-dark-blue flex items-center gap-2">
                <FaUserCheck className="text-custom-blue"/> Tasa de Asistencia
            </h3>
            <p className="text-sm text-custom-gray mb-2">Porcentaje de cumplimiento de turnos.</p>

            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={false}
                        outerRadius={100}
                        innerRadius={60}
                        fill="#8884d8"
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
        </div>
    );
};

export default AttendanceAndAbsence;