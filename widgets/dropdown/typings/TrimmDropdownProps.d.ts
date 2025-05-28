/**
 * This file was generated from TrimmDropdown.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue } from "mendix";

export interface DropdownItemsType {
    caption: string;
    action?: ActionValue;
}

export interface DropdownItemsPreviewType {
    caption: string;
    action: {} | null;
}

export interface TrimmDropdownContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    dropdownItems: DropdownItemsType[];
}

export interface TrimmDropdownPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    dropdownItems: DropdownItemsPreviewType[];
}
