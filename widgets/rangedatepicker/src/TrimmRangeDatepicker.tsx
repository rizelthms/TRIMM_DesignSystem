/** @jsx createElement */
import { createElement, useEffect, useState } from "react";
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
import "./ui/TrimmRangeDatepicker.css";

export function TrimmRangeDatePicker(props: TrimmRangeDatepickerContainerProps) {
    const { startDate, endDate, onChange, minDate, maxDate } = props;

    const [localStart, setLocalStart] = useState<Date | null>(null);
    const [localEnd, setLocalEnd] = useState<Date | null>(null);
    const [step, setStep] = useState<"start" | "end">("start");
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        if (startDate?.value) setLocalStart(startDate.value);
        if (endDate?.value) setLocalEnd(endDate.value);
    }, [startDate?.value, endDate?.value]);

    const isSelectable = (date: Date): boolean => {
        const check = startOfDay(date);
        if (minDate?.value && isBefore(check, startOfDay(minDate.value))) return false;
        if (maxDate?.value && isAfter(check, startOfDay(maxDate.value))) return false;
        return true;
    };

    const handleClickDate = (date: Date) => {
        if (!isSelectable(date)) return;

        if (step === "start") {
            setLocalStart(date);
            setLocalEnd(null);
            setStep("end");
        } else {
            if (localStart && date >= localStart) {
                setLocalEnd(date);
                startDate.setValue(localStart);
                endDate.setValue(date);
                if (onChange?.canExecute && !onChange.isExecuting) {
                    onChange.execute();
                }
                setStep("start");
            } else {
                setLocalStart(date);
                setLocalEnd(null);
                setStep("end");
            }
        }
    };

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
                        {format(cloneDay, "d")}
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

        return (
            <div className="trimm-datepicker-month">
                <div className="trimm-datepicker-header">
                    <span className="trimm-datepicker-header-label">
                        {format(monthDate, "MMMM yyyy")}
                    </span>
                </div>
                <div className="trimm-datepicker-days-row">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="trimm-datepicker-day-label">
                            {format(addDays(startOfWeek(monthDate), i), "EEEEE")}
                        </div>
                    ))}
                </div>
                <div className="trimm-datepicker-body">{rows}</div>
            </div>
        );
    };

    const renderField = (label: string, value: Date | null, active: boolean) => (
        <button
            type="button"
            className={`trimm-range-datepicker-field ${active ? "active" : ""}`}
        >
            <div className="trimm-range-datepicker-label-container">
                <div className="trimm-range-datepicker-label-text">{label}</div>
                <div className="trimm-range-datepicker-date">
                    {value ? format(value, "EEE MMM d yyyy") : "—"}
                </div>
            </div>
        </button>
    );

    return (
        <div className="trimm-range-datepicker">
            <div className="trimm-range-datepicker-toggle">
                {renderField("Start", localStart, step === "start")}
                {renderField("End", localEnd, step === "end")}
            </div>

            <div className="trimm-datepicker-nav">
                <button
                    type="button"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
                >
                    ◀
                </button>
                <button
                    type="button"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                    ▶
                </button>
            </div>

            <div className="trimm-datepicker-months">
                {renderMonth(currentMonth)}
                {renderMonth(addMonths(currentMonth, 1))}
            </div>
        </div>
    );
}
