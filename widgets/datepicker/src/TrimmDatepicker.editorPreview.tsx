/** @jsx createElement */
import { createElement, useState } from "react";
import { TrimmDatepicker } from "./TrimmDatepicker";
import { TrimmDatepickerPreviewProps } from "../typings/TrimmDatepickerProps";
import { ValueStatus, EditableValue } from "mendix";

// Helper for min/max dates
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
