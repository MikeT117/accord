import { handleTokenStoreInitialisation } from "@/lib/valtio/mutations/token-store-mutations";
import { tokensSchema } from "@/lib/zod-validation/localstorage-schema";
import { createFileRoute, redirect } from "@tanstack/react-router";

type AuthSearchParamsType = {
    accesstoken: string;
    refreshtoken: string;
};

export const Route = createFileRoute("/auth")({
    validateSearch: (params: Record<string, unknown>): AuthSearchParamsType => {
        return {
            accesstoken: (params?.accesstoken as string) ?? "",
            refreshtoken: (params?.refreshtoken as string) ?? "",
        };
    },
    beforeLoad: (ctx) => {
        const { success: tokensValid } = tokensSchema.safeParse({
            accesstoken: ctx.search.accesstoken,
            refreshtoken: ctx.search.refreshtoken,
        });

        if (tokensValid) {
            handleTokenStoreInitialisation(ctx.search.accesstoken, ctx.search.refreshtoken);
            throw redirect({ to: "/app/dashboard" });
        }

        throw redirect({ to: "/" });
    },
});
