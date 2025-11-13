import { useState } from "react";
import { Button } from "../ui/button";
import { useCreateRelationshipMutation } from "@/lib/react-query/mutations/create-relationship-mutation";
import { RELATIONSHIP_STATUS } from "@/lib/zod-validation/relationship-schema";

export function UserDashboardFriendCreator() {
    const [username, setUsername] = useState("");
    const { mutate: createRelationship } = useCreateRelationshipMutation();

    function handleCreateRelationship() {
        createRelationship({ status: RELATIONSHIP_STATUS.PENDING, username });
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        setUsername(e.currentTarget.value);
    }

    return (
        <div className="w-full p-3">
            <div className="flex grow flex-col space-x-3 overflow-hidden rounded-md border border-input bg-transparent px-3 py-1.5 shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 dark:bg-input/15">
                <div className="flex items-center space-x-3">
                    <input
                        placeholder="Add friends with their usernames."
                        className="w-full  overflow-hidden py-2 text-sm leading-relaxed text-foreground transition-[color] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                        onChange={handleInputChange}
                        value={username}
                    />
                    <Button onClick={handleCreateRelationship} size="sm">
                        Send Friend Request
                    </Button>
                </div>
            </div>
        </div>
    );
}
