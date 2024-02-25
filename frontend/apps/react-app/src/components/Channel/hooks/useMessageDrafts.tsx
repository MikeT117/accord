import { useEffect } from 'react';
import { messageDraftsStore, useMessageDraftsStore } from '../stores/messageDraftsStore';

export const useMessageDrafts = (channelId: string) => {
    const draft = useMessageDraftsStore((s) => s.drafts[channelId]);

    useEffect(() => {
        if (!draft) {
            messageDraftsStore.create(channelId);
        }
    }, [draft, messageDraftsStore]);

    return draft;
};
