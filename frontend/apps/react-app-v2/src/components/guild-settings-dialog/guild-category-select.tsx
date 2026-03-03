import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGuildCategoriesQuery } from "@/lib/react-query/queries/guild-category-query";
import type { ComponentProps } from "react";

type GuildCategorySelectProps = Omit<ComponentProps<typeof Select>, "defaultValue"> & {
    className?: string;
    defaultValue?: string | null;
};

export function GuildCategorySelect({ className, defaultValue, ...props }: GuildCategorySelectProps) {
    const guildCategories = useGuildCategoriesQuery();
    const placeholder = guildCategories?.find((g) => g.id === defaultValue)?.name ?? "Select Category";

    return (
        <Select defaultValue={typeof defaultValue !== "string" ? undefined : defaultValue} {...props}>
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
