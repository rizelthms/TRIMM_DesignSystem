/** @jsx createElement */
import { createElement } from "react";
import { TrimmDatepicker } from "./TrimmDatepicker";
import { TrimmDatepickerContainerProps, TrimmDatepickerPreviewProps } from "../typings/TrimmDatepickerProps";
import { ValueStatus, EditableValue } from "mendix";

export function preview(props: TrimmDatepickerPreviewProps) {
    const previewProps: TrimmDatepickerContainerProps = {
        name: "preview",
        class: props.class,
        style: props.styleObject,
        sampleText: "Sample Text",
        selectedDate: {
            value: new Date("2025-05-28"),
            status: ValueStatus.Available,
            isList: false,
            displayValue: "2025-05-28",
            validation: "",
            formatter: undefined,
            setValue: () => {},
            setTextValue: () => {},
            setTextValueWithCallback: () => {},
            setValueWithCallback: () => {},
            setFormatter: () => {},
            readOnly: false,
            setValidator: () => {}
        } as unknown as EditableValue<Date>,
        onDateChange: undefined // No-op in preview
    };

    return <TrimmDatepicker {...previewProps} />;
}
