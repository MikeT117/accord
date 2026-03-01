import * as z from "zod/v4-mini";

export const onboardingCompleteRegistrationFormSchema = z.object({
    username: z.string().check(
        z.minLength(3, { error: "Usernames must be longer than 3 characters." }),
        z.maxLength(32, { error: "Usernames must be no longer than 32 characters." }),
        z.refine((val) => !val.includes(" "), { error: "Username cannot contain spaces." }),
    ),
    displayname: z
        .string()
        .check(
            z.minLength(3, { error: "Display names must be longer than 3 characters." }),
            z.maxLength(32, { error: "Display names must be no longer than 32 characters." }),
        ),
});
