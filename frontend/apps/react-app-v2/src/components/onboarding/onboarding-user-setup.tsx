import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingUserSetupFormSchema } from "./onboading-user-setup-form-schema";
import { Controller, useForm } from "react-hook-form";
import type { OnboardingUserSeupFormType } from "./onboarding-user-setup-types";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Field, FieldGroup, FieldLegend, FieldDescription, FieldLabel, FieldError } from "../ui/field";
import { Card } from "../ui/card";
import type { z } from "zod/v4-mini";
import { useRegisterUserMutation } from "@/lib/react-query/mutations/register-user-mutation";
import { useEffect } from "react";
import { useUniqueUsernameQuery } from "@/lib/react-query/queries/unique-username-query";

type AuthOnboardingUserSetupProps = {
    token: string;
};

export function AuthOnboardingUserSetup({ token }: AuthOnboardingUserSetupProps) {
    const { mutate } = useRegisterUserMutation();
    const form = useForm<OnboardingUserSeupFormType>({
        resolver: zodResolver(onboardingUserSetupFormSchema),
        defaultValues: {
            displayname: "",
            username: "",
        },
    });

    const username: string = form.watch("username");
    const { refetch: checkUsername, data: checkUsernameResult } = useUniqueUsernameQuery({ username });

    function handleSubmit(data: z.infer<typeof onboardingUserSetupFormSchema>) {
        if (!checkUsernameResult) {
            form.setError("username", { message: "Invalid username" });
            return;
        }

        if (checkUsernameResult.available) {
            form.setError("username", { message: "This username is already taken" });
            return;
        }

        mutate({ ...data, token });
    }

    useEffect(() => {
        if (!username.trim().length) {
            return;
        }

        const handleUsernameCheck = setTimeout(() => {
            checkUsername();
        }, 2000);

        return () => clearTimeout(handleUsernameCheck);
    }, [username]);

    return (
        <div className="flex min-h-svh place-content-center place-items-center">
            <Card className="min-w-sm p-6">
                <FieldLegend>User Setup</FieldLegend>
                <FieldDescription>Create a username and display name for your account</FieldDescription>
                <form id="onboarding-user" onSubmit={form.handleSubmit(handleSubmit)}>
                    <FieldGroup>
                        <Controller
                            name="username"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                                    <Input
                                        {...field}
                                        id={field.name}
                                        aria-invalid={fieldState.invalid}
                                        autoComplete="off"
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller
                            name="displayname"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Display Name</FieldLabel>
                                    <Input
                                        {...field}
                                        id={field.name}
                                        aria-invalid={fieldState.invalid}
                                        autoComplete="off"
                                    />
                                    <FieldDescription></FieldDescription>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    </FieldGroup>
                </form>
                <Field orientation="horizontal">
                    <Button type="submit" className="w-full" form="onboarding-user">
                        Create Account
                    </Button>
                </Field>
            </Card>
        </div>
    );
}
