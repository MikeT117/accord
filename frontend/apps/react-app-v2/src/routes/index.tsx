import { createFileRoute, redirect } from "@tanstack/react-router";
import { tokenStore } from "@/lib/valtio/stores/token-store";
import { Authenticate } from "@/components/authenticate";
import { tokensSchema } from "@/lib/zod-validation/localstorage-schema";

export const Route = createFileRoute("/")({
    beforeLoad: () => {
        const { success: validTokensExist } = tokensSchema.safeParse(tokenStore);
        if (validTokensExist) throw redirect({ to: "/app/home" });
    },
    component: Authenticate,
});
