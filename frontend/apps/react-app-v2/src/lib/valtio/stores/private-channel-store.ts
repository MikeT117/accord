import type { Dictionary, PrivateChannelType } from "@/lib/types/types";
import { proxy } from "valtio";
import { devtools } from "valtio/utils";

type PrivateChannelStoreType = {
    initialised: boolean;
    keys: string[];
    values: Dictionary<PrivateChannelType>;
};

export const privateChannelStore = proxy<PrivateChannelStoreType>({ initialised: false, keys: [], values: {} });
devtools(privateChannelStore, { name: "private channel store", enabled: true });
