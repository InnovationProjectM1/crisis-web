import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatDate, DATE_FORMATS } from "@/lib/date-utils";

interface DatePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  format?: string;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  date,
  onDateChange,
  format = DATE_FORMATS.medium,
  placeholder = "Choisir une date",
  className,
}: DatePickerProps) {
  const today = new Date();
  const months = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  // État local pour le mois et l'année affichés
  const [viewDate, setViewDate] = React.useState({
    month: date ? date.getMonth() : today.getMonth(),
    year: date ? date.getFullYear() : today.getFullYear(),
  });

  // Générer les jours du mois actuel
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay() || 7; // Transformer le dimanche (0) en 7
  };

  const daysInMonth = getDaysInMonth(viewDate.month, viewDate.year);
  const firstDay = getFirstDayOfMonth(viewDate.month, viewDate.year);

  // Navigation entre les mois
  const prevMonth = () => {
    setViewDate((prev) => {
      if (prev.month === 0) {
        return { month: 11, year: prev.year - 1 };
      }
      return { ...prev, month: prev.month - 1 };
    });
  };

  const nextMonth = () => {
    setViewDate((prev) => {
      if (prev.month === 11) {
        return { month: 0, year: prev.year + 1 };
      }
      return { ...prev, month: prev.month + 1 };
    });
  };

  // Vérifier si une date est la date sélectionnée
  const isSelectedDate = (day: number) => {
    if (!date) return false;
    return (
      day === date.getDate() &&
      viewDate.month === date.getMonth() &&
      viewDate.year === date.getFullYear()
    );
  };

  // Vérifier si une date est aujourd'hui
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      viewDate.month === today.getMonth() &&
      viewDate.year === today.getFullYear()
    );
  };

  // Gérer la sélection d'une date
  const handleSelectDate = (day: number) => {
    const newDate = new Date(viewDate.year, viewDate.month, day);
    onDateChange(newDate);
  };

  // Génération de la grille du calendrier
  const renderCalendarDays = () => {
    const days = [];
    const totalSlots = Math.ceil((daysInMonth + firstDay - 1) / 7) * 7;

    for (let i = 1; i <= totalSlots; i++) {
      const day = i - (firstDay - 1);
      if (day > 0 && day <= daysInMonth) {
        days.push(
          <Button
            key={day}
            variant="ghost"
            size="sm"
            className={cn(
              "h-9 w-9 p-0 font-normal",
              isSelectedDate(day) &&
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              isToday(day) && !isSelectedDate(day) && "border border-primary",
            )}
            onClick={() => handleSelectDate(day)}
          >
            {day}
          </Button>,
        );
      } else {
        days.push(<div key={`empty-${i}`} className="h-9 w-9" />);
      }
    }

    return days;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? formatDate(date, format) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <span className="sr-only">Mois précédent</span>
              &lt;
            </Button>
            <div>
              {months[viewDate.month]} {viewDate.year}
            </div>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <span className="sr-only">Mois suivant</span>
              &gt;
            </Button>
          </div>
          <div className="grid grid-cols-7 text-center text-xs mb-1">
            <div>Lu</div>
            <div>Ma</div>
            <div>Me</div>
            <div>Je</div>
            <div>Ve</div>
            <div>Sa</div>
            <div>Di</div>
          </div>
          <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>
          <div className="mt-3 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDateChange(today)}
            >
              Aujourd&apos;hui
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDateChange(undefined)}
            >
              Effacer
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
