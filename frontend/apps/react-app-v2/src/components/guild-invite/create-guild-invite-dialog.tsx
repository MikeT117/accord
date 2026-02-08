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
import { UserAvatar } from "../user-avatar";
import { Button } from "../ui/button";
import { type ChangeEvent } from "react";
import { Search } from "lucide-react";
import { useAdhocPrivateMessage } from "./use-adhoc-private-message";

export function GuildInviteCreator() {
    const { isOpen } = useCreateGuildInviteDialogUIStore();
    return (
        <Dialog open={isOpen} onOpenChange={closeCreateGuildInviteDialog} modal>
            <DialogContent className="w-[440px]">
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
    const { data, mutate, isSuccess } = useCreateGuildInviteMutation();
    const { onCopy } = useClipboard();

    if (!guild) {
        return null;
    }

    const inviteLink = data ? `${env.HOST}/invite/${data.id}` : "";

    function handleCopyLinkClick() {
        if (!guild || !isSuccess) {
            return;
        }
        onCopy(inviteLink);
    }

    function sendLinkToFriend(userId: string) {
        if (!guild) {
            return;
        }

        if (!isSuccess) {
            const now = new Date();
            const future = new Date(now);
            future.setDate(now.getDate() + 7);

            mutate(
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

        mutate({ expiresAt: future, guildId });
    }

    function handleFilterChange(e: ChangeEvent<HTMLInputElement, HTMLInputElement>) {
        setFilter(e.currentTarget.value);
    }

    return (
        <>
            <DialogHeader className="items-center">
                <DialogTitle>Invite Friends to '{guild.name}'</DialogTitle>
            </DialogHeader>

            <InputGroup>
                <InputGroupInput placeholder="Search..." value={filter} onChange={handleFilterChange} />
                <InputGroupAddon>
                    <Search />
                </InputGroupAddon>
                <InputGroupAddon align="inline-end">{filteredRelationships.length} results</InputGroupAddon>
            </InputGroup>

            <div className="min-h-52">
                {filteredRelationships.map((r) => (
                    <Item key={r.id} className="hover:bg-white/10">
                        <ItemMedia>
                            <UserAvatar className="size-10" displayName={r.user.displayName} avatar={r.user.avatar} />
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle>{r.user.displayName}</ItemTitle>
                            <ItemDescription>{r.user.username}</ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            <Button
                                className="hover:cursor-pointer"
                                size="sm"
                                variant="outline"
                                onClick={() => sendLinkToFriend(r.user.id)}
                            >
                                Invite
                            </Button>
                        </ItemActions>
                    </Item>
                ))}
            </div>
            <span>Or send a server invite link to a friend</span>
            <DialogFooter>
                <InputGroup>
                    <InputGroupInput placeholder="Generate link..." value={inviteLink} readOnly />
                    <InputGroupAddon align="inline-end">
                        {isSuccess ? (
                            <InputGroupButton variant="secondary" onClick={handleCopyLinkClick}>
                                Copy
                            </InputGroupButton>
                        ) : (
                            <InputGroupButton variant="secondary" onClick={handleGenerateClick}>
                                Generate
                            </InputGroupButton>
                        )}
                    </InputGroupAddon>
                </InputGroup>
            </DialogFooter>
        </>
    );
}
