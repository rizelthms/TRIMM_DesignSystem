/** @jsx createElement */
import { createElement, useEffect, useState, useRef } from "react";
import { TrimmRangeDatepickerContainerProps } from "../typings/TrimmRangeDatepickerProps";
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    addMonths,
    format,
    isSameDay,
    isSameMonth,
    isBefore,
    isAfter,
    startOfDay
} from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { nl } from "date-fns/locale/nl";

/**
 * TRIMM Range Datepicker Widget
 * 
 * A Mendix pluggable widget that provides a date range selection interface
 * styled with the TRIMM Design System. Features dual-month calendar views, drag-and-drop
 * functionality, and comprehensive date validation.
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
 * Main TRIMM Range Datepicker component
 * Provides a dual-month calendar interface for selecting date ranges with drag functionality
 */
export function TrimmRangeDatePicker(props: TrimmRangeDatepickerContainerProps) {
    const { startDate, endDate, onChange, minDate, maxDate, locale, showIcon } = props;

    const [localStart, setLocalStart] = useState<Date | null>(null);
    const [localEnd, setLocalEnd] = useState<Date | null>(null);
    const [step, setStep] = useState<"start" | "end">("start");
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [showCalendar, setShowCalendar] = useState(false);
    const [popupOffset, setPopupOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const [dragStart, setDragStart] = useState<{ mouseX: number; mouseY: number; popupX: number; popupY: number } | null>(null);
    const popupRef = useRef<HTMLDivElement>(null);
    const toggleRef = useRef<HTMLDivElement>(null);

    // Sync local state with startDate and endDate props
    useEffect(() => {
        if (startDate?.value) setLocalStart(startDate.value);
        if (endDate?.value) setLocalEnd(endDate.value);
    }, [startDate?.value, endDate?.value]);

    // Reset popup position when opening calendar
    useEffect(() => {
        if (showCalendar) {
            // Always reset to default anchored position below the toggle (relative to parent)
            setPopupOffset({ x: 0, y: 0 });
        }
    }, [showCalendar]);

    // Click outside to close calendar
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (showCalendar &&
                popupRef.current &&
                toggleRef.current &&
                !popupRef.current.contains(event.target as Node) &&
                !toggleRef.current.contains(event.target as Node)) {
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

    // Calendar drag functionality
    useEffect(() => {
        function onMouseMove(e: MouseEvent) {
            if (dragging && dragStart) {
                setPopupOffset({
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

    /**
     * Checks if a date is selectable based on min/max date constraints
     */
    const isSelectable = (date: Date): boolean => {
        const check = startOfDay(date);
        if (minDate?.value && isBefore(check, startOfDay(minDate.value))) return false;
        if (maxDate?.value && isAfter(check, startOfDay(maxDate.value))) return false;
        return true;
    };

    /**
     * Handles date selection in the two-step range selection process
     * Step 1: Select start date, Step 2: Select end date
     */
    const handleClickDate = (date: Date) => {
        if (!isSelectable(date)) return;

        if (step === "start") {
            // First step: select start date
            setLocalStart(date);
            setLocalEnd(null);
            setStep("end");
        } else {
            // Second step: select end date
            if (localStart && date >= localStart) {
                // Valid range: set both dates and complete selection
                setLocalEnd(date);
                startDate.setValue(localStart);
                endDate.setValue(date);
                if (onChange?.canExecute && !onChange.isExecuting) {
                    onChange.execute();
                }
                setStep("start");
                setShowCalendar(false);
            } else {
                // Invalid range: reset to start step with new start date
                setLocalStart(date);
                setLocalEnd(null);
                setStep("end");
            }
        }
    };

    /**
     * Renders a single month calendar grid
     * Handles date states: selected, in-range, disabled, and navigation
     */
    const renderMonth = (monthDate: Date) => {
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthStart);
        const startDateGrid = startOfWeek(monthStart);
        const endDateGrid = endOfWeek(monthEnd);
        const rows = [];
        let days = [];
        let day = startDateGrid;

        while (day <= endDateGrid) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = day;
                const selected =
                    isSameDay(localStart ?? new Date("9999-01-01"), cloneDay) ||
                    isSameDay(localEnd ?? new Date("9999-01-01"), cloneDay);
                const inRange =
                    localStart && localEnd && cloneDay > localStart && cloneDay < localEnd;
                const disabled = !isSameMonth(cloneDay, monthStart) || !isSelectable(cloneDay);

                let className = "trimm-range-datepicker-day";
                if (selected) className += " selected";
                else if (inRange) className += " in-range";
                if (disabled) className += " disabled";

                days.push(
                    <div
                        key={cloneDay.toString()}
                        className={className}
                        onClick={() => !disabled && handleClickDate(cloneDay)}
                    >
                        {format(cloneDay, "d", { locale: getLocale(locale) })}
                    </div>
                );
                day = addDays(day, 1);
            }

            rows.push(
                <div className="trimm-range-datepicker-row" key={day.toString()}>
                    {days}
                </div>
            );
            days = [];
        }

        return (
            <div className="trimm-range-datepicker-month">
                <div className="trimm-range-datepicker-days-row">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="trimm-range-datepicker-day-label">
                            {format(addDays(startOfWeek(monthDate), i), "EEEEE", { locale: getLocale(locale) })}
                        </div>
                    ))}
                </div>
                <div className="trimm-range-datepicker-body">{rows}</div>
            </div>
        );
    };

    /**
     * Renders a date input field (Start or End)
     * Shows the field label, optional icon, and selected date or placeholder
     */
    const renderField = (label: string, value: Date | null, active: boolean) => (
        <button
            type="button"
            className={`trimm-range-datepicker-field ${active ? "active" : ""}`}
            onClick={() => setShowCalendar(prev => !prev)}
        >
            <div className="trimm-range-datepicker-label-inline">
                {showIcon && <span className="glyphicon glyphicon-calendar trimm-datepicker-icon" />}
                <span className="trimm-range-datepicker-label-text">{label}:</span>
                <span className="trimm-range-datepicker-date">
                    {value && !isNaN(value.getTime()) ? format(value, "EEE MMM d yyyy", { locale: getLocale(locale) }) : "—"}
                </span>
            </div>
        </button>
    );

    return (
        <div
            className={`trimm-range-datepicker${props.class ? ` ${props.class}` : ""}`}
            style={{ ...props.style, position: "relative" }}
        >
            <div className="trimm-range-datepicker-toggle" ref={toggleRef}>
                {renderField("Start", localStart, step === "start")}
                {renderField("End", localEnd, step === "end")}
            </div>

            {showCalendar && (
                <div
                    ref={popupRef}
                    className="trimm-range-datepicker-popup"
                    style={{
                        position: "absolute",
                        left: popupOffset.x,
                        top: `calc(100% + ${popupOffset.y}px)`
                    }}
                >
                    {/* Drag handle at the top of the popup */}
                    <div
                        className="trimm-range-datepicker-popup-draghandle"
                        style={{ cursor: "move", userSelect: "none", height: 20, width: "100%" }}
                        onMouseDown={e => {
                            e.preventDefault();
                            setDragging(true);
                            setDragStart({
                                mouseX: e.clientX,
                                mouseY: e.clientY,
                                popupX: popupOffset.x,
                                popupY: popupOffset.y
                            });
                        }}
                    />
                    <div className="trimm-range-datepicker-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                        <button
                            type="button"
                            className="trimm-range-datepicker-arrow"
                            onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
                        >
                            <span className="glyphicon glyphicon-triangle-left" aria-label="Previous month" />
                        </button>
                        <div style={{ display: 'flex', flex: 1, justifyContent: 'center', gap: 64 }}>
                            <span className="trimm-range-datepicker-header-label">
                                {format(currentMonth, "MMMM yyyy", { locale: getLocale(locale) })}
                            </span>
                            <span className="trimm-range-datepicker-header-label">
                                {format(addMonths(currentMonth, 1), "MMMM yyyy", { locale: getLocale(locale) })}
                            </span>
                        </div>
                        <button
                            type="button"
                            className="trimm-range-datepicker-arrow"
                            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        >
                            <span className="glyphicon glyphicon-triangle-right" aria-label="Next month" />
                        </button>
                    </div>
                    <div className="trimm-range-datepicker-months">
                        {/* Render both months, but without their own headers */}
                        {renderMonth(currentMonth)}
                        {renderMonth(addMonths(currentMonth, 1))}
                    </div>
                </div>
            )}
        </div>
    );
}
