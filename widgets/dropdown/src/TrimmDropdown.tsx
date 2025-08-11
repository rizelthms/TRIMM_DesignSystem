/** @jsx createElement */
import { createElement, useRef, useState } from "react";
import { TrimmDropdownContainerProps } from "../typings/TrimmDropdownProps";
import { DynamicValue, WebIcon } from "mendix";

/**
 * TRIMM Dropdown Widget
 * 
 * A Mendix pluggable widget that provides a customizable dropdown menu
 * styled with the TRIMM Design System. Features flexible option selection,
 * icon support, and seamless integration with Mendix actions.
 */

/**
 * Main TRIMM Dropdown component
 * Provides a toggle button that opens a dropdown menu with configurable items
 */
export function TrimmDropdown({ dropdownItems, icon, showCaretIcon, caption, class: className, style }: TrimmDropdownContainerProps) {
    const [open, setOpen] = useState(false);
    const toggleRef = useRef<HTMLButtonElement>(null);

    /**
     * Renders the appropriate icon based on the icon type
     * Supports Glyphicon, MDI, and image icons
     */
    const renderIcon = (iconProp: DynamicValue<WebIcon> | undefined) => {
        if (!iconProp?.value) return null;
        const { type } = iconProp.value;

        // Handle MDI icons
        if (type === "icon" && "iconClass" in iconProp.value && iconProp.value.iconClass) {
            return <span className={`trimm-dropdown-icon ${iconProp.value.iconClass}`} />;
        }

        // Handle Glyphicon icons
        if (type === "glyph" && "iconClass" in iconProp.value && iconProp.value.iconClass) {
            return <span className={`glyphicon ${iconProp.value.iconClass} trimm-dropdown-icon`} />;
        }

        // Handle image icons
        if (type === "image" && "iconUrl" in iconProp.value && iconProp.value.iconUrl) {
            return <img src={iconProp.value.iconUrl} alt="icon" className="trimm-dropdown-icon" />;
        }

        return null;
    };

    return (
        <div className={`trimm-dropdown${className ? ` ${className}` : ""}`} style={style}>
            <button
                ref={toggleRef}
                className="trimm-dropdown-toggle"
                onClick={() => setOpen(prev => !prev)}
                type="button"
            >
                {renderIcon(icon)}
                <span className="trimm-dropdown-label">{caption || "Options"}</span>
                {showCaretIcon && <span className="glyphicon glyphicon-chevron-down trimm-dropdown-caret" />}
            </button>

            {open && (
                <div className="trimm-dropdown-menu">
                    {dropdownItems?.map((item, idx) => (
                        <div
                            key={idx}
                            className="trimm-dropdown-item"
                            onClick={() => {
                                // Execute action if available and can be executed
                                if (item.action?.canExecute && !item.action?.isExecuting) {
                                    item.action.execute();
                                }
                            }}
                        >
                            {item.caption}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
