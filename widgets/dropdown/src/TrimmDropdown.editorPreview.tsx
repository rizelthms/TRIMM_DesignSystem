/** @jsx createElement */
import { createElement } from "react";
import { TrimmDropdown } from "./TrimmDropdown";
import { TrimmDropdownPreviewProps, TrimmDropdownContainerProps, DropdownItemsType } from "../typings/TrimmDropdownProps";
import { ActionValue, ValueStatus, DynamicValue, WebIcon } from "mendix";

export function preview(props: TrimmDropdownPreviewProps) {
    // Convert the preview icon prop into the expected DynamicValue<WebIcon> format
    const iconForWidget: DynamicValue<WebIcon> = {
        status: ValueStatus.Available, // In preview, data is typically available
        value: props.icon || { type: "glyph", iconClass: "" } // Use the actual icon value if available, otherwise provide a default glyph
    };

    // We no longer have a separate caretIcon prop in the widget
    // The showCaretIcon boolean prop controls the visibility of the fixed caret icon

    const dropdownProps: TrimmDropdownContainerProps = {
        name: "preview", // Provide a static name for the preview
        class: props.class, // Use the class from preview props
        style: props.styleObject, // Use the styleObject for web widgets
        dropdownItems: props.dropdownItems.map(item => {
            const dropdownItem: DropdownItemsType = {
                caption: item.caption,
                action: item.action ? {
                    canExecute: true,
                    isExecuting: false,
                    execute: () => {},
                    severity: "none"
                } as ActionValue<"none"> : undefined,
                // We no longer have a caretIcon property on individual dropdown items
                // Removing the caretIcon from the mapped item
            };
            return dropdownItem;
        }),
        icon: iconForWidget,
        showCaretIcon: props.showCaretIcon, // Pass the showCaretIcon boolean prop
    };

    return <TrimmDropdown
        {...dropdownProps}
    />;
}
