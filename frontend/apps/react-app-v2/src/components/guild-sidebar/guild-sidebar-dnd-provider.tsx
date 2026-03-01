import { useUpdateGuildChannelMutation } from "@/lib/react-query/mutations/update-guild-channel-mutation";
import { DragDropProvider } from "@dnd-kit/react";
import type { ReactNode } from "react";
import { guildSidebarDnDContextSchema } from "./zod-validation/guild-sidebar-dnd-context-zod-validator";

export function DnDProvider({ children }: { children: ReactNode }) {
    const { mutate: updateGuildChannel } = useUpdateGuildChannelMutation();
    return (
        <DragDropProvider
            key="channel-relations"
            onDragEnd={(event) => {
                if (event.canceled) return;

                const { success, data, error } = guildSidebarDnDContextSchema.safeParse({
                    ...(event.operation.source?.data ?? {}),
                    ...(event.operation.target?.data ?? {}),
                });
                if (!success) {
                    console.error(error);
                    return;
                }

                updateGuildChannel(data);
            }}
        >
            {children}
        </DragDropProvider>
    );
}
