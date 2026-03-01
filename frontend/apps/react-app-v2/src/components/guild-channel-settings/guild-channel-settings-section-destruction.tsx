import { closeGuildChannelSettings } from "@/lib/valtio/mutations/guild-channel-settings-ui-store-mutations";
import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useDeleteChannelMutation } from "@/lib/react-query/mutations/delete-channel-mutation";
import { ChangeEvent, useState } from "react";
import { SettingsDialogContentSection } from "../settings-dialog/settings-dialog-content-section";
import { GUILD_CHANNEL_TYPE } from "@/lib/zod-validation/channel-schema";
import { GuildChannelType } from "@/lib/types/types";

type GuildChannelSettingsDestructionSectionProps = Pick<GuildChannelType, "id" | "name" | "channelType">;

const warnings = {
    [GUILD_CHANNEL_TYPE.GUILD_CATEGORY_CHANNEL]: [
        "Permanently delete all customisation.",
        "Permanently delete and permissions and role assignments.",
        "Permanently delete all channel associations.",
    ],
    [GUILD_CHANNEL_TYPE.GUILD_TEXT_CHANNEL]: [
        "Permanently delete all messages.",
        "Permanently delete all files and attachments.",
        "Permanently delete all customisation.",
        "Permanently delete and permissions and role assignments.",
    ],
    [GUILD_CHANNEL_TYPE.GUILD_VOICE_CHANNEL]: [
        "Remove all active voice connections",
        "Permanently delete all customisation.",
        "Permanently delete and permissions and role assignments.",
    ],
};

export function GuildChannelSettingsDestructionSection({
    id,
    name,
    channelType,
}: GuildChannelSettingsDestructionSectionProps) {
    const { mutate: deleteChannel } = useDeleteChannelMutation({ onSuccess: closeGuildChannelSettings });
    const [confirmValue, setConfirmValue] = useState("");

    const isConfirmed = confirmValue === name;
    function handleDeleteChannelClick() {
        if (!isConfirmed) return;
        deleteChannel({ id });
    }

    function handleConfirmValueChange(e: ChangeEvent<HTMLInputElement, HTMLInputElement>) {
        setConfirmValue(e.currentTarget.value);
    }

    return (
        <SettingsDialogContentSection
            title={`Delete ${name}`}
            description={`Permanently delete ${name} and all its content.`}
        >
            <Card className="border-2 border-destructive/25 bg-destructive/5 ring-0">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>This is an irreversible action, there is no going back.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-md border-2 border-destructive/25 p-4">
                        <h4 className="mb-2 font-semibold text-destructive">This action will:</h4>
                        <ul className="ml-4 list-inside list-disc space-y-0.5 text-sm text-muted-foreground">
                            {warnings[channelType].map((warning) => (
                                <li>{warning}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="delete-confirmation">
                                Type <code className="rounded bg-muted px-1 py-0.5 text-sm">{name}</code> to confirm
                                deletion
                            </Label>
                            <Input
                                id="delete-confirmation"
                                placeholder={`Type "${name}" here`}
                                className="border-destructive/30 focus:border-destructive"
                                value={confirmValue}
                                onChange={handleConfirmValueChange}
                            />
                        </div>
                        <Button
                            variant="destructive"
                            className="w-full"
                            disabled={!isConfirmed}
                            onClick={handleDeleteChannelClick}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Permanently Delete
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </SettingsDialogContentSection>
    );
}
