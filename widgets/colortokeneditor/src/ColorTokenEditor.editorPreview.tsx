import { createElement, ReactElement } from "react";

/**
 * Preview component for Studio Pro
 * Shows a simplified version of the Color Token Editor with the FAB and drawer structure
 */
export function preview({ side = "right" }: { side?: string }): ReactElement {
    const normalizedSide = (side || "right").toLowerCase() === "left" ? "left" : "right";
    return (
        <div style={{ position: "relative", minHeight: 100 }}>
            <button
                className="trimm-button btn-info trimm-color-token-fab"
                type="button"
                aria-label="Open color token editor"
                style={{
                    position: "absolute",
                    top: 24,
                    [normalizedSide]: 24,
                    zIndex: 1001
                }}
            >
                <span className="glyphicon glyphicon-tint" />
            </button>
            <div className={`trimm-color-token-drawer ${normalizedSide}`}></div>
        </div>
    );
}

export function getPreviewCss(): string {
    return "";
}
