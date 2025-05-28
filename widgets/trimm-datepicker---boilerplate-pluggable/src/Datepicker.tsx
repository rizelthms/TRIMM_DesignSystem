import { ReactElement, createElement } from "react";
import { HelloWorldSample } from "./components/HelloWorldSample";

import { DatepickerContainerProps } from "../typings/DatepickerProps";

import "./ui/Datepicker.css";

export function Datepicker({ sampleText }: DatepickerContainerProps): ReactElement {
    return <HelloWorldSample sampleText={sampleText ? sampleText : "World"} />;
}
