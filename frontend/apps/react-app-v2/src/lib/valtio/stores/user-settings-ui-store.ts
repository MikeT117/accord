import { proxy } from "valtio";
import { devtools } from "valtio/utils";

type UserSettingsUIStoreType = {
    isOpen: boolean;
};

export const userSettingsUIStore = proxy<UserSettingsUIStoreType>({
    isOpen: false,
});
devtools(userSettingsUIStore, { name: "user settings ui store", enabled: true });
