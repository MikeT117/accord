import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { useCreateGuildInviteDialogUIStore } from "@/lib/valtio/queries/create-guild-invite-dialog-ui-store";
import { closeCreateGuildInviteDialog } from "@/lib/valtio/mutations/create-guild-invite-dialog-ui-store-mutations";
import { useParams } from "@tanstack/react-router";
import { useCreateGuildInviteMutation } from "@/lib/react-query/mutations/create-guild-invite-mutation";
import { env } from "@/lib/constants";
import { useClipboard } from "@/hooks/use-clipboard";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "../ui/input-group";
import { useGuild } from "@/lib/valtio/queries/guild-store-queries";
import { RELATIONSHIP_STATUS } from "@/lib/zod-validation/relationship-schema";
import { useFilteredRelationships } from "../user-dashboard/hooks/use-filtered-relationships";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "../ui/item";
import { AvatarWithFallback } from "../avatar-with-fallback";
import { Button } from "../ui/button";
import { type ChangeEvent } from "react";
import { Search } from "lucide-react";
import { useAdhocPrivateMessage } from "./hooks/use-adhoc-private-message";
import { Field, FieldDescription } from "../ui/field";
import { ScrollArea } from "../ui/scroll-area";

export function GuildInviteCreator() {
    const { isOpen } = useCreateGuildInviteDialogUIStore();
    return (
        <Dialog open={isOpen} onOpenChange={closeCreateGuildInviteDialog} modal>
            <DialogContent className="w-md">
                <GuildInviteCreatorContent />
            </DialogContent>
        </Dialog>
    );
}

function GuildInviteCreatorContent() {
    const { guildId } = useParams({ from: "/_auth/app/$guildId" });
    const guild = useGuild(guildId);
    const { filteredRelationships, filter, setFilter } = useFilteredRelationships(RELATIONSHIP_STATUS.FRIEND);
    const createAdhocPrivateMessage = useAdhocPrivateMessage();
    const {
        data: guildInvite,
        mutate: createGuildInvite,
        isSuccess: isGuildInviteCreationSuccessful,
    } = useCreateGuildInviteMutation();

    const { onCopy, isSuccess: isCopySuccessful } = useClipboard();

    if (!guild) {
        return null;
    }

    const inviteLink = guildInvite ? `${env.HOST}/invite/${guildInvite.id}` : "";

    function handleCopyLinkClick() {
        if (!guild || !isGuildInviteCreationSuccessful) {
            return;
        }
        onCopy(inviteLink);
    }

    function sendLinkToFriend(userId: string) {
        if (!guild) {
            return;
        }

        if (!isGuildInviteCreationSuccessful) {
            const now = new Date();
            const future = new Date(now);
            future.setDate(now.getDate() + 7);

            createGuildInvite(
                { expiresAt: future, guildId },
                {
                    onSuccess(inviteData) {
                        createAdhocPrivateMessage(userId, `${env.HOST}/invite/${inviteData.id}`);
                    },
                },
            );
        }

        createAdhocPrivateMessage(userId, inviteLink);
    }

    function handleGenerateClick() {
        if (!guild) {
            return;
        }
        const now = new Date();
        const future = new Date(now);
        future.setDate(now.getDate() + 7);

        createGuildInvite({ expiresAt: future, guildId });
    }

    function handleFilterChange(e: ChangeEvent<HTMLInputElement, HTMLInputElement>) {
        setFilter(e.currentTarget.value);
    }

    return (
        <>
            <DialogHeader className="items-center">
                <DialogTitle>Invite Friends to '{guild.name}'</DialogTitle>
            </DialogHeader>
            <InputGroup className="mt-4">
                <InputGroupInput placeholder="Search..." value={filter} onChange={handleFilterChange} />
                <InputGroupAddon>
                    <Search />
                </InputGroupAddon>
                <InputGroupAddon align="inline-end">{filteredRelationships.length} results</InputGroupAddon>
            </InputGroup>
            <ScrollArea className="h-52">
                {filteredRelationships.map((r) => (
                    <Item key={r.id} variant="outline" className="mb-1.5 border-2">
                        <ItemMedia variant="image">
                            <AvatarWithFallback fallback={r.user.displayName} src={r.user.avatar} />
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle>{r.user.displayName}</ItemTitle>
                            <ItemDescription>{r.user.username}</ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            <Button
                                className="cursor-pointer"
                                size="sm"
                                variant="outline"
                                onClick={() => sendLinkToFriend(r.user.id)}
                            >
                                Invite
                            </Button>
                        </ItemActions>
                    </Item>
                ))}
            </ScrollArea>
            <DialogFooter>
                <Field>
                    <FieldDescription>Or send a guild invite link to a friend</FieldDescription>
                    <InputGroup>
                        <InputGroupInput placeholder="Generate an invite link..." value={inviteLink} readOnly />
                        <InputGroupAddon align="inline-end">
                            {isGuildInviteCreationSuccessful ? (
                                <InputGroupButton onClick={handleCopyLinkClick}>
                                    {isCopySuccessful ? "Copied" : "Copy"}
                                </InputGroupButton>
                            ) : (
                                <InputGroupButton variant="outline" onClick={handleGenerateClick}>
                                    Generate
                                </InputGroupButton>
                            )}
                        </InputGroupAddon>
                    </InputGroup>
                </Field>
            </DialogFooter>
        </>
    );
}
