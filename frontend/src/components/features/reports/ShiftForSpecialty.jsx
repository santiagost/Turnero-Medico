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

import { getShiftsBySpecialty } from "../../../../services/report.service";

const BAR_COLORS = ['#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899'];

const ShiftForSpecialty = ({ filters }) => {
    const [chartData, setChartData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchShiftForSpecialty = async () => {
            // 1. Si no hay fechas seleccionadas, no hacemos la petición
            if (!filters.fromDate || !filters.toDate) {
                setChartData([]);
                return;
            }

            setIsLoading(true);
            try {
                const data = await getShiftsBySpecialty(filters.fromDate, filters.toDate);
                setChartData(data);
            } catch (error) {
                console.error("Error al cargar los turnos por especialidad:", error);
                setChartData([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchShiftForSpecialty();
    }, [filters]);

    // Renderizado condicional del contenido del gráfico
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="h-full flex items-center justify-center text-custom-blue font-medium">
                    Cargando especialidades...
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
                    No hay datos de especialidades en este período.
                </div>
            );
        }

        return (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />

                    <XAxis
                        dataKey="label" // Usamos 'label' del mapper genérico
                        stroke="#6B7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        // Truncar textos largos de especialidades
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
                        contentStyle={{
                            backgroundColor: "#fff",
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                        }}
                        formatter={(value) => [`${value} Turnos`, "Cantidad"]}
                        labelStyle={{ color: "#131048", marginBottom: "0.5rem", fontWeight: "bold" }}
                    />

                    <Bar
                        dataKey="value" // Usamos 'value' del mapper genérico
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
        );
    };

    return (
        <div className="bg-white p-6 rounded-lg w-full h-96 shadow-sm flex flex-col">
            <div className="mb-4">
                <h3 className="text-lg font-bold text-custom-dark-blue flex items-center gap-2">
                    <FaStethoscope className="text-custom-blue" /> Turnos por Especialidad
                </h3>
                <p className="text-sm text-custom-gray">
                    Ranking de especialidades más solicitadas.
                </p>
            </div>

            <div className="flex-1 w-full min-h-0">
                {renderContent()}
            </div>
        </div>
    );
};

export default ShiftForSpecialty;