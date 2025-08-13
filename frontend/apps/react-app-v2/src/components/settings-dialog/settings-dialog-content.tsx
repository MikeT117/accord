import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import type { ReactNode } from "react";
import { XIcon } from "lucide-react";

type SettingsDialogContentProps = {
    title: string;
    onClose: () => void;
    children: ReactNode;
    sidebar: ReactNode;
};

export function SettingsDialogContent({ title, sidebar, children, onClose }: SettingsDialogContentProps) {
    return (
        <DialogContent className="flex h-screen w-screen max-w-none! gap-0 rounded-none p-0" showCloseButton={false}>
            <div className="flex grow basis-[220px] justify-end border-r">
                <div className="flex flex-col space-y-6 p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl">{title}</DialogTitle>
                    </DialogHeader>
                    {sidebar}
                </div>
            </div>
            <div className="relative flex grow basis-[760px] overflow-auto">
                <div className="flex h-full grow flex-col">{children}</div>
                <Button variant="outline" size="icon" className="sticky top-6 right-6 ml-6" onClick={onClose}>
                    <XIcon />
                </Button>
            </div>
        </DialogContent>
    );
}
