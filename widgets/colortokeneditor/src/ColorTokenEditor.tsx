import React, { createElement, useState, useRef, useEffect } from "react";

/**
 * Color Token Editor Widget
 * 
 * A Mendix pluggable widget that enables runtime editing of CSS custom properties
 * (design tokens) for the TRIMM Design System. Allows users to customize theme
 * colors without code changes or application restarts.
 */

// --- minimal types/utilities for theme save ---
const THEMES_INDEX_KEY = "DS_Themes_Index";
const THEME_PREFIX = "DS_Theme_";

type Token = {
    name: string;
    value: string;
};

type Overrides = Record<string, string>;

/**
 * Validates if a string represents a valid CSS color value
 * Supports hex (#fff, #ffffff), rgb(r,g,b), and excludes Mendix template strings
 */
export function isValidColor(value: string | undefined): boolean {
    if (!value || typeof value !== "string") return false;
    if (value.startsWith("#{") && value.endsWith("}")) return false;
    return (
        /^#[0-9a-f]{6}$/i.test(value) ||
        /^#[0-9a-f]{3}$/i.test(value) ||
        /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/i.test(value)
    );
}

/**
 * Scans all loaded stylesheets for TRIMM Design System CSS custom properties
 * Filters for valid color tokens matching TRIMM naming patterns
 */
function getAllCSSCustomProperties(): Token[] {
    const vars: Record<string, string> = {};
    for (const sheet of Array.from(document.styleSheets)) {
        // Skip Mendix widget stylesheets to avoid conflicts
        if (sheet.href && sheet.href.includes('widgets.css')) continue;

        let rules: CSSRuleList | undefined;
        try {
            rules = sheet.cssRules;
        } catch (e) {
            // Skip cross-origin stylesheets
            continue;
        }
        if (!rules) continue;

        for (const rule of Array.from(rules)) {
            if (
                (rule as CSSStyleRule).selectorText === ":root" ||
                (rule as CSSStyleRule).selectorText === "html"
            ) {
                const style = (rule as CSSStyleRule).style;
                for (let i = 0; i < style.length; i++) {
                    const name = style[i];
                    // Match TRIMM Design System token patterns
                    if (name.startsWith("--") && (
                        /^--brand-[1-9](-hover|-active|-disabled)?$/.test(name) ||
                        /^--base-(black|white)(-hover|-active|-disabled)?$/.test(name) ||
                        /^--secondary-[1-9](-hover|-active|-disabled)?$/.test(name) ||
                        /^--support-[1-9](-hover|-active|-disabled)?$/.test(name)
                    )) {
                        const value = style.getPropertyValue(name).trim();
                        if (isValidColor(value)) {
                            vars[name] = value;
                        }
                    }
                }
            }
        }
    }

    // Sort tokens by base name and state (base, hover, active, disabled)
    return Object.entries(vars)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => {
            const aBase = a.name.split('-').slice(0, -1).join('-');
            const bBase = b.name.split('-').slice(0, -1).join('-');
            if (aBase === bBase) {
                const stateOrder = { '': 0, 'hover': 1, 'active': 2, 'disabled': 3 };
                const aState = a.name.includes('-hover') ? 'hover' :
                    a.name.includes('-active') ? 'active' :
                        a.name.includes('-disabled') ? 'disabled' : '';
                const bState = b.name.includes('-hover') ? 'hover' :
                    b.name.includes('-active') ? 'active' :
                        b.name.includes('-disabled') ? 'disabled' : '';
                return stateOrder[aState] - stateOrder[bState];
            }
            return aBase.localeCompare(bBase);
        });
}

/**
 * Determines the current theme from the document's data-theme attribute
 */
