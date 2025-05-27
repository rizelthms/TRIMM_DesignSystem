/** @jsx createElement */
import { createElement, useState, useRef } from "react";
import { TrimmDropdownContainerProps } from "../typings/TrimmDropdownProps";
import "./ui/TrimmDropdown.css";

export function TrimmDropdown({ }: TrimmDropdownContainerProps) {
    const [open, setOpen] = useState(false);
    const toggleRef = useRef<HTMLButtonElement>(null);

    const dropdownOptions = ["Option 1", "Option 2", "Option 3"];

    return (
        <div className="trimm-dropdown">
            <button
                ref={toggleRef}
                className="trimm-dropdown-toggle"
                onClick={() => setOpen(prev => !prev)}
                type="button"
            >
                Options <span className="material-symbols-outlined">expand_more</span>
            </button>

            {open && (
                <div className="trimm-dropdown-menu">
                    {/* Map over the hardcoded options instead of the 'items' prop */}
                    {dropdownOptions.map((item, idx) => (
                        <div key={idx} className="trimm-dropdown-item">
                            {item}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
