import { proxy } from "valtio";

type MessageCreatorStoreType = { drafts: { [key: string]: string } };

export const messageDraftStore = proxy<MessageCreatorStoreType>({ drafts: {} });
