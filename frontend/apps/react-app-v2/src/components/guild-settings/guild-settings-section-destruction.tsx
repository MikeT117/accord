import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useState } from "react";
import { SettingsDialogContentSection } from "../settings-dialog/settings-dialog-content-section";
import { closeGuildSettings } from "@/lib/valtio/mutations/guild-settings-ui-store-mutations";
import { useDeleteGuildMutation } from "@/lib/react-query/mutations/delete-guild-mutation";

type GuildSettingsDestructionSectionProps = {
    guildId: string;
    name: string;
};

export function GuildSettingsDestructionSection({ guildId, name }: GuildSettingsDestructionSectionProps) {
    const { mutate: deleteGuild } = useDeleteGuildMutation({ onSuccess: closeGuildSettings });
    const [confirmValue, setConfirmValue] = useState("");

    const isConfirmed = confirmValue === name;

    function handleDeleteGuildClick() {
        if (!isConfirmed) {
            return;
        }
        deleteGuild({ id: guildId });
    }

    function handleConfirmValueChange(e: React.FormEvent<HTMLInputElement>) {
        setConfirmValue(e.currentTarget.value);
    }

    return (
        <SettingsDialogContentSection
            title="Delete Guild"
            description="Permanently delete this guild and all its content."
        >
            <Card className="border-2 border-destructive/25 bg-destructive/5 ring-0">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>
                        Once you delete a guild, there is no going back. Please be certain.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-md border-2 border-destructive/25 p-4 ring-0">
                        <h4 className="mb-2 font-semibold text-destructive">This action will:</h4>
                        <ul className="ml-4 list-inside list-disc space-y-0.5 text-sm text-muted-foreground">
                            <li>Permanently delete all members</li>
                            <li>Permanently delete all channels</li>
                            <li>Permanently delete all roles</li>
                            <li>Permanently delete all channel messages</li>
                            <li>Permanently delete all files and attachments</li>
                            <li>Permanently delete all channel settings and permissions</li>
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
                            onClick={handleDeleteGuildClick}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Guild Permanently
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </SettingsDialogContentSection>
    );
}
