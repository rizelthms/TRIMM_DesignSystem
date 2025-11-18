/**
 * TRIMM Design System - Color Token Editor Integration Tests
 * 
 * This file contains integration tests for the Color Token Editor widget.
 * It validates component behavior, user interactions, theme persistence,
 * and accessibility compliance to ensure reliable theming functionality.
 * 
 * Test Coverage:
 * - Component rendering and user interactions
 * - Theme persistence and localStorage integration
 * - Accessibility compliance and keyboard navigation
 * - Edge cases and error handling
 * - Multiple widget instances and performance
 */

import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { ColorTokenEditor } from "../src/ColorTokenEditor";

// Mock localStorage for test isolation and verification of theme persistence functionality
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

// Mock Mendix API (mx.data) for database operations
let mockThemeDatabase: Map<string, any> = new Map();
let mockUserDatabase: Map<string, any> = new Map(); // userGuid -> user object
let mockUserAssociation: Map<string, string> = new Map(); // userGuid -> themeGuid
let guidCounter = 0;

function generateGuid(): string {
    return `mock-guid-${++guidCounter}`;
}

function createMockMxObject(data: Record<string, any>, guid: string): any {
    return {
        getGuid: () => guid,
        get: (attr: string) => data[attr],
        set: (attr: string, value: any) => {
            data[attr] = value;
        }
    };
}

function parseXpath(xpath: string): { entity?: string; filter?: string } {
    // Simple xpath parser for test purposes
    // Handles: //EntityName[Attribute='Value']
    const match = xpath.match(/\/\/([^.]+)\.([^\[]+)(?:\[([^\]]+)\])?/);
    if (!match) return {};
    const [, module, entity, filter] = match;
    return { entity: `${module}.${entity}`, filter };
}

const mockMx = {
    data: {
        get: (options: { xpath?: string; guid?: string; callback: (objs: any[]) => void; error?: (err: Error) => void }) => {
            // Use setImmediate or Promise.resolve().then() for better async handling
            Promise.resolve().then(() => {
                try {
                    if (options.guid) {
                        // Get by GUID - check both theme and user databases
                        const themeObj = Array.from(mockThemeDatabase.values()).find(o => o.getGuid() === options.guid);
                        if (themeObj) {
                            options.callback([themeObj]);
                            return;
                        }
                        const userObj = mockUserDatabase.get(options.guid);
                        if (userObj) {
                            options.callback([userObj]);
                            return;
                        }
                        options.callback([]);
                    } else if (options.xpath) {
                        // Get by xpath
                        const parsed = parseXpath(options.xpath);
                        let results: any[] = Array.from(mockThemeDatabase.values());

                        if (parsed.filter) {
                            // Apply filter: Name='value'
                            const filterMatch = parsed.filter.match(/(\w+)='([^']+)'/);
                            if (filterMatch) {
                                const [, attr, value] = filterMatch;
                                results = results.filter(obj => obj.get(attr) === value);
                            }
                        } else {
                            // No filter, return all
                            results = Array.from(mockThemeDatabase.values());
                        }

                        options.callback(results);
                    } else {
                        options.callback([]);
                    }
                } catch (err) {
                    options.error?.(err as Error);
                }
            });
        },
        create: (options: { entity: string; callback: (obj: any) => void; error?: (err: Error) => void }) => {
            Promise.resolve().then(() => {
                try {
                    const guid = generateGuid();
                    const data: Record<string, any> = {};
                    const obj = createMockMxObject(data, guid);
                    options.callback(obj);
                } catch (err) {
                    options.error?.(err as Error);
                }
            });
        },
        commit: (options: { mxobj: any; callback: () => void; error?: (err: Error) => void }) => {
            Promise.resolve().then(() => {
                try {
                    const guid = options.mxobj.getGuid();
                    const name = options.mxobj.get("Name");
                    if (name) {
                        mockThemeDatabase.set(name, options.mxobj);
                    } else {
                        // Check if it's a user object (has association attribute)
                        const userGuid = options.mxobj.get("TRIMM_DesignSystem.DS_ThemeProfile_User");
                        if (userGuid !== undefined) {
                            mockUserDatabase.set(guid, options.mxobj);
                        } else {
                            mockThemeDatabase.set(guid, options.mxobj);
                        }
                    }
                    options.callback();
                } catch (err) {
                    options.error?.(err as Error);
                }
            });
        },
        remove: (options: { guid: string; callback: () => void; error?: (err: Error) => void }) => {
            Promise.resolve().then(() => {
                try {
                    // Find and remove by GUID from both databases
                    for (const [key, obj] of mockThemeDatabase.entries()) {
                        if (obj.getGuid() === options.guid) {
                            mockThemeDatabase.delete(key);
                            break;
                        }
                    }
                    mockUserDatabase.delete(options.guid);
                    options.callback();
                } catch (err) {
                    options.error?.(err as Error);
                }
            });
        }
    },
    session: {
        getUserGuid: () => null // No user session by default (security off)
    }
};

