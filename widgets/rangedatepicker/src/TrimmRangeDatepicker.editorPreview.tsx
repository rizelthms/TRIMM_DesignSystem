/** @jsx createElement */
import { createElement } from "react";
import { TrimmRangeDatePicker } from "./TrimmRangeDatepicker";
import { TrimmRangeDatepickerPreviewProps } from "../typings/TrimmRangeDatepickerProps";
import { useState } from "react";
import { ValueStatus, EditableValue } from "mendix";

export function preview(props: TrimmRangeDatepickerPreviewProps) {
    const [start, setStart] = useState(new Date());
    const [end, setEnd] = useState(new Date(Date.now() + 86400000)); // +1 day
    const daysFromNow = (days: number) => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        return d;
    };
    return (
        <div className="trimm-range-datepicker-preview-wrapper">
            <TrimmRangeDatePicker
                name="TrimmRangeDatepickerPreview"
                {...{ ...props, style: undefined }}
                startDate={{
                    value: start,
                    status: ValueStatus.Available,
                    isList: false,
                    displayValue: start.toDateString(),
                    setValue: (d: Date) => setStart(d),
                    setTextValue: () => { },
                    setTextValueWithCallback: () => { },
                    setValueWithCallback: (d: Date, cb: () => void) => { setStart(d); cb(); },
                    setFormatter: () => { },
                    readOnly: false,
                    setValidator: () => { }
                } as unknown as EditableValue<Date>}
                endDate={{
                    value: end,
                    status: ValueStatus.Available,
                    isList: false,
                    displayValue: end.toDateString(),
                    setValue: (d: Date) => setEnd(d),
                    setTextValue: () => { },
                    setTextValueWithCallback: () => { },
                    setValueWithCallback: (d: Date, cb: () => void) => { setEnd(d); cb(); },
                    setFormatter: () => { },
                    readOnly: false,
                    setValidator: () => { }
                } as unknown as EditableValue<Date>}
                minDate={{
                    value: daysFromNow(-5),
                    status: ValueStatus.Available,
                    displayValue: "",
                    setValue: () => { }
                } as unknown as EditableValue<Date>}
                maxDate={{
                    value: daysFromNow(10),
                    status: ValueStatus.Available,
                    displayValue: "",
                    setValue: () => { }
                } as unknown as EditableValue<Date>}
                showIcon={true}
                locale={"en_US"}
                onChange={undefined} />
        </div>
    );
}
