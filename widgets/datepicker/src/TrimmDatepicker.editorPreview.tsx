import { ReactElement, createElement } from "react";
import { HelloWorldSample } from "./components/HelloWorldSample";
import { TrimmDatepickerPreviewProps } from "../typings/TrimmDatepickerProps";

export function preview({ sampleText }: TrimmDatepickerPreviewProps): ReactElement {
    return <HelloWorldSample sampleText={sampleText} />;
}

export function getPreviewCss(): string {
    return require("./ui/TrimmDatepicker.css");
}
