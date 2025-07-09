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

    it("enforces min and max date", () => {
        const today = new Date();
        const min = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);
        const max = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4);
        render(
            <TrimmDatepicker
                {...getProps({
                    minDate: { value: min } as any,
                    maxDate: { value: max } as any
                })}
            />
        );
        fireEvent.click(screen.getByRole("textbox"));
        // Days before min and after max should have 'disabled' class
        const allCells = screen.getAllByText(/\d+/);
        for (const cell of allCells) {
            const day = parseInt(cell.textContent || "0", 10);
            if (day < min.getDate() || day > max.getDate()) {
                expect(cell.className).toMatch(/disabled/);
            }
        }
    });

    it("switches locale to Dutch (nl-NL)", () => {
        render(<TrimmDatepicker {...getProps({ locale: "nl-NL" })} />);
        fireEvent.click(screen.getByRole("textbox"));
        // Dutch month names: e.g., 'januari', 'februari', etc.
        const monthLabel = screen.getByText((content) =>
            /januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december/i.test(content || "")
        );
        expect(monthLabel).toBeInTheDocument();
    });

    it("hides the calendar icon if showIcon is false", () => {
        render(<TrimmDatepicker {...getProps({ showIcon: false })} />);
        expect(screen.queryByText((_, el) => !!el && el.className.includes("trimm-datepicker-icon"))).not.toBeInTheDocument();
    });

    it("navigates months using previous/next buttons", () => {
        render(<TrimmDatepicker {...getProps()} />);
        fireEvent.click(screen.getByRole("textbox"));
        const labelBefore = screen.getByText(/\w+ \d{4}/).textContent;
        // Click next month
        const nextBtn = screen.getAllByRole("button").find(btn => btn.querySelector(".glyphicon-triangle-right"));
        fireEvent.click(nextBtn!);
        const labelAfterNext = screen.getByText(/\w+ \d{4}/).textContent;
        expect(labelAfterNext).not.toBe(labelBefore);
        // Click previous month
        const prevBtn = screen.getAllByRole("button").find(btn => btn.querySelector(".glyphicon-triangle-left"));
        fireEvent.click(prevBtn!);
        const labelAfterPrev = screen.getByText(/\w+ \d{4}/).textContent;
        expect(labelAfterPrev).toBe(labelBefore);
    });

    it("highlights today's date", () => {
        render(<TrimmDatepicker {...getProps()} />);
        fireEvent.click(screen.getByRole("textbox"));
        const today = new Date().getDate().toString();
        const todayCell = screen.getAllByText(today).find(cell => cell.className.includes("today"));
        expect(todayCell).toBeInTheDocument();
    });

    it("disables dates outside current month and prevents selection", () => {
        render(<TrimmDatepicker {...getProps()} />);
        fireEvent.click(screen.getByRole("textbox"));
        // Get all date cells
        const allCells = screen.getAllByText(/\d+/);
        // Find a cell that's likely disabled (dates outside current month)
        // We'll click on the first cell and verify calendar stays open
        const firstCell = allCells[0];
        fireEvent.click(firstCell);
        // Calendar should remain open (indicating the cell was disabled or didn't trigger selection)
        expect(screen.getByText(/\d{4}/)).toBeInTheDocument();
    });

    it("multiple instances operate independently", () => {
        render(
            <div>
                <TrimmDatepicker {...getProps({ name: "Datepicker1" })} />
                <TrimmDatepicker {...getProps({ name: "Datepicker2" })} />
            </div>
        );
        const inputs = screen.getAllByRole("textbox");
        expect(inputs).toHaveLength(2);
        // Open first datepicker
        fireEvent.click(inputs[0]);
        expect(screen.getByText(/\d{4}/)).toBeInTheDocument();
        // Open second datepicker - should show another calendar
        fireEvent.click(inputs[1]);
        const calendars = screen.getAllByText(/\d{4}/);
        expect(calendars).toHaveLength(2);
    });
}); 