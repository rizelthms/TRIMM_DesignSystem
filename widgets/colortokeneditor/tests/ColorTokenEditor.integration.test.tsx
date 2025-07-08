import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ColorTokenEditor from "../src/ColorTokenEditor";
import React from "react";

// Mock localStorage for isolation
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; }
    };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

const mockTokens = [
    { name: "--brand-1", value: "#ff0000" },
    { name: "--brand-2", value: "#00ff00" }
];

describe("ColorTokenEditor integration", () => {
    beforeEach(() => {
        window.localStorage.clear();
        document.body.innerHTML = "";
    });

    it("renders the floating action button (FAB)", () => {
        render(<ColorTokenEditor side="right" getTokens={() => mockTokens} />);
        const fab = screen.getByRole("button", { name: /open color token editor/i });
        expect(fab).toBeInTheDocument();
    });

    it("opens and closes the drawer when FAB is clicked", async () => {
        render(<ColorTokenEditor side="right" getTokens={() => mockTokens} />);
        const fab = screen.getByRole("button", { name: /open color token editor/i });
        fireEvent.click(fab);
        expect(screen.getByRole("dialog")).toBeVisible();
        // Close via overlay
        const overlay = screen.getAllByText((_, el) => !!el && el.className.includes("trimm-color-token-overlay"))[0];
        fireEvent.click(overlay);
        await waitFor(() => {
            expect(screen.queryByRole("dialog")).not.toBeVisible();
        });
    });

    it("changes a color and updates localStorage", async () => {
        render(<ColorTokenEditor side="right" getTokens={() => mockTokens} />);
        fireEvent.click(screen.getByRole("button", { name: /open color token editor/i }));
        // Find first color input
        const colorInput = await screen.findAllByRole("textbox", { hidden: true });
        fireEvent.change(colorInput[0], { target: { value: "#123456" } });
        // Check localStorage was updated
        const theme = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
        const overrides = JSON.parse(window.localStorage.getItem(`tokenOverrides_${theme}`) || "{}");
        expect(Object.values(overrides)).toContain("#123456");
    });

    it("resets all tokens when reset button is clicked", async () => {
        render(<ColorTokenEditor side="right" getTokens={() => mockTokens} />);
        fireEvent.click(screen.getByRole("button", { name: /open color token editor/i }));
        // Change a color
        const colorInput = await screen.findAllByRole("textbox", { hidden: true });
        fireEvent.change(colorInput[0], { target: { value: "#654321" } });
        // Click reset
        fireEvent.click(screen.getByRole("button", { name: /reset/i }));
        // All overrides should be cleared
        const theme = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
        expect(window.localStorage.getItem(`tokenOverrides_${theme}`)).toBeNull();
    });

    it("persists color overrides across renders", async () => {
        const { unmount, rerender } = render(<ColorTokenEditor side="right" getTokens={() => mockTokens} />);
        fireEvent.click(screen.getByRole("button", { name: /open color token editor/i }));
        const colorInput = await screen.findAllByRole("textbox", { hidden: true });
        fireEvent.change(colorInput[0], { target: { value: "#abcdef" } });
        unmount();
        rerender(<ColorTokenEditor side="right" getTokens={() => mockTokens} />);
        fireEvent.click(screen.getByRole("button", { name: /open color token editor/i }));
        // The color input should reflect the override
        expect(((await screen.findAllByRole("textbox", { hidden: true }))[0] as HTMLInputElement).value).toBe("#abcdef");
    });

    it("has correct accessibility attributes", () => {
        render(<ColorTokenEditor side="right" getTokens={() => mockTokens} />);
        const fab = screen.getByRole("button", { name: /open color token editor/i });
        expect(fab).toHaveAttribute("aria-label");
    });
}); 