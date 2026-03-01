import { useGuildRoleMembersQuery } from "@/lib/react-query/queries/guild-role-member-query";
import { Trash2Icon, UserX2Icon } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table";
import { AvatarWithFallback } from "../avatar-with-fallback";
import { useDeleteGuildRoleUserMutation } from "@/lib/react-query/mutations/delete-role-user-mutation";
import { openGuildRoleMembersList } from "@/lib/valtio/mutations/guild-role-members-dialog-ui-store-mutations";
import { GuildRoleMembersDialog } from "./guild-settings-role-editor-members-dialog";
import { useState } from "react";
import { Button } from "../ui/button";
import { ButtonWithTooltip } from "../button-with-tooltip";
import { Card, CardContent } from "../ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";
import { FilterInput } from "../filter-input";

type GuildSettingsRoleMembersEditorProps = {
    guildId: string;
    roleId: string;
};

export function GuildSettingsRoleMembersEditor({ guildId, roleId }: GuildSettingsRoleMembersEditorProps) {
    const guildRoleMembers = useGuildRoleMembersQuery({ roleId, guildId, assigned: true });
    const { mutate: unassignUserMutation } = useDeleteGuildRoleUserMutation();
    const [memberFilter, setMemberFilter] = useState("");

    const flatData = guildRoleMembers?.pages.flat() ?? [];

    const filteredMembers = flatData.length
        ? flatData.filter((m) => m.displayName?.includes(memberFilter) || m.username?.includes(memberFilter))
        : flatData;

    function handleUserUnassign(userId: string) {
        unassignUserMutation({ guildId, roleId, userId });
    }

    function handleOpenAddUsersDialog() {
        openGuildRoleMembersList(guildId, roleId);
    }

    return (
        <div className="flex flex-col space-y-3">
            <div className="mt-3 flex items-center space-x-3">
                <FilterInput
                    filterValue={memberFilter}
                    onChange={setMemberFilter}
                    resultsCount={filteredMembers.length}
                />
                <Button onClick={handleOpenAddUsersDialog}>Add Member</Button>
            </div>
            <Card className="bg-transparent p-0">
                <CardContent className="p-0">
                    {filteredMembers.length ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-full">Members</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredMembers.map((m) => (
                                    <TableRow key={m.id}>
                                        <TableCell className="w-full font-medium">
                                            <div className="flex items-center space-x-3">
                                                <AvatarWithFallback size="sm" src={m.avatar} fallback={m.displayName} />
                                                <p>{m.displayName}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <ButtonWithTooltip
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => handleUserUnassign(m.id)}
                                                tooltipText="Remove Member"
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
                                    <UserX2Icon />
                                </EmptyMedia>
                                <EmptyTitle>No Members Found</EmptyTitle>
                                <EmptyDescription>You can add roles by clicking the button below.</EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    )}
                </CardContent>
            </Card>
            <GuildRoleMembersDialog />
        </div>
    );
}
