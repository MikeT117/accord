import type { GuildType, Normalize } from "@/lib/types/types";
import { proxy } from "valtio";

type GuildStoreType = Normalize<GuildType> & { initialised: boolean };

export const guildStore = proxy<GuildStoreType>({ initialised: false, keys: [], values: {} });
