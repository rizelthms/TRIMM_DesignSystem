/**
 * TRIMM Design System - Color Token Editor Preview Component
 * 
 * This file contains the preview component for the Color Token Editor widget
 * in Mendix Studio Pro. It provides a visual representation of the widget
 * during development and design time.
 * 
 * Features:
 * - Simplified widget preview for Studio Pro
 * - FAB button positioning based on side property
 * - Drawer structure visualization
 * - Consistent styling with production widget
 */

import { createElement, ReactElement } from "react";
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
