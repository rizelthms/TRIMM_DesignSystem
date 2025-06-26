import { ReactElement } from "react";

export function preview(): ReactElement {
    return (
        <div className="token-editor-widget">
            <h3>Token Editor</h3>
            <div className="token-row">
                <label className="token-label">--brand-1</label>
                <input type="color" className="token-color-input" disabled value="#00172b" />
            </div>
            <div className="token-row">
                <label className="token-label">--support-2</label>
                <input type="color" className="token-color-input" disabled value="#b92025" />
            </div>
            <button className="token-reset-btn" disabled>Reset</button>
        </div>
    );
}

export function getPreviewCss(): string {
    return require("./ui/TokenEditor.css");
}
