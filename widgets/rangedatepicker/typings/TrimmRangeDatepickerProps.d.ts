/**
 * This file was generated from TrimmRangeDatepicker.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, EditableValue } from "mendix";

export interface TrimmRangeDatepickerContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    startDate: EditableValue<Date>;
    endDate: EditableValue<Date>;
    minDate?: EditableValue<Date>;
    maxDate?: EditableValue<Date>;
    onChange?: ActionValue;
    showIcon: boolean;
    locale: string;
}

export interface TrimmRangeDatepickerPreviewProps {
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
    startDate: string;
    endDate: string;
    minDate: string;
    maxDate: string;
    onChange: {} | null;
    showIcon: boolean;
    locale: string;
}
