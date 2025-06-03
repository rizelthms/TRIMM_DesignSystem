/** @jsx createElement */
import { createElement, useState, useRef, useEffect } from "react";
import { TrimmMultiDatepickerContainerProps } from "../typings/TrimmMultiDatepickerProps";
import "./ui/TrimmMultiDatepicker.css";
import {
    addMonths,
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    isSameMonth,
    isSameDay,
    parse,
    isBefore,
    isAfter,
    startOfDay,
} from "date-fns";
import enUS from "date-fns/locale/en-US";
import nl from "date-fns/locale/nl";

// Utility to map string to locale object
function getLocale(localeStr: string | undefined) {
    switch ((localeStr || "").toLowerCase()) {
        case "nl":
        case "nl-nl":
            return nl;
        case "en":
        case "en-us":
        default:
            return enUS;
    }
}

// Check if date is out of range (inclusive)
function isOutOfRange(day: Date, minDate?: Date, maxDate?: Date) {
    const checkDay = startOfDay(day);
    const min = minDate ? startOfDay(minDate) : undefined;
    const max = maxDate ? startOfDay(maxDate) : undefined;
    if (min && isBefore(checkDay, min)) return true;
    if (max && isAfter(checkDay, max)) return true;
    return false;
}

export function TrimmMultiDatepicker({
    selectedDates,
    class: className,
    style,
    showIcon,
    minDate,
    maxDate,
    locale
}: TrimmMultiDatepickerContainerProps) {
    const [showCalendar, setShowCalendar] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [localSelectedDates, setLocalSelectedDates] = useState<Date[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    // Parse dates from prop string when changed
    useEffect(() => {
        if (selectedDates?.value) {
            const dates = selectedDates.value
                .split(',')
                .map(dateStr => parse(dateStr.trim(), 'MM/dd/yyyy', new Date()))
                .filter(d => !isNaN(d.getTime()));
            setLocalSelectedDates(dates);
        }
    }, [selectedDates?.value]);

    // Helper: min/max as Date or undefined
    const min = minDate?.value instanceof Date ? minDate.value : undefined;
    const max = maxDate?.value instanceof Date ? maxDate.value : undefined;
    const localeObj = getLocale(locale);

    // Toggle date in selection
    const handleDateClick = (date: Date) => {
        if (isOutOfRange(date, min, max)) return; // Don't allow picking disabled date
        let updatedDates: Date[];
        if (isDateSelected(date)) {
            updatedDates = localSelectedDates.filter(d => !isSameDay(d, date));
        } else {
            updatedDates = [...localSelectedDates, date];
        }
        setLocalSelectedDates(updatedDates);
        if (selectedDates && selectedDates.setValue) {
            selectedDates.setValue(updatedDates.map(d => format(d, 'MM/dd/yyyy')).join(','));
        }
    };

    const isDateSelected = (date: Date) =>
        localSelectedDates.some(selected => isSameDay(selected, date));

    const inputValue =
        localSelectedDates.length === 0
            ? ""
            : localSelectedDates.map(d => format(d, "MM/dd/yyyy")).join(", ");

    return (
        <div className={`trimm-multidatepicker ${className || ""}`} style={style}>
            <div className="trimm-multidatepicker-input-wrapper" onClick={() => setShowCalendar(prev => !prev)}>
                {showIcon && <span className="glyphicon glyphicon-calendar trimm-multidatepicker-icon" />}
                <input
                    ref={inputRef}
                    type="text"
                    readOnly
                    className="trimm-multidatepicker-input"
                    value={inputValue}
                    placeholder="Select dates"
                />
            </div>
            {showCalendar && (
                <div className="trimm-multidatepicker-calendar">
                    {renderHeader()}
                    {renderDays()}
                    {renderCells()}
                </div>
            )}
        </div>
    );

    function renderHeader() {
        return (
            <div className="trimm-multidatepicker-header">
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}>◀</button>
                <span>{format(currentMonth, "LLLL yyyy", { locale: localeObj })}</span>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>▶</button>
            </div>
        );
    }

    function renderDays() {
        const days = [];
        const startDate = startOfWeek(currentMonth, { locale: localeObj });
        for (let i = 0; i < 7; i++) {
            days.push(
                <div className="trimm-multidatepicker-day-label" key={i}>
                    {format(addDays(startDate, i), "EEEEE", { locale: localeObj })}
                </div>
            );
        }
        return <div className="trimm-multidatepicker-days-row">{days}</div>;
    }

    function renderCells() {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { locale: localeObj });
        const endDate = endOfWeek(monthEnd, { locale: localeObj });

        const rows = [];
        let days = [];
        let day = startDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = day;
                const isSelected = isDateSelected(day);
                const isToday = isSameDay(day, new Date());
                const outOfRange = isOutOfRange(day, min, max);

                days.push(
                    <div
                        className={`trimm-multidatepicker-cell
                            ${!isSameMonth(day, monthStart) ? "disabled" : ""}
                            ${isSelected ? "selected" : ""}
                            ${isToday ? "today" : ""}
                            ${outOfRange ? "disabled" : ""}
                        `}
                        key={day.toString()}
                        onClick={() => !outOfRange && isSameMonth(day, monthStart) && handleDateClick(cloneDay)}
                    >
                        {format(day, "d", { locale: localeObj })}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="trimm-multidatepicker-row" key={day.toString()}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="trimm-multidatepicker-body">{rows}</div>;
    }
}
