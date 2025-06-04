/** @jsx createElement */
import { createElement } from "react";
import { TrimmRangeDatePicker } from "./TrimmRangeDatepicker";
import { TrimmRangeDatepickerPreviewProps } from "../typings/TrimmRangeDatepickerProps";

export function preview(props: TrimmRangeDatepickerPreviewProps) {
    return (
        <div className="trimm-range-datepicker-preview-wrapper">
            <TrimmRangeDatePicker
                {...(props as any)}
            />
        </div>
    );
}
