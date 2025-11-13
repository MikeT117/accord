import { usePrivateChannelsArray } from "@/lib/valtio/queries/private-channel-store-queries";
import { useUser } from "@/lib/valtio/queries/user-store-queries";
import { useState } from "react";

export function useFilteredPrivateChannels() {
    const [filter, setFilter] = useState("");
    const user = useUser();
    const channels = usePrivateChannelsArray();

    return {
        privateChannels: filter.trim().length
            ? channels.filter((c) =>
                  c.users.some((u) => u.id !== user.id && u.username.toLowerCase().includes(filter.toLowerCase())),
              )
            : channels,
        filter,
        setFilter,
    };
}
