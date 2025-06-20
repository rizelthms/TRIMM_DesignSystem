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
    isSameDay,
    isAfter,
    isBefore,
    startOfDay
} from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { nl } from "date-fns/locale/nl";

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

export function TrimmDatepicker({
    selectedDate,
    class: className,
    style,
    showIcon,
    locale,
    minDate,
    maxDate,
    onChange
}: TrimmDatepickerContainerProps) {
    const [showCalendar, setShowCalendar] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [localSelectedDate, setLocalSelectedDate] = useState<Date | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const [dragStart, setDragStart] = useState<{ mouseX: number; mouseY: number; popupX: number; popupY: number } | null>(null);
    const calendarRef = useRef<HTMLDivElement>(null);
    const [calendarPosition, setCalendarPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    useEffect(() => {
        const base = selectedDate?.value ?? null;
        setLocalSelectedDate(base);
        if (base) setCurrentMonth(base);
    }, [selectedDate?.value]);

    useEffect(() => {
        if (showCalendar && inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect();
            setCalendarPosition({ x: rect.left + window.scrollX, y: rect.bottom + window.scrollY });
        }
    }, [showCalendar]);

    useEffect(() => {
        function onMouseMove(e: MouseEvent) {
            if (dragging && dragStart) {
                setCalendarPosition({
                    x: dragStart.popupX + (e.clientX - dragStart.mouseX),
                    y: dragStart.popupY + (e.clientY - dragStart.mouseY)
                });
            }
        }
        function onMouseUp() {
            setDragging(false);
            setDragStart(null);
        }
        if (dragging) {
            window.addEventListener("mousemove", onMouseMove);
            window.addEventListener("mouseup", onMouseUp);
        }
        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
    }, [dragging, dragStart]);

    function isOutOfRange(day: Date) {
        const checkDay = startOfDay(day);
        const min = minDate?.value ? startOfDay(minDate.value) : undefined;
        const max = maxDate?.value ? startOfDay(maxDate.value) : undefined;
        if (min && isBefore(checkDay, min)) return true;
        if (max && isAfter(checkDay, max)) return true;
        return false;
    }

    const handleDateClick = (date: Date) => {
        if (isOutOfRange(date)) return;

        if (selectedDate) {
            selectedDate.setValue(date);
        } else {
            setLocalSelectedDate(date);
        }

        if (onChange?.canExecute && !onChange.isExecuting) {
            onChange.execute();
        }

        setShowCalendar(false);
    };

    const activeInputValue = selectedDate?.value ?? localSelectedDate ?? new Date();
    const localeObj = getLocale(locale);

    return (
        <div className={`trimm-datepicker ${className || ""}`} style={style}>
            <div className="trimm-datepicker-input-wrapper" onClick={() => setShowCalendar(prev => !prev)}>
                {showIcon && <span className="glyphicon glyphicon-calendar trimm-datepicker-icon" />}
                <input
                    ref={inputRef}
                    type="text"
                    readOnly
                    className="trimm-datepicker-input"
                    value={format(activeInputValue, "P", { locale: localeObj })}
                    placeholder="Select a date"
                />
            </div>
            {showCalendar && (
                <div
                    ref={calendarRef}
                    className="trimm-datepicker-calendar"
                    style={{
                        position: "absolute",
                        left: calendarPosition.x,
                        top: calendarPosition.y,
                        zIndex: 9999
                    }}
                >
                    <div
                        className="trimm-datepicker-header"
                        style={{ cursor: "move", userSelect: "none" }}
                        onMouseDown={e => {
                            e.preventDefault();
                            setDragging(true);
                            setDragStart({
                                mouseX: e.clientX,
                                mouseY: e.clientY,
                                popupX: calendarPosition.x,
                                popupY: calendarPosition.y
                            });
                        }}
                    >
                        {renderHeader()}
                    </div>
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
                <div className="trimm-datepicker-day-label" key={i}>
                    {format(addDays(startDate, i), "EEEEE", { locale: localeObj })}
                </div>
            );
        }
        return <div className="trimm-datepicker-days-row">{days}</div>;
    }

    function renderCells() {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { locale: localeObj });
        const endDate = endOfWeek(monthEnd, { locale: localeObj });

        const rows = [];
        let days = [];
        let day = startDate;
        const activeValue = selectedDate?.value ?? localSelectedDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = day;
                const isSelected = activeValue && isSameDay(day, activeValue);
                const isToday = isSameDay(day, new Date());
                const outOfRange = isOutOfRange(day);

                days.push(
                    <div
                        className={`trimm-datepicker-cell
                            ${!isSameMonth(day, monthStart) ? "disabled" : ""}
                            ${isSelected ? "selected" : ""}
                            ${isToday ? "today" : ""}
                            ${outOfRange ? "disabled" : ""}
                        `}
                        key={day.toString()}
                        onClick={() => !outOfRange && handleDateClick(cloneDay)}
                    >
                        {format(day, "d", { locale: localeObj })}
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
