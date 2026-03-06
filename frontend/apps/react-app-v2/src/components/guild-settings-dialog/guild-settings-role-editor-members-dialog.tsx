import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { useGuildRoleMembersQuery } from "@/lib/react-query/queries/guild-role-member-query";
import { AvatarWithFallback } from "../avatar-with-fallback";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { useCreateRoleUserAssocMutation } from "@/lib/react-query/mutations/create-role-user-assoc-mutation";
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from "../ui/item";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import { Search, UserX2Icon } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from "../ui/field";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";
import { AssignRoleMemberFormType } from "./types/guild-settings-dialog-types";
import { assignRoleMembersSchema } from "./zod-validation/guild-settings-form-validation";

type GuildRoleMembersDialogProps = {
    guildId: string;
    roleId: string;
    onClose: () => void;
};

export function GuildRoleMembersDialog({ guildId, onClose, roleId }: GuildRoleMembersDialogProps) {
    const data = useGuildRoleMembersQuery({ roleId, guildId, assigned: false });
    const { mutate: createRoleUserAssoc } = useCreateRoleUserAssocMutation({ onSuccess: onClose });
    const [filter, setFilter] = useState("");

    const filteredMembers =
        data?.pages.flat().filter((m) => m.username?.includes(filter) || m.displayName.includes(filter)) ?? [];

    const form = useForm<AssignRoleMemberFormType>({
        resolver: zodResolver(assignRoleMembersSchema),
        defaultValues: {
            userIds: [],
        },
    });

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        setFilter(e.currentTarget.value);
    }

    function onSubmit({ userIds }: { userIds: string[] }) {
        createRoleUserAssoc({ guildId, roleId, userIds });
    }
    return (
        <Dialog defaultOpen={true} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader className="items-center">
                    <DialogTitle>Add Members to role</DialogTitle>
                    <DialogDescription className="text-center">Assign role to members.</DialogDescription>
                </DialogHeader>
                <InputGroup className="mt-4">
                    <InputGroupInput placeholder="Search..." value={filter} onChange={handleInputChange} />
                    <InputGroupAddon>
                        <Search />
                    </InputGroupAddon>
                    <InputGroupAddon align="inline-end">{filteredMembers.length} results</InputGroupAddon>
                </InputGroup>
                <ScrollArea className="h-72">
                    <form id="add-role-members-form" onSubmit={form.handleSubmit(onSubmit)}>
                        {filteredMembers.length ? (
                            <FieldSet>
                                <FieldGroup>
                                    <Controller
                                        control={form.control}
                                        name="userIds"
                                        render={({ field, fieldState }) => (
                                            <Field aria-invalid={fieldState.invalid}>
                                                <FieldLabel>Members</FieldLabel>
                                                {filteredMembers.map((m) => (
                                                    <Item
                                                        key={m.id}
                                                        variant="outline"
                                                        className="border-2 has-[[aria-checked=true]]:bg-input/30"
                                                    >
                                                        <ItemMedia variant="icon">
                                                            <AvatarWithFallback
                                                                size="sm"
                                                                fallback={m.displayName}
                                                                src={m.avatar}
                                                            />
                                                        </ItemMedia>
                                                        <ItemContent>
                                                            <ItemTitle>{m.displayName}</ItemTitle>
                                                        </ItemContent>
                                                        <ItemActions>
                                                            <Checkbox
                                                                checked={field.value?.includes(m.id)}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                        ? field.onChange([...field.value, m.id])
                                                                        : field.onChange(
                                                                              field.value?.filter(
                                                                                  (value) => value !== m.id,
                                                                              ),
                                                                          );
                                                                }}
                                                            />
                                                        </ItemActions>
                                                    </Item>
                                                ))}
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />
                                </FieldGroup>
                            </FieldSet>
                        ) : (
                            <Empty>
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <UserX2Icon />
                                    </EmptyMedia>
                                    <EmptyTitle>No Members Found</EmptyTitle>
                                    <EmptyDescription>
                                        It looks like all users have already been assigned this role.
                                    </EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        )}
                    </form>
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" form="add-role-members-form">
                        Add
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
