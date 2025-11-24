import { format, isBefore, addMinutes, parse, } from "date-fns";
import { WEEKDAYS } from "./constants";

export const calculateAge = (dateString) => {
  if (!dateString) {
    return null;
  }

  const today = new Date();
  const [year, month, day] = dateString.split("-").map(Number);
  const birthDate = new Date(year, month - 1, day); // El mes en JS es 0-indexado

  let age = today.getFullYear() - birthDate.getFullYear();

  const todayMonth = today.getMonth();
  const birthMonth = birthDate.getMonth();
  const todayDay = today.getDate();
  const birthDay = birthDate.getDate();

  if (
    todayMonth < birthMonth ||
    (todayMonth === birthMonth && todayDay < birthDay)
  ) {
    age--;
  }

  return age;
};

export const estimateDate = (dateString) => {
  // Si la fecha no existe o ya es "Hoy" o "Mañana", devuélvela tal cual.
  if (!dateString || dateString === "Hoy" || dateString === "Mañana") {
    return dateString;
  }

  // --- Lógica de parseo y comparación ---

  // 1. Parsear la fecha de entrada (yyyy-MM-dd)
  const [year, month, day] = dateString.split("-").map(Number);
  // Valida que el formato sea correcto
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return dateString; // Devuelve el string original si no es 'yyyy-MM-dd'
  }
  const inputDate = new Date(year, month - 1, day);
  inputDate.setHours(0, 0, 0, 0); // Ignorar la hora

  // 2. Obtener la fecha de hoy (sin hora)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 3. Obtener la fecha de mañana (sin hora)
  const tomorrow = new Date(today); // Clona 'today'
  tomorrow.setDate(today.getDate() + 1);

  // 4. Comparar usando los timestamps (getTime())
  if (inputDate.getTime() === today.getTime()) {
    return "Hoy";
  }

  if (inputDate.getTime() === tomorrow.getTime()) {
    return "Mañana";
  }

  // 5. Si no es hoy ni mañana, devuelve la fecha en formato legible "dd/MM/yyyy"
  // Esto es mejor que devolver "2025-11-05"
  return `${String(day).padStart(2, "0")}/${String(month).padStart(
    2,
    "0"
  )}/${year}`;
};

export const getFormattedDate = (isoString) => {
  if (!isoString) return null;
  try {
    return isoString.split("T")[0];
  } catch (error) {
    console.error("Error al formatear la fecha:", error);
    return null;
  }
};

export const getFormattedTime = (isoString) => {
  if (!isoString) return null;
  try {
    const dateObj = new Date(isoString);
    return (
      dateObj.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      }) + " hs"
    );
  } catch (error) {
    console.error("Error al formatear la hora:", error);
    return null;
  }
};

export const generateMasterGrid = (doctorAvailability) => {
    if (!doctorAvailability || doctorAvailability.length === 0) return [];

    // 1. Encontrar la hora de inicio más temprana y la de fin más tardía de la semana
    let minStart = "23:59";
    let maxEnd = "00:00";
    // Asumimos que la duración es estándar (30 min) para la grilla, 
    // o tomamos la mínima si varía (para simplificar usamos 30).
    const step = 30; 

    doctorAvailability.forEach(config => {
        if (config.startTime < minStart) minStart = config.startTime;
        if (config.endTime > maxEnd) maxEnd = config.endTime;
    });

    // 2. Generar todos los slots entre minStart y maxEnd
    const slots = [];
    let current = parse(minStart, "HH:mm", new Date());
    const end = parse(maxEnd, "HH:mm", new Date());

    // Iteramos mientras sea antes de la hora de fin
    while (isBefore(current, end)) {
        slots.push(format(current, "HH:mm"));
        current = addMinutes(current, step);
    }

    return slots;
};

export const daysOptions = WEEKDAYS.map((day, index) => ({
  value: index,
  label: day,
}));

export const getDateRange = (rangeType) => {
    const today = new Date();
    let to = new Date();
    let from = new Date();

    switch (rangeType) {
        case 'today': break;
        case 'week': from.setDate(today.getDate() - 7); break;
        case 'month': from = new Date(today.getFullYear(), today.getMonth(), 1); break;
        case 'lastMonth': 
            from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            to = new Date(today.getFullYear(), today.getMonth(), 0);
            break;
        case 'year': from = new Date(today.getFullYear(), 0, 1); break;
        default: return { from: "", to: "" };
    }
    
    const formatDate = (d) => d.toISOString().split('T')[0];
    return { from: formatDate(from), to: formatDate(to) };
};