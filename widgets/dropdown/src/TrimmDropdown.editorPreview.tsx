/** @jsx createElement */
import { createElement } from "react";
import { TrimmDropdown } from "./TrimmDropdown";
import { TrimmDropdownPreviewProps, TrimmDropdownContainerProps, DropdownItemsType } from "../typings/TrimmDropdownProps";
import { ActionValue, ValueStatus, DynamicValue, WebIcon } from "mendix";

/**
 * Preview component for Studio Pro
 * Shows a simplified version of the TRIMM Dropdown with mock data
 */
export function preview(props: TrimmDropdownPreviewProps) {
    // Convert preview icon prop to expected DynamicValue<WebIcon> format
    const iconForWidget: DynamicValue<WebIcon> = {
        status: ValueStatus.Available,
        value: props.icon || { type: "glyph", iconClass: "" }
    };

    const dropdownProps: TrimmDropdownContainerProps = {
        name: "preview",
        class: props.class,
        style: props.styleObject,
        caption: props.caption,
        dropdownItems: props.dropdownItems.map(item => {
            const dropdownItem: DropdownItemsType = {
                caption: item.caption,
                action: item.action ? {
                    canExecute: true,
                    isExecuting: false,
                    execute: () => { },
                    severity: "none"
                } as ActionValue<"none"> : undefined,
            };
            return dropdownItem;
        }),
        icon: iconForWidget,
        showCaretIcon: props.showCaretIcon,
    };

    return <TrimmDropdown
        {...dropdownProps}
    />;
}
