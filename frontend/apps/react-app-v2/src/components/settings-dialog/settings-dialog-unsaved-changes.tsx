import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertTitle, AlertDescription, AlertAction } from "../ui/alert";
import { Button } from "../ui/button";

type UnsavedChangesProps = {
    onDiscard: () => void;
    onSave: () => void;
    isVisible: boolean;
};

export function SettingsDialogUnsavedChanges({ onDiscard, onSave, isVisible }: UnsavedChangesProps) {
    if (!isVisible) {
        return null;
    }
    return (
        <Alert className="sticky border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-500">
            <AlertCircleIcon />
            <AlertTitle className="">You have unsaved changes</AlertTitle>
            <AlertDescription>Your changes will be lost if to exist without saving.</AlertDescription>
            <AlertAction className="space-x-1.5">
                <Button variant="outline" onClick={onDiscard}>
                    Discard
                </Button>
                <Button onClick={onSave}>Save Changes</Button>
            </AlertAction>
        </Alert>
    );
}
