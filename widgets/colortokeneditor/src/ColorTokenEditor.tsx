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
 * - localStorage persistence for theme overrides
 * - JSON import/export for theme sharing
 * - Accessibility compliance with ARIA support
 * 
 * Architecture:
 * - Scans loaded stylesheets for TRIMM design tokens
 * - Applies overrides via CSS custom properties on document root
 * - Manages theme state with localStorage persistence
 * - Supports multiple widget instances independently
 */

// --- minimal types/utilities for theme save ---
const THEMES_INDEX_KEY = "DS_Themes_Index";
const THEME_PREFIX = "DS_Theme_";
const THEME_VERSION = "1.0.0";

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

// LocalStorage keys for persisting widget state
const PALETTE_POS_KEY = "colorTokenEditorPalettePos";
const DRAWER_WIDTH_KEY = "colorTokenEditorDrawerWidth";
const DEFAULT_DRAWER_WIDTH = 340;

// Clamp a given position to the current viewport so the FAB stays visible
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

function areOverridesEqual(a: Overrides, b: Overrides): boolean {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    for (const key of aKeys) {
        if (a[key] !== b[key]) return false;
    }
    return true;
}

/**
 * Theme Management Functions
 */

/**
 * Gets the list of saved theme names
 */
function getSavedThemeNames(): string[] {
    try {
        return JSON.parse(localStorage.getItem(THEMES_INDEX_KEY) || "[]") as string[];
    } catch {
        return [];
    }
}

/**
 * Saves the current theme state with a given name
 */
function saveTheme(name: string, _description?: string, explicitLight?: Overrides, explicitDark?: Overrides): boolean {
    try {
        const now = new Date().toISOString();
        const themeData = localStorage.getItem(`${THEME_PREFIX}${name}`);
        const existingTheme: SavedTheme | null = themeData ? JSON.parse(themeData) : null;

        const theme: SavedTheme = {
            name,
            version: THEME_VERSION,
            light: sanitizeOverrides(explicitLight ?? getOverrides("light")),
            dark: sanitizeOverrides(explicitDark ?? getOverrides("dark")),
            createdAt: existingTheme?.createdAt || now,
            updatedAt: now
        };

        localStorage.setItem(`${THEME_PREFIX}${name}`, JSON.stringify(theme));

        const themeNames = getSavedThemeNames();
        if (!themeNames.includes(name)) {
            themeNames.push(name);
            localStorage.setItem(THEMES_INDEX_KEY, JSON.stringify(themeNames));
        }

        return true;
    } catch {
        return false;
    }
}

/**
 * Loads a saved theme by name
 */
function loadTheme(name: string): boolean {
    try {
        const themeData = localStorage.getItem(`${THEME_PREFIX}${name}`);
        if (!themeData) return false;

        const theme: SavedTheme = JSON.parse(themeData);

        // Replace both light and dark overrides stores and clear DOM props first
        const tokenNames = Array.from(document.styleSheets) ? Object.keys(theme.light).concat(Object.keys(theme.dark)) : [];
        removeTokenProperties(Array.from(new Set(tokenNames)));
        setOverrides("light", sanitizeOverrides(theme.light));
        setOverrides("dark", sanitizeOverrides(theme.dark));

        const currentTheme = getCurrentTheme();
        applyOverrides(currentTheme === "dark" ? theme.dark : theme.light);
        return true;
    } catch {
        return false;
    }
}

/**
 * Deletes a saved theme
 */
function deleteTheme(name: string): boolean {
    try {
        // Remove theme data
        localStorage.removeItem(`${THEME_PREFIX}${name}`);

        // Update theme index
        const themeNames = getSavedThemeNames();
        const updatedNames = themeNames.filter(n => n !== name);
        localStorage.setItem(THEMES_INDEX_KEY, JSON.stringify(updatedNames));

        return true;
    } catch {
        return false;
    }
}

/**
 * Exports a theme to JSON format
 */
function exportTheme(name: string): string | null {
    try {
        const themeData = localStorage.getItem(`${THEME_PREFIX}${name}`);
        if (!themeData) return null;

        const theme: SavedTheme = JSON.parse(themeData);
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

        return JSON.stringify(exportData, null, 2);
    } catch {
        return null;
    }
}

/**
 * Imports a theme from JSON format
 */
