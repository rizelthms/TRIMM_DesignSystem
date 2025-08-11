/** @jsx createElement */
import { createElement, useState, useRef, useEffect } from "react";
import { TrimmDatepickerContainerProps } from "../typings/TrimmDatepickerProps";
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

/**
 * TRIMM Datepicker Widget
 * 
 * A Mendix pluggable widget that provides an accessible calendar interface
 * styled with the TRIMM Design System. Features locale-aware formatting,
 * date constraints, and seamless integration with Mendix data attributes.
 */

/**
 * Returns the appropriate date-fns locale object based on the locale string
 */
function getLocale(localeStr: string | undefined) {
    switch (localeStr) {
        case "nl_NL":
            return nl;
        case "en_US":
        default:
            return enUS;
    }
}

/**
 * Main TRIMM Datepicker component
 * Provides a calendar popup with month navigation, date selection, and drag functionality
 */
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
    const [popupOffset, setPopupOffset] = useState<{ left: number; top: number }>({ left: 0, top: 0 });

    // Sync local state with selectedDate prop
    useEffect(() => {
        const base = selectedDate?.value ?? null;
        setLocalSelectedDate(base);
        if (base) setCurrentMonth(base);
    }, [selectedDate?.value]);

    // Calendar drag functionality
    useEffect(() => {
        function onMouseUp() {
            setDragging(false);
            setDragStart(null);
        }
        function onMouseMove(e: MouseEvent) {
            if (dragging && dragStart && calendarRef.current) {
                const dx = e.clientX - dragStart.mouseX;
                const dy = e.clientY - dragStart.mouseY;
                setPopupOffset({
                    left: dragStart.popupX + dx,
                    top: dragStart.popupY + dy
                });
            }
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

    // Reset popup position when opening
    useEffect(() => {
        if (showCalendar && inputRef.current) {
            setPopupOffset({ left: 0, top: 0 });
        }
    }, [showCalendar]);

    // Click outside to close calendar
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (showCalendar &&
                calendarRef.current &&
                inputRef.current &&
                !calendarRef.current.contains(event.target as Node) &&
                !inputRef.current.parentElement?.contains(event.target as Node)) {
                setShowCalendar(false);
            }
        }

        if (showCalendar) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showCalendar]);

    /**
     * Checks if a date is outside the allowed range (min/max date constraints)
     */
    function isOutOfRange(day: Date) {
        const checkDay = startOfDay(day);
        const min = minDate?.value ? startOfDay(minDate.value) : undefined;
        const max = maxDate?.value ? startOfDay(maxDate.value) : undefined;
        if (min && isBefore(checkDay, min)) return true;
        if (max && isAfter(checkDay, max)) return true;
        return false;
    }

    /**
     * Handles date selection from the calendar
     * Updates the selected date and triggers onChange action if provided
     */
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
                {showCalendar && (
                    <div
                        ref={calendarRef}
                        className="trimm-datepicker-calendar"
                        style={{
                            position: "absolute",
                            left: popupOffset.left,
                            top: `calc(100% + ${popupOffset.top}px)`,
                            zIndex: 9999
                        }}
                    >
                        <div
                            className="trimm-datepicker-header"
                            style={{ cursor: "move", userSelect: "none" }}
                            onMouseDown={e => {
                                e.preventDefault();
                                setDragging(true);
                                // Store current offset for dragging
                                setDragStart({
                                    mouseX: e.clientX,
                                    mouseY: e.clientY,
                                    popupX: popupOffset.left,
                                    popupY: popupOffset.top
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
        </div>
    );

    /**
     * Renders the calendar header with month navigation
     */
    function renderHeader() {
        return (
            <div className="trimm-datepicker-header">
                <button className="trimm-datepicker-arrow" onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}>
                    <span className="glyphicon glyphicon-triangle-left" aria-label="Previous month" />
                </button>
                <span className="trimm-datepicker-header-label">{format(currentMonth, "LLLL yyyy", { locale: localeObj })}</span>
                <button className="trimm-datepicker-arrow" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                    <span className="glyphicon glyphicon-triangle-right" aria-label="Next month" />
                </button>
            </div>
        );
    }

    /**
     * Renders the day labels row (Mon, Tue, Wed, etc.)
     */
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

    /**
     * Renders the calendar grid with date cells
     * Handles date states: selected, today, disabled, and out-of-range
     */
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
