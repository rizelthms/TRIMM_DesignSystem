import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react";
import { TrimmRangeDatePicker } from "../src/TrimmRangeDatepicker";
import { createElement } from "react";
import { LocaleEnum } from "../typings/TrimmRangeDatepickerProps";

// Mock Mendix types for integration testing
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

describe("TrimmRangeDatepicker integration", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        document.body.innerHTML = "";
    });

    it("renders the range datepicker with start and end fields", () => {
        render(createElement(TrimmRangeDatePicker, getProps()));
        expect(screen.getByText("Start:")).toBeInTheDocument();
        expect(screen.getByText("End:")).toBeInTheDocument();
        expect(screen.getAllByText("—")).toHaveLength(2);
    });

    it("opens and closes the calendar popup when clicking fields", async () => {
        render(createElement(TrimmRangeDatePicker, getProps()));
        const startField = screen.getByText("Start:");
        
        // Open calendar
        fireEvent.click(startField);
        expect(document.querySelector('.trimm-range-datepicker-popup')).toBeInTheDocument();
        
        // Close calendar by clicking again
        fireEvent.click(startField);
        await waitFor(() => {
            expect(document.querySelector('.trimm-range-datepicker-popup')).not.toBeInTheDocument();
        });
    });

    it("selects start date and moves to end date selection", async () => {
        render(createElement(TrimmRangeDatePicker, getProps()));
        const startField = screen.getByText("Start:");
        
        // Open calendar
        fireEvent.click(startField);
        
        // Select a start date
        const dateCells = document.querySelectorAll('.trimm-range-datepicker-day:not(.disabled)');
        const firstDate = dateCells[0];
        fireEvent.click(firstDate);
        
        // Should show selected date and remain open for end date selection
        expect(document.querySelector('.trimm-range-datepicker-popup')).toBeInTheDocument();
        // The placeholder '—' remains until both dates are selected
        expect(screen.getAllByText("—")).toHaveLength(1);
    });

    it("completes full range selection and calls onChange", async () => {
        render(createElement(TrimmRangeDatePicker, getProps()));
        const startField = screen.getByText("Start:");
        
        // Open calendar and select start date
        fireEvent.click(startField);
        const dateCells = document.querySelectorAll('.trimm-range-datepicker-day:not(.disabled)');
        const firstDate = dateCells[0];
        fireEvent.click(firstDate);
        
        // Select end date
        const laterDate = dateCells[5];
        fireEvent.click(laterDate);
        
        // Should call onChange
        expect(mockAction.execute).toHaveBeenCalled();
        
        // Calendar should close
        await waitFor(() => {
            expect(document.querySelector('.trimm-range-datepicker-popup')).not.toBeInTheDocument();
        });
    });

    it("handles date constraints with min and max dates", () => {
        const minDate = new Date(2025, 0, 15);
        const maxDate = new Date(2025, 0, 25);
        
        render(createElement(TrimmRangeDatePicker, getProps({
            minDate: mockEditableValue(minDate),
            maxDate: mockEditableValue(maxDate)
        })));
        
        const startField = screen.getByText("Start:");
        fireEvent.click(startField);
        
        // Should have disabled dates outside the range
        const disabledDates = document.querySelectorAll('.trimm-range-datepicker-day.disabled');
        expect(disabledDates.length).toBeGreaterThan(0);
        
        // Try to click disabled date
        if (disabledDates.length > 0) {
            fireEvent.click(disabledDates[0]);
            // Should not select disabled date
            expect(screen.getAllByText("—")).toHaveLength(2);
        }
    });

    it("navigates between months using arrow buttons", () => {
        render(createElement(TrimmRangeDatePicker, getProps()));
        const startField = screen.getByText("Start:");
        fireEvent.click(startField);
        
        const prevButton = document.querySelector('.glyphicon-triangle-left');
        const nextButton = document.querySelector('.glyphicon-triangle-right');
        
        expect(prevButton).toBeInTheDocument();
        expect(nextButton).toBeInTheDocument();
        
        // Navigate to previous month
        fireEvent.click(prevButton!.parentElement!);
        expect(document.querySelector('.trimm-range-datepicker-popup')).toBeInTheDocument();
        
        // Navigate to next month
        fireEvent.click(nextButton!.parentElement!);
        expect(document.querySelector('.trimm-range-datepicker-popup')).toBeInTheDocument();
    });

    it("supports dragging the popup", () => {
        render(createElement(TrimmRangeDatePicker, getProps()));
        const startField = screen.getByText("Start:");
        fireEvent.click(startField);
        
        const dragHandle = document.querySelector('.trimm-range-datepicker-popup-draghandle');
        expect(dragHandle).toBeInTheDocument();
        
        // Start dragging
        fireEvent.mouseDown(dragHandle!, { clientX: 100, clientY: 100 });
        
        // Move mouse
        fireEvent.mouseMove(window, { clientX: 150, clientY: 150 });
        
        // Release mouse
        fireEvent.mouseUp(window);
        
        // Popup should still be open
        expect(document.querySelector('.trimm-range-datepicker-popup')).toBeInTheDocument();
    });

    it("handles different locales correctly", () => {
        // Test English locale
        const { unmount } = render(createElement(TrimmRangeDatePicker, getProps({ locale: "en_US" as LocaleEnum })));
        expect(screen.getByText("Start:")).toBeInTheDocument();
        unmount();
        
        // Test Dutch locale
        render(createElement(TrimmRangeDatePicker, getProps({ locale: "nl_NL" as LocaleEnum })));
        expect(screen.getByText("Start:")).toBeInTheDocument();
    });

    it("displays selected dates correctly", () => {
        const startDate = new Date(2025, 0, 15);
        const endDate = new Date(2025, 0, 20);
        
        render(createElement(TrimmRangeDatePicker, getProps({
            startDate: mockEditableValue(startDate),
            endDate: mockEditableValue(endDate)
        })));
        
        // Should display the formatted dates
        expect(screen.getByText('Wed Jan 15 2025')).toBeInTheDocument();
        expect(screen.getByText('Mon Jan 20 2025')).toBeInTheDocument();
    });

    it("handles rapid date selection without crashing", () => {
        render(createElement(TrimmRangeDatePicker, getProps()));
        const startField = screen.getByText("Start:");
        
        // Rapidly open and close calendar
        for (let i = 0; i < 5; i++) {
            fireEvent.click(startField);
            fireEvent.click(startField);
        }
        
        // Should not crash
        expect(screen.getByText("Start:")).toBeInTheDocument();
    });

    it("handles onChange when canExecute is false", () => {
        const onChangeWithCanExecuteFalse = {
            ...mockAction,
            canExecute: false
        };
        
        render(createElement(TrimmRangeDatePicker, getProps({ onChange: onChangeWithCanExecuteFalse })));
        const startField = screen.getByText("Start:");
        
        // Open calendar and select dates
        fireEvent.click(startField);
        const dateCells = document.querySelectorAll('.trimm-range-datepicker-day:not(.disabled)');
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
        
        render(createElement(TrimmRangeDatePicker, getProps({ onChange: onChangeWithIsExecutingTrue })));
        const startField = screen.getByText("Start:");
        
        // Open calendar and select dates
        fireEvent.click(startField);
        const dateCells = document.querySelectorAll('.trimm-range-datepicker-day:not(.disabled)');
        const firstDate = dateCells[0];
        fireEvent.click(firstDate);
        
        const laterDate = dateCells[5];
        fireEvent.click(laterDate);
        
        // Should not call execute when isExecuting is true
        expect(onChangeWithIsExecutingTrue.execute).not.toHaveBeenCalled();
    });

    it("handles undefined onChange gracefully", () => {
        render(createElement(TrimmRangeDatePicker, getProps({ onChange: undefined })));
        const startField = screen.getByText("Start:");
        
        // Open calendar and select dates
        fireEvent.click(startField);
        const dateCells = document.querySelectorAll('.trimm-range-datepicker-day:not(.disabled)');
        const firstDate = dateCells[0];
        fireEvent.click(firstDate);
        
        const laterDate = dateCells[5];
        fireEvent.click(laterDate);
        
        // Should not crash without onChange
        expect(screen.getByText("Start:")).toBeInTheDocument();
    });

    it("handles invalid dates gracefully", () => {
        render(createElement(TrimmRangeDatePicker, getProps({
            startDate: mockEditableValue(new Date("invalid")),
            endDate: mockEditableValue(new Date("invalid"))
        })));
        
        // Should not crash with invalid dates
        expect(screen.getByText("Start:")).toBeInTheDocument();
        expect(screen.getAllByText("—")).toHaveLength(2);
    });

    it("handles null date values", () => {
        render(createElement(TrimmRangeDatePicker, getProps({
            startDate: mockEditableValue(null),
            endDate: mockEditableValue(null)
        })));
        
        // Should render without crashing
        expect(screen.getByText("Start:")).toBeInTheDocument();
        expect(screen.getAllByText("—")).toHaveLength(2);
    });

    it("handles same start and end date selection", () => {
        render(createElement(TrimmRangeDatePicker, getProps()));
        const startField = screen.getByText("Start:");
        
        // Open calendar and select start date
        fireEvent.click(startField);
        const dateCells = document.querySelectorAll('.trimm-range-datepicker-day:not(.disabled)');
        const firstDate = dateCells[0];
        fireEvent.click(firstDate);
        
        // Select the same date for end
        fireEvent.click(firstDate);
        
        // Should call onChange even for same date
        expect(mockAction.execute).toHaveBeenCalled();
    });

    it("handles mouse events during dragging", () => {
        render(createElement(TrimmRangeDatePicker, getProps()));
        const startField = screen.getByText("Start:");
        fireEvent.click(startField);
        
        const dragHandle = document.querySelector('.trimm-range-datepicker-popup-draghandle');
        
        // Start dragging
        fireEvent.mouseDown(dragHandle!, { clientX: 100, clientY: 100 });
        
        // Move mouse multiple times
        fireEvent.mouseMove(window, { clientX: 150, clientY: 150 });
        fireEvent.mouseMove(window, { clientX: 200, clientY: 200 });
        
        // Release mouse
        fireEvent.mouseUp(window);
        
        // Popup should still be open
        expect(document.querySelector('.trimm-range-datepicker-popup')).toBeInTheDocument();
    });

    it("handles component unmount during interaction", () => {
        const { unmount } = render(createElement(TrimmRangeDatePicker, getProps()));
        const startField = screen.getByText("Start:");
        
        // Open calendar
        fireEvent.click(startField);
        
        // Unmount while calendar is open
        expect(() => unmount()).not.toThrow();
    });

    it("handles rapid state changes", () => {
        render(createElement(TrimmRangeDatePicker, getProps()));
        const startField = screen.getByText("Start:");
        
        // Rapidly open and close calendar
        for (let i = 0; i < 10; i++) {
            fireEvent.click(startField);
            fireEvent.click(startField);
        }
        
        // Should not crash
        expect(screen.getByText("Start:")).toBeInTheDocument();
    });

    it("handles date selection with disabled dates", () => {
        const minDate = new Date(2025, 0, 15);
        render(createElement(TrimmRangeDatePicker, getProps({
            minDate: mockEditableValue(minDate)
        })));
        
        const startField = screen.getByText("Start:");
        fireEvent.click(startField);
        
        // Try to click on disabled dates
        const disabledDates = document.querySelectorAll('.trimm-range-datepicker-day.disabled');
        if (disabledDates.length > 0) {
            fireEvent.click(disabledDates[0]);
            // Should not show any selected date
            expect(screen.getAllByText("—")).toHaveLength(2);
        }
    });

    it("handles popup positioning", () => {
        render(createElement(TrimmRangeDatePicker, getProps()));
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
        const toggleElement = document.querySelector('.trimm-range-datepicker-toggle');
        if (toggleElement) {
            toggleElement.getBoundingClientRect = mockGetBoundingClientRect;
        }
        
        // Open calendar
        fireEvent.click(startField);
        
        // Should have positioned popup
        expect(document.querySelector('.trimm-range-datepicker-popup')).toBeInTheDocument();
    });

    it("handles multiple rapid date selections", () => {
        render(createElement(TrimmRangeDatePicker, getProps()));
        const startField = screen.getByText("Start:");
        
        // Open calendar
        fireEvent.click(startField);
        
        const dateCells = document.querySelectorAll('.trimm-range-datepicker-day:not(.disabled)');
        
        // Rapidly click different dates
        for (let i = 0; i < Math.min(5, dateCells.length); i++) {
            fireEvent.click(dateCells[i]);
        }
        
        // Should not crash
        expect(screen.getByText("Start:")).toBeInTheDocument();
    });

    it("handles edge case with very early dates", () => {
        const earlyDate = new Date(1900, 0, 1);
        render(createElement(TrimmRangeDatePicker, getProps({
            startDate: mockEditableValue(earlyDate),
            endDate: mockEditableValue(earlyDate)
        })));
        
        // Should render without crashing
        expect(screen.getByText("Start:")).toBeInTheDocument();
    });

    it("handles edge case with very late dates", () => {
        const lateDate = new Date(2100, 11, 31);
        render(createElement(TrimmRangeDatePicker, getProps({
            startDate: mockEditableValue(lateDate),
            endDate: mockEditableValue(lateDate)
        })));
        
        // Should render without crashing
        expect(screen.getByText("Start:")).toBeInTheDocument();
    });

    it("handles date selection with timezone considerations", () => {
        render(createElement(TrimmRangeDatePicker, getProps()));
        const startField = screen.getByText("Start:");
        
        // Open calendar and select dates
        fireEvent.click(startField);
        const dateCells = document.querySelectorAll('.trimm-range-datepicker-day:not(.disabled)');
        const firstDate = dateCells[0];
        fireEvent.click(firstDate);
        
        const laterDate = dateCells[5];
        fireEvent.click(laterDate);
        
        // Should call onChange with proper date objects if available
        expect(mockAction.execute).toHaveBeenCalled();
        const callArgs = mockAction.execute.mock.calls[0][0];
        if (callArgs && callArgs.startDate && callArgs.endDate) {
            expect(callArgs.startDate).toBeInstanceOf(Date);
            expect(callArgs.endDate).toBeInstanceOf(Date);
        }
    });

    it("supports focus and blur events for accessibility", () => {
        render(createElement(TrimmRangeDatePicker, getProps()));
        // Select the first button (start field)
        const startButton = document.querySelectorAll('.trimm-range-datepicker-field')[0] as HTMLButtonElement;
        // JSDOM does not always update document.activeElement as in browsers
        expect(() => fireEvent.focus(startButton)).not.toThrow();
        expect(() => fireEvent.blur(startButton)).not.toThrow();
    });
}); 