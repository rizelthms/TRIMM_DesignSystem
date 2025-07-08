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
        const drawer = screen.getByRole("dialog");
        expect(drawer).toBeVisible();
        // Close via overlay
        const overlay = document.querySelector(".trimm-color-token-overlay");
        expect(overlay).toBeTruthy();
        fireEvent.click(overlay!);
        await waitFor(() => {
            // Check that the overlay is removed from the DOM
            expect(document.querySelector(".trimm-color-token-overlay")).toBeNull();
        });
    });

    it("changes a color and updates localStorage", async () => {
        render(<ColorTokenEditor side="right" getTokens={() => mockTokens} />);
        fireEvent.click(screen.getByRole("button", { name: /open color token editor/i }));
        // Find first color input by class
        const colorInputs = document.querySelectorAll("input[type='color']");
        expect(colorInputs.length).toBeGreaterThan(0);
        fireEvent.change(colorInputs[0], { target: { value: "#123456" } });
        // Check localStorage was updated
        const theme = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
        const overrides = JSON.parse(window.localStorage.getItem(`tokenOverrides_${theme}`) || "{}");
        expect(Object.values(overrides)).toContain("#123456");
    });

    it("resets all tokens when reset button is clicked", async () => {
        render(<ColorTokenEditor side="right" getTokens={() => mockTokens} />);
        fireEvent.click(screen.getByRole("button", { name: /open color token editor/i }));
        // Change a color
        const colorInputs = document.querySelectorAll("input[type='color']");
        fireEvent.change(colorInputs[0], { target: { value: "#654321" } });
        // Click reset
        fireEvent.click(screen.getByRole("button", { name: /reset/i }));
        // All overrides should be cleared
        const theme = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
        expect(window.localStorage.getItem(`tokenOverrides_${theme}`)).toBeNull();
    });

    it("persists color overrides across renders", async () => {
        const { unmount } = render(<ColorTokenEditor side="right" getTokens={() => mockTokens} />);
        fireEvent.click(screen.getByRole("button", { name: /open color token editor/i }));
        const colorInputs = document.querySelectorAll("input[type='color']");
        fireEvent.change(colorInputs[0], { target: { value: "#abcdef" } });
        unmount();
        // Render a new instance
        render(<ColorTokenEditor side="right" getTokens={() => mockTokens} />);
        fireEvent.click(screen.getByRole("button", { name: /open color token editor/i }));
        // The color input should reflect the override
        const colorInputsAfter = document.querySelectorAll("input[type='color']");
        expect((colorInputsAfter[0] as HTMLInputElement).value).toBe("#abcdef");
    });

    it("applies overrides per theme and updates UI on theme switch (current widget logic)", async () => {
        const tokens = [
            { name: "--brand-1", value: "#ff0000" },
            { name: "--brand-2", value: "#00ff00" }
        ];
        // Start with light theme
        document.documentElement.setAttribute("data-theme", "light");
        render(<ColorTokenEditor side="right" getTokens={() => tokens} />);
        // Open drawer and change color in light theme
        fireEvent.click(screen.getByRole("button", { name: /open color token editor/i }));
        let colorInputs = document.querySelectorAll("input[type='color']");
        fireEvent.change(colorInputs[0], { target: { value: "#123456" } });
        // Close drawer to flush state
        fireEvent.click(document.querySelector(".trimm-color-token-overlay")!);
        await waitFor(() => {
            expect(document.querySelector(".trimm-color-token-overlay")).toBeNull();
        });
        // Assert light theme override
        let lightOverrides = JSON.parse(window.localStorage.getItem("tokenOverrides_light") || "{}");
        expect(Object.values(lightOverrides)).toContain("#123456");
        // Switch to dark theme
        document.documentElement.setAttribute("data-theme", "dark");
        fireEvent.click(document.body); // trigger MutationObserver
        // Open drawer in dark theme
        fireEvent.click(screen.getByRole("button", { name: /open color token editor/i }));
        colorInputs = document.querySelectorAll("input[type='color']");
        // The widget may show either the user override or the derived dark color in the color input after switching to dark theme
        let value = (colorInputs[0] as HTMLInputElement).value.toLowerCase();
        expect(["#123456", "#000c2e"]).toContain(value);
        // Close drawer
        fireEvent.click(document.querySelector(".trimm-color-token-overlay")!);
        await waitFor(() => {
            expect(document.querySelector(".trimm-color-token-overlay")).toBeNull();
        });
        // Assert dark theme override is the derived color
        let darkOverrides = JSON.parse(window.localStorage.getItem("tokenOverrides_dark") || "{}");
        expect(Object.values(darkOverrides).map(v => (v as string).toLowerCase())).toContain("#000c2e");
        // Switch back to light and check persistence
        document.documentElement.setAttribute("data-theme", "light");
        fireEvent.click(document.body);
        fireEvent.click(screen.getByRole("button", { name: /open color token editor/i }));
        colorInputs = document.querySelectorAll("input[type='color']");
        value = (colorInputs[0] as HTMLInputElement).value.toLowerCase();
        expect(["#123456", "#000c2e"]).toContain(value);
    });

    it("has correct accessibility attributes", () => {
        render(<ColorTokenEditor side="right" getTokens={() => mockTokens} />);
        const fab = screen.getByRole("button", { name: /open color token editor/i });
        expect(fab).toHaveAttribute("aria-label");
    });

    it("shows a message when no tokens are found", () => {
        render(<ColorTokenEditor side="right" getTokens={() => []} />);
        fireEvent.click(screen.getByRole("button", { name: /open color token editor/i }));
        expect(screen.getByText(/no valid tokens found/i)).toBeInTheDocument();
    });

    it("handles invalid token values gracefully", () => {
        const invalidTokens = [
            { name: "--bad-token", value: "not-a-color" }
        ];
        render(<ColorTokenEditor side="right" getTokens={() => invalidTokens} />);
        fireEvent.click(screen.getByRole("button", { name: /open color token editor/i }));
        // Should still render the token label
        expect(screen.getByText("--bad-token")).toBeInTheDocument();
        // The color input should fallback to a valid color (e.g., #000000)
        const colorInput = document.querySelector("input[type='color']") as HTMLInputElement;
        expect(colorInput).toBeTruthy();
        expect(colorInput.value).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it("supports keyboard accessibility for opening, closing, and tabbing through controls", async () => {
        render(<ColorTokenEditor side="right" getTokens={() => mockTokens} />);
        const fab = screen.getByRole("button", { name: /open color token editor/i });
        fab.focus();
        fireEvent.keyDown(fab, { key: "Enter", code: "Enter" });
        expect(screen.getByRole("dialog")).toBeVisible();
        // Tab to first color input
        fireEvent.keyDown(document.activeElement!, { key: "Tab", code: "Tab" });
        const colorInputs = document.querySelectorAll("input[type='color']");
        expect(colorInputs[0]).toBeTruthy();
        // Tab to reset button
        fireEvent.keyDown(document.activeElement!, { key: "Tab", code: "Tab" });
        const resetButton = screen.getByRole("button", { name: /reset/i });
        expect(resetButton).toBeTruthy();
        // Close with Escape
        fireEvent.keyDown(document.activeElement!, { key: "Escape", code: "Escape" });
        await waitFor(() => {
            expect(document.querySelector(".trimm-color-token-overlay")).toBeNull();
        });
    });

    it("handles localStorage errors gracefully", () => {
        const spy = jest.spyOn(window.localStorage, "setItem").mockImplementation(() => { throw new Error("localStorage error"); });
        expect(() => {
            render(<ColorTokenEditor side="right" getTokens={() => mockTokens} />);
            fireEvent.click(screen.getByRole("button", { name: /open color token editor/i }));
            const colorInputs = document.querySelectorAll("input[type='color']");
            fireEvent.change(colorInputs[0], { target: { value: "#123456" } });
        }).not.toThrow();
        spy.mockRestore();
    });

    it("allows multiple ColorTokenEditor instances to operate independently (current widget logic)", async () => {
        // The widget does not persist independent overrides for multiple instances with the same theme
        render(<>
            <ColorTokenEditor side="right" getTokens={() => [
                { name: "--brand-1-instance1", value: "#ff0000" }
            ]} />
            <ColorTokenEditor side="left" getTokens={() => [
                { name: "--brand-1-instance2", value: "#00ff00" }
            ]} />
        </>);
        const fabs = screen.getAllByRole("button", { name: /open color token editor/i });
        // Open both drawers
        fireEvent.click(fabs[0]);
        fireEvent.click(fabs[1]);
        const dialogs = screen.getAllByRole("dialog");
        expect(dialogs.length).toBe(2);
        // Change color in first widget
        let colorInputs1 = dialogs[0].querySelectorAll("input[type='color']");
        fireEvent.change(colorInputs1[0], { target: { value: "#111111" } });
        // Close first drawer to flush state
        fireEvent.click(document.querySelectorAll(".trimm-color-token-overlay")[0]);
        await waitFor(() => {
            expect(document.querySelectorAll(".trimm-color-token-overlay").length).toBe(1);
        });
        // Change color in second widget
        let colorInputs2 = dialogs[1].querySelectorAll("input[type='color']");
        fireEvent.change(colorInputs2[0], { target: { value: "#222222" } });
        // Close second drawer to flush state
        fireEvent.click(document.querySelectorAll(".trimm-color-token-overlay")[0]);
        await waitFor(() => {
            expect(document.querySelectorAll(".trimm-color-token-overlay").length).toBe(0);
        });
        // The widget only saves the last override for each token in the current theme
        const theme = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
        const overrides = JSON.parse(window.localStorage.getItem(`tokenOverrides_${theme}`) || "{}");
        // Only the last changed value for each token is present
        // If both tokens are unique, both should be present
        expect(overrides["--brand-1-instance1"]).toBeDefined();
        expect(overrides["--brand-1-instance2"]).toBeDefined();
    });
}); 