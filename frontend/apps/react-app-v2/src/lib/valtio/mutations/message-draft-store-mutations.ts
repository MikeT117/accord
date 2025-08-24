import { messageDraftStore } from "../stores/message-draft-store";

export function deleteMessageDraft(key: string) {
    delete messageDraftStore.drafts[key];
}

export function resetMessageDraft(key: string) {
    messageDraftStore.drafts[key] = "";
}

export function setMessageDraft(key: string, value: string) {
    messageDraftStore.drafts[key] = value;
}

export function appendMessageDraft(key: string, value: string) {
    messageDraftStore.drafts[key] = `${messageDraftStore.drafts[key]}${value}`;
}
