import { ReactElement, createElement } from "react";
import { HelloWorldSample } from "./components/HelloWorldSample";
import { TrimmRangeDatepickerPreviewProps } from "../typings/TrimmRangeDatepickerProps";

export function preview({ sampleText }: TrimmRangeDatepickerPreviewProps): ReactElement {
    return <HelloWorldSample sampleText={sampleText} />;
}

export function getPreviewCss(): string {
    return require("./ui/TrimmRangeDatepicker.css");
}
