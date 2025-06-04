/** @jsx createElement */
import { createElement, useState } from "react";
import { TrimmRangeDatepickerContainerProps } from "../typings/TrimmRangeDatepickerProps";
import "./ui/TrimmRangeDatepicker.css";

export function TrimmRangeDatePicker(props: TrimmRangeDatepickerContainerProps) {
    const { startDate, endDate, onChange, minDate, maxDate } = props;

    const [localStart, setLocalStart] = useState<Date | null>(null);
    const [localEnd, setLocalEnd] = useState<Date | null>(null);
    const [step, setStep] = useState<"start" | "end">("start");

    const isSelectable = (date: Date): boolean => {
        if (minDate?.value && date < minDate.value) return false;
        if (maxDate?.value && date > maxDate.value) return false;
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

                // Save to Mendix
                startDate.setValue(localStart);
                endDate.setValue(date);

                if (onChange?.canExecute && !onChange.isExecuting) {
                    onChange.execute();
                }

                setStep("start");
            } else {
                // If end < start, treat it as new start
                setLocalStart(date);
                setLocalEnd(null);
                setStep("end");
            }
        }
    };

    const renderDay = (day: number) => {
        const today = new Date();
        const current = new Date(today.getFullYear(), today.getMonth(), day);

        const selected =
            localStart?.toDateString() === current.toDateString() ||
            localEnd?.toDateString() === current.toDateString();

        const inRange =
            localStart &&
            localEnd &&
            current > localStart &&
            current < localEnd;

        const disabled = !isSelectable(current);

        let className = "trimm-range-datepicker-day";
        if (selected) className += " selected";
        else if (inRange) className += " in-range";
        if (disabled) className += " disabled";

        return (
            <div
                key={day}
                className={className}
                onClick={() => !disabled && handleClickDate(current)}
            >
                {day}
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
                    {value ? value.toDateString() : " —"}
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

            <div className="trimm-range-datepicker-calendar">
                {Array.from({ length: 30 }, (_, i) => renderDay(i + 1))}
            </div>
        </div>
    );
}