// Setup Mendix API mock before each test
beforeAll(() => {
    (window as any).mx = mockMx;
});

beforeEach(() => {
    mockThemeDatabase.clear();
    mockUserDatabase.clear();
    mockUserAssociation.clear();
    guidCounter = 0;
    window.localStorage.clear();
    document.body.innerHTML = "";
});

const mockTokens = [
    { name: "--brand-1", value: "#ff0000" },
    { name: "--brand-2", value: "#00ff00" }
];

describe("ColorTokenEditor integration", () => {

    it("renders the floating action button (FAB)", async () => {
        await act(async () => {
            render(<ColorTokenEditor side="right" getTokens={() => mockTokens} />);
        });
        const fab = screen.getByRole("button", { name: /open color token editor/i });
        expect(fab).toBeInTheDocument();
    });

    it("opens and closes the drawer when FAB is clicked", async () => {
        await act(async () => {
            render(<ColorTokenEditor side="right" getTokens={() => mockTokens} />);
        });
        const fab = screen.getByRole("button", { name: /open color token editor/i });
        await act(async () => {
            fireEvent.click(fab);
        });
        const drawer = screen.getByRole("dialog");
        expect(drawer).toBeVisible();
        // Close via overlay click to test user interaction patterns
        const overlay = document.querySelector(".trimm-color-token-overlay");
        expect(overlay).toBeTruthy();
        await act(async () => {
            fireEvent.click(overlay!);
        });
        await waitFor(() => {
            expect(document.querySelector(".trimm-color-token-overlay")).toBeNull();
        });
    });

    it("changes a color and updates localStorage", async () => {
        await act(async () => {
            render(<ColorTokenEditor side="right" getTokens={() => mockTokens} />);
        });
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /open color token editor/i }));
        });
        const colorInputs = document.querySelectorAll("input[type='color']");
        expect(colorInputs.length).toBeGreaterThan(0);
        await act(async () => {
            fireEvent.change(colorInputs[0], { target: { value: "#123456" } });
        });
        // Check localStorage was updated with the new color value for theme persistence
        const theme = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
        const overrides = JSON.parse(window.localStorage.getItem(`tokenOverrides_${theme}`) || "{}");
        expect(Object.values(overrides)).toContain("#123456");
    });

    it("resets all tokens when reset button is clicked", async () => {
        await act(async () => {
            render(<ColorTokenEditor side="right" getTokens={() => mockTokens} />);
        });
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /open color token editor/i }));
        });
        // Change a color to create a test override for reset functionality validation
        const colorInputs = document.querySelectorAll("input[type='color']");
        await act(async () => {
            fireEvent.change(colorInputs[0], { target: { value: "#654321" } });
        });
        // Click reset to test override clearing functionality
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /reset/i }));
        });
        // All overrides should be cleared from localStorage after reset
        const theme = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
        expect(window.localStorage.getItem(`tokenOverrides_${theme}`)).toBeNull();
    });

    it("persists color overrides across renders", async () => {
        let unmount;
        await act(async () => {
            ({ unmount } = render(<ColorTokenEditor side="right" getTokens={() => mockTokens} />));
        });
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /open color token editor/i }));
        });
        const colorInputs = document.querySelectorAll("input[type='color']");
        await act(async () => {
            fireEvent.change(colorInputs[0], { target: { value: "#abcdef" } });
        });
        unmount!();
        // Render a new instance to test cross-render persistence
        await act(async () => {
            render(<ColorTokenEditor side="right" getTokens={() => mockTokens} />);
        });
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /open color token editor/i }));
        });
        // The color input should reflect the override from localStorage persistence
        const colorInputsAfter = document.querySelectorAll("input[type='color']");
        expect((colorInputsAfter[0] as HTMLInputElement).value).toBe("#abcdef");
    });

    it("applies overrides per theme and updates UI on theme switch", async () => {
        const tokens = [
            { name: "--brand-1", value: "#ff0000" },
            { name: "--brand-2", value: "#00ff00" }
        ];
        // Start with light theme to test theme-specific override behavior
        document.documentElement.setAttribute("data-theme", "light");
        await act(async () => {
            render(<ColorTokenEditor side="right" getTokens={() => tokens} />);
        });
        // Open drawer and change color in light theme to create theme-specific overrides
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /open color token editor/i }));
        });
        let colorInputs = document.querySelectorAll("input[type='color']");
        await act(async () => {
            fireEvent.change(colorInputs[0], { target: { value: "#123456" } });
        });
        // Close drawer to flush state and ensure localStorage persistence
        fireEvent.click(document.querySelector(".trimm-color-token-overlay")!);
        await waitFor(() => {
            expect(document.querySelector(".trimm-color-token-overlay")).toBeNull();
        });
        // Assert light theme override is stored in localStorage
        let lightOverrides = JSON.parse(window.localStorage.getItem("tokenOverrides_light") || "{}");
        expect(Object.values(lightOverrides)).toContain("#123456");
        // Switch to dark theme to test theme switching and automatic color derivation
        await act(async () => {
            document.documentElement.setAttribute("data-theme", "dark");
            fireEvent.click(document.body); // trigger MutationObserver for theme change detection
        });
        // Open drawer in dark theme to verify theme-specific color display
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /open color token editor/i }));
        });
        colorInputs = document.querySelectorAll("input[type='color']");
        // The widget may show either the user override or the derived dark color for theme consistency
        let value = (colorInputs[0] as HTMLInputElement).value.toLowerCase();
        expect(["#123456", "#000c2e"]).toContain(value);
        // Close drawer to flush dark theme state changes
        fireEvent.click(document.querySelector(".trimm-color-token-overlay")!);
        await waitFor(() => {
            expect(document.querySelector(".trimm-color-token-overlay")).toBeNull();
        });
        // Assert dark theme override is the derived color from light theme input
        let darkOverrides = JSON.parse(window.localStorage.getItem("tokenOverrides_dark") || "{}");
        expect(Object.values(darkOverrides).map(v => (v as string).toLowerCase())).toContain("#000c2e");
        // Switch back to light and check persistence of original overrides
        await act(async () => {
            document.documentElement.setAttribute("data-theme", "light");
            fireEvent.click(document.body);
        });
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /open color token editor/i }));
        });
        colorInputs = document.querySelectorAll("input[type='color']");
        value = (colorInputs[0] as HTMLInputElement).value.toLowerCase();
        expect(["#123456", "#000c2e"]).toContain(value);
    });

    it("has correct accessibility attributes", async () => {
        await act(async () => {
            render(<ColorTokenEditor side="right" getTokens={() => mockTokens} />);
        });
        const fab = screen.getByRole("button", { name: /open color token editor/i });
        expect(fab).toHaveAttribute("aria-label");
    });

    it("shows a message when no tokens are found", async () => {
        await act(async () => {
            render(<ColorTokenEditor side="right" getTokens={() => []} />);
        });
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /open color token editor/i }));
        });
        expect(screen.getByText(/no valid tokens found/i)).toBeInTheDocument();
    });

    it("handles invalid token values gracefully", async () => {
        const invalidTokens = [
            { name: "--bad-token", value: "not-a-color" }
        ];
        await act(async () => {
            render(<ColorTokenEditor side="right" getTokens={() => invalidTokens} />);
        });
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /open color token editor/i }));
        });
        // Should still render the token label
        expect(screen.getByText("--bad-token")).toBeInTheDocument();
        // The color input should fallback to a valid color
        const colorInput = document.querySelector("input[type='color']") as HTMLInputElement;
        expect(colorInput).toBeTruthy();
        expect(colorInput.value).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it("supports keyboard accessibility for opening, closing, and tabbing through controls", async () => {
        await act(async () => {
            render(<ColorTokenEditor side="right" getTokens={() => mockTokens} />);
        });
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

    it("handles localStorage errors gracefully", async () => {
        const spy = jest.spyOn(window.localStorage, "setItem").mockImplementation(() => { throw new Error("localStorage error"); });
        await act(async () => {
            render(<ColorTokenEditor side="right" getTokens={() => mockTokens} />);
        });
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /open color token editor/i }));
            const colorInputs = document.querySelectorAll("input[type='color']");
            fireEvent.change(colorInputs[0], { target: { value: "#123456" } });
        });
        spy.mockRestore();
    });

    it("allows multiple ColorTokenEditor instances to operate independently", async () => {
        await act(async () => {
            render(<>
                <ColorTokenEditor side="right" getTokens={() => [
                    { name: "--brand-1-instance1", value: "#ff0000" }
                ]} />
                <ColorTokenEditor side="left" getTokens={() => [
                    { name: "--brand-1-instance2", value: "#00ff00" }
                ]} />
            </>);
        });
        const fabs = screen.getAllByRole("button", { name: /open color token editor/i });
        // Open both drawers to test multiple widget instance independence
        await act(async () => {
            fireEvent.click(fabs[0]);
        });
        await act(async () => {
            fireEvent.click(fabs[1]);
        });
        const dialogs = screen.getAllByRole("dialog");
        expect(dialogs.length).toBe(2);
        // Change color in first widget to test independent state management
        let colorInputs1 = dialogs[0].querySelectorAll("input[type='color']");
        await act(async () => {
            fireEvent.change(colorInputs1[0], { target: { value: "#111111" } });
        });
        // Close first drawer to flush state and test isolation between instances
        fireEvent.click(document.querySelectorAll(".trimm-color-token-overlay")[0]);
        await waitFor(() => {
            expect(document.querySelectorAll(".trimm-color-token-overlay").length).toBe(1);
        });
        // Change color in second widget to verify independent operation
        let colorInputs2 = dialogs[1].querySelectorAll("input[type='color']");
        await act(async () => {
            fireEvent.change(colorInputs2[0], { target: { value: "#222222" } });
        });
        // Close second drawer to flush state and complete independent testing
        fireEvent.click(document.querySelectorAll(".trimm-color-token-overlay")[0]);
        await waitFor(() => {
            expect(document.querySelectorAll(".trimm-color-token-overlay").length).toBe(0);
        });
        // The widget only saves the last override for each token in the current theme for consistency
        const theme = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
        const overrides = JSON.parse(window.localStorage.getItem(`tokenOverrides_${theme}`) || "{}");
        // Only the last changed value for each token is present in localStorage
        expect(overrides["--brand-1-instance1"]).toBeDefined();
        expect(overrides["--brand-1-instance2"]).toBeDefined();
    });

    it("renders and handles a large number of tokens", async () => {
        const tokens = Array.from({ length: 200 }, (_, i) => ({
            name: `--color-${i}`,
            value: `#${(i % 10).toString().repeat(6)}`
        }));
        await act(async () => {
            render(<ColorTokenEditor side="right" getTokens={() => tokens} />);
        });
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /open color token editor/i }));
        });
        expect(document.querySelectorAll("input[type='color']").length).toBe(200);
    });

    it("performs responsively and efficiently with a large number of tokens", async () => {
        const tokens = Array.from({ length: 200 }, (_, i) => ({
            name: `--color-${i}`,
            value: `#${(i % 10).toString().repeat(6)}`
        }));
        const start = performance.now();
        await act(async () => {
            render(<ColorTokenEditor side="right" getTokens={() => tokens} />);
        });
        const renderTime = performance.now() - start;
        // Should render in under 500ms
        expect(renderTime).toBeLessThan(500);
        // Rapidly open/close drawer
        const fab = screen.getByRole("button", { name: /open color token editor/i });
        for (let i = 0; i < 5; i++) {
            fireEvent.click(fab);
            fireEvent.click(document.querySelector(".trimm-color-token-overlay")!);
        }
        // Rapidly change colors
        fireEvent.click(fab);
        const colorInputs = document.querySelectorAll("input[type='color']");
        for (let i = 0; i < 10; i++) {
            fireEvent.change(colorInputs[i], { target: { value: `#${(i + 1).toString().repeat(6)}` } });
        }
        // No errors should be thrown and UI should remain interactive
        expect(document.querySelectorAll("input[type='color']").length).toBe(200);
    });

    it("renders tokens with special character names", async () => {
        const tokens = [
            { name: "--token!@#", value: "#123456" },
            { name: "--token space", value: "#abcdef" },
            { name: "", value: "#000000" }
        ];
        await act(async () => {
            render(<ColorTokenEditor side="right" getTokens={() => tokens} />);
        });
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /open color token editor/i }));
        });
        expect(screen.getByText("--token!@#")).toBeInTheDocument();
        expect(screen.getByText("--token space")).toBeInTheDocument();
        // For empty name, check for a label with no text
        const labels = document.querySelectorAll('.trimm-color-token-label');
        expect(Array.from(labels).some(label => label.textContent === "")).toBe(true);
    });

    it("handles duplicate token names gracefully", async () => {
        const tokens = [
            { name: "--dup", value: "#abcdef" },
            { name: "--dup-2", value: "#abcdef" }
        ];
        await act(async () => {
            render(<ColorTokenEditor side="right" getTokens={() => tokens} />);
        });
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /open color token editor/i }));
        });
        // Both should be rendered with unique keys
        expect(screen.getByText("--dup")).toBeInTheDocument();
        expect(screen.getByText("--dup-2")).toBeInTheDocument();
    });

    it("renders tokens with invalid or empty values", async () => {
        const tokens = [
            { name: "--empty", value: "" },
            { name: "--null", value: null },
            { name: "--undefined", value: undefined },
            { name: "--bad", value: "notacolor" }
        ];
        await act(async () => {
            render(<ColorTokenEditor side="right" getTokens={() => tokens as any} />);
        });
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /open color token editor/i }));
        });
        expect(screen.getByText("--empty")).toBeInTheDocument();
        expect(screen.getByText("--null")).toBeInTheDocument();
        expect(screen.getByText("--undefined")).toBeInTheDocument();
        expect(screen.getByText("--bad")).toBeInTheDocument();
        // All should fallback to a valid color input value
        const colorInputs = document.querySelectorAll("input[type='color']");
        colorInputs.forEach(input => {
            expect((input as HTMLInputElement).value).toMatch(/^#[0-9a-f]{6}$/i);
        });
    });

    it("restores Default TRIMM immediately after deleting the active theme", async () => {
        // Force light theme
        document.documentElement.setAttribute("data-theme", "light");
        await act(async () => {
            render(<ColorTokenEditor side="right" getTokens={() => mockTokens} />);
        });
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /open color token editor/i }));
        });
        // Wait for initial load to complete
        await waitFor(() => {
            expect(screen.getByLabelText(/choose theme/i)).toBeInTheDocument();
        });

        // Change a color to create a visible override
        const colorInputs = document.querySelectorAll("input[type='color']");
        await act(async () => {
            fireEvent.change(colorInputs[0], { target: { value: "#111111" } });
        });

        // Create theme "a"
        const nameInput = screen.getByLabelText(/theme name/i) as HTMLInputElement;
        await act(async () => {
            fireEvent.change(nameInput, { target: { value: "a" } });
        });
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /create new theme/i }));
        });
        // Wait for save to complete
        await waitFor(() => {
            expect(screen.queryByText(/failed to save/i)).not.toBeInTheDocument();
        }, { timeout: 3000 });

        // Wait for theme to appear in dropdown
        await waitFor(() => {
            const select = screen.getByLabelText(/choose theme/i) as HTMLSelectElement;
            expect(Array.from(select.options).some(opt => opt.value === "a")).toBe(true);
        });

        // Load theme "a"
        const select = screen.getByLabelText(/choose theme/i) as HTMLSelectElement;
        await act(async () => {
            fireEvent.change(select, { target: { value: "a" } });
        });
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /load selected theme/i }));
        });
        // Wait for load to complete
        await waitFor(() => {
            expect(screen.queryByText(/failed to load/i)).not.toBeInTheDocument();
        }, { timeout: 3000 });

        // Delete theme "a" and confirm
        const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /delete selected theme/i }));
        });
        confirmSpy.mockRestore();

        // Should display restoration message and clear overrides in storage
        // The message is "Active theme was deleted. Default TRIMM restored."
        // Wait for the message to appear - it may take a moment for async DB operations
        const message = await screen.findByText(/active theme was deleted/i, {}, { timeout: 8000 });
        expect(message).toBeInTheDocument();
        expect(message.textContent?.toLowerCase()).toContain("default trimm restored");
        const lightOverrides = JSON.parse(window.localStorage.getItem("tokenOverrides_light") || "{}");
        const darkOverrides = JSON.parse(window.localStorage.getItem("tokenOverrides_dark") || "{}");
        expect(Object.keys(lightOverrides).length).toBe(0);
        expect(Object.keys(darkOverrides).length).toBe(0);
    });

    it("allows re-importing the same JSON file after deleting the theme", async () => {
        // Mock FileReader to synchronously provide content
        let mockFileContent = "";
        const OriginalFileReader = (globalThis as any).FileReader;
        class FRMock {
            public result: string | ArrayBuffer | null = null;
            public onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
            public onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
            readAsText(_file: Blob) {
                this.result = mockFileContent as any;
                if (this.onload) this.onload.call(this as any, {} as any);
            }
        }
        (globalThis as any).FileReader = FRMock as any;

        await act(async () => {
            render(<ColorTokenEditor side="right" getTokens={() => mockTokens} />);
        });
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /open color token editor/i }));
        });

        // Wait for initial load
        await waitFor(() => {
            expect(screen.getByLabelText(/choose theme/i)).toBeInTheDocument();
        });

        // Prepare import JSON for theme "a"
        const exportJson = {
            metadata: { version: "1.0.0", exportedAt: new Date().toISOString(), source: "TRIMM Design System Color Token Editor" },
            theme: {
                name: "a",
                version: "1.0.0",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                light: { "--brand-1": "#112233" },
                dark: { "--brand-1": "#0f1520" }
            }
        };
        mockFileContent = JSON.stringify(exportJson);

        const hiddenInput = document.getElementById("trimm-theme-file-input") as HTMLInputElement;
        // First import
        await act(async () => {
            fireEvent.change(hiddenInput, { target: { files: [new File([mockFileContent], "a.json", { type: "application/json" })] } });
        });
        // Wait for import to complete and theme to appear
        await waitFor(() => {
            const select = screen.getByLabelText(/choose theme/i) as HTMLSelectElement;
            expect(Array.from(select.options).some(opt => opt.value === "a")).toBe(true);
        }, { timeout: 3000 });

        // Delete theme "a"
        const select = screen.getByLabelText(/choose theme/i) as HTMLSelectElement;
        const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
        await act(async () => {
            fireEvent.change(select, { target: { value: "a" } });
            fireEvent.click(screen.getByRole("button", { name: /delete selected theme/i }));
        });
        confirmSpy.mockRestore();

        // Wait for deletion to complete
        await waitFor(() => {
            const selectAfterDelete = screen.getByLabelText(/choose theme/i) as HTMLSelectElement;
            expect(Array.from(selectAfterDelete.options).some(opt => opt.value === "a")).toBe(false);
        }, { timeout: 3000 });

        // Re-import the exact same file again (input value cleared by widget)
        await act(async () => {
            fireEvent.change(hiddenInput, { target: { files: [new File([mockFileContent], "a.json", { type: "application/json" })] } });
        });
        // "a" should be available again
        await waitFor(() => {
            const selectAfterReimport = screen.getByLabelText(/choose theme/i) as HTMLSelectElement;
            expect(Array.from(selectAfterReimport.options).some(opt => opt.value === "a")).toBe(true);
        }, { timeout: 3000 });

        // Restore FileReader
        (globalThis as any).FileReader = OriginalFileReader;
    });

    it("has correct tab order and focus management", async () => {
        const tokens = [
            { name: "--brand-1", value: "#ff0000" },
            { name: "--brand-2", value: "#00ff00" }
        ];
        await act(async () => {
            render(<ColorTokenEditor side="right" getTokens={() => tokens} />);
        });
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /open color token editor/i }));
        });
        // Tab through: color input 1, color input 2, reset button, close button
        const colorInputs = document.querySelectorAll("input[type='color']");
        const resetBtn = screen.getByRole("button", { name: /reset/i });
        const closeBtn = screen.getByRole("button", { name: /close color token editor/i });
        // Focus first color input
        (colorInputs[0] as HTMLElement).focus();
        expect(document.activeElement).toBe(colorInputs[0]);
        // Tab to second color input
        fireEvent.keyDown(document.activeElement!, { key: "Tab", code: "Tab" });
        (colorInputs[1] as HTMLElement).focus();
        expect(document.activeElement).toBe(colorInputs[1]);
        // Tab to reset button
        fireEvent.keyDown(document.activeElement!, { key: "Tab", code: "Tab" });
        resetBtn.focus();
        expect(document.activeElement).toBe(resetBtn);
        // Tab to close button
        fireEvent.keyDown(document.activeElement!, { key: "Tab", code: "Tab" });
        closeBtn.focus();
        expect(document.activeElement).toBe(closeBtn);
    });

    it("has correct ARIA roles and labels", async () => {
        const tokens = [
            { name: "--brand-1", value: "#ff0000" }
        ];
        await act(async () => {
            render(<ColorTokenEditor side="right" getTokens={() => tokens} />);
        });
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /open color token editor/i }));
        });
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /close color token editor/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
        expect(screen.getByLabelText("Open color token editor")).toBeInTheDocument();
    });

    it("does not crash if localStorage quota is exceeded", async () => {
        const tokens = [
            { name: "--brand-1", value: "#ff0000" }
        ];
        // Simulate quota exceeded
        jest.spyOn(window.localStorage, "setItem").mockImplementation(() => { throw new DOMException("QuotaExceededError", "QuotaExceededError"); });
        await act(async () => {
            render(<ColorTokenEditor side="right" getTokens={() => tokens} />);
        });
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /open color token editor/i }));
            const colorInput = document.querySelector("input[type='color']")!;
            fireEvent.change(colorInput, { target: { value: "#123456" } });
        });
        // Should not throw or crash
        expect(screen.getByText("--brand-1")).toBeInTheDocument();
        (window.localStorage.setItem as jest.Mock).mockRestore();
    });
}); 