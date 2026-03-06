import { env } from "@/lib/constants";
import { useEffect, useState } from "react";

const INVITE_CHECK = `https://${env.HOST}/invite/`;
const INVITE_REGEX = RegExp(
    `https://${env.HOST}/invite/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}`,
    "gm",
);

export const useExtractedInvites = (content: string) => {
    const [invites, setInvites] = useState<string[]>([]);

    useEffect(() => {
        if (!content.includes(INVITE_CHECK)) {
            return;
        }

        const inviteIds = [];

        for (const match of content.matchAll(INVITE_REGEX)) {
            const splitMatch = match[0].split("/");
            inviteIds.push(splitMatch[splitMatch.length - 1]);
        }

        setInvites(inviteIds);
    }, [content]);

    return invites;
};
