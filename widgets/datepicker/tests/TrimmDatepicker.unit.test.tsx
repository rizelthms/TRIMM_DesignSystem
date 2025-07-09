import * as React from "react";
import { createElement } from "react";
import { render } from "@testing-library/react";
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

    // More unit tests for logic and edge cases will be added incrementally.
}); 