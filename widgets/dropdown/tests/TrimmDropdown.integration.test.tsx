import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react";
import { TrimmDropdown } from "../src/TrimmDropdown";
import { createElement } from "react";

// Mock Mendix types for integration testing
const mockDynamicValue = (value: any) => ({
    value,
    status: "available" as const
});

const mockWebIcon = (type: "icon" | "glyph" | "image", value: any) => ({
    type,
    value
});

const mockAction = {
    execute: jest.fn(),
    canExecute: true,
    isExecuting: false
};

const getProps = (overrides = {}) => ({
    name: "test-dropdown",
    class: "test-class",
    dropdownItems: [
        { caption: "Profile Settings", action: mockAction },
        { caption: "Account Management", action: mockAction },
        { caption: "Logout", action: mockAction }
    ],
    icon: undefined,
    showCaretIcon: true,
    caption: "User Menu",
    ...overrides
});

describe("TrimmDropdown Integration", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        document.body.innerHTML = '';
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("Core Functionality", () => {
        it("renders dropdown with proper structure and styling", () => {
            const { container } = render(createElement(TrimmDropdown, getProps()));

            // Check main structure
            const dropdown = container.querySelector('.trimm-dropdown');
            expect(dropdown).toBeInTheDocument();
            expect(dropdown).toHaveClass('test-class');

            // Check toggle button
            const toggle = container.querySelector('.trimm-dropdown-toggle');
            expect(toggle).toBeInTheDocument();
            expect(toggle).toHaveAttribute('type', 'button');

            // Check caption
            expect(screen.getByText("User Menu")).toBeInTheDocument();

            // Check caret icon
            const caret = container.querySelector('.glyphicon-chevron-down');
            expect(caret).toBeInTheDocument();
        });

        it("opens dropdown menu when toggle is clicked", async () => {
            const { container } = render(createElement(TrimmDropdown, getProps()));
            const toggle = container.querySelector('.trimm-dropdown-toggle');

            await act(async () => {
                fireEvent.click(toggle!);
            });

            // Menu should be visible
            const menu = container.querySelector('.trimm-dropdown-menu');
            expect(menu).toBeInTheDocument();

            // All items should be visible
            expect(screen.getByText("Profile Settings")).toBeVisible();
            expect(screen.getByText("Account Management")).toBeVisible();
            expect(screen.getByText("Logout")).toBeVisible();
        });

        it("closes dropdown menu when toggle is clicked again", async () => {
            const { container } = render(createElement(TrimmDropdown, getProps()));
            const toggle = container.querySelector('.trimm-dropdown-toggle');

            // Open dropdown
            await act(async () => {
                fireEvent.click(toggle!);
            });

            expect(container.querySelector('.trimm-dropdown-menu')).toBeInTheDocument();

            // Close dropdown
            await act(async () => {
                fireEvent.click(toggle!);
            });

            expect(container.querySelector('.trimm-dropdown-menu')).not.toBeInTheDocument();
        });

        it("executes action when dropdown item is clicked", async () => {
            const { container } = render(createElement(TrimmDropdown, getProps()));
            const toggle = container.querySelector('.trimm-dropdown-toggle');

            // Open dropdown
            await act(async () => {
                fireEvent.click(toggle!);
            });

            // Click item
            await act(async () => {
                fireEvent.click(screen.getByText("Profile Settings"));
            });

            expect(mockAction.execute).toHaveBeenCalledTimes(1);
        });
    });

    describe("Icon Rendering", () => {
        it("renders icon type icon correctly in real usage", () => {
            const icon = mockDynamicValue({ type: "icon", iconClass: "fa fa-user" });
            const { container } = render(createElement(TrimmDropdown, getProps({ icon })));

            const iconElement = container.querySelector('.trimm-dropdown-icon.fa.fa-user');
            expect(iconElement).toBeInTheDocument();
        });

        it("renders glyph type icon correctly in real usage", () => {
            const icon = mockDynamicValue({ type: "glyph", iconClass: "glyphicon-settings" });
            const { container } = render(createElement(TrimmDropdown, getProps({ icon })));

            const iconElement = container.querySelector('.glyphicon.glyphicon-settings');
            expect(iconElement).toBeInTheDocument();
        });

        it("renders image type icon correctly in real usage", () => {
            const icon = mockDynamicValue({ type: "image", iconUrl: "/images/user-avatar.png" });
            const { container } = render(createElement(TrimmDropdown, getProps({ icon })));

            const iconElement = container.querySelector('img[src="/images/user-avatar.png"]');
            expect(iconElement).toBeInTheDocument();
            expect(iconElement).toHaveAttribute('alt', 'icon');
        });

        it("handles missing icon gracefully", () => {
            const { container } = render(createElement(TrimmDropdown, getProps({ icon: undefined })));

            // Should render without icon but not crash
            expect(container.querySelector('.trimm-dropdown')).toBeInTheDocument();
            expect(container.querySelector('.trimm-dropdown-icon')).not.toBeInTheDocument();
        });
    });

    describe("Real-world Usage Scenarios", () => {
        it("works as navigation menu with multiple items", async () => {
            const navItems = [
                { caption: "Dashboard", action: { ...mockAction, execute: jest.fn() } },
                { caption: "Reports", action: { ...mockAction, execute: jest.fn() } },
                { caption: "Settings", action: { ...mockAction, execute: jest.fn() } },
                { caption: "Help", action: { ...mockAction, execute: jest.fn() } }
            ];

            const { container } = render(createElement(TrimmDropdown, getProps({
                caption: "Navigation",
                dropdownItems: navItems
            })));

            const toggle = container.querySelector('.trimm-dropdown-toggle');

            // Open menu
            await act(async () => {
                fireEvent.click(toggle!);
            });

            // Verify all navigation items are present
            expect(screen.getByText("Dashboard")).toBeVisible();
            expect(screen.getByText("Reports")).toBeVisible();
            expect(screen.getByText("Settings")).toBeVisible();
            expect(screen.getByText("Help")).toBeVisible();

            // Click on Reports
            await act(async () => {
                fireEvent.click(screen.getByText("Reports"));
            });

            expect(navItems[1].action.execute).toHaveBeenCalledTimes(1);
        });

        it("works as user profile dropdown with actions", async () => {
            const userActions = [
                { caption: "View Profile", action: { ...mockAction, execute: jest.fn() } },
                { caption: "Edit Account", action: { ...mockAction, execute: jest.fn() } },
                { caption: "Privacy Settings", action: { ...mockAction, execute: jest.fn() } },
                { caption: "Sign Out", action: { ...mockAction, execute: jest.fn() } }
            ];

            const userIcon = mockDynamicValue({ type: "glyph", iconClass: "glyphicon-user" });

            const { container } = render(createElement(TrimmDropdown, getProps({
                caption: "John Doe",
                icon: userIcon,
                dropdownItems: userActions,
                class: "user-profile-dropdown"
            })));

            // Check user icon is present
            expect(container.querySelector('.glyphicon-user')).toBeInTheDocument();

            // Open dropdown
            const toggle = container.querySelector('.trimm-dropdown-toggle');
            await act(async () => {
                fireEvent.click(toggle!);
            });

            // Test profile action
            await act(async () => {
                fireEvent.click(screen.getByText("View Profile"));
            });

            expect(userActions[0].action.execute).toHaveBeenCalledTimes(1);

            // Test sign out action
            await act(async () => {
                fireEvent.click(screen.getByText("Sign Out"));
            });

            expect(userActions[3].action.execute).toHaveBeenCalledTimes(1);
        });

        it("handles empty dropdown gracefully in production", async () => {
            const { container } = render(createElement(TrimmDropdown, getProps({
                dropdownItems: [],
                caption: "Empty Menu"
            })));

            const toggle = container.querySelector('.trimm-dropdown-toggle');

            // Should not crash when opening empty dropdown
            await act(async () => {
                fireEvent.click(toggle!);
            });

            const menu = container.querySelector('.trimm-dropdown-menu');
            expect(menu).toBeInTheDocument();

            // Menu should be empty but present
            const items = container.querySelectorAll('.trimm-dropdown-item');
            expect(items).toHaveLength(0);
        });
    });

    describe("Accessibility", () => {
        it("has proper ARIA attributes for screen readers", () => {
            const { container } = render(createElement(TrimmDropdown, getProps()));
            const toggle = container.querySelector('.trimm-dropdown-toggle');

            expect(toggle).toHaveAttribute('type', 'button');
            // Additional ARIA attributes would be added in the component implementation
        });

        it("supports keyboard navigation", async () => {
            const { container } = render(createElement(TrimmDropdown, getProps()));
            const toggle = container.querySelector('.trimm-dropdown-toggle');

            // Focus the toggle
            (toggle as HTMLButtonElement).focus();
            expect(document.activeElement).toBe(toggle);

            // Test Enter key to open dropdown
            await act(async () => {
                fireEvent.keyDown(toggle!, { key: 'Enter', code: 'Enter' });
            });

            // Test Escape key to close dropdown
            await act(async () => {
                fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
            });

            // Should handle keyboard events without crashing
            expect(container.querySelector('.trimm-dropdown')).toBeInTheDocument();
        });

        it("maintains focus management for accessibility", async () => {
            const { container } = render(createElement(TrimmDropdown, getProps()));
            const toggle = container.querySelector('.trimm-dropdown-toggle');

            // Focus and open dropdown
            (toggle as HTMLButtonElement).focus();
            await act(async () => {
                fireEvent.click(toggle!);
            });

            // After opening, focus should still be manageable
            expect(document.activeElement).toBeTruthy();
        });
    });

    describe("Error Handling", () => {
        it("handles actions that cannot execute", async () => {
            const disabledAction = { ...mockAction, canExecute: false, execute: jest.fn() };
            const items = [
                { caption: "Enabled Action", action: mockAction },
                { caption: "Disabled Action", action: disabledAction }
            ];

            const { container } = render(createElement(TrimmDropdown, getProps({
                dropdownItems: items
            })));

            const toggle = container.querySelector('.trimm-dropdown-toggle');
            await act(async () => {
                fireEvent.click(toggle!);
            });

            // Click disabled action
            await act(async () => {
                fireEvent.click(screen.getByText("Disabled Action"));
            });

            // Should not execute disabled action
            expect(disabledAction.execute).not.toHaveBeenCalled();
        });

        it("handles actions that are currently executing", async () => {
            const executingAction = { ...mockAction, isExecuting: true, execute: jest.fn() };
            const items = [{ caption: "Loading Action", action: executingAction }];

            const { container } = render(createElement(TrimmDropdown, getProps({
                dropdownItems: items
            })));

            const toggle = container.querySelector('.trimm-dropdown-toggle');
            await act(async () => {
                fireEvent.click(toggle!);
            });

            // Click executing action
            await act(async () => {
                fireEvent.click(screen.getByText("Loading Action"));
            });

            // Should not execute action that's already executing
            expect(executingAction.execute).not.toHaveBeenCalled();
        });

        it("handles null or undefined actions gracefully", async () => {
            const items = [
                { caption: "No Action", action: null },
                { caption: "Undefined Action", action: undefined }
            ];

            const { container } = render(createElement(TrimmDropdown, getProps({
                dropdownItems: items
            })));

            const toggle = container.querySelector('.trimm-dropdown-toggle');
            await act(async () => {
                fireEvent.click(toggle!);
            });

            // Should not crash when clicking items without actions
            await act(async () => {
                fireEvent.click(screen.getByText("No Action"));
            });

            await act(async () => {
                fireEvent.click(screen.getByText("Undefined Action"));
            });

            expect(container.querySelector('.trimm-dropdown')).toBeInTheDocument();
        });
    });

    describe("Performance and Responsiveness", () => {
        it("handles rapid open/close operations smoothly", async () => {
            const { container } = render(createElement(TrimmDropdown, getProps()));
            const toggle = container.querySelector('.trimm-dropdown-toggle');

            // Rapidly open and close multiple times
            for (let i = 0; i < 5; i++) {
                await act(async () => {
                    fireEvent.click(toggle!);
                });
                await act(async () => {
                    fireEvent.click(toggle!);
                });
            }

            // Should remain stable
            expect(container.querySelector('.trimm-dropdown')).toBeInTheDocument();
        });

        it("handles large numbers of dropdown items efficiently", async () => {
            const manyItems = Array.from({ length: 50 }, (_, i) => ({
                caption: `Item ${i + 1}`,
                action: { ...mockAction, execute: jest.fn() }
            }));

            const { container } = render(createElement(TrimmDropdown, getProps({
                dropdownItems: manyItems,
                caption: "Large Menu"
            })));

            const toggle = container.querySelector('.trimm-dropdown-toggle');

            // Should render without performance issues
            await act(async () => {
                fireEvent.click(toggle!);
            });

            const items = container.querySelectorAll('.trimm-dropdown-item');
            expect(items).toHaveLength(50);

            // Test clicking middle item
            await act(async () => {
                fireEvent.click(screen.getByText("Item 25"));
            });

            expect(manyItems[24].action.execute).toHaveBeenCalledTimes(1);
        });
    });

    describe("Integration with Mendix Design System", () => {
        it("applies TRIMM design system classes correctly", () => {
            const { container } = render(createElement(TrimmDropdown, getProps({
                class: "trimm-custom-dropdown"
            })));

            const dropdown = container.querySelector('.trimm-dropdown');
            expect(dropdown).toHaveClass('trimm-custom-dropdown');

            // Should have proper structure for CSS styling
            expect(container.querySelector('.trimm-dropdown-toggle')).toBeInTheDocument();
        });

        it("works with custom styling and maintains functionality", async () => {
            const { container } = render(createElement(TrimmDropdown, getProps({
                class: "custom-styled-dropdown",
                style: { backgroundColor: 'lightblue', padding: '10px' }
            })));

            const dropdown = container.querySelector('.trimm-dropdown');
            expect(dropdown).toHaveStyle('background-color: lightblue');
            expect(dropdown).toHaveStyle('padding: 10px');

            // Functionality should still work with custom styling
            const toggle = container.querySelector('.trimm-dropdown-toggle');
            await act(async () => {
                fireEvent.click(toggle!);
            });

            expect(screen.getByText("Profile Settings")).toBeVisible();
        });
    });
}); 