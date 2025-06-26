import { ReactElement, createElement } from "react";
import { HelloWorldSample } from "./components/HelloWorldSample";
import { ColorTokenEditorPreviewProps } from "../typings/ColorTokenEditorProps";

export function preview({ sampleText }: ColorTokenEditorPreviewProps): ReactElement {
    return <HelloWorldSample sampleText={sampleText} />;
}

export function getPreviewCss(): string {
    return require("./ui/ColorTokenEditor.css");
}
