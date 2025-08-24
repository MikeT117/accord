import { proxy } from "valtio";
import { devtools } from "valtio/utils";

type MessageCreatorStoreType = { drafts: { [key: string]: string } };

export const messageDraftStore = proxy<MessageCreatorStoreType>({ drafts: {} });
devtools(messageDraftStore, { name: "message draft store", enabled: true });
