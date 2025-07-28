import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";

type UnsavedChangesProps = {
    onDiscard: () => void;
    onSave: () => void;
    isVisible: boolean;
} & React.ComponentProps<typeof Alert>;

export function SettingsDialogUnsavedChanges({ onDiscard, onSave, isVisible, ...props }: UnsavedChangesProps) {
    if (!isVisible) {
        return null;
    }
    return (
        <Alert {...props}>
            <AlertCircleIcon />
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <AlertTitle>You have unsaved changes</AlertTitle>
                    <AlertDescription>
                        <p>Your changes will be lost if to exist without saving.</p>
                    </AlertDescription>
                </div>
                <div className="flex space-x-2">
                    <Button onClick={onSave}>Save Changes</Button>
                    <Button variant="outline" onClick={onDiscard}>
                        Discard
                    </Button>
                </div>
            </div>
        </Alert>
    );
}
