import { SettingsDialogContentSection } from "../settings-dialog/settings-dialog-content-section";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { formatDistanceToNow } from "date-fns";
import { useGuildsArray } from "@/lib/valtio/queries/guild-store-queries";

export function UserSettingsGuildsSection() {
    const guilds = useGuildsArray();

    return (
        <SettingsDialogContentSection title="Servers" description="View and manager server memberships.">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Members</TableHead>
                        <TableHead>Channels</TableHead>
                        <TableHead>Discoverable</TableHead>
                        <TableHead>Created</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {guilds.map((guild) => (
                        <TableRow key={guild.id}>
                            <TableCell>{guild.name}</TableCell>
                            <TableCell>{guild.memberCount}</TableCell>
                            <TableCell>{guild.channelCount}</TableCell>
                            <TableCell>{guild.discoverable ? "Yes" : "No"}</TableCell>
                            <TableCell>
                                {formatDistanceToNow(guild.createdAt, {
                                    addSuffix: true,
                                })}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </SettingsDialogContentSection>
    );
}
