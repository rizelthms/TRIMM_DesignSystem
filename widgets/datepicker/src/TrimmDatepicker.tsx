import { ReactElement, createElement } from "react";
import { HelloWorldSample } from "./components/HelloWorldSample";

import { TrimmDatepickerContainerProps } from "../typings/TrimmDatepickerProps";

import "./ui/TrimmDatepicker.css";

export function TrimmDatepicker({ sampleText }: TrimmDatepickerContainerProps): ReactElement {
    return <HelloWorldSample sampleText={sampleText ? sampleText : "World"} />;
}
