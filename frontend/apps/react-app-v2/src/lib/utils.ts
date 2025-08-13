import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getValidatedStateFromLocalStorage<R>(key: string, validator: (input: unknown) => R): R {
    const localStorageState = localStorage.getItem(key);
    if (!localStorageState) {
        return validator({});
    }

    let state: unknown = {};
    try {
        state = JSON.parse(localStorageState);
    } catch {
        /*
          We don't care if this fails as the
          validator will return default values if parsing fails.
      }*/
    }

    return validator(state);
}
