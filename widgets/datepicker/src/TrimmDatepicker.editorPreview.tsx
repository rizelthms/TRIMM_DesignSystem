/** @jsx createElement */
import { createElement, useState } from "react";
import { TrimmDatepicker } from "./TrimmDatepicker";
import { TrimmDatepickerPreviewProps } from "../typings/TrimmDatepickerProps";
import { ValueStatus, EditableValue, DynamicValue, WebIcon } from "mendix";

export function preview(props: TrimmDatepickerPreviewProps) {
    const [date, setDate] = useState(new Date());

    const previewProps = {
        name: "preview",
        class: props.class,
        style: props.styleObject,
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
        showIcon: true,
        locale: "en-US",
        dropdownItems: [],
        icon: { status: ValueStatus.Available, value: { type: "glyph", iconClass: "" } } as DynamicValue<WebIcon>,
        caption: "",
        showCaretIcon: false
    };

    return <TrimmDatepicker {...previewProps} />;
}
