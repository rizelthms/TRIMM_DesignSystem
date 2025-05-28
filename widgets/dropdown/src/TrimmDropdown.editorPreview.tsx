/** @jsx createElement */
import { createElement } from "react";
import { TrimmDropdown } from "./TrimmDropdown";
import { TrimmDropdownPreviewProps } from "../typings/TrimmDropdownProps";
import { ActionValue, ValueStatus, DynamicValue, WebIcon } from "mendix";

export function preview(props: TrimmDropdownPreviewProps) {
    // Convert the preview icon prop into the expected DynamicValue<WebIcon> format
    const iconForWidget: DynamicValue<WebIcon> = {
        status: ValueStatus.Available, // In preview, data is typically available
        value: props.icon || { type: "glyph", iconClass: "" } // Use the actual icon value if available, otherwise provide a default glyph
    };

    return <TrimmDropdown
        {...props}
        name="preview"
        style={props.styleObject}
        dropdownItems={props.dropdownItems.map(item => ({
            ...item,
            action: item.action ? {
                canExecute: true,
                isExecuting: false,
                execute: () => { },
                severity: "none"
            } as ActionValue<"none"> : undefined
        }))}
        icon={iconForWidget} // Pass the constructed DynamicValue
    />;
}
