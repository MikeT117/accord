import { createFileRoute, redirect } from "@tanstack/react-router";
import { tokensSchema } from "@/lib/zod-validation/token-schema";
import { tokenStore } from "@/lib/valtio-stores/token-store";
import { Authenticate } from "@/components/authenticate";

export const Route = createFileRoute("/")({
    beforeLoad: () => {
        const { success: validTokensExist } =
            tokensSchema.safeParse(tokenStore);
        if (validTokensExist) {
            throw redirect({ to: "/app" });
        }
    },
    component: Authenticate,
});
