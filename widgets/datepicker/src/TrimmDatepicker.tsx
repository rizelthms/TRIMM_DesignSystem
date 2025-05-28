/** @jsx createElement */
import { createElement, useState, useRef, useEffect } from "react";
import { TrimmDatepickerContainerProps } from "../typings/TrimmDatepickerProps";
import "./ui/TrimmDatepicker.css";
import {
    addMonths,
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    isSameMonth,
    isSameDay
} from "date-fns";

export function TrimmDatepicker({ selectedDate, onDateChange, class: className, style }: TrimmDatepickerContainerProps) {
    const [showCalendar, setShowCalendar] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (selectedDate?.value) {
            setCurrentMonth(selectedDate.value);
        }
    }, [selectedDate?.value]);

    const handleDateClick = (date: Date) => {
        if (selectedDate && onDateChange?.canExecute) {
            selectedDate.setValue(date);
            onDateChange.execute();
        }
        setShowCalendar(false);
    };

    const renderHeader = () => (
        <div className="trimm-datepicker-header">
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}>◀</button>
            <span>{format(currentMonth, "MMMM yyyy")}</span>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>▶</button>
        </div>
    );

    const renderDays = () => {
        const days = [];
        const startDate = startOfWeek(currentMonth);

        for (let i = 0; i < 7; i++) {
            days.push(
                <div className="trimm-datepicker-day-label" key={i}>
                    {format(addDays(startDate, i), "EEEEE")}
                </div>
            );
        }
        return <div className="trimm-datepicker-days-row">{days}</div>;
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = day;
                days.push(
                    <div
                        className={`trimm-datepicker-cell
                            ${!isSameMonth(day, monthStart) ? "disabled" : ""}
                            ${selectedDate?.value && isSameDay(day, selectedDate.value) ? "selected" : ""}
                            ${isSameDay(day, new Date()) ? "today" : ""}
                        `}
                        key={day.toString()}
                        onClick={() => handleDateClick(cloneDay)}
                    >
                        {format(day, "d")}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="trimm-datepicker-row" key={day.toString()}>
                    {days}
                </div>
            );
            days = [];
        }

        return <div className="trimm-datepicker-body">{rows}</div>;
    };

    return (
        <div className={`trimm-datepicker ${className || ""}`} style={style}>
            <input
                ref={inputRef}
                type="text"
                readOnly
                className="trimm-datepicker-input"
                value={selectedDate?.value ? format(selectedDate.value, "MM/dd/yyyy") : ""}
                onClick={() => setShowCalendar(prev => !prev)}
                placeholder="Select a date"
            />
            {showCalendar && (
                <div className="trimm-datepicker-calendar">
                    {renderHeader()}
                    {renderDays()}
                    {renderCells()}
                </div>
            )}
        </div>
    );
}
