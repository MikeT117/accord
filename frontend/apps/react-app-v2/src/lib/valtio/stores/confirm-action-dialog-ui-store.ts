import { proxy } from "valtio";

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
