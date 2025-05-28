/** @jsx createElement */
import { createElement, useRef, useState } from "react";
import { TrimmDropdownContainerProps } from "../typings/TrimmDropdownProps";
import "./ui/TrimmDropdown.css";

export function TrimmDropdown({ dropdownItems, icon }: TrimmDropdownContainerProps) {
    const [open, setOpen] = useState(false);
    const toggleRef = useRef<HTMLButtonElement>(null);

    const renderIcon = () => {
        if (!icon?.value) return null;

        const { type } = icon.value;

        if (type === "icon" && 'iconClass' in icon.value && icon.value.iconClass) {
            // Atlas or custom font icon
            return <span className={`trimm-dropdown-icon ${icon.value.iconClass}`} />;
        }

        if (type === "glyph" && 'iconClass' in icon.value && icon.value.iconClass) {
            // Glyphicon (Bootstrap 3) - less common in modern Atlas 3
            return <span className={`glyphicon ${icon.value.iconClass} trimm-dropdown-icon`} />;
        }

        if (type === "image" && 'iconUrl' in icon.value && icon.value.iconUrl) {
            // Image icon
            return <img src={icon.value.iconUrl} alt="dropdown icon" className="trimm-dropdown-icon" />;
        }

        return null; // Should not happen if type is one of the above
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
