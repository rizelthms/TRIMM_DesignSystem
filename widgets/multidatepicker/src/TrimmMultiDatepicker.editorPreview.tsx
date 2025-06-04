/** @jsx createElement */
import { createElement, useState } from "react";
import { TrimmMultiDatepicker } from "./TrimmMultiDatepicker";
import { TrimmMultiDatepickerPreviewProps } from "../typings/TrimmMultiDatepickerProps";
import { ValueStatus, EditableValue } from "mendix";

// Helper for preview value
function createEditableValue(init: string): EditableValue<string> {
    const [val, setVal] = useState(init);
    return {
        value: val,
        status: ValueStatus.Available,
        displayValue: val,
        setValue: setVal,
        isList: false,
        validation: "",
        formatter: {} as any,
        setTextValue: () => { },
        setTextValueWithCallback: () => { },
        setValueWithCallback: (v: string, cb: () => void) => { setVal(v); cb(); },
        setFormatter: () => { },
        readOnly: false,
        setValidator: () => { }
    } as unknown as EditableValue<string>;
}

export function preview(props: TrimmMultiDatepickerPreviewProps) {
    // Start with empty value for preview
    const selectedDatesList = createEditableValue("");
    const selectedDateToToggle = createEditableValue("");
    return (
        <TrimmMultiDatepicker
            selectedDatesList={selectedDatesList}
            selectedDateToToggle={selectedDateToToggle}
            onToggleDate={{ canExecute: false, isExecuting: false, execute: () => { } }}
            class={props.class}
            style={props.styleObject}
            showIcon={true}
            locale="en-US"
            name={""}
        />
    );
}
