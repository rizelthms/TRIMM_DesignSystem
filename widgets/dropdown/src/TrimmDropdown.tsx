/** @jsx createElement */
import { createElement, useRef, useState } from "react";
import { TrimmDropdownContainerProps } from "../typings/TrimmDropdownProps";
import "./ui/TrimmDropdown.css";

export function TrimmDropdown({ dropdownItems }: TrimmDropdownContainerProps) {
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
                Options <span className="material-symbols-outlined">expand_more</span>
            </button>

            {open && (
                <div className="trimm-dropdown-menu">
                    {dropdownItems?.map((item, idx) => (
                        <div
                            key={idx}
                            className="trimm-dropdown-item"
                            onClick={() => item.action?.execute?.()}
                        >
                            {item.caption}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
