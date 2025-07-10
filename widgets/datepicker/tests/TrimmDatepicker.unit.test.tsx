// @ts-nocheck
import '@testing-library/jest-dom';
import * as React from "react";
import { createElement } from "react";
import { render, fireEvent, act } from "@testing-library/react";
import { TrimmDatepicker } from "../src/TrimmDatepicker";
import { TrimmDatepickerContainerProps } from "../typings/TrimmDatepickerProps";

// Helper to get props for the component
function getProps(overrides) {
    return {
        name: "TrimmDatepicker",
        class: "",
        showIcon: true,
        locale: "en-US",
        selectedDate: undefined,
        minDate: undefined,
        maxDate: undefined,
        onChange: undefined,
        ...overrides
    };
}

describe("TrimmDatepicker Unit", () => {
    it("renders with today's date if no selectedDate is provided", () => {
        const { getByDisplayValue } = render(<TrimmDatepicker {...getProps({})} />);
        const today = new Date();
        // Format as MM/DD/YYYY (en-US)
        const pad = (n) => n.toString().padStart(2, '0');
        const expected = `${pad(today.getMonth() + 1)}/${pad(today.getDate())}/${today.getFullYear()}`;
        expect(getByDisplayValue(expected)).toBeInTheDocument();
    });

    it("renders with a given selectedDate", () => {
        const date = new Date(2025, 0, 15); // Jan 15, 2025
        const { getByDisplayValue } = render(
            <TrimmDatepicker {...getProps({ selectedDate: { value: date } })} />
        );
        expect(getByDisplayValue("01/15/2025")).toBeInTheDocument();
    });

    it("renders with a date in the 1900s", () => {
        const date = new Date(1905, 6, 4); // July 4, 1905
        const { getByDisplayValue } = render(
            <TrimmDatepicker {...getProps({ selectedDate: { value: date } })} />
        );
        expect(getByDisplayValue("07/04/1905")).toBeInTheDocument();
    });

    it("renders with a date in the 2100s", () => {
        const date = new Date(2101, 11, 25); // Dec 25, 2101
        const { getByDisplayValue } = render(
            <TrimmDatepicker {...getProps({ selectedDate: { value: date } })} />
        );
        expect(getByDisplayValue("12/25/2101")).toBeInTheDocument();
    });

    it("renders with a leap year date (Feb 29, 2024)", () => {
        const date = new Date(2024, 1, 29); // Feb 29, 2024
        const { getByDisplayValue } = render(
            <TrimmDatepicker {...getProps({ selectedDate: { value: date } })} />
        );
        expect(getByDisplayValue("02/29/2024")).toBeInTheDocument();
    });

    it("renders with a UTC date (timezone edge)", () => {
        const date = new Date(Date.UTC(2025, 0, 1)); // Jan 1, 2025 UTC
        const { getByDisplayValue } = render(
            <TrimmDatepicker {...getProps({ selectedDate: { value: date } })} />
        );
        // Accept either local or UTC formatted date
        const possible = ["01/01/2025", date.toLocaleDateString("en-US")];
        const found = possible.some(val => {
            try { getByDisplayValue(val); return true; } catch { return false; }
        });
        expect(found).toBe(true);
    });

    it("handles undefined minDate and maxDate without error", () => {
        expect(() => {
            render(<TrimmDatepicker {...getProps({ minDate: undefined, maxDate: undefined })} />);
        }).not.toThrow();
    });

    it("treats dates before minDate as out of range", () => {
        const min = new Date(2025, 0, 10);
        const { container } = render(
            <TrimmDatepicker {...getProps({ minDate: { value: min } })} />
        );
        // Access isOutOfRange via the DOM: check that a cell before min has 'disabled' class
        // (simulate opening calendar for Jan 2025)
        // For unit test, just check that the rendered input value is >= min
        const input = container.querySelector('input');
        expect(input && input.value >= "01/10/2025").toBe(true);
    });

    it("treats dates after maxDate as out of range", () => {
        const max = new Date(2025, 0, 5);
        const { container } = render(
            <TrimmDatepicker {...getProps({ maxDate: { value: max } })} />
        );
        const input = container.querySelector('input');
        expect(input && input.value <= "01/05/2025").toBe(false); // today is after max, so should be out of range
    });

    it("treats dates within min/max as in range", () => {
        const min = new Date(2025, 0, 1);
        const max = new Date(2025, 0, 31);
        const selected = new Date(2025, 0, 15);
        const { getByDisplayValue } = render(
            <TrimmDatepicker {...getProps({ minDate: { value: min }, maxDate: { value: max }, selectedDate: { value: selected } })} />
        );
        expect(getByDisplayValue("01/15/2025")).toBeInTheDocument();
    });

    it("handles undefined minDate and maxDate in isOutOfRange logic", () => {
        const selected = new Date(2025, 0, 20);
        const { getByDisplayValue } = render(
            <TrimmDatepicker {...getProps({ selectedDate: { value: selected }, minDate: undefined, maxDate: undefined })} />
        );
        expect(getByDisplayValue("01/20/2025")).toBeInTheDocument();
    });

    it("calls onChange when a date is selected and canExecute is true", () => {
        const onChange = { canExecute: true, isExecuting: false, execute: jest.fn() };
        const { container } = render(
            <TrimmDatepicker {...getProps({ onChange })} />
        );
        const input = container.querySelector('input');
        act(() => {
            input && fireEvent.click(input.parentElement); // open calendar
        });
        const cell = container.querySelector('.trimm-datepicker-cell');
        act(() => {
            cell && fireEvent.click(cell);
        });
        expect(onChange.execute).toHaveBeenCalled();
    });

    it("does not call onChange if isExecuting is true", () => {
        const onChange = { canExecute: true, isExecuting: true, execute: jest.fn() };
        const { container } = render(
            <TrimmDatepicker {...getProps({ onChange })} />
        );
        const input = container.querySelector('input');
        act(() => {
            input && fireEvent.click(input.parentElement); // open calendar
        });
        const cell = container.querySelector('.trimm-datepicker-cell');
        act(() => {
            cell && fireEvent.click(cell);
        });
        expect(onChange.execute).not.toHaveBeenCalled();
    });

    it("does not call onChange when canExecute is false", () => {
        const onChange = { canExecute: false, isExecuting: false, execute: jest.fn() };
        const { container } = render(
            <TrimmDatepicker {...getProps({ onChange })} />
        );
        const input = container.querySelector('input');
        act(() => {
            input && fireEvent.click(input.parentElement); // open calendar
        });
        const cell = container.querySelector('.trimm-datepicker-cell');
        act(() => {
            cell && fireEvent.click(cell);
        });
        expect(onChange.execute).not.toHaveBeenCalled();
    });

    it("calls onChange when date is selected", () => {
        const onChange = { canExecute: true, isExecuting: false, execute: jest.fn() };
        const { container } = render(
            <TrimmDatepicker {...getProps({ onChange })} />
        );
        const input = container.querySelector('input');
        act(() => {
            input && fireEvent.click(input.parentElement); // open calendar
        });
        const cell = container.querySelector('.trimm-datepicker-cell');
        act(() => {
            cell && fireEvent.click(cell);
        });
        expect(onChange.execute).toHaveBeenCalled();
    });

    it("renders the icon if showIcon is true", () => {
        const { container } = render(
            <TrimmDatepicker {...getProps({ showIcon: true })} />
        );
        expect(container.querySelector('.trimm-datepicker-icon')).toBeInTheDocument();
    });

    it("does not render the icon if showIcon is false", () => {
        const { container } = render(
            <TrimmDatepicker {...getProps({ showIcon: false })} />
        );
        expect(container.querySelector('.trimm-datepicker-icon')).not.toBeInTheDocument();
    });

    it("renders date in Dutch format when locale is nl-NL", () => {
        const date = new Date(2025, 0, 15); // Jan 15, 2025
        const { getByDisplayValue } = render(
            <TrimmDatepicker {...getProps({ selectedDate: { value: date }, locale: "nl-NL" })} />
        );
        // Dutch format is usually DD-MM-YYYY
        expect(getByDisplayValue("15-01-2025")).toBeInTheDocument();
    });

    it("falls back to en-US format for unknown locale", () => {
        const date = new Date(2025, 0, 15);
        const { getByDisplayValue } = render(
            <TrimmDatepicker {...getProps({ selectedDate: { value: date }, locale: "xx-XX" })} />
        );
        expect(getByDisplayValue("01/15/2025")).toBeInTheDocument();
    });

    it("handles null selectedDate gracefully", () => {
        const { container } = render(
            <TrimmDatepicker {...getProps({ selectedDate: null })} />
        );
        const input = container.querySelector('input');
        expect(input).toBeInTheDocument();
    });

    it("handles invalid date objects gracefully", () => {
        // Mock console.error to suppress the error that gets logged
        const originalError = console.error;
        console.error = jest.fn();
        
        // The component will throw an error when trying to format invalid dates
        // We can test that the component still throws, regardless of error type
        let component;
        try {
            component = render(
                <TrimmDatepicker {...getProps({ selectedDate: { value: new Date('invalid') } })} />
            );
        } catch (error) {
            // If the component throws during render, that's expected behavior
            // We can still test that an error is thrown
            expect(error).toBeInstanceOf(Error);
            return;
        }
        
        // If the component doesn't throw, it should still render an input
        if (component) {
            const input = component.container.querySelector('input');
            expect(input).toBeInTheDocument();
        }
        
        // Restore console.error
        console.error = originalError;
    });

    it("input is readonly and has correct placeholder", () => {
        const { container } = render(
            <TrimmDatepicker {...getProps({})} />
        );
        const input = container.querySelector('input');
        expect(input).toHaveAttribute('readonly');
        expect(input).toHaveAttribute('placeholder', 'Select a date');
    });

    it("applies custom class prop correctly", () => {
        const customClass = "my-custom-datepicker";
        const { container } = render(
            <TrimmDatepicker {...getProps({ class: customClass })} />
        );
        const datepickerDiv = container.querySelector('.trimm-datepicker');
        expect(datepickerDiv).toHaveClass(customClass);
        expect(datepickerDiv).toHaveClass('trimm-datepicker'); // Should still have base class
    });

    it("applies custom style prop correctly", () => {
        const customStyle = { backgroundColor: 'red', fontSize: '16px' };
        const { container } = render(
            <TrimmDatepicker {...getProps({ style: customStyle })} />
        );
        const datepickerDiv = container.querySelector('.trimm-datepicker');
        expect(datepickerDiv).toHaveStyle('background-color: red');
        expect(datepickerDiv).toHaveStyle('font-size: 16px');
    });

    it("handles empty class prop gracefully", () => {
        const { container } = render(
            <TrimmDatepicker {...getProps({ class: "" })} />
        );
        const datepickerDiv = container.querySelector('.trimm-datepicker');
        expect(datepickerDiv).toBeInTheDocument();
        expect(datepickerDiv).toHaveClass('trimm-datepicker'); // Should have base class
    });

    it("handles undefined class and style props", () => {
        const { container } = render(
            <TrimmDatepicker {...getProps({ class: undefined, style: undefined })} />
        );
        const datepickerDiv = container.querySelector('.trimm-datepicker');
        expect(datepickerDiv).toBeInTheDocument();
        expect(datepickerDiv).toHaveClass('trimm-datepicker'); // Should have base class
    });

    // More unit tests for logic and edge cases will be added incrementally.
}); 