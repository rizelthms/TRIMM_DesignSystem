/** @jsx createElement */
import { createElement, useState, useRef } from "react";
import { TrimmMultiDatepickerContainerProps } from "../typings/TrimmMultiDatepickerProps";
import "./ui/TrimmMultiDatepicker.css";
import {
    addMonths, format, startOfMonth, endOfMonth,
    startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parse
} from "date-fns";
import enUS from "date-fns/locale/en-US";
import nl from "date-fns/locale/nl";

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

function parseDatesFromString(dateString: string) {
    if (!dateString || dateString.trim() === "") return [];
    return dateString
        .split(",")
        .map(str => parse(str.trim(), "yyyy-MM-dd", new Date()))
        .filter(d => d instanceof Date && !isNaN(d.getTime()));
}

export function TrimmMultiDatepicker({
    selectedDatesList,
    selectedDateToToggle,
    onToggleDate,
    class: className,
    style,
    showIcon,
    locale
}: TrimmMultiDatepickerContainerProps) {
    console.log("TrimmMultiDatepicker loaded", {
        selectedDatesList,
        selectedDateToToggle,
        onToggleDate
    });
    const [showCalendar, setShowCalendar] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const inputRef = useRef<HTMLInputElement>(null);

    const currentSelectedDates = parseDatesFromString(selectedDatesList?.value ?? "");
    const localeObj = getLocale(locale);

    const isDateSelected = (date: Date) =>
        currentSelectedDates.some(selected => isSameDay(selected, date));

    const handleDateClick = (date: Date) => {
        console.log("[MultiDatepicker] Clicked date:", date, format(date, "yyyy-MM-dd"));
        if (
            selectedDateToToggle &&
            typeof selectedDateToToggle.setValue === "function"
        ) {
            console.log("[MultiDatepicker] Setting selectedDateToToggle to", format(date, "yyyy-MM-dd"));
            selectedDateToToggle.setValue(format(date, "yyyy-MM-dd"));
        } else {
            console.warn("[MultiDatepicker] selectedDateToToggle.setValue not available!", selectedDateToToggle);
        }

        if (onToggleDate && onToggleDate.canExecute && !onToggleDate.isExecuting) {
            console.log("[MultiDatepicker] Executing onToggleDate action");
            onToggleDate.execute();
        } else {
            console.warn("[MultiDatepicker] onToggleDate is not executable:", onToggleDate);
        }
    };

    const inputValue =
        currentSelectedDates.length === 0
            ? ""
            : currentSelectedDates.map(d => format(d, "yyyy-MM-dd")).join(", ");

    console.log("SelectedDatesList.value in render:", selectedDatesList?.value);

    return (
        <div className={`trimm-multidatepicker ${className || ""}`} style={style}>
            <div className="trimm-multidatepicker-input-wrapper" onClick={() => setShowCalendar(prev => !prev)}>
                {showIcon && <span className="glyphicon glyphicon-calendar trimm-multidatepicker-icon" />}
                <input
                    type="text"
                    readOnly
                    className="trimm-multidatepicker-input"
                    value={inputValue}
                    placeholder="Select dates"
                    ref={inputRef}
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

                days.push(
                    <div
                        className={`trimm-multidatepicker-cell
                            ${!isSameMonth(day, monthStart) ? "disabled" : ""}
                            ${isSelected ? "selected" : ""}
                            ${isToday ? "today" : ""}`}
                        key={day.toString()}
                        onClick={() => {
                            console.log(
                                "[MultiDatepicker DEBUG] onClick fired for",
                                cloneDay,
                                "index",
                                i,
                                "row",
                                rows.length
                            );
                            try {
                                handleDateClick(cloneDay);
                            } catch (e) {
                                console.error("[MultiDatepicker DEBUG] handleDateClick threw error:", e);
                            }
                        }}
                        style={{ cursor: "pointer", userSelect: "none" }}
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
