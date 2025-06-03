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
    parse
} from "date-fns";


export function TrimmMultiDatepicker({ selectedDates, class: className, style, showIcon }: TrimmMultiDatepickerContainerProps) {
    const [showCalendar, setShowCalendar] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [localSelectedDates, setLocalSelectedDates] = useState<Date[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
        if (selectedDates?.value) {
            const dates = selectedDates.value.split(',').map(dateStr => parse(dateStr.trim(), 'MM/dd/yyyy', new Date()));
            setLocalSelectedDates(dates);
        }
    }, [selectedDates?.value]);

    const handleDateClick = (date: Date) => {
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
                <div className="trimm-multidatepicker-day-label" key={i}>
                    {format(addDays(startDate, i), "EEEEE")}
                </div>
            );
        }
        return <div className="trimm-multidatepicker-days-row">{days}</div>;
    }

    function renderCells() {
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
                const isSelected = isDateSelected(day);
                const isToday = isSameDay(day, new Date());

                days.push(
                    <div
                        className={`trimm-multidatepicker-cell
                            ${!isSameMonth(day, monthStart) ? "disabled" : ""}
                            ${isSelected ? "selected" : ""}
                            ${isToday ? "today" : ""}
                        `}
                        key={day.toString()}
                        onClick={() => isSameMonth(day, monthStart) && handleDateClick(cloneDay)}
                    >
                        {format(day, "d")}
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
