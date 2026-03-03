import { SettingsDialogContentSection } from "../settings-dialog/settings-dialog-content-section";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Trash2Icon } from "lucide-react";
import { AvatarWithFallback } from "../avatar-with-fallback";
import { ButtonWithTooltip } from "../button-with-tooltip";
import { formatDistanceToNow } from "date-fns";
import { GuildRoleBadges } from "../guild-role-badges";
import { useInfiniteGuildMembersQuery } from "@/lib/react-query/queries/guild-member-query";
import { Card, CardContent } from "../ui/card";

type GuildSettingsMembersSectionProps = {
    guildId: string;
};

export function GuildSettingsMembersSection({ guildId }: GuildSettingsMembersSectionProps) {
    const guildMembers = useInfiniteGuildMembersQuery({ guildId });
    const flattendGuildMembers = guildMembers?.pages.flat() ?? [];

    return (
        <SettingsDialogContentSection title="Guild Members" description="View and manage members of this guild.">
            <Card className="bg-transparent p-0">
                <CardContent className="p-0">
                    <Table className="overflow-hidden rounded-md">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Member</TableHead>
                                <TableHead>Roles</TableHead>
                                <TableHead>Member Since</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {flattendGuildMembers.map((m) => (
                                <TableRow key={m.id}>
                                    <TableCell>
                                        <div className="flex items-center space-x-4">
                                            <AvatarWithFallback
                                                size="default"
                                                fallback={m.displayName}
                                                src={m.avatar}
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-xs">{m.displayName}</span>
                                                <span className="text-xs text-muted-foreground">{m.username}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <GuildRoleBadges guildId={guildId} roleIDs={m.roles} />
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-xs">
                                            {formatDistanceToNow(m.createdAt, { addSuffix: true })}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <ButtonWithTooltip size="icon" variant="destructive" tooltipText="Kick Member">
                                            <Trash2Icon />
                                        </ButtonWithTooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </SettingsDialogContentSection>
    );
}
