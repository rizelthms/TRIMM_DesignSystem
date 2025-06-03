/** @jsx createElement */
import { createElement, useState } from "react";
import { TrimmMultiDatepicker } from "./TrimmMultiDatepicker";
import { TrimmMultiDatepickerPreviewProps } from "../typings/TrimmMultiDatepickerProps";
import { ValueStatus, EditableValue } from "mendix";

function usePreviewMultiDateEditableValue(initialDates: string[]): EditableValue<string> {
    const [value, setValue] = useState(initialDates.join(","));

    return {
        value,
        status: ValueStatus.Available,
        displayValue: value,
        isList: false,
        validation: "",
        formatter: undefined,
        setValue: (newValue: string) => setValue(newValue),
        setTextValue: () => { },
        setTextValueWithCallback: () => { },
        setValueWithCallback: (newValue: string, callback: () => void) => {
            setValue(newValue);
            callback();
        },
        setFormatter: () => { },
        readOnly: false,
        setValidator: () => { }
    } as unknown as EditableValue<string>;
}

export function preview(props: TrimmMultiDatepickerPreviewProps) {
    // Simulate two preselected dates for preview js for now
    const initialDates = ["06/10/2025", "06/12/2025"];
    const selectedDates = usePreviewMultiDateEditableValue(initialDates);

    return (
        <TrimmMultiDatepicker
            selectedDates={selectedDates}
            class={props.class}
            style={props.styleObject}
            showIcon={true}
            name="TrimmMultiDatepicker"
        />
    );
}
