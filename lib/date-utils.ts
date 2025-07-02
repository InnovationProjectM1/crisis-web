// lib/date-utils.ts
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";

/**
 * Formats standard pour les dates dans l'application
 */
export const DATE_FORMATS = {
  short: "dd/MM/yyyy",
  medium: "d MMM yyyy",
  long: "d MMMM yyyy",
  full: "EEEE d MMMM yyyy",
  time: "HH:mm",
  dateTime: "d MMM yyyy, HH:mm",
  relative: "relative",
};

/**
 * Paramètres régionaux disponibles
 */
export const LOCALES = {
  fr,
  enUS,
};

/**
 * Formater une date selon un format standard ou personnalisé
 */
export function formatDate(
  date: Date | string | number,
  formatStr = DATE_FORMATS.medium,
  locale = LOCALES.fr,
) {
  const dateObj = date instanceof Date ? date : new Date(date);
  return format(dateObj, formatStr, { locale });
}

// Helper function to format time in a more readable way
export function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
