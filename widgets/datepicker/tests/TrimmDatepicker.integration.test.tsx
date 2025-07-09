/** @jsx createElement */
import { createElement } from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TrimmDatepicker } from "../src/TrimmDatepicker";
import { TrimmDatepickerContainerProps } from "../typings/TrimmDatepickerProps";

function getProps(overrides: Partial<TrimmDatepickerContainerProps> = {}): TrimmDatepickerContainerProps {
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

describe("TrimmDatepicker Integration", () => {
    it("renders the input and calendar icon", () => {
        render(<TrimmDatepicker {...getProps()} />);
        expect(screen.getByRole("textbox")).toBeInTheDocument();
        expect(screen.getByRole("textbox")).toHaveAttribute("readonly");
        expect(screen.getByText((_, el) => !!el && el.className.includes("trimm-datepicker-icon"))).toBeInTheDocument();
    });

    it("shows calendar on input click and allows date selection", () => {
        render(<TrimmDatepicker {...getProps()} />);
        fireEvent.click(screen.getByRole("textbox"));
        expect(screen.getByText(/\d{4}/)).toBeInTheDocument(); // Month/year label
        // Click a day cell (first enabled day)
        const dayCell = screen.getAllByText("1")[0];
        fireEvent.click(dayCell);
        expect(screen.queryByText(/\d{4}/)).not.toBeInTheDocument(); // Calendar closes
    });
}); 