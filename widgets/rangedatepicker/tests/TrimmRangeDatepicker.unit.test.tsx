import { render, screen, fireEvent, act } from "@testing-library/react";
import { TrimmRangeDatePicker } from "../src/TrimmRangeDatepicker";
import { createElement } from "react";

// Mock Mendix types
const mockEditableValue = (value: Date | null) => ({
    value,
    status: "available" as const,
    setValue: jest.fn(),
    isList: false,
    displayValue: value ? value.toISOString() : "",
    validation: "",
    formatter: jest.fn(),
    readOnly: false,
    required: false,
    hasError: false,
    errorMessage: ""
});

const mockAction = {
    execute: jest.fn(),
    canExecute: true,
    isExecuting: false
};

const getProps = (overrides = {}) => ({
    name: "test-range-datepicker",
    class: "test-class",
    startDate: mockEditableValue(null),
    endDate: mockEditableValue(null),
    minDate: undefined,
    maxDate: undefined,
    onChange: mockAction,
    showIcon: true,
    locale: "en-US",
    ...overrides
});

describe("TrimmRangeDatepicker Unit", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders with default props", () => {
        const { container } = render(createElement(TrimmRangeDatePicker, getProps()));
        const datepicker = container.querySelector('.trimm-range-datepicker');
        expect(datepicker).toBeInTheDocument();
        expect(screen.getByText("Start:")).toBeInTheDocument();
        expect(screen.getByText("End:")).toBeInTheDocument();
        expect(screen.getAllByText("—")).toHaveLength(2); // One for start, one for end
    });

    it("renders with custom class and style", () => {
        const { container } = render(createElement(TrimmRangeDatePicker, getProps({
            class: "custom-class",
            style: { backgroundColor: "red" }
        })));
        const datepicker = container.querySelector('.trimm-range-datepicker');
        expect(datepicker).toHaveClass('custom-class');
        expect(datepicker).toHaveStyle('background-color: rgb(255, 0, 0)');
    });

    it("shows icon when showIcon is true", () => {
        const { container } = render(createElement(TrimmRangeDatePicker, getProps({ showIcon: true })));
        const icons = container.querySelectorAll('.glyphicon-calendar');
        expect(icons).toHaveLength(2); // One for start, one for end
    });

    it("hides icon when showIcon is false", () => {
        const { container } = render(createElement(TrimmRangeDatePicker, getProps({ showIcon: false })));
        const icons = container.querySelectorAll('.glyphicon-calendar');
        expect(icons).toHaveLength(0);
    });

    it("opens calendar when field is clicked", () => {
        const { container } = render(createElement(TrimmRangeDatePicker, getProps()));
        const startField = screen.getByText("Start:");
        
        fireEvent.click(startField);
        
        expect(container.querySelector('.trimm-range-datepicker-popup')).toBeInTheDocument();
    });

    it("closes calendar when field is clicked again", () => {
        const { container } = render(createElement(TrimmRangeDatePicker, getProps()));
        const startField = screen.getByText("Start:");
        
        // Open calendar
        fireEvent.click(startField);
        expect(container.querySelector('.trimm-range-datepicker-popup')).toBeInTheDocument();
        
        // Close calendar
        fireEvent.click(startField);
        expect(container.querySelector('.trimm-range-datepicker-popup')).not.toBeInTheDocument();
    });

    it("selects start date when clicking on a date in start step", () => {
        const { container } = render(createElement(TrimmRangeDatePicker, getProps()));
        const startField = screen.getByText("Start:");
        
        // Open calendar
        fireEvent.click(startField);
        
        // Click on a date
        const dateCells = container.querySelectorAll('.trimm-range-datepicker-day:not(.disabled)');
        const firstDate = dateCells[0];
        fireEvent.click(firstDate);
        
        // Should show the selected date
        expect(screen.getByText(/Mon|Tue|Wed|Thu|Fri|Sat|Sun/)).toBeInTheDocument();
    });

    it("selects end date when clicking on a date in end step", () => {
        const { container } = render(createElement(TrimmRangeDatePicker, getProps()));
        const startField = screen.getByText("Start:");
        
        // Open calendar and select start date
        fireEvent.click(startField);
        const dateCells = container.querySelectorAll('.trimm-range-datepicker-day:not(.disabled)');
        const firstDate = dateCells[0];
        fireEvent.click(firstDate);
        
        // Now select end date
        const laterDate = dateCells[5]; // Pick a later date
        fireEvent.click(laterDate);
        
        // Should call onChange
        expect(mockAction.execute).toHaveBeenCalled();
    });

    it("resets to start step when end date is before start date", () => {
        const { container } = render(createElement(TrimmRangeDatePicker, getProps()));
        const startField = screen.getByText("Start:");
        
        // Open calendar and select start date
        fireEvent.click(startField);
        const dateCells = container.querySelectorAll('.trimm-range-datepicker-day:not(.disabled)');
        const firstDate = dateCells[0];
        fireEvent.click(firstDate);
        
        // Try to select an earlier date for end
        const earlierDate = dateCells[0]; // Same or earlier date
        fireEvent.click(earlierDate);
        
        // Should not call onChange, should reset to start step
        expect(mockAction.execute).not.toHaveBeenCalled();
    });

    it("handles minDate constraint", () => {
        const minDate = new Date(2025, 0, 15); // January 15, 2025
        const { container } = render(createElement(TrimmRangeDatePicker, getProps({ minDate: mockEditableValue(minDate) })));
        const startField = screen.getByText("Start:");
        
        // Open calendar
        fireEvent.click(startField);
        
        // Dates before minDate should be disabled
        const disabledDates = container.querySelectorAll('.trimm-range-datepicker-day.disabled');
        expect(disabledDates.length).toBeGreaterThan(0);
    });

    it("handles maxDate constraint", () => {
        const maxDate = new Date(2025, 0, 15); // January 15, 2025
        const { container } = render(createElement(TrimmRangeDatePicker, getProps({ maxDate: mockEditableValue(maxDate) })));
        const startField = screen.getByText("Start:");
        
        // Open calendar
        fireEvent.click(startField);
        
        // Dates after maxDate should be disabled
        const disabledDates = container.querySelectorAll('.trimm-range-datepicker-day.disabled');
        expect(disabledDates.length).toBeGreaterThan(0);
    });

    it("navigates to previous month", () => {
        const { container } = render(createElement(TrimmRangeDatePicker, getProps()));
        const startField = screen.getByText("Start:");
        
        // Open calendar
        fireEvent.click(startField);
        
        const prevButton = container.querySelector('.glyphicon-triangle-left');
        expect(prevButton).toBeInTheDocument();
        
        fireEvent.click(prevButton.parentElement);
        
        // Calendar should still be open
        expect(container.querySelector('.trimm-range-datepicker-popup')).toBeInTheDocument();
    });

    it("navigates to next month", () => {
        const { container } = render(createElement(TrimmRangeDatePicker, getProps()));
        const startField = screen.getByText("Start:");
        
        // Open calendar
        fireEvent.click(startField);
        
        const nextButton = container.querySelector('.glyphicon-triangle-right');
        expect(nextButton).toBeInTheDocument();
        
        fireEvent.click(nextButton.parentElement);
        
        // Calendar should still be open
        expect(container.querySelector('.trimm-range-datepicker-popup')).toBeInTheDocument();
    });

    it("supports dragging functionality", () => {
        const { container } = render(createElement(TrimmRangeDatePicker, getProps()));
        const startField = screen.getByText("Start:");
        
        // Open calendar
        fireEvent.click(startField);
        
        const dragHandle = container.querySelector('.trimm-range-datepicker-popup-draghandle');
        expect(dragHandle).toBeInTheDocument();
        
        // Start dragging
        fireEvent.mouseDown(dragHandle, { clientX: 100, clientY: 100 });
        
        // Move mouse
        fireEvent.mouseMove(window, { clientX: 150, clientY: 150 });
        
        // Release mouse
        fireEvent.mouseUp(window);
        
        // Calendar should still be open
        expect(container.querySelector('.trimm-range-datepicker-popup')).toBeInTheDocument();
    });

    it("handles Dutch locale", () => {
        const { container } = render(createElement(TrimmRangeDatepicker, getProps({ locale: "nl-NL" })));
        const startField = screen.getByText("Start:");
        
        // Open calendar
        fireEvent.click(startField);
        
        // Should render with Dutch locale
        expect(container.querySelector('.trimm-range-datepicker-popup')).toBeInTheDocument();
    });

    it("handles undefined onChange", () => {
        const { container } = render(createElement(TrimmRangeDatepicker, getProps({ onChange: undefined })));
        const startField = screen.getByText("Start:");
        
        // Open calendar and select dates
        fireEvent.click(startField);
        const dateCells = container.querySelectorAll('.trimm-range-datepicker-day:not(.disabled)');
        const firstDate = dateCells[0];
        fireEvent.click(firstDate);
        
        const laterDate = dateCells[5];
        fireEvent.click(laterDate);
        
        // Should not crash without onChange
        expect(container.querySelector('.trimm-range-datepicker')).toBeInTheDocument();
    });

    it("handles onChange when canExecute is false", () => {
        const onChangeWithCanExecuteFalse = {
            ...mockAction,
            canExecute: false
        };
        
        const { container } = render(createElement(TrimmRangeDatepicker, getProps({ onChange: onChangeWithCanExecuteFalse })));
        const startField = screen.getByText("Start:");
        
        // Open calendar and select dates
        fireEvent.click(startField);
        const dateCells = container.querySelectorAll('.trimm-range-datepicker-day:not(.disabled)');
        const firstDate = dateCells[0];
        fireEvent.click(firstDate);
        
        const laterDate = dateCells[5];
        fireEvent.click(laterDate);
        
        // Should not call execute when canExecute is false
        expect(onChangeWithCanExecuteFalse.execute).not.toHaveBeenCalled();
    });

    it("handles onChange when isExecuting is true", () => {
        const onChangeWithIsExecutingTrue = {
            ...mockAction,
            isExecuting: true
        };
        
        const { container } = render(createElement(TrimmRangeDatepicker, getProps({ onChange: onChangeWithIsExecutingTrue })));
        const startField = screen.getByText("Start:");
        
        // Open calendar and select dates
        fireEvent.click(startField);
        const dateCells = container.querySelectorAll('.trimm-range-datepicker-day:not(.disabled)');
        const firstDate = dateCells[0];
        fireEvent.click(firstDate);
        
        const laterDate = dateCells[5];
        fireEvent.click(laterDate);
        
        // Should not call execute when isExecuting is true
        expect(onChangeWithIsExecutingTrue.execute).not.toHaveBeenCalled();
    });

    it("displays selected dates correctly", () => {
        const startDate = new Date(2025, 0, 15);
        const endDate = new Date(2025, 0, 20);
        
        const { container } = render(createElement(TrimmRangeDatepicker, getProps({
            startDate: mockEditableValue(startDate),
            endDate: mockEditableValue(endDate)
        })));
        
        // Should display the dates
        expect(screen.getByText(/Thu Jan 15 2025|Thu Jan 16 2025/)).toBeInTheDocument();
        expect(screen.getByText(/Mon Jan 20 2025|Tue Jan 21 2025/)).toBeInTheDocument();
    });

    it("handles rapid state changes", () => {
        const { container } = render(createElement(TrimmRangeDatepicker, getProps()));
        const startField = screen.getByText("Start:");
        
        // Rapidly open and close calendar
        for (let i = 0; i < 5; i++) {
            fireEvent.click(startField);
            fireEvent.click(startField);
        }
        
        // Should not crash
        expect(container.querySelector('.trimm-range-datepicker')).toBeInTheDocument();
    });

    it("handles mouse event cleanup on unmount", () => {
        const { unmount } = render(createElement(TrimmRangeDatepicker, getProps()));
        
        // Should not throw when unmounting with active mouse events
        expect(() => unmount()).not.toThrow();
    });

    it("renders day labels correctly", () => {
        const { container } = render(createElement(TrimmRangeDatepicker, getProps()));
        const startField = screen.getByText("Start:");
        
        // Open calendar
        fireEvent.click(startField);
        
        // Should render day labels
        const dayLabels = container.querySelectorAll('.trimm-range-datepicker-day-label');
        expect(dayLabels.length).toBeGreaterThan(0);
    });

    it("handles edge case with invalid dates", () => {
        const { container } = render(createElement(TrimmRangeDatepicker, getProps({
            startDate: mockEditableValue(new Date("invalid")),
            endDate: mockEditableValue(new Date("invalid"))
        })));
        
        // Should not crash with invalid dates
        expect(container.querySelector('.trimm-range-datepicker')).toBeInTheDocument();
    });
}); 