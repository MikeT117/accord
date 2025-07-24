import { z } from "zod/v4-mini";

export const guildSidebarDnDContextSchema = z.object({
    id: z.uuid(),
    name: z.string(),
    topic: z.string(),
    parentId: z.nullable(z.uuid()),
});
