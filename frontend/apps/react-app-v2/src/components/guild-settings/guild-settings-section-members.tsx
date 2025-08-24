import { SettingsDialogContentSection } from "../settings-dialog/settings-dialog-content-section";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Trash2Icon } from "lucide-react";
import { DestructiveIconButton } from "../destructive-icon-button";
import { useGuildInvitesQuery } from "@/lib/react-query/queries/guild-member-query";
import { UserAvatar } from "../user-avatar";

type GuildSettingsMembersSectionProps = {
    guildId: string;
};

export function GuildSettingsMembersSection({ guildId }: GuildSettingsMembersSectionProps) {
    const guildMembers = useGuildInvitesQuery({ guildId });

    const flatData = guildMembers?.pages.flat() ?? [];
    const memberCount = flatData.length;

    return (
        <SettingsDialogContentSection title="Server Members" description="View and manage members of this server.">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Members - {memberCount}</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {flatData.map((m) => (
                        <TableRow key={m.user.id}>
                            <TableCell className="w-full font-medium">
                                <div className="flex items-center space-x-2">
                                    <UserAvatar
                                        className="size-6 border-none"
                                        displayName={m.guildMember.nickname ?? m.user.displayName}
                                        avatar={m.guildMember.avatar ?? m.user.avatar ?? ""}
                                    />
                                    <p> {m.guildMember.nickname ?? m.user.displayName}</p>
                                </div>
                            </TableCell>
                            <TableCell className="flex space-x-2">
                                <DestructiveIconButton onClick={() => void 0} tooltipText="Kick User">
                                    <Trash2Icon />
                                </DestructiveIconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </SettingsDialogContentSection>
    );
}