function importTheme(jsonData: string): { success: boolean; error?: string } {
    try {
        const data: ThemeExport = JSON.parse(jsonData);

        if (!data.theme || !data.theme.name || !data.theme.light || !data.theme.dark) {
            return { success: false, error: "Invalid theme format" };
        }

        const light = sanitizeOverrides(data.theme.light);
        const dark = sanitizeOverrides(data.theme.dark);

        const success = saveTheme(data.theme.name, undefined, light, dark);
        return { success, error: success ? undefined : "Failed to save imported theme" };
    } catch (error) {
        return { success: false, error: "Invalid JSON format" };
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

    // Use injected getTokens or fallback to automatic discovery
    const tokens = (getTokens ?? getAllCSSCustomProperties)();
    const [theme, setTheme] = React.useState<"light" | "dark">(getCurrentTheme());
    const [overrides, setOverridesState] = React.useState<Overrides>(getOverrides(theme));
    const prevThemeRef = useRef<"light" | "dark">(getCurrentTheme());
    const [open, setOpen] = useState(false);

    // Theme management state
    const [savedThemes, setSavedThemes] = useState<string[]>(getSavedThemeNames());
    const [selectedTheme, setSelectedTheme] = useState<string>("");
    const [newThemeName, setNewThemeName] = useState<string>("");
    const [showImportModal, setShowImportModal] = useState(false);
    const [themeMessage, setThemeMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [activeThemeName, setActiveThemeName] = useState<string>("default");



    // Draggable FAB state
    const [fabPos, setFabPos] = useState<{ x: number; y: number }>(() => {
        const buttonSize = 48;
        const margin = 24;
        // Side-aware default position
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

    // Keep FAB in view when the window resizes
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

    // Detect active theme name on mount based on stored overrides matching a saved theme
    useEffect(() => {
        try {
            const names = getSavedThemeNames();
            const currentLight = sanitizeOverrides(getOverrides("light"));
            const currentDark = sanitizeOverrides(getOverrides("dark"));
            for (const name of names) {
                const raw = localStorage.getItem(`${THEME_PREFIX}${name}`);
                if (!raw) continue;
                const saved: SavedTheme = JSON.parse(raw);
                if (areOverridesEqual(sanitizeOverrides(saved.light || {}), currentLight) &&
                    areOverridesEqual(sanitizeOverrides(saved.dark || {}), currentDark)) {
                    setActiveThemeName(name);
                    return;
                }
            }
            setActiveThemeName("default");
        } catch {
            setActiveThemeName("default");
        }
        // run once on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

        const success = saveTheme(newThemeName.trim());
        if (success) {
            setSavedThemes(getSavedThemeNames());
            setNewThemeName("");
            setThemeMessage({ type: "success", text: `Theme "${newThemeName}" saved successfully` });
        } else {
            setThemeMessage({ type: "error", text: "Failed to save theme" });
        }
    }

    function handleSaveChanges() {
        if (!selectedTheme) {
            setThemeMessage({ type: "error", text: "No theme selected to save changes to" });
            return;
        }

        const success = saveTheme(selectedTheme);
        if (success) {
            setThemeMessage({ type: "success", text: `Changes saved to "${selectedTheme}"` });
        } else {
            setThemeMessage({ type: "error", text: "Failed to save changes" });
        }
    }

    function handleLoadTheme() {
        if (!selectedTheme) {
            setThemeMessage({ type: "error", text: "Please select a theme to load" });
            return;
        }

        if (selectedTheme === "default") {
            // Reset to default TRIMM design system
            resetOverrides(tokens, "light");
            resetOverrides(tokens, "dark");
            setOverridesState({});
            setActiveThemeName("default");
            setThemeMessage({ type: "success", text: "Default TRIMM theme loaded" });
            return;
        }

        const success = loadTheme(selectedTheme);
        if (success) {
            setOverridesState(getOverrides(getCurrentTheme()));
            setActiveThemeName(selectedTheme);
            setThemeMessage({ type: "success", text: `Theme "${selectedTheme}" loaded successfully` });
        } else {
            setThemeMessage({ type: "error", text: "Failed to load theme" });
        }
    }

    function handleDeleteTheme() {
        if (!selectedTheme) {
            setThemeMessage({ type: "error", text: "Please select a theme to delete" });
            return;
        }

        if (window.confirm(`Are you sure you want to delete theme "${selectedTheme}"?`)) {
            const deletingActive = selectedTheme === activeThemeName;
            const success = deleteTheme(selectedTheme);
            if (success) {
                setSavedThemes(getSavedThemeNames());
                setSelectedTheme("");
                setThemeMessage({ type: "success", text: `Theme "${selectedTheme}" deleted successfully` });

                // Fallback to default if the deleted theme was effectively active
                if (deletingActive) {
                    // Clear inline properties so CSS defaults (Default TRIMM) apply immediately
                    const tokenNames = new Set<string>([...Object.keys(getOverrides("light")), ...Object.keys(getOverrides("dark"))]);
                    removeTokenProperties(Array.from(tokenNames));
                    setOverrides("light", {});
                    setOverrides("dark", {});
                    setOverridesState({});
                    setActiveThemeName("default");
                    setThemeMessage({ type: "success", text: "Default TRIMM theme restored" });
                }
            } else {
                setThemeMessage({ type: "error", text: "Failed to delete theme" });
            }
        }
    }

    function handleExportTheme() {
        if (!selectedTheme) {
            setThemeMessage({ type: "error", text: "Please select a theme to export" });
            return;
        }

        // Special handling: export Default TRIMM from computed values
        if (selectedTheme === "default") {
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

        const exportData = exportTheme(selectedTheme);
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
            const result = importTheme(text);
            if (result.success) {
                setSavedThemes(getSavedThemeNames());
                setShowImportModal(false);
                setThemeMessage({ type: "success", text: "Theme imported successfully" });
            } else {
                setThemeMessage({ type: "error", text: result.error || "Failed to import theme" });
            }
            const input = document.getElementById("trimm-theme-file-input") as HTMLInputElement | null;
            if (input) input.value = "";
        };
        reader.onerror = () => {
            setThemeMessage({ type: "error", text: "Failed to read file" });
            const input = document.getElementById("trimm-theme-file-input") as HTMLInputElement | null;
            if (input) input.value = "";
        };
        reader.readAsText(file);
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
                            <option value="default">Default TRIMM</option>
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
                            disabled={!selectedTheme || selectedTheme === "default"}
                            aria-label="Update selected theme"
                        >
                            Update theme
                        </button>
                        <button
                            className="trimm-button btn-danger trimm-button-small"
                            onClick={handleDeleteTheme}
                            type="button"
                            disabled={!selectedTheme || selectedTheme === "default"}
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