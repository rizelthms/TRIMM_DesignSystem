/** @jsx createElement */
import { createElement } from "react";
import { TrimmDropdown } from "./TrimmDropdown";
import { TrimmDropdownPreviewProps } from "../../dropdown/typings/TrimmDropdownProps";

export function preview(props: TrimmDropdownPreviewProps) {
    return <TrimmDropdown {...props} name="preview" style={props.styleObject} />;
}
