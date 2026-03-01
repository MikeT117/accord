import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const queryClient = new QueryClient({
    defaultOptions: {
        mutations: {
            onError: () => {
                toast.error("Unable to complete request!", { dismissible: true });
            },
        },
    },
});
