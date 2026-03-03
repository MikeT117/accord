import { usePrivateChannels } from "@/lib/zustand/stores/private-channel-store";
import { useUser } from "@/lib/zustand/stores/user-store";
import { useState } from "react";

export function useFilteredPrivateChannels() {
    const [channelFilter, setChannelFilter] = useState("");
    const user = useUser();
    const channels = usePrivateChannels();

    const filteredChannels = channelFilter.trim().length
        ? channels.filter((c) =>
              c.users.some((u) => u.id !== user.id && u.username.toLowerCase().includes(channelFilter.toLowerCase())),
          )
        : channels;

    return {
        channelFilter,
        setChannelFilter,
        filteredChannels,
    };
}
