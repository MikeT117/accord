import { httpClient } from "@/lib/http-client";
import { guildStoreActions } from "@/lib/zustand/stores/guild-store";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

type DeleteGuildMemberMutationArgs = {
    guildId: string;
    userId: string;
};

const mutationFn = async (args: DeleteGuildMemberMutationArgs) => {
    return httpClient.delete(`/guilds/${args.guildId}/members/${args.userId}`);
};

export const useDeleteGuildMemberMutation = () => {
    const router = useRouter();
    return useMutation({
        mutationFn,
        onSuccess: (_, vars) => {
            router.navigate({ to: "/app/dashboard" });
            guildStoreActions.deleteGuild({ id: vars.guildId });
        },
        onError: () => {
            toast("An error occurred deleting guild member, please try again later.");
        },
    });
};
