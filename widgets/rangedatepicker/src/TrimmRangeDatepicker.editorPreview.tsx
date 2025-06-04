/** @jsx createElement */
import { createElement } from "react";
import { TrimmRangeDatePicker } from "./TrimmRangeDatepicker";
import { TrimmRangeDatepickerPreviewProps } from "../typings/TrimmRangeDatepickerProps";
import { EditableValue, ValueStatus, ActionValue } from "mendix";

// Create a mock EditableValue<Date> for preview rendering
function mockDateValue(date: Date): EditableValue<Date> {
    return {
        value: date,
        status: ValueStatus.Available,
        displayValue: date.toDateString(),
        isList: false,
        readOnly: false,
        validation: undefined,
        setValue: () => { },
        setTextValue: () => { },
        setTextValueWithCallback: () => { },
        setValueWithCallback: (_date: Date | undefined, cb?: () => void) => cb?.(),
        setFormatter: () => { },
        setValidator: () => { },
        formatter: undefined
    } as unknown as EditableValue<Date>;
}

export function preview(props: TrimmRangeDatepickerPreviewProps) {
    const today = new Date();
    const future = new Date();
    future.setDate(today.getDate() + 5);

    const previewProps = {
        name: "preview",
        class: props.class,
        style: props.styleObject,
        startDate: mockDateValue(today),
        endDate: mockDateValue(future),
        minDate: mockDateValue(new Date("2025-06-01")),
        maxDate: mockDateValue(new Date("2025-07-01")),
        onChange: {
            canExecute: false,
            isExecuting: false,
            execute: () => { }
        } as ActionValue
    };

    return <TrimmRangeDatePicker {...previewProps} />;
}
