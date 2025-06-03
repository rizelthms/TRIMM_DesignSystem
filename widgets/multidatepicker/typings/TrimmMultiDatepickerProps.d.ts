/**
 * This file was generated from TrimmMultiDatepicker.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { EditableValue } from "mendix";

export interface TrimmMultiDatepickerContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    selectedDates?: EditableValue<string>;
    minDate?: EditableValue<Date>;
    maxDate?: EditableValue<Date>;
    showIcon: boolean;
    locale: string;
}

export interface TrimmMultiDatepickerPreviewProps {
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
    selectedDates: string;
    minDate: string;
    maxDate: string;
    showIcon: boolean;
    locale: string;
}
