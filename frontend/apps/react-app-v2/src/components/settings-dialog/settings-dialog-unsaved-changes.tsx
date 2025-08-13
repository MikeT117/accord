import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
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
        <Alert variant="warning" className="sticky bottom-6">
            <AlertCircleIcon />
            <AlertTitle>You have unsaved changes</AlertTitle>
            <AlertDescription>Your changes will be lost if to exist without saving.</AlertDescription>
            <div className="flex col-3 h-full -row-start-1 -row-end-3 items-center space-x-2">
                <Button variant="outline" onClick={onDiscard}>
                    Discard
                </Button>
                <Button onClick={onSave}>Save Changes</Button>
            </div>
        </Alert>
    );
}
