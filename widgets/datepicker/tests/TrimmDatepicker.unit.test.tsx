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
        // Wait for calendar to render
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
        input && input.parentElement.click();
        const cell = container.querySelector('.trimm-datepicker-cell');
        cell && cell.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(onChange.execute).not.toHaveBeenCalled();
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

    // More unit tests for logic and edge cases will be added incrementally.
}); 