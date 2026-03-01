import { proxy } from "valtio";

type UserSettingsUIStoreType = {
    isOpen: boolean;
};

export const userSettingsUIStore = proxy<UserSettingsUIStoreType>({
    isOpen: false,
});
