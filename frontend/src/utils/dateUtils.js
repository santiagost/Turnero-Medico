import { 
  format, 
  isBefore, 
  addMinutes, 
  parse, 
  parseISO, 
  differenceInYears, 
  isToday, 
  isTomorrow,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  subDays
} from "date-fns";
// Importamos el locale español para asegurar formatos correctos si usaras nombres de días/meses
import { es } from "date-fns/locale"; 
import { WEEKDAYS } from "./constants";

// --- UTILIDADES DE FECHA Y HORA ---

export const calculateAge = (dateString) => {
  if (!dateString) return null;
  // differenceInYears se encarga de la lógica de si ya cumplió años o no
  return differenceInYears(new Date(), parseISO(dateString));
};

export const estimateDate = (dateString) => {
  // Si es null o ya es texto legible, devolver
  if (!dateString || dateString === "Hoy" || dateString === "Mañana") {
    return dateString;
  }

  // Parseamos asumiendo formato estándar ISO o yyyy-MM-dd
  // parseISO maneja mejor los strings que new Date() en distintos navegadores
  const date = parseISO(dateString);

  if (isNaN(date.getTime())) return dateString; // Validación de fecha inválida

  if (isToday(date)) {
    return "Hoy";
  }

  if (isTomorrow(date)) {
    return "Mañana";
  }

  // Formato estándar: 05/11/2025
  return format(date, "dd/MM/yyyy");
};

export const getFormattedDate = (isoString) => {
  if (!isoString) return null;
  try {
    // Devuelve siempre yyyy-MM-dd para inputs tipo date o DB
    return format(parseISO(isoString), "yyyy-MM-dd");
  } catch (error) {
    console.error("Error al formatear la fecha:", error);
    return null;
  }
};

export const getFormattedTime = (isoString) => {
  if (!isoString) return null;
  try {
    // Formato HH:mm hs (Ej: 14:30 hs)
    // Usamos parseISO para asegurar que lea bien el string UTC/ISO
    return format(parseISO(isoString), "HH:mm") + " hs";
  } catch (error) {
    console.error("Error al formatear la hora:", error);
    return null;
  }
};

export const generateMasterGrid = (doctorAvailability) => {
  if (!doctorAvailability || doctorAvailability.length === 0) return [];

  let minStart = "23:59";
  let maxEnd = "00:00";
  const step = 30;

  doctorAvailability.forEach((config) => {
    if (config.startTime < minStart) minStart = config.startTime;
    if (config.endTime > maxEnd) maxEnd = config.endTime;
  });

  const slots = [];
  // parse crea una fecha base hoy con la hora indicada
  let current = parse(minStart, "HH:mm", new Date());
  const end = parse(maxEnd, "HH:mm", new Date());

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
  let from = new Date();
  let to = new Date();

  // Usamos helpers de date-fns para evitar errores de cálculo manual
  switch (rangeType) {
    case "today":
      // from y to son hoy
      break;
    case "week":
      // Últimos 7 días
      from = subDays(today, 7);
      break;
    case "month":
      // Desde el día 1 del mes actual
      from = startOfMonth(today);
      break;
    case "lastMonth":
      // Mes pasado completo (1 al 30/31)
      const lastMonthDate = subMonths(today, 1);
      from = startOfMonth(lastMonthDate);
      to = endOfMonth(lastMonthDate);
      break;
    case "year":
      // Desde el 1 de Enero de este año
      from = startOfYear(today);
      break;
    default:
      return { from: "", to: "" };
  }

  return {
    from: format(from, "yyyy-MM-dd"),
    to: format(to, "yyyy-MM-dd"),
  };
};