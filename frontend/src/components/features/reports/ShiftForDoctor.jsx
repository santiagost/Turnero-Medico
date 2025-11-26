import React, { useEffect, useState } from "react";
import { FaFilePdf, FaUserMd } from "react-icons/fa";

import Select from "../../ui/Select";
import Button from "../../ui/Button";
import StatusBadge from "../../ui/StatusBadge";

import { useToast } from "../../../hooks/useToast"

import { getDoctorOptions } from "../../../../services/doctor.service"
import { downloadMedicalPerformancePDF, getMedicalPerformance } from "../../../../services/report.service";

const mapToTableFormat = (rawData) => {
    return rawData.map(shift => ({
        id: shift.shiftId,
        date: shift.date,
        time: shift.time,
        patient: shift.name,
        socialWork: shift.socialWork,
        status: shift.status
    }));
};

const ShiftForDoctor = ({ filters }) => {
    const toast = useToast();
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
                const data = await getMedicalPerformance(filters.fromDate, filters.toDate, selectedDoctor)
                console.log(data);
                const formattedData = mapToTableFormat(data);
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

    const [doctorOptions, setDoctorOptions] = useState([
        { value: "", label: "" }
    ]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const dataFromBackend = await getDoctorOptions();

                setDoctorOptions([
                    ...dataFromBackend
                ]);
            } catch (error) {
                console.error("No se pudieron cargar las opciones", error);
            }
        };

        fetchOptions();
    }, []);

    const handleDoctorChange = (e) => {
        setSelectedDoctor(e.target.value);
    };

    const handleExportPDF = async () => {
        // 1. Validamos que haya fechas seleccionadas
        if (!filters.fromDate || !filters.toDate) {
            toast.error("Por favor seleccione un rango de fechas.");
            return;
        }

        try {
            const doctorId = selectedDoctor ? selectedDoctor : null;
            const pdfData = await downloadMedicalPerformancePDF(
                filters.fromDate,
                filters.toDate,
                doctorId
            );
            const blob = new Blob([pdfData], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reporte_medico_${filters.fromDate}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success("Reporte descargado correctamente");

        } catch (error) {
            console.error(error);
            if (error.response && error.response.status === 404) {
                toast.error("No hay datos para generar el reporte en esas fechas.");
            } else {
                toast.error("Error al descargar el reporte");
            }
        }
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
                                            {console.log(shift.status)}
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