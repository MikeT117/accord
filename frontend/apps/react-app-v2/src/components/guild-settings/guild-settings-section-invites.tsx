import { SettingsDialogContentSection } from "../settings-dialog/settings-dialog-content-section";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { EyeIcon, LockKeyholeOpenIcon } from "lucide-react";
import { DestructiveIconButton } from "../destructive-icon-button";
import { useGuildInvitesQuery } from "@/lib/react-query/queries/guild-invite-query";
import { GuildIcon } from "../guild-icon";
import { formatDistanceToNow } from "date-fns";

type GuildSettingsInvitesSectionProps = {
    guildId: string;
};

export function GuildSettingsInvitesSection({ guildId }: GuildSettingsInvitesSectionProps) {
    const guildInvites = useGuildInvitesQuery({ guildId });

    const flatData = guildInvites?.pages.flat() ?? [];
    const inviteCount = flatData.length;

    return (
        <SettingsDialogContentSection title="Server Invites" description="View and manage server invites">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Invites - {inviteCount}</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {flatData.map((i) => (
                        <TableRow key={i.id}>
                            <TableCell className="w-full font-medium">
                                <div className="flex items-center space-x-2">
                                    <GuildIcon className="size-6 border-none" name={i.name} icon={i.icon ?? ""} />
                                    <p>{i.name}</p>
                                </div>
                            </TableCell>
                            <TableCell className="w-full font-medium">
                                {formatDistanceToNow(i.createdAt, {
                                    addSuffix: true,
                                })}
                            </TableCell>
                            <TableCell className="flex space-x-2">
                                <DestructiveIconButton onClick={() => void 0} tooltipText="View Ban Info">
                                    <EyeIcon />
                                </DestructiveIconButton>
                                <DestructiveIconButton onClick={() => void 0} tooltipText="Delete Ban">
                                    <LockKeyholeOpenIcon />
                                </DestructiveIconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </SettingsDialogContentSection>
    );
}
