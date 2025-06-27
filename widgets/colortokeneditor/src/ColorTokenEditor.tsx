import React, { createElement, useState, useRef, useEffect } from "react";

type Token = {
    name: string;
    value: string;
};

type Overrides = Record<string, string>;

function isValidColor(value: string): boolean {
    if (!value || value === undefined) return false;
    if (value.includes("#{")) return false;
    if (/^#([0-9a-f]{3}){1,2}$/i.test(value)) return true;
    if (value.startsWith("rgb")) return true;
    return false;
}

function getAllCSSCustomProperties(): Token[] {
    const vars: Record<string, string> = {};
    for (const sheet of Array.from(document.styleSheets)) {
        if (sheet.href && sheet.href.includes('widgets.css')) continue;

        let rules: CSSRuleList | undefined;
        try {
            rules = sheet.cssRules;
        } catch (e) {
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

function getCurrentTheme(): "light" | "dark" {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function getOverrides(theme: "light" | "dark"): Overrides {
    try {
        return JSON.parse(localStorage.getItem(`tokenOverrides_${theme}`) || "{}") as Overrides;
    } catch {
        return {};
    }
}

function setOverrides(theme: "light" | "dark", overrides: Overrides) {
    localStorage.setItem(`tokenOverrides_${theme}`, JSON.stringify(overrides));
}

function applyOverrides(overrides: Overrides) {
    Object.entries(overrides).forEach(([token, value]) => {
        document.documentElement.style.setProperty(token, value);
    });
}

function resetOverrides(tokens: Token[], theme: "light" | "dark") {
    localStorage.removeItem(`tokenOverrides_${theme}`);
    tokens.forEach((t: Token) => {
        document.documentElement.style.setProperty(t.name, t.value);
    });
}

function deriveDarkColor(lightColor: string): string {
    // Simple darken by 20% for demonstration; for production, use a color lib
    let c = lightColor.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    let num = parseInt(c, 16);
    let r = Math.max(0, ((num >> 16) & 0xFF) - 40);
    let g = Math.max(0, ((num >> 8) & 0xFF) - 40);
    let b = Math.max(0, (num & 0xFF) - 40);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function clearOverrides(overrides: Overrides) {
    Object.keys(overrides).forEach(token => {
        document.documentElement.style.removeProperty(token);
    });
}

const PALETTE_POS_KEY = "colorTokenEditorPalettePos";
const DRAWER_WIDTH_KEY = "colorTokenEditorDrawerWidth";
const DEFAULT_DRAWER_WIDTH = 340;

const TokenEditor: React.FC<{ side?: string }> = ({ side = "right" }) => {
    const normalizedSide = (side || "right").toLowerCase() === "left" ? "left" : "right";
    const [tokens, setTokens] = React.useState<Token[]>([]);
    const [theme, setTheme] = React.useState<"light" | "dark">(getCurrentTheme());
    const [overrides, setOverridesState] = React.useState<Overrides>(getOverrides(theme));
    const prevThemeRef = useRef<"light" | "dark">(getCurrentTheme());
    const [open, setOpen] = useState(false);
    // Draggable FAB state
    const [fabPos, setFabPos] = useState<{ x: number; y: number }>(() => {
        const saved = localStorage.getItem(PALETTE_POS_KEY);
        return saved ? JSON.parse(saved) : { x: 24, y: 24 };
    });
    const dragging = useRef(false);
    const offset = useRef({ x: 0, y: 0 });

    // Resizable drawer state
    const [drawerWidth, setDrawerWidth] = useState(() => {
        const saved = localStorage.getItem(DRAWER_WIDTH_KEY);
        return saved ? parseInt(saved, 10) : DEFAULT_DRAWER_WIDTH;
    });
    const resizing = useRef(false);
    const startX = useRef(0);
    const startWidth = useRef(drawerWidth);

    // Persist FAB position
    useEffect(() => {
        localStorage.setItem(PALETTE_POS_KEY, JSON.stringify(fabPos));
    }, [fabPos]);
    // Persist drawer width
    useEffect(() => {
        localStorage.setItem(DRAWER_WIDTH_KEY, String(drawerWidth));
    }, [drawerWidth]);

    // Drag handlers for FAB
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
            newWidth = Math.max(200, Math.min(600, startWidth.current + (startX.current - e.clientX)));
        } else {
            newWidth = Math.max(200, Math.min(600, startWidth.current + (e.clientX - startX.current)));
        }
        setDrawerWidth(newWidth);
    }
    function onResizeMouseUp() {
        resizing.current = false;
        document.removeEventListener("mousemove", onResizeMouseMove);
        document.removeEventListener("mouseup", onResizeMouseUp);
    }
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
            const list = getAllCSSCustomProperties();
            setTokens(list);
            handleThemeChange();
        }
        updateTokens();
        const observer = new MutationObserver(() => {
            handleThemeChange();
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
        return () => observer.disconnect();
    }, []);

    function handleChange(token: string, value: string) {
        const lightOverrides = { ...getOverrides("light"), [token]: value };
        setOverrides("light", lightOverrides);
        const derived = deriveDarkColor(value);
        const darkOverrides = { ...getOverrides("dark"), [token]: derived };
        setOverrides("dark", darkOverrides);
        if (getCurrentTheme() === "dark") {
            setOverridesState(darkOverrides);
            applyOverrides(darkOverrides);
        } else {
            setOverridesState(lightOverrides);
            applyOverrides(lightOverrides);
        }
    }

    function handleReset() {
        resetOverrides(tokens, "light");
        resetOverrides(tokens, "dark");
        setOverridesState({});
        window.location.reload();
    }

    function getValidHex(value: string, fallback = "#000000") {
        if (/^#([0-9a-f]{3}){1,2}$/i.test(value)) return value;
        return fallback;
    }

    // Palette icon: Modern TRIMM SVG only
    const paletteIcon = (
        <svg className="trimm-color-token-fab-icon-fallback" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
            <circle cx="16" cy="16" r="15" fill="var(--brand-3, #0e808a)" stroke="var(--base-white, #fff)" strokeWidth="2" />
            <circle cx="11" cy="14" r="2" fill="var(--base-white, #fff)" />
            <circle cx="21" cy="14" r="2" fill="var(--base-white, #fff)" />
            <circle cx="13" cy="21" r="2" fill="var(--base-white, #fff)" />
            <circle cx="19" cy="21" r="2" fill="var(--base-white, #fff)" />
            <circle cx="16" cy="10" r="1.2" fill="var(--brand-2, #f37123)" />
        </svg>
    );

    return (
        <div>
            {/* Draggable floating open button */}
            <button
                className="btn btn-info trimm-color-token-fab"
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
            {/* Sidebar/Drawer */}
            <div
                className={`trimm-color-token-drawer${open ? " open" : ""} ${normalizedSide}`}
                role="dialog"
                aria-modal="true"
                style={{ width: drawerWidth }}
            >
                <div className="trimm-color-token-drawer-header">
                    <h3>Color Token Editor</h3>
                    <button
                        className="btn btn-default trimm-color-token-close"
                        onClick={() => setOpen(false)}
                        aria-label="Close color token editor"
                        type="button"
                    >
                        ×
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
                    className="btn btn-info trimm-color-token-reset-btn"
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

export default TokenEditor;