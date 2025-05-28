/** @jsx createElement */
import { createElement, useRef, useState } from "react";
import { TrimmDropdownContainerProps } from "../typings/TrimmDropdownProps";
import "./ui/TrimmDropdown.css";
import { DynamicValue, WebIcon } from "mendix";

export function TrimmDropdown({ dropdownItems, icon, showCaretIcon, caption }: TrimmDropdownContainerProps) {
    const [open, setOpen] = useState(false);
    const toggleRef = useRef<HTMLButtonElement>(null);

    const renderIcon = (iconProp: DynamicValue<WebIcon> | undefined) => {
        if (!iconProp?.value) return null;
        const { type } = iconProp.value;

        if (type === "icon" && "iconClass" in iconProp.value && iconProp.value.iconClass) {
            return <span className={`trimm-dropdown-icon ${iconProp.value.iconClass}`} />;
        }

        if (type === "glyph" && "iconClass" in iconProp.value && iconProp.value.iconClass) {
            return <span className={`glyphicon ${iconProp.value.iconClass} trimm-dropdown-icon`} />;
        }

        if (type === "image" && "iconUrl" in iconProp.value && iconProp.value.iconUrl) {
            return <img src={iconProp.value.iconUrl} alt="icon" className="trimm-dropdown-icon" />;
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
