/** @jsx createElement */
import { createElement, useState } from "react";
import { TrimmDatepicker } from "./TrimmDatepicker";
import { TrimmDatepickerPreviewProps } from "../typings/TrimmDatepickerProps";
import { ValueStatus, EditableValue } from "mendix";

/**
 * TRIMM Design System - Datepicker Preview Component
 * 
 * This file contains the preview component for the TRIMM Datepicker widget
 * in Mendix Studio Pro. It provides a visual representation of the widget
 * during development and design time.
 * 
 * Features:
 * - Simplified widget preview for Studio Pro
 * - Mock data for realistic preview
 * - Consistent styling with production widget
 * - Helper functions for date manipulation
 */

// Helper for min/max dates to create realistic preview constraints
function daysFromNow(days: number) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
}

export function preview(props: TrimmDatepickerPreviewProps) {
    const [date, setDate] = useState(new Date());

    const previewProps = {
        ...props,
        name: "TrimmDatepicker",
        onChange: undefined,
        style: props.styleObject || {},
        selectedDate: {
            value: date,
            status: ValueStatus.Available,
            isList: false,
            displayValue: date.toDateString(),
            validation: "",
            formatter: undefined,
            setValue: (newDate: Date) => setDate(newDate),
            setTextValue: () => { },
            setTextValueWithCallback: () => { },
            setValueWithCallback: (newDate: Date, callback: () => void) => {
                setDate(newDate);
                callback();
            },
            setFormatter: () => { },
            readOnly: false,
            setValidator: () => { }
        } as unknown as EditableValue<Date>,
        minDate: {
            value: daysFromNow(-5),
            status: ValueStatus.Available,
            displayValue: "",
            setValue: () => { }
        } as unknown as EditableValue<Date>,
        maxDate: {
            value: daysFromNow(5),
            status: ValueStatus.Available,
            displayValue: "",
            setValue: () => { }
        } as unknown as EditableValue<Date>
    };

    return <TrimmDatepicker {...previewProps} />;
}
