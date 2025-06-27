import { createElement, ReactElement } from "react";

export function preview({ side = "right" }: { side?: string }): ReactElement {
    const normalizedSide = (side || "right").toLowerCase() === "left" ? "left" : "right";
    return (
        <div style={{ position: "relative", minHeight: 300 }}>
            <button
                className="btn btn-info trimm-color-token-fab"
                type="button"
                aria-label="Open color token editor"
                style={{
                    position: "absolute",
                    top: 24,
                    [normalizedSide]: 24,
                    zIndex: 1001
                }}
            >
                <span className="atlas-icon atlas-icon-color-painting-palette trimm-color-token-fab-icon" />
            </button>
            <div className={`trimm-color-token-drawer ${normalizedSide}`}></div>
        </div>
    );
}

export function getPreviewCss(): string {
    return "";
}
