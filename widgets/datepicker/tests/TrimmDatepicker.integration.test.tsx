/** @jsx createElement */
import { createElement } from "react";
import { render, screen } from "@testing-library/react";
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
}); 