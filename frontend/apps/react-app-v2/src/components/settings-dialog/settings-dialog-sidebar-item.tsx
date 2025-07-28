import type { JSX } from "react";

type SettingsDialogSidebarItemProps = {
    isActive: boolean;
    onClick: () => void;
    label: string;
    description: string;
    icon: JSX.Element;
};

export function SettingsDialogSidebarItem({
    label,
    description,
    icon,
    isActive,
    onClick,
}: SettingsDialogSidebarItemProps) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors [&_svg]:size-4 ${
                isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
        >
            {icon}
            <div>
                <div className="font-medium">{label}</div>
                <div className={`text-xs ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {description}
                </div>
            </div>
        </button>
    );
}
