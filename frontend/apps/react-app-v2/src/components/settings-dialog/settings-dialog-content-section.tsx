import type { ReactNode } from "react";

type SettingsDialogContentSectionProps = {
    title: string;
    description: string;
    children: ReactNode;
};

export function SettingsDialogContentSection({ description, title, children }: SettingsDialogContentSectionProps) {
    return (
        <div className="space-y-6 relative">
            <div className="flex flex-col space-y-1">
                <h2 className="text-2xl font-semibold">{title}</h2>
                <p className="text-muted-foreground text-sm">{description}</p>
            </div>
            {children}
        </div>
    );
}
