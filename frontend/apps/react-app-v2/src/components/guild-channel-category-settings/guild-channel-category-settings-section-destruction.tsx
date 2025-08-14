import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useDeleteChannelMutation } from "@/lib/react-query/mutations/delete-channel-mutation";
import { useState } from "react";
import { SettingsDialogContentSection } from "../settings-dialog/settings-dialog-content-section";
import { closeGuildChannelSettings } from "@/lib/valtio/mutations/guild-channel-settings-ui-store-mutations";

type GuildChannelSettingsDestructionSectionProps = {
    id: string;
    name: string;
};

export function GuildCategoryChannelSettingsDestructionSection({
    id,
    name,
}: GuildChannelSettingsDestructionSectionProps) {
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
            title="Delete Category"
            description="Permanently delete this category and all its content."
        >
            <Card className="border-destructive/20">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>
                        Once you delete a category, there is no going back. Please be certain.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
                        <h4 className="mb-2 font-semibold text-destructive">This action will:</h4>
                        <ul className="ml-8 list-disc space-y-1 text-sm text-muted-foreground">
                            <li>Unlink all child channels from this category</li>
                            <li>Delete all category settings and permissions</li>
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
                            Delete Category Permanently
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </SettingsDialogContentSection>
    );
}
