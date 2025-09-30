/** @jsx createElement */
import { createElement } from "react";
import { TrimmDropdown } from "./TrimmDropdown";
import { TrimmDropdownPreviewProps, TrimmDropdownContainerProps, DropdownItemsType } from "../typings/TrimmDropdownProps";
import { ActionValue, ValueStatus, DynamicValue, WebIcon } from "mendix";

/**
 * TRIMM Design System - Dropdown Preview Component
 * 
 * This file contains the preview component for the TRIMM Dropdown widget
 * in Mendix Studio Pro. It provides a visual representation of the widget
 * during development and design time.
 * 
 * Features:
 * - Simplified widget preview for Studio Pro
 * - Mock data for realistic preview
 * - Consistent styling with production widget
 * - Helper functions for Mendix type conversion
 */
export function preview(props: TrimmDropdownPreviewProps) {
    // Convert preview icon prop to expected DynamicValue<WebIcon> format for Mendix integration
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
