import { closeGuildChannelSettings } from "@/lib/valtio/mutations/guild-channel-settings-ui-store-mutations";
import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useDeleteChannelMutation } from "@/lib/react-query/mutations/delete-channel-mutation";
import { useState } from "react";
import { SettingsDialogContentSection } from "../settings-dialog/settings-dialog-content-section";

type GuildChannelSettingsDestructionSectionProps = {
    id: string;
    name: string;
};

export function GuildChannelSettingsDestructionSection({ id, name }: GuildChannelSettingsDestructionSectionProps) {
    const { mutate: deleteChannel } = useDeleteChannelMutation({ onSuccess: closeGuildChannelSettings });
    const [confirmValue, setConfirmValue] = useState("");

    const isConfirmed = confirmValue === name;
    function handleDeleteChannelClick() {
        if (!isConfirmed) return;
        deleteChannel({ id });
    }

    function handleConfirmValueChange(e: React.FormEvent<HTMLInputElement>) {
        setConfirmValue(e.currentTarget.value);
    }

    return (
        <SettingsDialogContentSection
            title="Delete Channel"
            description="Permanently delete this channel and all its content."
        >
            <Card className="border-destructive/20">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>
                        Once you delete a channel, there is no going back. Please be certain.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                        <h4 className="font-semibold text-destructive mb-2">This action will:</h4>
                        <ul className="text-sm text-muted-foreground space-y-0.5 ml-4 list-disc list-inside">
                            <li>Permanently delete all messages in this channel</li>
                            <li>Remove all files and attachments</li>
                            <li>Delete all channel settings and permissions</li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="delete-confirmation">
                                Type <code className="bg-muted px-1 py-0.5 rounded text-sm">{name}</code> to confirm
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
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Channel Permanently
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </SettingsDialogContentSection>
    );
}
