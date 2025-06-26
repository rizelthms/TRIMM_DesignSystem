import { createElement, ReactElement } from "react";

export function preview(): ReactElement {
    return (
        <div className="color-token-editor-widget">
            <h3>Color Token Editor</h3>
            <div className="color-token-row">
                <label className="color-token-label">--brand-1</label>
                <input type="color" className="color-token-color-input" disabled value="#00172b" />
            </div>
            <div className="color-token-row">
                <label className="color-token-label">--support-2</label>
                <input type="color" className="color-token-color-input" disabled value="#b92025" />
            </div>
            <button className="color-token-reset-btn" disabled>Reset</button>
        </div>
    );
}

export function getPreviewCss(): string {
    return require("./ui/ColorTokenEditor.css");
}
