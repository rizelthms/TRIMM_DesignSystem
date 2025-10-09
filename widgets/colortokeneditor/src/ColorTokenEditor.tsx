import React, { createElement, useState, useRef, useEffect } from "react";

/**
 * TRIMM Design System - Color Token Editor Widget
 *
 * A Mendix pluggable widget that enables runtime editing of CSS custom properties
 * (design tokens) for the TRIMM Design System. This widget provides a comprehensive
 * theming solution that allows users to customize theme colors without code changes
 * or application restarts.
 *
 * Key Features:
 * - Real-time color token editing with live preview
 * - Light/dark theme support with automatic derivation
 * - Theme management (save, load, export, import, delete)
 * - Draggable floating action button for easy access
 * - Resizable drawer interface for optimal workspace
 * - Mendix database persistence for themes and user preferences
 * - JSON import/export for theme sharing
 * - Accessibility compliance with ARIA support
 *
 * Architecture:
 * - Scans loaded stylesheets for TRIMM design tokens
 * - Applies overrides via CSS custom properties on document root
 * - Manages theme state with Mendix database persistence via mx.data API
 * - Active theme persists via User association (security ON) or a system-wide record (security OFF)
 * - Supports multiple widget instances independently
 */

// --- minimal types/utilities for theme save ---
const THEME_VERSION = "1.0.0";
const DEFAULT_TRIMM_NAME = "Default TRIMM";
// Special record used when app security is OFF (no user session). Stores the system-wide active theme.
const SYSTEM_ACTIVE_THEME_RECORD = "__SYSTEM_ACTIVE_THEME__";

type Token = {
    name: string;
    value: string;
};

type Overrides = Record<string, string>;

type SavedTheme = {
    name: string;
    version: string;
    light: Overrides;
    dark: Overrides;
    createdAt: string;
    updatedAt: string;
};

