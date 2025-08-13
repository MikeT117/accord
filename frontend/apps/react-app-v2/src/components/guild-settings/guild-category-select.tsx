import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGuildCategoriesQuery } from "@/lib/react-query/queries/guild-category-query-options";
import type { ComponentProps } from "react";

type GuildCategorySelectProps = { className?: string } & ComponentProps<typeof Select>;

export function GuildCategorySelect({ className, ...props }: GuildCategorySelectProps) {
    const guildCategories = useGuildCategoriesQuery();
    const placeholder = guildCategories?.find((g) => g.id === props.defaultValue)?.name ?? "Select Category";

    return (
        <Select {...props}>
            <SelectTrigger className={className}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {guildCategories?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                        {c.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
