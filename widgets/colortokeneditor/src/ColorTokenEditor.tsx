import { ReactElement, createElement } from "react";
import { HelloWorldSample } from "./components/HelloWorldSample";

import { ColorTokenEditorContainerProps } from "../typings/ColorTokenEditorProps";

import "./ui/ColorTokenEditor.css";

export function ColorTokenEditor({ sampleText }: ColorTokenEditorContainerProps): ReactElement {
    return <HelloWorldSample sampleText={sampleText ? sampleText : "World"} />;
}
