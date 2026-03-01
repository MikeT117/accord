import { useState } from "react";
import { Button } from "../ui/button";
import { useCreateRelationshipMutation } from "@/lib/react-query/mutations/create-relationship-mutation";
import { RELATIONSHIP_STATUS } from "@/lib/zod-validation/relationship-schema";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import { UserIcon } from "lucide-react";
import { useCreateRelationshipRequestDialogUIStore } from "@/lib/valtio/queries/create-relationship-request-dialog-ui-store";
import { closeCreateRelationshipRequestDialog } from "@/lib/valtio/mutations/create-relationship-request-dialog-ui-store-mutations";

export function RelationRequestCreatorDialog() {
    const { isOpen } = useCreateRelationshipRequestDialogUIStore();
    return (
        <Dialog open={isOpen} onOpenChange={closeCreateRelationshipRequestDialog} modal>
            <DialogContent className="w-96 gap-4">
                <RelationRequestCreatorDialogContent />
            </DialogContent>
        </Dialog>
    );
}

function RelationRequestCreatorDialogContent() {
    const [username, setUsername] = useState("");
    const { mutate: createRelationship } = useCreateRelationshipMutation();

    function handleCreateRelationship() {
        createRelationship(
            { status: RELATIONSHIP_STATUS.PENDING, username },
            { onSuccess: closeCreateRelationshipRequestDialog },
        );
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        setUsername(e.currentTarget.value);
    }

    return (
        <>
            <DialogHeader className="items-center">
                <DialogTitle>Create Friend Request</DialogTitle>
                <DialogDescription className="text-center">
                    Enter their username below, if the user exists they will receive a friend request.
                </DialogDescription>
            </DialogHeader>
            <InputGroup>
                <InputGroupAddon align="inline-start">
                    <UserIcon />
                </InputGroupAddon>
                <InputGroupInput onChange={handleInputChange} value={username} placeholder="Enter username..." />
            </InputGroup>
            <DialogFooter>
                <Button onClick={handleCreateRelationship}>Send Request</Button>
            </DialogFooter>
        </>
    );
}
