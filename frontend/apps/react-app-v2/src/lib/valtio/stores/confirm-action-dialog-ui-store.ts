import { proxy } from "valtio";
import { devtools } from "valtio/utils";

type ConfirmActionDialogUIStore = {
    isOpen: boolean;
    title: string;
    description: string;
    actionFn: () => void;
};

export const confirmActionDialogUIStore = proxy<ConfirmActionDialogUIStore>({
    isOpen: false,
    description: "",
    title: "",
    actionFn: () => void 0,
});
devtools(confirmActionDialogUIStore, { name: "confirm action dialog ui store", enabled: true });
