// lib/date-utils.ts
import {
  format,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
} from "date-fns";
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

/**
 * Formater une date relative (il y a X minutes/heures/jours)
 */
export function formatRelativeTime(date: Date | string | number): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();

  const diffMinutes = differenceInMinutes(now, dateObj);
  const diffHours = differenceInHours(now, dateObj);
  const diffDays = differenceInDays(now, dateObj);

  if (diffMinutes < 1) {
    return "À l'instant";
  } else if (diffMinutes < 60) {
    return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`;
  } else if (diffHours < 24) {
    return `Il y a ${diffHours} heure${diffHours > 1 ? "s" : ""}`;
  } else if (diffDays < 30) {
    return `Il y a ${diffDays} jour${diffDays > 1 ? "s" : ""}`;
  } else {
    return formatDate(dateObj);
  }
}

/**
 * Formater pour le tweet feed (fonction de remplacement pour l'ancien formatTime)
 */
export function formatTweetTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) {
    return "Just now";
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffMins < 1440) {
    return `${Math.floor(diffMins / 60)}h ago`;
  } else {
    return formatDate(date, DATE_FORMATS.short);
  }
}
