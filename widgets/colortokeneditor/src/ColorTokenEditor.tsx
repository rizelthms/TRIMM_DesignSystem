import React, { createElement } from "react";

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

const TokenEditor: React.FC = () => {
    const [tokens, setTokens] = React.useState<Token[]>([]);
    const [theme, setTheme] = React.useState<"light" | "dark">(getCurrentTheme());
    const [overrides, setOverridesState] = React.useState<Overrides>(getOverrides(theme));
    const prevThemeRef = React.useRef<"light" | "dark">(getCurrentTheme());

    React.useEffect(() => {
        function handleThemeChange() {
            const currentTheme = getCurrentTheme();
            const prevTheme = prevThemeRef.current;
            if (prevTheme !== currentTheme) {
                // Clear previous theme's overrides
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
        // Always set the light override
        const lightOverrides = { ...getOverrides("light"), [token]: value };
        setOverrides("light", lightOverrides);
        // Always auto-derive and set the dark override
        const derived = deriveDarkColor(value);
        const darkOverrides = { ...getOverrides("dark"), [token]: derived };
        setOverrides("dark", darkOverrides);
        // Apply the correct override for the current theme
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

    return (
        <div className="color-token-editor-widget">
            <h3>Color Token Editor</h3>
            {tokens.length === 0 ? (
                <div style={{ color: "#b00", marginBottom: 12 }}>
                    No valid tokens found. Check your theme build output.
                </div>
            ) : (
                tokens.map(t => (
                    <div key={t.name} className="color-token-row">
                        <label className="color-token-label">{t.name}</label>
                        <input
                            type="color"
                            value={getValidHex(overrides[t.name] || t.value)}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(t.name, e.target.value)}
                            className="color-token-color-input"
                        />
                    </div>
                ))
            )}
            <button onClick={handleReset} className="color-token-reset-btn">Reset</button>
        </div>
    );
};

export default TokenEditor;