import React from "react";

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
          if (name.startsWith("--")) {
            const value = style.getPropertyValue(name).trim();
            vars[name] = value;
          }
        }
      }
    }
  }
  return Object.entries(vars)
    .filter(([_, value]) => isValidColor(value))
    .map(([name, value]) => ({ name, value }));
}

function getOverrides(): Overrides {
  try {
    return JSON.parse(localStorage.getItem("tokenOverrides") || "{}") as Overrides;
  } catch {
    return {};
  }
}

function setOverrides(overrides: Overrides) {
  localStorage.setItem("tokenOverrides", JSON.stringify(overrides));
}

function applyOverrides(overrides: Overrides) {
  Object.entries(overrides).forEach(([token, value]) => {
    document.documentElement.style.setProperty(token, value);
  });
}

function resetOverrides(tokens: Token[]) {
  localStorage.removeItem("tokenOverrides");
  tokens.forEach((t: Token) => {
    document.documentElement.style.setProperty(t.name, t.value);
  });
}

const TokenEditor: React.FC = () => {
  const [tokens, setTokens] = React.useState<Token[]>([]);
  const overrides = getOverrides();

  React.useEffect(() => {
    function updateTokens() {
      const list = getAllCSSCustomProperties();
    setTokens(list);
    applyOverrides(overrides);
    }
    updateTokens();
    const observer = new MutationObserver(() => {
      updateTokens();
    });
    observer.observe(document.documentElement, { attributes: true, childList: false, subtree: false });
    return () => observer.disconnect();
  }, []);

  function handleChange(token: string, value: string) {
    const newOverrides = { ...getOverrides(), [token]: value };
    setOverrides(newOverrides);
    applyOverrides(newOverrides);
  }

  function handleReset() {
    resetOverrides(tokens);
    window.location.reload();
  }

  return (
    <div className="token-editor-widget">
      <h3>Token Editor</h3>
      {tokens.length === 0 ? (
        <div style={{ color: "#b00", marginBottom: 12 }}>
          No valid tokens found. Check your theme build output.
        </div>
      ) : (
        tokens.map(t => (
          <div key={t.name} className="token-row">
            <label className="token-label">{t.name}</label>
          <input
            type="color"
            value={overrides[t.name] || t.value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(t.name, e.target.value)}
              className="token-color-input"
          />
        </div>
        ))
      )}
      <button onClick={handleReset} className="token-reset-btn">Reset</button>
    </div>
  );
};

export default TokenEditor;