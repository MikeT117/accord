import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import type { ReactNode } from "react";
import { XIcon } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

type SettingsDialogContentProps = {
    title: string;
    onClose: () => void;
    children: ReactNode;
    sidebar: ReactNode;
};

export function SettingsDialogContent({ title, sidebar, children, onClose }: SettingsDialogContentProps) {
    return (
        <DialogContent
            className="flex h-svh w-svw max-w-none! justify-center gap-0 rounded-none bg-sidebar p-0"
            showCloseButton={false}
        >
            <div className="flex grow basis-[180px] justify-end">
                <div className="flex flex-col space-y-6 p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl">{title}</DialogTitle>
                    </DialogHeader>
                    {sidebar}
                </div>
            </div>
            <ScrollArea className="relative flex h-svh w-full grow basis-[760px] flex-col bg-background">
                <div className="max-w-[1116px]">{children}</div>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute top-6 right-6"
                    onClick={onClose}
                >
                    <XIcon />
                </Button>
            </ScrollArea>
        </DialogContent>
    );
}
