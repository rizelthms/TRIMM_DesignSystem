/**
 * This file was generated from TrimmDatepicker.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, EditableValue } from "mendix";

export interface TrimmDatepickerContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    selectedDate?: EditableValue<Date>;
    minDate?: EditableValue<Date>;
    maxDate?: EditableValue<Date>;
    onChange?: ActionValue;
    showIcon: boolean;
    locale: string;
}

export interface TrimmDatepickerPreviewProps {
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
    selectedDate: string;
    minDate: string;
    maxDate: string;
    onChange: {} | null;
    showIcon: boolean;
    locale: string;
}