type ThemeExport = {
    metadata: {
        version: string;
        exportedAt: string;
        source: string;
    };
    theme: SavedTheme;
};

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
        // Skip Mendix widget stylesheets to avoid conflicts with TRIMM design system tokens
        if (sheet.href && sheet.href.includes('widgets.css')) continue;

        let rules: CSSRuleList | undefined;
        try {
            rules = sheet.cssRules;
        } catch (e) {
            // Skip cross-origin stylesheets that cannot be accessed due to CORS restrictions
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
                    // Match TRIMM Design System token patterns for brand, base, secondary, and support colors
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
 * Retrieves stored color overrides for a specific theme from localStorage (runtime cache).
 * This is a performance optimization for the editor. The database is the source of truth for saved themes.
 */
function getOverrides(theme: "light" | "dark"): Overrides {
    try {
        return JSON.parse(localStorage.getItem(`tokenOverrides_${theme}`) || "{}") as Overrides;
    } catch {
        return {};
    }
}

/**
 * Stores color overrides for a specific theme in localStorage (runtime cache).
 * This is a performance optimization for the editor. The database is the source of truth for saved themes.
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

// Remove all token properties from document style so CSS defaults apply
function removeTokenProperties(tokenNames: string[]) {
    tokenNames.forEach(name => document.documentElement.style.removeProperty(name));
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

// LocalStorage keys for persisting widget state across browser sessions
const PALETTE_POS_KEY = "colorTokenEditorPalettePos";
const DRAWER_WIDTH_KEY = "colorTokenEditorDrawerWidth";
const DEFAULT_DRAWER_WIDTH = 340;

// Clamp a given position to the current viewport so the FAB stays visible and accessible
function clampToViewport(pos: { x: number; y: number }, buttonSize = 48, padding = 8) {
    const maxX = Math.max(padding, (typeof window !== "undefined" ? window.innerWidth : 800) - buttonSize - padding);
    const maxY = Math.max(padding, (typeof window !== "undefined" ? window.innerHeight : 600) - buttonSize - padding);
    return {
        x: Math.min(Math.max(padding, pos.x), maxX),
        y: Math.min(Math.max(padding, pos.y), maxY)
    };
}

/**
 * Validates and returns a valid hex color value, with fallback
 */
export function getValidHex(value: string, fallback = "#000000"): string {
    if (/^#([0-9a-f]{3}){1,2}$/i.test(value)) return value;
    return fallback;
}

function sanitizeOverrides(source: Overrides): Overrides {
    const clean: Overrides = {};
    Object.entries(source || {}).forEach(([k, v]) => {
        if (isValidColor(v)) clean[k] = v;
    });
    return clean;
}


/**
 * Theme Management Functions - Using Mendix Database (mx.data API)
 */

/**
 * Gets the list of saved theme names from the Mendix database
 */
function getSavedThemeNames(callback: (names: string[]) => void): void {
    if (typeof window !== "undefined" && (window as any).mx) {
        const mx = (window as any).mx;
        mx.data.get({
            xpath: "//TRIMM_DesignSystem.DS_ThemeProfile",
            callback: (objs: any[]) => {
                const names = objs
                    .map((obj: any) => obj.get("Name"))
                    .filter((name: string) => name && name !== DEFAULT_TRIMM_NAME && name !== SYSTEM_ACTIVE_THEME_RECORD);
                callback(names);
            },
            error: (err: Error) => {
                console.error("Failed to load theme names from database:", err);
                callback([]);
            }
        });
    } else {
        console.warn("Mendix API not available");
        callback([]);
    }
}

/**
 * Saves the current theme state with a given name to the Mendix database
 */
function saveTheme(name: string, callback: (success: boolean) => void, _description?: string, explicitLight?: Overrides, explicitDark?: Overrides): void {
    if (typeof window === "undefined" || !(window as any).mx) {
        callback(false);
        return;
    }

    const mx = (window as any).mx;
    const now = new Date().toISOString();

    const theme: SavedTheme = {
        name,
        version: THEME_VERSION,
        light: sanitizeOverrides(explicitLight ?? getOverrides("light")),
        dark: sanitizeOverrides(explicitDark ?? getOverrides("dark")),
        createdAt: now,
        updatedAt: now
    };

    // Check if theme already exists
    mx.data.get({
        xpath: `//TRIMM_DesignSystem.DS_ThemeProfile[Name='${name}']`,
        callback: (objs: any[]) => {
            if (objs.length > 0) {
                // Update existing theme
                const obj = objs[0];
                obj.set("ColorOverrides", JSON.stringify(theme));
                mx.data.commit({
                    mxobj: obj,
                    callback: () => callback(true),
                    error: (err: Error) => {
                        console.error("Failed to update theme:", err);
                        callback(false);
                    }
                });
            } else {
                // Create new theme
                console.log("Creating new theme:", name);
                console.log("Theme data:", theme);

                mx.data.create({
                    entity: "TRIMM_DesignSystem.DS_ThemeProfile",
                    callback: (obj: any) => {
                        console.log("Theme object created, setting attributes...");
                        try {
                            obj.set("Name", name);
                            obj.set("IsDefault", false);
                            obj.set("IsDarkDefault", false);
                            obj.set("ColorOverrides", JSON.stringify(theme));
                            console.log("Attributes set, committing...");

                            mx.data.commit({
                                mxobj: obj,
                                callback: () => {
                                    console.log("Theme saved successfully:", name);
                                    callback(true);
                                },
                                error: (err: Error) => {
                                    console.error("Failed to commit theme:", err);
                                    console.error("Error details:", err.message);
                                    callback(false);
                                }
                            });
                        } catch (setError) {
                            console.error("Failed to set attributes:", setError);
                            callback(false);
                        }
                    },
                    error: (err: Error) => {
                        console.error("Failed to create theme object:", err);
                        console.error("Error details:", err.message);
                        console.error("Entity name: TRIMM_DesignSystem.DS_ThemeProfile");
                        callback(false);
                    }
                });
            }
        },
        error: (err: Error) => {
            console.error("Failed to check for existing theme:", err);
            callback(false);
        }
    });
}

/**
 * Loads a saved theme by name from the Mendix database
 */
function loadTheme(name: string, callback: (success: boolean) => void): void {
    if (typeof window === "undefined" || !(window as any).mx) {
        callback(false);
        return;
    }

    const mx = (window as any).mx;
    mx.data.get({
        xpath: `//TRIMM_DesignSystem.DS_ThemeProfile[Name='${name}']`,
        callback: (objs: any[]) => {
            if (objs.length === 0) {
                callback(false);
                return;
            }

            try {
                const obj = objs[0];
                const colorOverridesStr = obj.get("ColorOverrides");
                const theme: SavedTheme = JSON.parse(colorOverridesStr);

                // Replace both light and dark overrides stores and clear DOM props first
                const tokenNames = Object.keys(theme.light).concat(Object.keys(theme.dark));
                removeTokenProperties(Array.from(new Set(tokenNames)));
                setOverrides("light", sanitizeOverrides(theme.light));
                setOverrides("dark", sanitizeOverrides(theme.dark));

                const currentTheme = getCurrentTheme();
                applyOverrides(currentTheme === "dark" ? theme.dark : theme.light);
                callback(true);
            } catch (err) {
                console.error("Failed to parse theme data:", err);
                callback(false);
            }
        },
        error: (err: Error) => {
            console.error("Failed to load theme from database:", err);
            callback(false);
        }
    });
}

/**
 * Deletes a saved theme from the Mendix database
 * Protects Default TRIMM theme from deletion
 */
function deleteTheme(name: string, callback: (success: boolean) => void): void {
    // Protect Default TRIMM from deletion
    if (name === DEFAULT_TRIMM_NAME) {
        console.warn("Cannot delete Default TRIMM theme");
        callback(false);
        return;
    }

    if (typeof window === "undefined" || !(window as any).mx) {
        callback(false);
        return;
    }

    const mx = (window as any).mx;
    mx.data.get({
        xpath: `//TRIMM_DesignSystem.DS_ThemeProfile[Name='${name}']`,
        callback: (objs: any[]) => {
            if (objs.length === 0) {
                callback(false);
                return;
            }

            mx.data.remove({
                guid: objs[0].getGuid(),
                callback: () => callback(true),
                error: (err: Error) => {
                    console.error("Failed to delete theme:", err);
                    callback(false);
                }
            });
        },
        error: (err: Error) => {
            console.error("Failed to find theme for deletion:", err);
            callback(false);
        }
    });
}

/**
 * Exports a theme to JSON format from the Mendix database
 */
function exportTheme(name: string, callback: (json: string | null) => void): void {
    if (typeof window === "undefined" || !(window as any).mx) {
        callback(null);
        return;
    }

    const mx = (window as any).mx;
    mx.data.get({
        xpath: `//TRIMM_DesignSystem.DS_ThemeProfile[Name='${name}']`,
        callback: (objs: any[]) => {
            if (objs.length === 0) {
                callback(null);
                return;
            }

            try {
                const obj = objs[0];
                const colorOverridesStr = obj.get("ColorOverrides");
                const theme: SavedTheme = JSON.parse(colorOverridesStr);

                const exportData: ThemeExport = {
                    metadata: {
                        version: THEME_VERSION,
                        exportedAt: new Date().toISOString(),
                        source: "TRIMM Design System Color Token Editor"
                    },
                    theme: {
                        ...theme,
                        updatedAt: new Date().toISOString()
                    }
                };

                callback(JSON.stringify(exportData, null, 2));
            } catch (err) {
                console.error("Failed to export theme:", err);
                callback(null);
            }
        },
        error: (err: Error) => {
            console.error("Failed to find theme for export:", err);
            callback(null);
        }
    });
}

/**
 * Imports a theme from JSON format to the Mendix database
 */
function importTheme(jsonData: string, callback: (result: { success: boolean; error?: string }) => void): void {
    try {
        const data: ThemeExport = JSON.parse(jsonData);

        if (!data.theme || !data.theme.name || !data.theme.light || !data.theme.dark) {
            callback({ success: false, error: "Invalid theme format" });
            return;
        }

        const light = sanitizeOverrides(data.theme.light);
        const dark = sanitizeOverrides(data.theme.dark);

        saveTheme(data.theme.name, (success) => {
            callback({ success, error: success ? undefined : "Failed to save imported theme" });
        }, undefined, light, dark);
    } catch (error) {
        callback({ success: false, error: "Invalid JSON format" });
    }
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

    // Use injected getTokens function or fallback to automatic CSS token discovery
    const tokens = (getTokens ?? getAllCSSCustomProperties)();
    const [theme, setTheme] = React.useState<"light" | "dark">(getCurrentTheme());
    const [overrides, setOverridesState] = React.useState<Overrides>(getOverrides(theme));
    const prevThemeRef = useRef<"light" | "dark">(getCurrentTheme());
    const [open, setOpen] = useState(false);

    // Theme management state for save, load, export, import, and delete functionality
    const [savedThemes, setSavedThemes] = useState<string[]>([]);
    const [selectedTheme, setSelectedTheme] = useState<string>("");
    const [newThemeName, setNewThemeName] = useState<string>("");
    const [showImportModal, setShowImportModal] = useState(false);
    const [themeMessage, setThemeMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [activeThemeName, setActiveThemeName] = useState<string>("default");

    // Load saved themes from database on mount to populate the dropdown
    useEffect(() => {
        getSavedThemeNames(names => {
            setSavedThemes(names);
        });
    }, []);



    // Draggable FAB state for position persistence and viewport clamping
    const [fabPos, setFabPos] = useState<{ x: number; y: number }>(() => {
        const buttonSize = 48;
        const margin = 24;
        // Side-aware default position based on drawer position preference
        const defaultPos = {
            x: normalizedSide === "right"
                ? Math.max(margin, (typeof window !== "undefined" ? window.innerWidth : 800) - margin - buttonSize)
                : margin,
            y: margin
        };
        try {
            const saved = localStorage.getItem(PALETTE_POS_KEY);
            const initial = saved ? JSON.parse(saved) : defaultPos;
            return clampToViewport(initial, buttonSize, 8);
        } catch {
            return clampToViewport(defaultPos, buttonSize, 8);
        }
    });
    const dragging = useRef(false);
    const offset = useRef({ x: 0, y: 0 });

    // Resizable drawer state for width persistence and user customization
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

    // Keep FAB in view when the window resizes to maintain accessibility
    useEffect(() => {
        function onResize() {
            setFabPos(prev => clampToViewport(prev));
        }
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(DRAWER_WIDTH_KEY, String(drawerWidth));
        } catch { }
    }, [drawerWidth]);

    // Mouse drag handlers for FAB positioning
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

    // Touch support for FAB positioning
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

    // Cleanup all document-level event listeners on unmount
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

    // Theme change detection (light/dark mode)
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

        // Watch for theme changes via data-theme attribute on document element
        const observer = new MutationObserver(() => {
            handleThemeChange();
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
        return () => observer.disconnect();
    }, []);

    // Load the active theme on mount (user association when available, otherwise system record)
    useEffect(() => {
        // Small delay helps when running locally with slow session init
        setTimeout(() => {
            loadActiveTheme();
        }, 50);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Effect to periodically check if the active theme still exists, to sync across browser tabs
    useEffect(() => {
        // Don't run this check for the default theme
        if (activeThemeName === "default" || activeThemeName === DEFAULT_TRIMM_NAME) {
            return;
        }

        const intervalId = setInterval(() => {
            console.log(`[SyncCheck] Verifying active theme '${activeThemeName}' still exists...`);
            validateActiveTheme(activeThemeName);
        }, 5000); // Check every 5 seconds

        return () => clearInterval(intervalId); // Cleanup on component unmount or when theme changes
    }, [activeThemeName]);

    // Function that checks if a theme name exists in the DB and resets if not
    function validateActiveTheme(themeName: string) {
        if (typeof window === "undefined" || !(window as any).mx) return;

        const mx = (window as any).mx;
        mx.data.get({
            xpath: `//TRIMM_DesignSystem.DS_ThemeProfile[Name='${themeName}']`,
            callback: (objs: any[]) => {
                if (objs.length === 0) {
                    console.warn(`[SyncCheck] Active theme '${themeName}' no longer exists. Resetting to default.`);
                    // The theme was deleted in another tab/browser. Reset this session.
                    const tokenNames = new Set<string>([
                        ...Object.keys(getOverrides("light")),
                        ...Object.keys(getOverrides("dark"))
                    ]);
                    removeTokenProperties(Array.from(tokenNames));
                    setOverrides("light", {});
                    setOverrides("dark", {});
                    setOverridesState({});
                    setActiveThemeName("default");
                    setThemeMessage({ type: "success", text: "Active theme was deleted elsewhere. Restored default." });
                }
            },
            error: (e: Error) => {
                console.error("[SyncCheck] Error validating active theme:", e);
            }
        });
    }

    // Function to load active theme: prefer user association; fallback to system record when no session
    function loadActiveTheme() {
        if (typeof window === "undefined" || !(window as any).mx) {
            setActiveThemeName("default");
            return;
        }
        const mx = (window as any).mx;
        const userGuid = mx.session?.getUserGuid?.();

        // If user session exists, load from user association
        if (userGuid && userGuid !== "0") {
            console.log("[ActiveTheme] Loading from user association. userGuid=", userGuid);
            mx.data.get({
                guid: userGuid,
                callback: (userObj: any) => {
                    const themeProfileGuid = userObj.get("TRIMM_DesignSystem.DS_ThemeProfile_User");
                    if (themeProfileGuid) {
                        mx.data.get({
                            guid: themeProfileGuid,
                            callback: (themeObj: any) => {
                                const themeName = themeObj.get("Name");
                                console.log("[ActiveTheme] Found user's active theme:", themeName);
                                loadTheme(themeName, success => {
                                    if (success) {
                                        setOverridesState(getOverrides(getCurrentTheme()));
                                        setActiveThemeName(themeName);
                                    } else {
                                        console.warn("[ActiveTheme] Could not load associated theme. Defaulting.");
                                        setActiveThemeName("default");
                                    }
                                });
                            },
                            error: () => setActiveThemeName("default")
                        });
                    } else {
                        console.log("[ActiveTheme] No theme associated for user. Using default.");
                        setActiveThemeName("default");
                    }
                },
                error: (err: Error) => {
                    console.error("[ActiveTheme] Failed to load user for active theme:", err);
                    setActiveThemeName("default");
                }
            });
            return;
        }

        // No user session (security off). Fallback: system-wide active theme record
        console.log("[ActiveTheme] No user session. Loading system-wide active theme.");
        mx.data.get({
            xpath: `//TRIMM_DesignSystem.DS_ThemeProfile[Name='${SYSTEM_ACTIVE_THEME_RECORD}']`,
            callback: (objs: any[]) => {
                if (objs.length === 0) {
                    console.log("[ActiveTheme] No system-wide active theme record. Using default.");
                    setActiveThemeName("default");
                    return;
                }
                try {
                    const settingsObj = objs[0];
                    const raw = settingsObj.get("ColorOverrides");
                    const parsed = JSON.parse(raw || "{}");
                    const themeName = parsed?.activeThemeName;
                    if (themeName && themeName !== "default" && themeName !== DEFAULT_TRIMM_NAME) {
                        console.log("[ActiveTheme] System-wide active theme:", themeName);
                        loadTheme(themeName, success => {
                            if (success) {
                                setOverridesState(getOverrides(getCurrentTheme()));
                                setActiveThemeName(themeName);
                            } else {
                                console.warn("[ActiveTheme] System theme not loadable. Defaulting.");
                                setActiveThemeName("default");
                            }
                        });
                    } else {
                        console.log("[ActiveTheme] System record has no active theme. Defaulting.");
                        setActiveThemeName("default");
                    }
                } catch (e) {
                    console.error("[ActiveTheme] Parse error in system record. Defaulting.", e);
                    setActiveThemeName("default");
                }
            },
            error: (err: Error) => {
                console.error("[ActiveTheme] Query system active theme failed:", err);
                setActiveThemeName("default");
            }
        });
    }

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
        try {
            localStorage.removeItem("tokenOverrides_light");
            localStorage.removeItem("tokenOverrides_dark");
        } catch { }
        const tokenNames = tokens.map(t => t.name);
        removeTokenProperties(tokenNames);
        setOverridesState({});
    }

    /**
     * Theme Management Handlers
     */
    function handleSaveTheme() {
        if (!newThemeName.trim()) {
            setThemeMessage({ type: "error", text: "Theme name is required" });
            return;
        }

        console.log("[Save] Saving theme:", newThemeName);
        saveTheme(newThemeName.trim(), success => {
            if (success) {
                getSavedThemeNames(names => {
                    setSavedThemes(names);
                });
                setNewThemeName("");
                setThemeMessage({ type: "success", text: `Theme "${newThemeName}" saved successfully. Use Load to apply it.` });
                console.log("[Save] Theme saved. Not auto-applied. Use Load to apply.");
            } else {
                setThemeMessage({ type: "error", text: "Failed to save theme" });
                console.error("[Save] Failed to save theme:", newThemeName);
            }
        });
    }

    function handleSaveChanges() {
        if (!selectedTheme) {
            setThemeMessage({ type: "error", text: "No theme selected to save changes to" });
            return;
        }

        // Protect Default TRIMM from being edited
        if (selectedTheme === DEFAULT_TRIMM_NAME) {
            setThemeMessage({ type: "error", text: "Cannot edit Default TRIMM theme" });
            return;
        }

        console.log("[Save] Saving changes to theme:", selectedTheme);
        saveTheme(selectedTheme, success => {
            if (success) {
                setThemeMessage({ type: "success", text: `Changes saved to "${selectedTheme}". Use Load to apply changes.` });
                console.log("[Save] Changes saved. Not auto-applied. Use Load to apply.");
            } else {
                setThemeMessage({ type: "error", text: "Failed to save changes" });
                console.error("[Save] Failed to save changes to theme:", selectedTheme);
            }
        });
    }

    function handleLoadTheme() {
        if (!selectedTheme) {
            setThemeMessage({ type: "error", text: "Please select a theme to load" });
            return;
        }

        const isDefault = selectedTheme === "default" || selectedTheme === DEFAULT_TRIMM_NAME;

        if (isDefault) {
            // Reset to default TRIMM design system
            resetOverrides(tokens, "light");
            resetOverrides(tokens, "dark");
            setOverridesState({});
            setActiveThemeName("default");
            persistActiveTheme(null); // Clear user or system active theme
            setThemeMessage({ type: "success", text: "Default TRIMM theme loaded" });
            return;
        }

        console.log("[Load] Loading theme:", selectedTheme);
        loadTheme(selectedTheme, success => {
            if (success) {
                setOverridesState(getOverrides(getCurrentTheme()));
                setActiveThemeName(selectedTheme);
                persistActiveTheme(selectedTheme); // Save active theme (user association or system record)
                setThemeMessage({ type: "success", text: `Theme "${selectedTheme}" loaded successfully` });
                console.log("[Load] Theme applied and persisted:", selectedTheme);
            } else {
                setThemeMessage({ type: "error", text: "Failed to load theme" });
                console.error("[Load] Failed to load theme:", selectedTheme);
            }
        });
    }

    function handleDeleteTheme() {
        if (!selectedTheme) {
            setThemeMessage({ type: "error", text: "Please select a theme to delete" });
            return;
        }

        // Protect Default TRIMM from deletion
        if (selectedTheme === DEFAULT_TRIMM_NAME || selectedTheme === "default") {
            setThemeMessage({ type: "error", text: "Cannot delete Default TRIMM theme" });
            return;
        }

        if (window.confirm(`Are you sure you want to delete theme "${selectedTheme}"?`)) {
            const deletingActive = selectedTheme === activeThemeName;
            console.log("[Delete] Deleting theme:", selectedTheme, " active=", deletingActive);

            // Show an immediate pending message
            setThemeMessage({ type: "success", text: `Deleting "${selectedTheme}"...` });

            deleteTheme(selectedTheme, success => {
                if (success) {
                    console.log("[Delete] Successfully deleted from database. Updating UI.");
                    // Refetch themes to update the dropdown
                    getSavedThemeNames(names => {
                        setSavedThemes(names);
                    });
                    setSelectedTheme(""); // Clear selection

                    // If we deleted the currently active theme, restore Default TRIMM
                    if (deletingActive) {
                        console.log("[Delete] Deleting active theme, restoring Default TRIMM...");
                        // Clear active theme from database FIRST and wait for it to complete
                        persistActiveTheme(null, () => {
                            console.log("[Delete] Active theme cleared from DB. Applying default styles.");
                            // Now that the DB is updated, reset the UI
                            const tokenNames = new Set<string>([
                                ...Object.keys(getOverrides("light")),
                                ...Object.keys(getOverrides("dark"))
                            ]);
                            removeTokenProperties(Array.from(tokenNames));
                            setOverrides("light", {});
                            setOverrides("dark", {});
                            setOverridesState({});
                            setActiveThemeName("default");
                            setThemeMessage({ type: "success", text: "Active theme was deleted. Default TRIMM restored." });
                        });
                    } else {
                        // If we deleted a non-active theme, just confirm deletion
                        setThemeMessage({ type: "success", text: `Theme "${selectedTheme}" deleted successfully` });
                    }
                } else {
                    setThemeMessage({ type: "error", text: "Failed to delete theme" });
                    console.error("[Delete] Failed to delete theme:", selectedTheme);
                }
            });
        }
    }

    function handleExportTheme() {
        if (!selectedTheme) {
            setThemeMessage({ type: "error", text: "Please select a theme to export" });
            return;
        }

        // Special handling: export Default TRIMM from computed values
        if (selectedTheme === "default" || selectedTheme === DEFAULT_TRIMM_NAME) {
            try {
                const tokenNames = tokens.map(t => t.name);

                // Helper to read computed values for a theme, ignoring overrides
                const readComputedFor = (mode: "light" | "dark"): Overrides => {
                    const prev = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
                    // Temporarily switch theme
                    if (mode === "dark") {
                        document.documentElement.setAttribute("data-theme", "dark");
                    } else {
                        document.documentElement.removeAttribute("data-theme");
                    }
                    // Read computed values
                    const style = getComputedStyle(document.documentElement);
                    const out: Overrides = {};
                    tokenNames.forEach(name => {
                        const v = style.getPropertyValue(name).trim();
                        if (isValidColor(v)) out[name] = v;
                    });
                    // Restore theme
                    if (prev === "dark") {
                        document.documentElement.setAttribute("data-theme", "dark");
                    } else {
                        document.documentElement.removeAttribute("data-theme");
                    }
                    return out;
                };

                const exportData: ThemeExport = {
                    metadata: {
                        version: THEME_VERSION,
                        exportedAt: new Date().toISOString(),
                        source: "TRIMM Design System Color Token Editor"
                    },
                    theme: {
                        name: "Default TRIMM",
                        version: THEME_VERSION,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        light: readComputedFor("light"),
                        dark: readComputedFor("dark")
                    }
                };

                const json = JSON.stringify(exportData, null, 2);
                const blob = new Blob([json], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `DefaultTRIMM-theme.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                setThemeMessage({ type: "success", text: `Default TRIMM exported` });
                return;
            } catch {
                setThemeMessage({ type: "error", text: "Failed to export Default TRIMM" });
                return;
            }
        }

        exportTheme(selectedTheme, (exportData) => {
            if (exportData) {
                // Create and download file
                const blob = new Blob([exportData], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${selectedTheme}-theme.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                setThemeMessage({ type: "success", text: `Theme "${selectedTheme}" exported successfully` });
            } else {
                setThemeMessage({ type: "error", text: "Failed to export theme" });
            }
        });
    }

    function handleImportThemeFile(file: File | null) {
        if (!file) {
            setThemeMessage({ type: "error", text: "No file selected" });
            const input = document.getElementById("trimm-theme-file-input") as HTMLInputElement | null;
            if (input) input.value = "";
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const text = String(reader.result || "");
            importTheme(text, (result) => {
                if (result.success) {
                    getSavedThemeNames((names) => {
                        setSavedThemes(names);
                    });
                    setShowImportModal(false);
                    setThemeMessage({ type: "success", text: "Theme imported successfully" });
                } else {
                    setThemeMessage({ type: "error", text: result.error || "Failed to import theme" });
                }
                const input = document.getElementById("trimm-theme-file-input") as HTMLInputElement | null;
                if (input) input.value = "";
            });
        };
        reader.onerror = () => {
            setThemeMessage({ type: "error", text: "Failed to read file" });
            const input = document.getElementById("trimm-theme-file-input") as HTMLInputElement | null;
            if (input) input.value = "";
        };
        reader.readAsText(file);
    }

    // Function to persist the active theme: prefers user association; falls back to system record
    function persistActiveTheme(themeName: string | null, callback?: () => void) {
        if (typeof window === "undefined" || !(window as any).mx) {
            callback?.();
            return;
        }
        const mx = (window as any).mx;
        const userGuid = mx.session?.getUserGuid?.();

        // If user session exists, store on user association
        if (userGuid && userGuid !== "0") {
            console.log(`[Persist] Saving active theme for user ${userGuid}:`, themeName);
            mx.data.get({
                guid: userGuid,
                callback: (userObj: any) => {
                    if (themeName) {
                        mx.data.get({
                            xpath: `//TRIMM_DesignSystem.DS_ThemeProfile[Name='${themeName}']`,
                            callback: (themes: any[]) => {
                                if (themes.length > 0) {
                                    const themeGuid = themes[0].getGuid();
                                    userObj.set("TRIMM_DesignSystem.DS_ThemeProfile_User", themeGuid);
                                    mx.data.commit({
                                        mxobj: userObj,
                                        callback: () => {
                                            console.log("[Persist] User active theme saved.");
                                            callback?.();
                                        },
                                        error: (e: Error) => {
                                            console.error("[Persist] Commit failed:", e);
                                            callback?.();
                                        }
                                    });
                                } else {
                                    console.warn("[Persist] Theme not found to associate:", themeName);
                                    callback?.();
                                }
                            },
                            error: (e: Error) => {
                                console.error("[Persist] Could not query theme to associate:", e);
                                callback?.();
                            }
                        });
                    } else {
                        userObj.set("TRIMM_DesignSystem.DS_ThemeProfile_User", null);
                        mx.data.commit({
                            mxobj: userObj,
                            callback: () => {
                                console.log("[Persist] User active theme cleared.");
                                callback?.();
                            },
                            error: (e: Error) => {
                                console.error("[Persist] Commit failed:", e);
                                callback?.();
                            }
                        });
                    }
                },
                error: (e: Error) => {
                    console.error("[Persist] Could not retrieve user:", e);
                    callback?.();
                }
            });
            return;
        }

        // Security off: persist to system-wide record
        console.log("[Persist] No user session. Saving system-wide active theme:", themeName);
        mx.data.get({
            xpath: `//TRIMM_DesignSystem.DS_ThemeProfile[Name='${SYSTEM_ACTIVE_THEME_RECORD}']`,
            callback: (objs: any[]) => {
                const payload = JSON.stringify({ activeThemeName: themeName });
                const ensureAndCommit = (obj: any) => {
                    obj.set("Name", SYSTEM_ACTIVE_THEME_RECORD);
                    obj.set("IsDefault", false);
                    obj.set("IsDarkDefault", false);
                    obj.set("ColorOverrides", payload);
                    mx.data.commit({
                        mxobj: obj,
                        callback: () => {
                            console.log("[Persist] System-wide active theme saved.");
                            callback?.();
                        },
                        error: (e: Error) => {
                            console.error("[Persist] System commit failed:", e);
                            callback?.();
                        }
                    });
                };

                if (objs.length > 0) {
                    ensureAndCommit(objs[0]);
                } else {
                    mx.data.create({
                        entity: "TRIMM_DesignSystem.DS_ThemeProfile",
                        callback: (obj: any) => ensureAndCommit(obj),
                        error: (e: Error) => {
                            console.error("[Persist] Create system record failed:", e);
                            callback?.();
                        }
                    });
                }
            },
            error: (e: Error) => {
                console.error("[Persist] Query system record failed:", e);
                callback?.();
            }
        });
    }

    // Clear theme message after 3 seconds
    useEffect(() => {
        if (themeMessage) {
            const timer = setTimeout(() => setThemeMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [themeMessage]);

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
                    ["--fab-left" as any]: `${fabPos.x}px`,
                    ["--fab-top" as any]: `${fabPos.y}px`,
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

                {/* Drawer resize handle */}
                <div
                    className={`trimm-color-token-drawer-resize-handle ${normalizedSide}`}
                    onMouseDown={onResizeMouseDown}
                    style={{ cursor: "ew-resize", pointerEvents: "auto" }}
                    aria-label="Resize color token drawer"
                    role="separator"
                />

                {/* Theme message */}
                {themeMessage && (
                    <div className={`trimm-theme-message trimm-theme-message-${themeMessage.type}`}>
                        {themeMessage.text}
                    </div>
                )}

                {/* Theme management section */}
                <div className="trimm-theme-manager">
                    {/* Row 1: create new theme */}
                    <div className="trimm-theme-compact-row" aria-label="Create theme">
                        <input
                            type="text"
                            placeholder="Theme name"
                            value={newThemeName}
                            onChange={(e) => setNewThemeName(e.target.value)}
                            className="trimm-theme-input-small"
                            aria-label="Theme name"
                        />
                        <button
                            className="trimm-button btn-cta trimm-button-small"
                            onClick={handleSaveTheme}
                            type="button"
                            aria-label="Create new theme"
                        >
                            Save new theme
                        </button>
                    </div>

                    {/* Row 2: choose theme and actions */}
                    <div className="trimm-theme-compact-row" aria-label="Manage theme">
                        <select
                            value={selectedTheme}
                            onChange={(e) => setSelectedTheme(e.target.value)}
                            className="trimm-theme-select-small"
                            aria-label="Choose theme"
                        >
                            <option value="">Choose theme...</option>
                            <option value={DEFAULT_TRIMM_NAME}>Default TRIMM</option>
                            {savedThemes.map(name => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                        <button
                            className="trimm-button btn-info trimm-button-small"
                            onClick={handleLoadTheme}
                            type="button"
                            disabled={!selectedTheme}
                            aria-label="Load selected theme"
                        >
                            Load theme
                        </button>
                        <button
                            className="trimm-button btn-success trimm-button-small"
                            onClick={handleSaveChanges}
                            type="button"
                            disabled={!selectedTheme || selectedTheme === "default" || selectedTheme === DEFAULT_TRIMM_NAME}
                            aria-label="Update selected theme"
                        >
                            Update theme
                        </button>
                        <button
                            className="trimm-button btn-danger trimm-button-small"
                            onClick={handleDeleteTheme}
                            type="button"
                            disabled={!selectedTheme || selectedTheme === "default" || selectedTheme === DEFAULT_TRIMM_NAME}
                            aria-label="Delete selected theme"
                        >
                            Delete theme
                        </button>
                    </div>

                    {/* Row 3: export/import */}
                    <div className="trimm-theme-compact-row" aria-label="Import and export">
                        <button
                            className="trimm-button btn-primary trimm-button-small"
                            onClick={handleExportTheme}
                            type="button"
                            disabled={!selectedTheme}
                            aria-label="Export selected theme to JSON"
                        >
                            Export JSON
                        </button>
                        <input
                            id="trimm-theme-file-input"
                            type="file"
                            accept="application/json,.json"
                            style={{ display: "none" }}
                            onChange={(e) => handleImportThemeFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                        />
                        <button
                            className="trimm-button btn-primary trimm-button-small"
                            type="button"
                            onClick={() => {
                                const input = document.getElementById("trimm-theme-file-input") as HTMLInputElement | null;
                                if (input) {
                                    input.value = "";
                                    input.click();
                                }
                            }}
                            aria-label="Import theme from JSON"
                        >
                            Import JSON
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

            {/* Import modal */}
            {showImportModal && (
                <div className="trimm-modal-overlay" onClick={() => setShowImportModal(false)}>
                    <div className="trimm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="trimm-modal-header">
                            <h4>Import Theme</h4>
                            <button
                                className="trimm-button btn-default"
                                onClick={() => setShowImportModal(false)}
                                type="button"
                            >
                                <span className="glyphicon glyphicon-remove" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="trimm-modal-body">
                            <input
                                type="file"
                                accept="application/json,.json"
                                onChange={(e) => handleImportThemeFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                                aria-label="Select theme JSON file"
                            />
                        </div>
                        <div className="trimm-modal-footer">
                            <button
                                className="trimm-button btn-default"
                                onClick={() => setShowImportModal(false)}
                                type="button"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Overlay for closing drawer */}
            {open && <div className="trimm-color-token-overlay" onClick={() => setOpen(false)} />}
        </div>
    );
};

export { ColorTokenEditor };