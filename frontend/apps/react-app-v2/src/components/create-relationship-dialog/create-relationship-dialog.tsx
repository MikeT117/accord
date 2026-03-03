import { useState } from "react";
import { Button } from "../ui/button";
import { useCreateRelationshipMutation } from "@/lib/react-query/mutations/create-relationship-mutation";
import { RELATIONSHIP_STATUS } from "@/lib/zod-validation/relationship-schema";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import { UserIcon } from "lucide-react";

export function CreateRelationRequestDialog({ onClose }: { onClose: () => void }) {
    const [username, setUsername] = useState("");
    const { mutate: createRelationship } = useCreateRelationshipMutation();

    function handleCreateRelationship() {
        createRelationship({ status: RELATIONSHIP_STATUS.PENDING, username }, { onSuccess: onClose });
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        setUsername(e.currentTarget.value);
    }
    return (
        <Dialog defaultOpen={true} onOpenChange={onClose} modal>
            <DialogContent className="w-96 gap-4">
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
            </DialogContent>
        </Dialog>
    );
}
