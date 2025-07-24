import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getValidatedStateFromLocalStorage<R>(key: string, validator: (input: any) => R): R {
    const localStorageState = localStorage.getItem(key);
    if (!localStorageState) {
        return validator({});
    }

    let state: any = {};
    try {
        state = JSON.parse(localStorageState);
    } catch {}

    return validator(state);
}
