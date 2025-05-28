/** @jsx createElement */
import { createElement } from "react";
import { TrimmDropdown } from "./TrimmDropdown";
import { TrimmDropdownPreviewProps } from "../typings/TrimmDropdownProps";
import { ActionValue } from "mendix";

export function preview(props: TrimmDropdownPreviewProps) {
    return <TrimmDropdown {...props} name="preview" style={props.styleObject} dropdownItems={props.dropdownItems.map(item => ({
        ...item,
        action: item.action ? {
            canExecute: true,
            isExecuting: false,
            execute: () => { },
            severity: "none"
        } as ActionValue<"none"> : undefined
    }))} />;
}
