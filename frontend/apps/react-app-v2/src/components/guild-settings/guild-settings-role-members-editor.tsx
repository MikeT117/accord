import { useGuildRoleMembersQuery } from "@/lib/react-query/queries/guild-role-members-query-options";
import { Trash2Icon } from "lucide-react";
import { DestructiveIconButton } from "../destructive-icon-button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table";
import { UserAvatar } from "../user-avatar";
import { useDeleteGuildRoleUserMutation } from "@/lib/react-query/mutations/delete-role-user-mutation";
import { openGuildRoleMembersList } from "@/lib/valtio/mutations/guild-role-members-dialog-ui-store-mutations";
import { GuildRoleMembersDialog } from "./guild-settings-role-editor-members-dialog";
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

type GuildSettingsRoleMembersEditorProps = {
    guildId: string;
    roleId: string;
};

export function GuildSettingsRoleMembersEditor({ guildId, roleId }: GuildSettingsRoleMembersEditorProps) {
    const guildRoleMembers = useGuildRoleMembersQuery({ roleId, guildId, assigned: true });
    const { mutate: unassignUserMutation } = useDeleteGuildRoleUserMutation();
    const [memberFilter, setMemberFilter] = useState("");

    const flatData = guildRoleMembers?.pages.flat() ?? [];

    const filteredData = flatData.length
        ? flatData.filter(
              (m) =>
                  m.guildMember.nickname?.includes(memberFilter) ||
                  m.user.displayName?.includes(memberFilter) ||
                  m.user.username?.includes(memberFilter),
          )
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
                <Input
                    value={memberFilter}
                    onChange={(e) => setMemberFilter(e.currentTarget.value)}
                    placeholder="Search Members"
                />
                <Button onClick={handleOpenAddUsersDialog}>Add Member</Button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Members</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredData.map((m) => (
                        <TableRow key={m.user.id}>
                            <TableCell className="w-full font-medium">
                                <div className="flex items-center space-x-3">
                                    <UserAvatar
                                        className="size-6 border-none"
                                        avatar={m.guildMember.avatar ?? m.user.avatar}
                                        displayName={m.guildMember.nickname ?? m.user.displayName}
                                    />
                                    <p>{m.guildMember.nickname ?? m.user.displayName}</p>
                                </div>
                            </TableCell>
                            <TableCell className="flex space-x-2">
                                <DestructiveIconButton
                                    onClick={() => handleUserUnassign(m.user.id)}
                                    tooltipText="Remove Member"
                                >
                                    <Trash2Icon />
                                </DestructiveIconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <GuildRoleMembersDialog />
        </div>
    );
}
