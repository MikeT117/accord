import { usePrivateChannelsArray } from "@/lib/valtio/queries/private-channel-store-queries";
import { useUser } from "@/lib/valtio/queries/user-store-queries";
import { useState } from "react";

export function useFilteredPrivateChannels() {
    const [channelFilter, setChannelFilter] = useState("");
    const user = useUser();
    const channels = usePrivateChannelsArray();

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
