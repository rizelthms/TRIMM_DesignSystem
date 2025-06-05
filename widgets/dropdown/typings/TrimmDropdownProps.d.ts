/**
 * This file was generated from TrimmDropdown.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, DynamicValue, WebIcon } from "mendix";

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
    icon?: DynamicValue<WebIcon>;
    caption: string;
    showCaretIcon: boolean;
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
    icon: { type: "glyph"; iconClass: string; } | { type: "image"; imageUrl: string; iconUrl: string; } | { type: "icon"; iconClass: string; } | undefined;
    caption: string;
    showCaretIcon: boolean;
}
