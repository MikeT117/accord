import { SettingsDialogContentSection } from "../settings-dialog/settings-dialog-content-section";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { MailIcon, MailOpenIcon, Trash2Icon } from "lucide-react";
import { useGuildInvitesQuery } from "@/lib/react-query/queries/guild-invite-query";
import { AvatarWithFallback } from "../avatar-with-fallback";
import { formatDistanceToNow } from "date-fns";
import { ButtonWithTooltip } from "../button-with-tooltip";
import { useDeleteGuildInviteMutation } from "@/lib/react-query/mutations/delete-guild-invite-mutation";
import { Card, CardContent } from "../ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";
import { Button } from "../ui/button";
import { openCreateGuildInviteDialog } from "@/lib/valtio/mutations/create-guild-invite-dialog-ui-store-mutations";

type GuildSettingsInvitesSectionProps = {
    guildId: string;
};

export function GuildSettingsInvitesSection({ guildId }: GuildSettingsInvitesSectionProps) {
    const { data: guildInvites, refetch } = useGuildInvitesQuery({ guildId });
    const { mutate: deleteGuildInvite } = useDeleteGuildInviteMutation();

    function handleDeleteGuildInviteClick(inviteId: string) {
        deleteGuildInvite({ guildId, inviteId }, { onSuccess: () => refetch() });
    }

    const flattenedInvites = guildInvites?.pages.flat() ?? [];

    return (
        <SettingsDialogContentSection title="Guild Invites" description="View and manage guild invites">
            <Card className="bg-transparent p-0">
                <CardContent className="p-0">
                    {flattenedInvites.length ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Inviter</TableHead>
                                    <TableHead>Uses</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Expires</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {flattenedInvites.map((i) => (
                                    <TableRow key={i.id}>
                                        <TableCell>
                                            <div className="flex items-center space-x-4">
                                                <AvatarWithFallback
                                                    size="default"
                                                    fallback={i.displayName}
                                                    src={i.avatar}
                                                />
                                                <div className="flex flex-col">
                                                    <span className="text-xs">{i.displayName}</span>
                                                    <span className="text-xs text-muted-foreground">{i.username}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs">{i.usedCount}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs">
                                                {formatDistanceToNow(i.createdAt, {
                                                    addSuffix: true,
                                                })}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs">
                                                {formatDistanceToNow(i.expiresAt, {
                                                    addSuffix: true,
                                                })}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <ButtonWithTooltip
                                                size="icon"
                                                variant="destructive"
                                                tooltipText="Delete Invite"
                                                onClick={() => handleDeleteGuildInviteClick(i.id)}
                                            >
                                                <Trash2Icon />
                                            </ButtonWithTooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <MailOpenIcon />
                                </EmptyMedia>
                                <EmptyTitle>No Invites Found</EmptyTitle>
                                <EmptyDescription>You can add roles by clicking the button below.</EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                                <Button variant="outline" onClick={openCreateGuildInviteDialog}>
                                    <MailIcon />
                                    <span>Create Invite</span>
                                </Button>
                            </EmptyContent>
                        </Empty>
                    )}
                </CardContent>
            </Card>
        </SettingsDialogContentSection>
    );
}
