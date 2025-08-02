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
        <DialogContent className="max-w-none! w-screen h-screen p-0 gap-0 rounded-none flex" showCloseButton={false}>
            <div className="flex grow basis-[220px] justify-end bg-card/30">
                <div className="flex flex-col p-6 space-y-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl">{title}</DialogTitle>
                    </DialogHeader>
                    {sidebar}
                </div>
            </div>
            <div className="flex grow basis-[760px] flex-col p-6 overflow-auto relative">
                <Button variant="outline" size="icon" className="fixed right-40" onClick={onClose}>
                    <XIcon />
                </Button>
                <div className="flex h-full max-w-[80%] flex-col">{children}</div>
            </div>
        </DialogContent>
    );
}
