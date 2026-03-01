import type { ReactNode } from "react";

type SettingsDialogContentSectionProps = {
    title: string;
    description: string;
    children: ReactNode;
};

export function SettingsDialogContentSection({ description, title, children }: SettingsDialogContentSectionProps) {
    return (
        <div className="flex h-svh flex-col p-6 pr-20">
            <div className="mb-6 flex flex-col gap-1">
                <h2 className="text-2xl font-semibold">{title}</h2>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="flex h-full flex-col gap-6">{children}</div>
        </div>
    );
}
