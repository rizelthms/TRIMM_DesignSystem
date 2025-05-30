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

export function TrimmDatepicker({ selectedDate, class: className, style, showIcon }: TrimmDatepickerContainerProps) {
    console.log("showIcon prop:", showIcon);
    const [showCalendar, setShowCalendar] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [localSelectedDate, setLocalSelectedDate] = useState<Date | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const base = selectedDate?.value ?? null;
        setLocalSelectedDate(base);
        if (base) {
            setCurrentMonth(base);
        }
    }, [selectedDate?.value]);

    const handleDateClick = (date: Date) => {
        if (selectedDate) {
            selectedDate.setValue(date);
        } else {
            setLocalSelectedDate(date);
        }
        setShowCalendar(false);
    };

    const activeInputValue = selectedDate?.value ?? localSelectedDate ?? new Date();

    return (
        <div className={`trimm-datepicker ${className || ""}`} style={style}>
            <div className="trimm-datepicker-input-wrapper" onClick={() => setShowCalendar(prev => !prev)}>
                {showIcon && <span className="glyphicon glyphicon-calendar trimm-datepicker-icon" />}
                <input
                    ref={inputRef}
                    type="text"
                    readOnly
                    className="trimm-datepicker-input"
                    value={format(activeInputValue, "MM/dd/yyyy")}
                    placeholder="Select a date"
                />
            </div>
            {showCalendar && (
                <div className="trimm-datepicker-calendar">
                    {renderHeader()}
                    {renderDays()}
                    {renderCells()}
                </div>
            )}
        </div>
    );

    function renderHeader() {
        return (
            <div className="trimm-datepicker-header">
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}>◀</button>
                <span>{format(currentMonth, "MMMM yyyy")}</span>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>▶</button>
            </div>
        );
    }

    function renderDays() {
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
    }

    function renderCells() {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;
        const activeValue = selectedDate?.value ?? localSelectedDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = day;
                const isSelected = activeValue && isSameDay(day, activeValue);
                const isToday = isSameDay(day, new Date());

                days.push(
                    <div
                        className={`trimm-datepicker-cell
                            ${!isSameMonth(day, monthStart) ? "disabled" : ""}
                            ${isSelected ? "selected" : ""}
                            ${isToday ? "today" : ""}
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
    }
}
