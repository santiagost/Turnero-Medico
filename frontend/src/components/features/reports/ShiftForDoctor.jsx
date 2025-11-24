import React, { useEffect, useState } from "react";
import { FaFilePdf, FaUserMd } from "react-icons/fa";
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from "date-fns";

import Select from "../../ui/Select";
import Button from "../../ui/Button";
import StatusBadge from "../../ui/StatusBadge";

import { doctorOptions, doctorScheduleMock } from "../../../utils/mockData";

// --- CAPA DE SERVICIO SIMULADA (Esto simula la lógica de tu Backend) ---
// Cuando tengas la API, borrarás esta función completa.
const simulatedBackendService = (doctorId, from, to) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (!doctorId || !from || !to) {
                resolve([]);
                return;
            }

            const startDate = startOfDay(parseISO(from));
            const endDate = endOfDay(parseISO(to));
            const docIdInt = parseInt(doctorId);

            // Simulación de la Query de Base de Datos
            const filteredRaw = doctorScheduleMock.filter(shift => {
                const shiftDate = parseISO(shift.startTime);
                const isDoctor = shift.doctor.doctorId === docIdInt;
                const isInDateRange = isWithinInterval(shiftDate, { start: startDate, end: endDate });
                return isDoctor && isInDateRange;
            });

            resolve(filteredRaw);
        }, 500);
    });
};

const mapToTableFormat = (rawData) => {
    return rawData.map(shift => ({
        id: shift.shiftId,
        date: format(parseISO(shift.startTime), 'yyyy-MM-dd'),
        time: format(parseISO(shift.startTime), 'HH:mm'),
        patient: `${shift.patient.lastName}, ${shift.patient.firstName}`,
        socialWork: shift.patient.socialWork ? shift.patient.socialWork.name : "Particular",
        status: shift.status.name // Extraemos el string del objeto status
    }));
};

const ShiftForDoctor = ({ filters }) => {
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [shifts, setShifts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchShifts = async () => {
            if (!filters.fromDate || !filters.toDate || !selectedDoctor) {
                setShifts([]);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                /*
                const response = await fetch(
                    `/api/reports/shifts-by-doctor?doctorId=${selectedDoctor}&from=${filters.fromDate}&to=${filters.toDate}`
                );
                if (!response.ok) throw new Error("Error al obtener datos");
                const rawData = await response.json();
                */

                // 2. CÓDIGO ACTUAL (Mock Service):
                console.log(`📡 Fetching Mock Data: Doc ${selectedDoctor}, ${filters.fromDate} to ${filters.toDate}`);
                const rawData = await simulatedBackendService(selectedDoctor, filters.fromDate, filters.toDate);
                
                const formattedData = mapToTableFormat(rawData);
                setShifts(formattedData);

            } catch (err) {
                console.error("Error fetching shifts:", err);
                setError("Hubo un error al cargar los reportes.");
                setShifts([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchShifts();
    }, [filters, selectedDoctor]);

    const handleDoctorChange = (e) => {
        setSelectedDoctor(e.target.value);
    };

    const handleExportPDF = () => {
        const docLabel = doctorOptions.find(d => d.value.toString() === selectedDoctor)?.label;
        // Aquí luego llamarás a tu endpoint de descarga de PDF
        alert(`Generando PDF para: ${docLabel}`);
    };

    return (
        <div className="bg-white p-6 rounded-lg w-full">

            {/* Header del Reporte */}
            <div className="flex flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h3 className="text-lg font-bold text-custom-dark-blue flex items-center gap-2">
                        <FaUserMd className="text-custom-blue" /> Turnos por Médico
                    </h3>
                    <p className="text-sm text-custom-gray mb-2">Seleccione un profesional para ver sus turnos.</p>
                </div>

                {shifts.length > 0 && (
                    <Button
                        text="Exportar PDF"
                        icon={<FaFilePdf />}
                        variant="secondary"
                        onClick={handleExportPDF}
                        size="small"
                    />
                )}
            </div>

            {/* Selector de Médico */}
            <div className="w-1/4 mb-6">
                <Select
                    tittle="Seleccionar Médico"
                    name="doctorSelector"
                    value={selectedDoctor}
                    onChange={handleDoctorChange}
                    options={doctorOptions}
                    size="small"
                    placeholder="Elija un profesional..."
                />
            </div>

            {/* Tabla de Resultados */}
            <div className="overflow-x-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-custom-mid-gray text-custom-dark-blue">
                            <th className="py-3 px-4 text-sm font-semibold ">Fecha</th>
                            <th className="py-3 px-4 text-sm font-semibold ">Hora</th>
                            <th className="py-3 px-4 text-sm font-semibold ">Paciente</th>
                            <th className="py-3 px-4 text-sm font-semibold ">Obra Social</th>
                            <th className="py-3 px-4 text-sm font-semibold text-center">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="5" className="py-8 text-center text-custom-gray">
                                    Cargando datos...
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan="5" className="py-8 text-center text-custom-red bg-custom-red/15 rounded-lg">
                                    {error}
                                </td>
                            </tr>
                        ) : shifts.length > 0 ? (
                            shifts.map((shift) => (
                                <tr key={shift.id} className="border-b border-custom-mid-gray last:border-0 hover:bg-custom-light-blue/20 transition-colors">
                                    <td className="py-3 px-4 text-sm text-gray-700">{shift.date}</td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{shift.time}</td>
                                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{shift.patient}</td>
                                    <td className="py-3 px-4 text-sm text-gray-600">{shift.socialWork}</td>
                                    <td className="py-3 px-4 text-center">
                                        <div className="flex justify-center">
                                            <StatusBadge status={shift.status} />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="py-8 text-center text-gray-400 bg-gray-50 rounded-lg">
                                    {selectedDoctor
                                        ? "No se encontraron turnos para este médico en estas fechas."
                                        : "Seleccione un médico para comenzar."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ShiftForDoctor;