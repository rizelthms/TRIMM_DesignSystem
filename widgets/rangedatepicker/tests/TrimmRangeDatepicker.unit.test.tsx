import { render, screen, fireEvent, act } from "@testing-library/react";
import { TrimmRangeDatePicker } from "../src/TrimmRangeDatepicker";
import { createElement } from "react";
import { LocaleEnum } from "../typings/TrimmRangeDatepickerProps";

// Mock Mendix types
const mockEditableValue = (value: Date | null) => ({
    value,
    status: "available" as const,
    setValue: jest.fn(),
    setFormatter: jest.fn(),
    setValidator: jest.fn(),
    setTextValue: jest.fn(),
    isList: false,
    displayValue: value && !isNaN(value.getTime()) ? value.toISOString() : "",
    validation: "",
    formatter: jest.fn(),
    readOnly: false,
    required: false,
    hasError: false,
    errorMessage: "",
    severity: "error" as const
} as any);

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
    locale: "en_US" as LocaleEnum,
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
        expect(datepicker).toHaveStyle('background-color: red');
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
        
        // Should call onChange, should reset to start step
        expect(mockAction.execute).toHaveBeenCalled();
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
        
        fireEvent.click(prevButton!.parentElement!);
        
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
        
        fireEvent.click(nextButton!.parentElement!);
        
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
        fireEvent.mouseDown(dragHandle!, { clientX: 100, clientY: 100 });
        
        // Move mouse
        fireEvent.mouseMove(window, { clientX: 150, clientY: 150 });
        
        // Release mouse
        fireEvent.mouseUp(window);
        
        // Calendar should still be open
        expect(container.querySelector('.trimm-range-datepicker-popup')).toBeInTheDocument();
    });

    it("handles Dutch locale", () => {
        const { container } = render(createElement(TrimmRangeDatePicker, getProps({ locale: "nl-NL" })));
        const startField = screen.getByText("Start:");
        
        // Open calendar
        fireEvent.click(startField);
        
        // Should render with Dutch locale
        expect(container.querySelector('.trimm-range-datepicker-popup')).toBeInTheDocument();
    });

    it("handles undefined onChange", () => {
        const { container } = render(createElement(TrimmRangeDatePicker, getProps({ onChange: undefined })));
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
        
        const { container } = render(createElement(TrimmRangeDatePicker, getProps({ onChange: onChangeWithCanExecuteFalse }))); 
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
        
                const { container } = render(createElement(TrimmRangeDatePicker, getProps({ onChange: onChangeWithIsExecutingTrue }))); 
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
        
        const { container } = render(createElement(TrimmRangeDatePicker, getProps({
            startDate: mockEditableValue(startDate),
            endDate: mockEditableValue(endDate)
        })));
        
        // Should display the dates
        expect(screen.getByText('Wed Jan 15 2025')).toBeInTheDocument();
        expect(screen.getByText('Mon Jan 20 2025')).toBeInTheDocument();
    });

    it("handles rapid state changes", () => {
        const { container } = render(createElement(TrimmRangeDatePicker, getProps()));
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
        const { unmount } = render(createElement(TrimmRangeDatePicker, getProps()));
        
        // Should not throw when unmounting with active mouse events
        expect(() => unmount()).not.toThrow();
    });

    it("renders day labels correctly", () => {
        const { container } = render(createElement(TrimmRangeDatePicker, getProps()));
        const startField = screen.getByText("Start:");
        
        // Open calendar
        fireEvent.click(startField);
        
        // Should render day labels
        const dayLabels = container.querySelectorAll('.trimm-range-datepicker-day-label');
        expect(dayLabels.length).toBeGreaterThan(0);
    });

    it("handles edge case with invalid dates", () => {
        const { container } = render(createElement(TrimmRangeDatePicker, getProps({
            startDate: mockEditableValue(new Date("invalid")),
            endDate: mockEditableValue(new Date("invalid"))
        })));
        
        // Should not crash with invalid dates
        expect(container.querySelector('.trimm-range-datepicker')).toBeInTheDocument();
    });

    it("handles different locale formats", () => {
        // Test English locale
                const { container: containerEn } = render(createElement(TrimmRangeDatePicker, getProps({ locale: "en_US" as LocaleEnum })));
        expect(containerEn.querySelector('.trimm-range-datepicker')).toBeInTheDocument();

        // Test Dutch locale
        const { container: containerNl } = render(createElement(TrimmRangeDatePicker, getProps({ locale: "nl_NL" as LocaleEnum })));
        expect(containerNl.querySelector('.trimm-range-datepicker')).toBeInTheDocument();
        
        // Test Dutch with country code
        const { container: containerNlNl } = render(createElement(TrimmRangeDatePicker, getProps({ locale: "nl-NL" })));
        expect(containerNlNl.querySelector('.trimm-range-datepicker')).toBeInTheDocument();
        
        // Test English with country code
        const { container: containerEnUs } = render(createElement(TrimmRangeDatePicker, getProps({ locale: "en-US" })));
        expect(containerEnUs.querySelector('.trimm-range-datepicker')).toBeInTheDocument();
        
        // Test undefined locale (should default to en-US)
        const { container: containerUndefined } = render(createElement(TrimmRangeDatePicker, getProps({ locale: undefined })));
        expect(containerUndefined.querySelector('.trimm-range-datepicker')).toBeInTheDocument();
    });

    it("handles mouse move and mouse up events during dragging", () => {
        const { container } = render(createElement(TrimmRangeDatePicker, getProps()));
        const startField = screen.getByText("Start:");
        
        // Open calendar
        fireEvent.click(startField);
        
        const dragHandle = container.querySelector('.trimm-range-datepicker-popup-draghandle');
        expect(dragHandle).toBeInTheDocument();
        
        // Start dragging
        fireEvent.mouseDown(dragHandle!, { clientX: 100, clientY: 100 });
        
        // Move mouse multiple times
        fireEvent.mouseMove(window, { clientX: 150, clientY: 150 });
        fireEvent.mouseMove(window, { clientX: 200, clientY: 200 });
        
        // Release mouse
        fireEvent.mouseUp(window);
        
        // Calendar should still be open
        expect(container.querySelector('.trimm-range-datepicker-popup')).toBeInTheDocument();
    });

    it("handles date selection with disabled dates", () => {
        const { container } = render(createElement(TrimmRangeDatePicker, getProps()));
        const startField = screen.getByText("Start:");
        
        // Open calendar
        fireEvent.click(startField);
        
        // Try to click on disabled dates (should not trigger handleClickDate)
        const disabledDates = container.querySelectorAll('.trimm-range-datepicker-day.disabled');
        if (disabledDates.length > 0) {
            fireEvent.click(disabledDates[0]);
            // Should not show any selected date
            expect(screen.getAllByText("—")).toHaveLength(2);
        }
    });

    it("handles date selection in range mode", () => {
        const { container } = render(createElement(TrimmRangeDatePicker, getProps()));
        const startField = screen.getByText("Start:");
        
        // Open calendar and select start date
        fireEvent.click(startField);
        const dateCells = container.querySelectorAll('.trimm-range-datepicker-day:not(.disabled)');
        const firstDate = dateCells[0];
        fireEvent.click(firstDate);
        
        // Select end date that creates a range
        const rangeEndDate = dateCells[10]; // Pick a date that creates a range
        fireEvent.click(rangeEndDate);
        
        // Should call onChange for the range
        expect(mockAction.execute).toHaveBeenCalled();
    });

    it("handles month navigation multiple times", () => {
        const { container } = render(createElement(TrimmRangeDatePicker, getProps()));
        const startField = screen.getByText("Start:");
        
        // Open calendar
        fireEvent.click(startField);
        
        const prevButton = container.querySelector('.glyphicon-triangle-left');
        const nextButton = container.querySelector('.glyphicon-triangle-right');
        
        // Navigate multiple months
        fireEvent.click(prevButton!.parentElement!);
        fireEvent.click(prevButton!.parentElement!);
        fireEvent.click(nextButton!.parentElement!);
        fireEvent.click(nextButton!.parentElement!);
        
        // Calendar should still be open
        expect(container.querySelector('.trimm-range-datepicker-popup')).toBeInTheDocument();
    });

    it("handles popup positioning when calendar opens", () => {
        const { container } = render(createElement(TrimmRangeDatePicker, getProps()));
        const startField = screen.getByText("Start:");
        
        // Mock getBoundingClientRect
        const mockRect = {
            left: 100,
            bottom: 200,
            top: 150,
            right: 300,
            width: 200,
            height: 50,
            x: 100,
            y: 150,
            toJSON: () => mockRect
        };
        
        const mockGetBoundingClientRect = jest.fn(() => mockRect);
        Object.defineProperty(window, 'scrollX', { value: 0, writable: true });
        Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
        
        // Mock the toggleRef element
        const toggleElement = container.querySelector('.trimm-range-datepicker-toggle');
        if (toggleElement) {
            toggleElement.getBoundingClientRect = mockGetBoundingClientRect;
        }
        
        // Open calendar
        fireEvent.click(startField);
        
        // Should have positioned popup
        expect(container.querySelector('.trimm-range-datepicker-popup')).toBeInTheDocument();
    });

    it("handles onChange execution conditions", () => {
        const onChangeWithConditions = {
            execute: jest.fn(),
            canExecute: true,
            isExecuting: false
        };
        
        const { container } = render(createElement(TrimmRangeDatePicker, getProps({ onChange: onChangeWithConditions })));
        const startField = screen.getByText("Start:");
        
        // Open calendar and select dates
        fireEvent.click(startField);
        const dateCells = container.querySelectorAll('.trimm-range-datepicker-day:not(.disabled)');
        const firstDate = dateCells[0];
        fireEvent.click(firstDate);
        
        const laterDate = dateCells[5];
        fireEvent.click(laterDate);
        
        // Should call execute when conditions are met
        expect(onChangeWithConditions.execute).toHaveBeenCalled();
    });

    it("handles date constraints with edge cases", () => {
        const minDate = new Date(2025, 0, 1);
        const maxDate = new Date(2025, 11, 31);
        
        const { container } = render(createElement(TrimmRangeDatePicker, getProps({
            minDate: mockEditableValue(minDate),
            maxDate: mockEditableValue(maxDate)
        })));
        const startField = screen.getByText("Start:");
        
        // Open calendar
        fireEvent.click(startField);
        
        // Should have disabled dates outside the range
        const disabledDates = container.querySelectorAll('.trimm-range-datepicker-day.disabled');
        expect(disabledDates.length).toBeGreaterThan(0);
        
        // Try to select a disabled date
        if (disabledDates.length > 0) {
            fireEvent.click(disabledDates[0]);
            // Should not show any selected date
            expect(screen.getAllByText("—")).toHaveLength(2);
        }
    });

    it("handles rapid date selection", () => {
        const { container } = render(createElement(TrimmRangeDatePicker, getProps()));
        const startField = screen.getByText("Start:");
        
        // Open calendar
        fireEvent.click(startField);
        
        const dateCells = container.querySelectorAll('.trimm-range-datepicker-day:not(.disabled)');
        
        // Rapidly click different dates
        for (let i = 0; i < Math.min(5, dateCells.length); i++) {
            fireEvent.click(dateCells[i]);
        }
        
        // Should not crash
        expect(container.querySelector('.trimm-range-datepicker')).toBeInTheDocument();
    });

    it("handles component unmount during dragging", () => {
        const { container, unmount } = render(createElement(TrimmRangeDatePicker, getProps()));
        const startField = screen.getByText("Start:");
        
        // Open calendar
        fireEvent.click(startField);
        
        const dragHandle = container.querySelector('.trimm-range-datepicker-popup-draghandle');
        
        // Start dragging
        fireEvent.mouseDown(dragHandle!, { clientX: 100, clientY: 100 });
        
        // Unmount while dragging
        expect(() => unmount()).not.toThrow();
    });

    it("handles date selection with same start and end date", () => {
        const { container } = render(createElement(TrimmRangeDatePicker, getProps()));
        const startField = screen.getByText("Start:");
        
        // Open calendar and select start date
        fireEvent.click(startField);
        const dateCells = container.querySelectorAll('.trimm-range-datepicker-day:not(.disabled)');
        const firstDate = dateCells[0];
        fireEvent.click(firstDate);
        
        // Select the same date for end
        fireEvent.click(firstDate);
        
        // Should call onChange even for same date
        expect(mockAction.execute).toHaveBeenCalled();
    });

    it("handles date selection with null values", () => {
        const { container } = render(createElement(TrimmRangeDatePicker, getProps({
            startDate: mockEditableValue(null),
            endDate: mockEditableValue(null)
        })));
        
        // Should render without crashing
        expect(container.querySelector('.trimm-range-datepicker')).toBeInTheDocument();
        expect(screen.getAllByText("—")).toHaveLength(2);
    });
}); 