import { SettingsDialogContentSection } from "../settings-dialog/settings-dialog-content-section";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { CircleOffIcon, EyeIcon, LockKeyholeOpenIcon } from "lucide-react";
import { useGuildBansQuery } from "@/lib/react-query/queries/guild-ban-query";
import { AvatarWithFallback } from "../avatar-with-fallback";
import { ButtonWithTooltip } from "../button-with-tooltip";
import { Card, CardContent } from "../ui/card";
import { ButtonGroup } from "../ui/button-group";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";

type GuildSettingsBansSectionProps = {
    guildId: string;
};

export function GuildSettingsBansSection({ guildId }: GuildSettingsBansSectionProps) {
    const guildBans = useGuildBansQuery(guildId);

    const flatData = guildBans?.pages.flat() ?? [];

    return (
        <SettingsDialogContentSection title="Guild Bans" description="View and manage guild bans">
            <Card className="bg-transparent p-0">
                <CardContent className="p-0">
                    {flatData.length ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Bans</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {flatData.map((b) => (
                                    <TableRow key={b.userId}>
                                        <TableCell className="w-full font-medium">
                                            <div className="flex items-center space-x-2">
                                                <AvatarWithFallback size="sm" fallback={b.displayName} src={b.avatar} />
                                                <p>{b.displayName}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <ButtonGroup>
                                                <ButtonWithTooltip
                                                    size="icon"
                                                    variant="secondary"
                                                    onClick={() => void 0}
                                                    tooltipText="View Ban Info"
                                                >
                                                    <EyeIcon />
                                                </ButtonWithTooltip>
                                                <ButtonWithTooltip
                                                    size="icon"
                                                    variant="destructive"
                                                    onClick={() => void 0}
                                                    tooltipText="Delete Ban"
                                                >
                                                    <LockKeyholeOpenIcon />
                                                </ButtonWithTooltip>
                                            </ButtonGroup>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <CircleOffIcon />
                                </EmptyMedia>
                                <EmptyTitle>No Bans Found</EmptyTitle>
                            </EmptyHeader>
                        </Empty>
                    )}
                </CardContent>
            </Card>
        </SettingsDialogContentSection>
    );
}
