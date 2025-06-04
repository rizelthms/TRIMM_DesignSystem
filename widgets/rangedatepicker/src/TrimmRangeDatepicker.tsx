import { ReactElement, createElement } from "react";
import { HelloWorldSample } from "./components/HelloWorldSample";

import { TrimmRangeDatepickerContainerProps } from "../typings/TrimmRangeDatepickerProps";

import "./ui/TrimmRangeDatepicker.css";

export function TrimmRangeDatepicker({ sampleText }: TrimmRangeDatepickerContainerProps): ReactElement {
    return <HelloWorldSample sampleText={sampleText ? sampleText : "World"} />;
}
