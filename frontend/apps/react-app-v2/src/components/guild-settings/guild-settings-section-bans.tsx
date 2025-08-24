import { SettingsDialogContentSection } from "../settings-dialog/settings-dialog-content-section";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { EyeIcon, LockKeyholeOpenIcon } from "lucide-react";
import { DestructiveIconButton } from "../destructive-icon-button";
import { useGuildBansQuery } from "@/lib/react-query/queries/guild-ban-query";
import { UserAvatar } from "../user-avatar";

type GuildSettingsBansSectionProps = {
    guildId: string;
};

export function GuildSettingsBansSection({ guildId }: GuildSettingsBansSectionProps) {
    const guildBans = useGuildBansQuery(guildId);

    const flatData = guildBans?.pages.flat() ?? [];
    const memberCount = flatData.length;

    return (
        <SettingsDialogContentSection title="Server Bans" description="View and manage server bans">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Bans - {memberCount}</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {flatData.map((b) => (
                        <TableRow key={b.userId}>
                            <TableCell className="w-full font-medium">
                                <div className="flex items-center space-x-2">
                                    <UserAvatar
                                        className="size-6 border-none"
                                        displayName={b.displayName}
                                        avatar={b.avatar ?? ""}
                                    />
                                    <p>{b.displayName}</p>
                                </div>
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
