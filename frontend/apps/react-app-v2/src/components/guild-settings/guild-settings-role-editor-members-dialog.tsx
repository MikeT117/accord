import { useGuildRoleMembersState } from "@/lib/valtio/queries/guild-role-members-dialog-ui-store-queries";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { closeGuildRoleMembersList } from "@/lib/valtio/mutations/guild-role-members-dialog-ui-store-mutations";
import { useGuildRoleMembersQuery } from "@/lib/react-query/queries/guild-role-member-query";
import { UserAvatar } from "../user-avatar";
import { Input } from "../ui/input";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { AssignRoleMemberFormType } from "./guild-settings-dialog-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { assignRoleMembersSchema } from "./guild-settings-form-validation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { useCreateRoleUserAssocMutation } from "@/lib/react-query/mutations/create-role-user-assoc-mutation";

export function GuildRoleMembersDialog() {
    const { isOpen, guildId, roleId } = useGuildRoleMembersState();

    return (
        <Dialog open={isOpen} onOpenChange={closeGuildRoleMembersList}>
            {isOpen && <GuildRoleMembersDialogContent guildId={guildId} roleId={roleId} />}
        </Dialog>
    );
}

type GuildRoleMembersDialogContentProps = {
    guildId: string;
    roleId: string;
};

function GuildRoleMembersDialogContent({ guildId, roleId }: GuildRoleMembersDialogContentProps) {
    const data = useGuildRoleMembersQuery({ roleId, guildId, assigned: false });
    const { mutate: createRoleUserAssoc } = useCreateRoleUserAssocMutation({ onSuccess: closeGuildRoleMembersList });
    const [filter, setFilter] = useState("");

    const filteredData =
        data?.pages
            .flat()
            .filter((m) => m.guildMember.nickname?.includes(filter) || m.user.displayName.includes(filter)) ?? [];

    const form = useForm<AssignRoleMemberFormType>({
        resolver: zodResolver(assignRoleMembersSchema),
        defaultValues: {
            userIds: [],
        },
    });

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        setFilter(e.currentTarget.value);
    }

    function handleSubmit() {
        return form.handleSubmit(({ userIds }) => createRoleUserAssoc({ guildId, roleId, userIds }))();
    }

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="text-center">Add Members</DialogTitle>
                <DialogDescription className="text-center">Assign role to members.</DialogDescription>
            </DialogHeader>
            <div className="flex h-full min-h-[350px] flex-col space-y-6 overflow-auto">
                <Input onChange={handleInputChange} value={filter} placeholder="Search members" />
                <Form {...form}>
                    <FormField
                        control={form.control}
                        name="userIds"
                        render={() => (
                            <FormItem>
                                <FormLabel className="ml-4 text-base">Members</FormLabel>
                                {filteredData.map((m) => (
                                    <FormField
                                        key={m.user.id}
                                        control={form.control}
                                        name="userIds"
                                        render={({ field }) => (
                                            <FormItem
                                                key={m.user.id}
                                                className="flex flex-row items-center gap-2 rounded-lg px-4 py-2 hover:bg-accent"
                                            >
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(m.user.id)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                                ? field.onChange([...field.value, m.user.id])
                                                                : field.onChange(
                                                                      field.value?.filter(
                                                                          (value) => value !== m.user.id,
                                                                      ),
                                                                  );
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormLabel className="w-full text-sm">
                                                    <UserAvatar
                                                        className="size-6 border-none"
                                                        displayName={m.user.displayName}
                                                        avatar={m.guildMember.avatar ?? m.user.avatar ?? ""}
                                                    />
                                                    <p>{m.user.displayName}</p>
                                                </FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                ))}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </Form>
            </div>
            <div className="items center flex w-full justify-end space-x-2">
                <Button variant="outline" onClick={closeGuildRoleMembersList}>
                    Cancel
                </Button>
                <Button onClick={handleSubmit}>Add</Button>
            </div>
        </DialogContent>
    );
}
