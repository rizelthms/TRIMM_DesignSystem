/** @jsx createElement */
import { createElement, useRef, useState } from "react";
import { TrimmDropdownContainerProps } from "../typings/TrimmDropdownProps";
import "./ui/TrimmDropdown.css";

export function TrimmDropdown({ dropdownItems, icon }: TrimmDropdownContainerProps) {
    const [open, setOpen] = useState(false);
    const toggleRef = useRef<HTMLButtonElement>(null);

    const renderIcon = () => {
        if (!icon?.value) return null;

        if ("iconClass" in icon.value && icon.value.iconClass) {
            // Glyphicon or Atlas (legacy)
            return <i className={`trimm-dropdown-icon ${icon.value.iconClass}`} />;
        }

        if ("iconUrl" in icon.value && icon.value.iconUrl) {
            // Image icon
            return <img src={icon.value.iconUrl} alt="dropdown icon" className="trimm-dropdown-icon" />;
        }

        return null;
    };

    return (
        <div className="trimm-dropdown">
            <button
                ref={toggleRef}
                className="trimm-dropdown-toggle"
                onClick={() => setOpen(prev => !prev)}
                type="button"
            >
                {renderIcon()}
                <span className="trimm-dropdown-label">Options</span>
                <span className="material-symbols-outlined">expand_more</span>
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
