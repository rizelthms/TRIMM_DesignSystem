/** @jsx createElement */
import { createElement, useRef, useState } from "react";
import { TrimmDropdownContainerProps } from "../typings/TrimmDropdownProps";
import "./ui/TrimmDropdown.css";

export function TrimmDropdown({ items }: TrimmDropdownContainerProps) {
    const [open, setOpen] = useState(false);
    const toggleRef = useRef<HTMLButtonElement>(null);

    return (
        <div className="trimm-dropdown">
            <button
                ref={toggleRef}
                className="trimm-dropdown-toggle"
                onClick={() => setOpen(prev => !prev)}
                type="button"
            >
                Options
            </button>

            {open && (
                <div className="trimm-dropdown-menu">
                    {Array.isArray(items) && items.map((item, idx) => (
                        <div key={idx} className="trimm-dropdown-item">
                            {item}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