function getCurrentTheme(): "light" | "dark" {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

/**
 * Retrieves stored color overrides for a specific theme from localStorage
 */
function getOverrides(theme: "light" | "dark"): Overrides {
    try {
        return JSON.parse(localStorage.getItem(`tokenOverrides_${theme}`) || "{}") as Overrides;
    } catch {
        return {};
    }
}

/**
 * Stores color overrides for a specific theme in localStorage
 */
function setOverrides(theme: "light" | "dark", overrides: Overrides) {
    try {
        localStorage.setItem(`tokenOverrides_${theme}`, JSON.stringify(overrides));
    } catch { }
}

/**
 * Applies color overrides to the document root element
 */
function applyOverrides(overrides: Overrides) {
    Object.entries(overrides).forEach(([token, value]) => {
        document.documentElement.style.setProperty(token, value);
    });
}

/**
 * Resets all overrides for a theme and restores original token values
 */
function resetOverrides(tokens: Token[], theme: "light" | "dark") {
    try {
        localStorage.removeItem(`tokenOverrides_${theme}`);
    } catch { }
    tokens.forEach((t: Token) => {
        document.documentElement.style.setProperty(t.name, t.value);
    });
}

/**
 * Derives a darker version of a light color for dark theme compatibility
 * Simple darkening algorithm - for production, consider using a color library
 */
export function deriveDarkColor(lightColor: string): string {
    let c = lightColor.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    let num = parseInt(c, 16);
    let r = Math.max(0, ((num >> 16) & 0xFF) - 40);
    let g = Math.max(0, ((num >> 8) & 0xFF) - 40);
    let b = Math.max(0, (num & 0xFF) - 40);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Derives a lighter version of a dark color for light theme compatibility
 * Simple lightening algorithm - for production, consider using a color library
 */
export function deriveLightColor(darkColor: string): string {
    let c = darkColor.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    let num = parseInt(c, 16);
    let r = Math.min(255, ((num >> 16) & 0xFF) + 40);
    let g = Math.min(255, ((num >> 8) & 0xFF) + 40);
    let b = Math.min(255, (num & 0xFF) + 40);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Removes all color overrides from the document root element
 */
function clearOverrides(overrides: Overrides) {
    Object.keys(overrides).forEach(token => {
        document.documentElement.style.removeProperty(token);
    });
}

// LocalStorage keys for persisting widget state
const PALETTE_POS_KEY = "colorTokenEditorPalettePos";
const DRAWER_WIDTH_KEY = "colorTokenEditorDrawerWidth";
const DEFAULT_DRAWER_WIDTH = 340;

/**
 * Validates and returns a valid hex color value, with fallback
 */
export function getValidHex(value: string, fallback = "#000000"): string {
    if (/^#([0-9a-f]{3}){1,2}$/i.test(value)) return value;
    return fallback;
}

import { ColorTokenEditorContainerProps } from "../typings/ColorTokenEditorProps";

export interface ColorTokenEditorProps extends Partial<ColorTokenEditorContainerProps> {
    getTokens?: () => Array<{ name: string; value: string }>;
}

/**
 * Main Color Token Editor component
 * Provides a floating action button and resizable drawer for editing theme colors
 */
const ColorTokenEditor = ({ side = "right", getTokens }: ColorTokenEditorProps) => {
    const normalizedSide = (side || "right").toLowerCase() === "left" ? "left" : "right";

    // Use injected getTokens or fallback to automatic discovery
    const tokens = (getTokens ?? getAllCSSCustomProperties)();
    const [theme, setTheme] = React.useState<"light" | "dark">(getCurrentTheme());
    const [overrides, setOverridesState] = React.useState<Overrides>(getOverrides(theme));
    const prevThemeRef = useRef<"light" | "dark">(getCurrentTheme());
    const [open, setOpen] = useState(false);

    // --- Save new theme (minimal) ---
    const [newThemeName, setNewThemeName] = useState("");
    function getSavedThemeNames(): string[] {
        try {
            return JSON.parse(localStorage.getItem(THEMES_INDEX_KEY) || "[]");
        } catch { return []; }
    }
    function handleSaveTheme() {
        const name = newThemeName.trim();
        if (!name) return;
        const themeObj = {
            name,
            version: "1.0.0",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            light: getOverrides("light"),
            dark: getOverrides("dark")
        };
        localStorage.setItem(`${THEME_PREFIX}${name}`, JSON.stringify(themeObj));
        const index = Array.from(new Set([...getSavedThemeNames(), name]));
        localStorage.setItem(THEMES_INDEX_KEY, JSON.stringify(index));
        setNewThemeName("");
    }

    // Draggable FAB state
    const [fabPos, setFabPos] = useState<{ x: number; y: number }>(() => {
        try {
            const saved = localStorage.getItem(PALETTE_POS_KEY);
            return saved ? JSON.parse(saved) : { x: 24, y: 24 };
        } catch {
            return { x: 24, y: 24 };
        }
    });
    const dragging = useRef(false);
    const offset = useRef({ x: 0, y: 0 });

    // Resizable drawer state
    const [drawerWidth, setDrawerWidth] = useState(() => {
        try {
            const saved = localStorage.getItem(DRAWER_WIDTH_KEY);
            return saved ? parseInt(saved, 10) : DEFAULT_DRAWER_WIDTH;
        } catch {
            return DEFAULT_DRAWER_WIDTH;
        }
    });
    const resizing = useRef(false);
    const startX = useRef(0);
    const startWidth = useRef(drawerWidth);

    // Persist FAB position and drawer width in localStorage
    useEffect(() => {
        try {
            localStorage.setItem(PALETTE_POS_KEY, JSON.stringify(fabPos));
        } catch { }
    }, [fabPos]);

    useEffect(() => {
        try {
            localStorage.setItem(DRAWER_WIDTH_KEY, String(drawerWidth));
        } catch { }
    }, [drawerWidth]);

    // Mouse drag handlers for FAB
    function onMouseDown(e: React.MouseEvent) {
        dragging.current = true;
        offset.current = {
            x: e.clientX - fabPos.x,
            y: e.clientY - fabPos.y
        };
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    }

    function onMouseMove(e: MouseEvent) {
        if (!dragging.current) return;
        setFabPos({
            x: Math.max(0, e.clientX - offset.current.x),
            y: Math.max(0, e.clientY - offset.current.y)
        });
    }

    function onMouseUp() {
        dragging.current = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    }

    // Touch support for FAB
    function onTouchStart(e: React.TouchEvent) {
        dragging.current = true;
        const touch = e.touches[0];
        offset.current = {
            x: touch.clientX - fabPos.x,
            y: touch.clientY - fabPos.y
        };
        document.addEventListener("touchmove", onTouchMove);
        document.addEventListener("touchend", onTouchEnd);
    }

    function onTouchMove(e: TouchEvent) {
        if (!dragging.current) return;
        const touch = e.touches[0];
        setFabPos({
            x: Math.max(0, touch.clientX - offset.current.x),
            y: Math.max(0, touch.clientY - offset.current.y)
        });
    }

    function onTouchEnd() {
        dragging.current = false;
        document.removeEventListener("touchmove", onTouchMove);
        document.removeEventListener("touchend", onTouchEnd);
    }

    // Drawer resize handlers
    function onResizeMouseDown(e: React.MouseEvent) {
        resizing.current = true;
        startX.current = e.clientX;
        startWidth.current = drawerWidth;
        document.addEventListener("mousemove", onResizeMouseMove);
        document.addEventListener("mouseup", onResizeMouseUp);
    }

    function onResizeMouseMove(e: MouseEvent) {
        if (!resizing.current) return;
        let newWidth;
        if (normalizedSide === "right") {
            newWidth = Math.max(200, Math.min(900, startWidth.current + (startX.current - e.clientX)));
        } else {
            newWidth = Math.max(200, Math.min(900, startWidth.current + (e.clientX - startX.current)));
        }
        setDrawerWidth(newWidth);
    }

    function onResizeMouseUp() {
        resizing.current = false;
        document.removeEventListener("mousemove", onResizeMouseMove);
        document.removeEventListener("mouseup", onResizeMouseUp);
    }

    // Cleanup event listeners on unmount
    useEffect(() => {
        return () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
            document.removeEventListener("touchmove", onTouchMove);
            document.removeEventListener("touchend", onTouchEnd);
            document.removeEventListener("mousemove", onResizeMouseMove);
            document.removeEventListener("mouseup", onResizeMouseUp);
        };
    }, []);

    // Theme change detection and override management
    React.useEffect(() => {
        function handleThemeChange() {
            const currentTheme = getCurrentTheme();
            const prevTheme = prevThemeRef.current;
            if (prevTheme !== currentTheme) {
                const prevOverrides = getOverrides(prevTheme);
                clearOverrides(prevOverrides);
            }
            prevThemeRef.current = currentTheme;
            setTheme(currentTheme);
            const currentOverrides = getOverrides(currentTheme);
            setOverridesState(currentOverrides);
            applyOverrides(currentOverrides);
        }

        function updateTokens() {
            handleThemeChange();
        }

        updateTokens();

        // Watch for theme changes via data-theme attribute
        const observer = new MutationObserver(() => {
            handleThemeChange();
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
        return () => observer.disconnect();
    }, []);

    /**
     * Handles color changes with automatic theme derivation
     * When user changes a color in light mode, derives a dark version and vice versa
     */
    function handleChange(token: string, value: string) {
        const currentTheme = getCurrentTheme();

        if (currentTheme === "light") {
            const lightOverrides = { ...getOverrides("light"), [token]: value };
            setOverrides("light", lightOverrides);
            const derivedDark = deriveDarkColor(value);
            const darkOverrides = { ...getOverrides("dark"), [token]: derivedDark };
            setOverrides("dark", darkOverrides);
            setOverridesState(lightOverrides);
            applyOverrides(lightOverrides);
        } else {
            const darkOverrides = { ...getOverrides("dark"), [token]: value };
            setOverrides("dark", darkOverrides);
            const derivedLight = deriveLightColor(value);
            const lightOverrides = { ...getOverrides("light"), [token]: derivedLight };
            setOverrides("light", lightOverrides);
            setOverridesState(darkOverrides);
            applyOverrides(darkOverrides);
        }
    }

    /**
     * Resets all color overrides and reloads the page to restore original theme
     */
    function handleReset() {
        resetOverrides(tokens, "light");
        resetOverrides(tokens, "dark");
        setOverridesState({});
        if (window.location.hostname !== "localhost" || window.location.port !== "") {
            window.location.reload();
        }
    }

    const paletteIcon = (
        <span className="glyphicon glyphicon-tint" aria-hidden="true" />
    );

    return (
        <div>
            {/* Draggable floating action button */}
            <button
                className="trimm-color-token-fab"
                onClick={() => setOpen(true)}
                aria-label="Open color token editor"
                type="button"
                style={{
                    position: "fixed",
                    left: fabPos.x,
                    top: fabPos.y,
                    zIndex: 1001,
                    cursor: dragging.current ? "grabbing" : "grab",
                    pointerEvents: "auto"
                }}
                onMouseDown={onMouseDown}
                onTouchStart={onTouchStart}
            >
                {paletteIcon}
            </button>

            {/* Resizable sidebar/drawer */}
            <div
                className={`trimm-color-token-drawer${open ? " open" : ""} ${normalizedSide}`}
                role="dialog"
                aria-modal="true"
                style={{ width: drawerWidth }}
            >
                <div className="trimm-color-token-drawer-header">
                    <h3>Color Token Editor</h3>
                    <button
                        className="trimm-button btn-default"
                        onClick={() => setOpen(false)}
                        aria-label="Close color token editor"
                        type="button"
                    >
                        <span className="glyphicon glyphicon-remove" aria-hidden="true" />
                    </button>
                </div>

                {/* Minimal theme toolbar: save only */}
                <div className="trimm-theme-manager">
                    <div className="trimm-theme-compact-row" aria-label="Create theme">
                        <input
                            type="text"
                            placeholder="Theme name"
                            value={newThemeName}
                            onChange={(e) => setNewThemeName(e.target.value)}
                            className="trimm-theme-input-small"
                        />
                        <button
                            className="trimm-button btn-cta trimm-button-small"
                            onClick={handleSaveTheme}
                            type="button"
                        >
                            Save new theme
                        </button>
                    </div>
                </div>

                {/* Token grid */}
                <div className="trimm-color-token-grid">
                    {tokens.length === 0 ? (
                        <div className="trimm-color-token-error">
                            No valid tokens found. Check your theme build output.
                        </div>
                    ) : (
                        tokens.map(t => (
                            <div key={t.name} className="trimm-color-token-item">
                                <span
                                    className="trimm-color-token-swatch"
                                    style={{ background: getValidHex(overrides[t.name] || t.value) }}
                                />
                                <span className="trimm-color-token-label">{t.name}</span>
                                <input
                                    type="color"
                                    value={getValidHex(overrides[t.name] || t.value)}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(t.name, e.target.value)}
                                    className="trimm-color-token-color-input"
                                />
                            </div>
                        ))
                    )}
                </div>

                <button
                    className="trimm-button btn-info"
                    onClick={handleReset}
                    type="button"
                >
                    Reset
                </button>
            </div>

            {/* Overlay for closing drawer */}
            {open && <div className="trimm-color-token-overlay" onClick={() => setOpen(false)} />}
        </div>
    );
};

export { ColorTokenEditor };