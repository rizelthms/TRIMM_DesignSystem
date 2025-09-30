/** @jsx createElement */
import { createElement, useRef, useState } from "react";
import { TrimmDropdownContainerProps } from "../typings/TrimmDropdownProps";
import { DynamicValue, WebIcon } from "mendix";

/**
 * TRIMM Design System - Dropdown Widget
 * 
 * A Mendix pluggable widget that provides a customizable dropdown menu
 * styled with the TRIMM Design System. Features flexible option selection,
 * icon support, and seamless integration with Mendix actions.
 * 
 * Key Features:
 * - Toggle button that opens a dropdown menu when clicked
 * - Configurable list of items with optional Mendix actions
 * - Support for Glyphicon, MDI, or image icons on the button
 * - Optional caret arrow indicator for visual feedback
 * - Hover states and interactive visual feedback
 * - No entity context required - works with static configuration
 * 
 * Architecture:
 * - Uses React state for dropdown open/close management
 * - Supports multiple icon types through Mendix WebIcon system
 * - Implements action execution with canExecute and isExecuting validation
 * - Provides accessibility support with proper button semantics
 */

/**
 * Main TRIMM Dropdown component
 * Provides a toggle button that opens a dropdown menu with configurable items
 */
export function TrimmDropdown({ dropdownItems, icon, showCaretIcon, caption, class: className, style }: TrimmDropdownContainerProps) {
    const [open, setOpen] = useState(false);
    const toggleRef = useRef<HTMLButtonElement>(null);

    /**
     * Renders the appropriate icon based on the icon type from Mendix WebIcon system
     * Supports Glyphicon, MDI, and image icons with proper CSS class application
     */
    const renderIcon = (iconProp: DynamicValue<WebIcon> | undefined) => {
        if (!iconProp?.value) return null;
        const { type } = iconProp.value;

        // Handle MDI icons with custom CSS classes
        if (type === "icon" && "iconClass" in iconProp.value && iconProp.value.iconClass) {
            return <span className={`trimm-dropdown-icon ${iconProp.value.iconClass}`} />;
        }

        // Handle Glyphicon icons with Bootstrap classes
        if (type === "glyph" && "iconClass" in iconProp.value && iconProp.value.iconClass) {
            return <span className={`glyphicon ${iconProp.value.iconClass} trimm-dropdown-icon`} />;
        }

        // Handle image icons with proper alt text and styling
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
                                // Execute action if available and can be executed with proper validation
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
