import { ReactElement, createElement } from "react";
import { HelloWorldSample } from "./components/HelloWorldSample";
import { DatepickerPreviewProps } from "../typings/DatepickerProps";

export function preview({ sampleText }: DatepickerPreviewProps): ReactElement {
    return <HelloWorldSample sampleText={sampleText} />;
}

export function getPreviewCss(): string {
    return require("./ui/Datepicker.css");
}
