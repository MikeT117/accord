import type { GuildType, Normalize } from "@/lib/types/types";
import { proxy } from "valtio";
import { devtools } from "valtio/utils";

type GuildStoreType = Normalize<GuildType> & { initialised: boolean };

export const guildStore = proxy<GuildStoreType>({ initialised: false, keys: [], values: {} });
devtools(guildStore, { name: "guild store", enabled: true });
