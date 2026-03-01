import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Field, FieldGroup, FieldLabel, FieldError, FieldDescription, FieldSet } from "../ui/field";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { useCompleteRegistrationMutation } from "@/lib/react-query/mutations/register-user-mutation";
import { useUniqueUsernameCheck } from "@/lib/react-query/queries/unique-username-query";
import { AccordLogo } from "../accord-logo";
import { OnboardingCompleteRegistrationFormType } from "./types/onboarding-user-setup-types";
import { onboardingCompleteRegistrationFormSchema } from "./zod-validation/onboarding-complete-registration-form-schema";

type OnboardingCompleteRegistrationProps = {
    token: string;
};

export function OnboardingCompleteRegistration({ token }: OnboardingCompleteRegistrationProps) {
    const { mutate: completeRegistration } = useCompleteRegistrationMutation();
    const { mutate: checkUniqueUsername } = useUniqueUsernameCheck();

    const form = useForm<OnboardingCompleteRegistrationFormType>({
        resolver: zodResolver(onboardingCompleteRegistrationFormSchema),
        defaultValues: {
            displayname: "",
            username: "",
        },
    });

    function handleSubmit(data: OnboardingCompleteRegistrationFormType) {
        checkUniqueUsername(
            { token, username: data.username },
            {
                onSuccess: (response) => {
                    if (!response.available) {
                        form.setError("username", { message: "This username is not available" });
                        return;
                    }

                    completeRegistration({ ...data, token });
                },
            },
        );
    }

    return (
        <div className="flex min-h-svh flex-col place-content-center place-items-center gap-6">
            <div className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-background bg-clip-padding px-2.5 text-sm font-medium whitespace-nowrap select-none has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 dark:border-input dark:bg-input/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
                <AccordLogo />
                <span className="font-medium">Accord</span>
            </div>
            <Card className="w-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Welcome back</CardTitle>
                    <CardDescription>Set your display name and create a unique username</CardDescription>
                </CardHeader>
                <CardContent>
                    <form id="user-onboarding-form" onSubmit={form.handleSubmit(handleSubmit)}>
                        <FieldSet>
                            <FieldGroup>
                                <Controller
                                    name="username"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="user-onboarding-field-username">Username</FieldLabel>
                                            <Input
                                                id="user-onboarding-field-username"
                                                aria-invalid={fieldState.invalid}
                                                autoComplete="off"
                                                {...field}
                                            />
                                            <FieldDescription>
                                                This will be the username unique to you, it will be how people find you.
                                            </FieldDescription>
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />
                                <Controller
                                    name="displayname"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="user-onboarding-field-display-name">
                                                Display Name
                                            </FieldLabel>
                                            <Input
                                                id="user-onboarding-field-display-name"
                                                aria-invalid={fieldState.invalid}
                                                autoComplete="off"
                                                {...field}
                                            />
                                            <FieldDescription>
                                                This will be the name everyone sees, it does not need to be unique.
                                            </FieldDescription>
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />
                            </FieldGroup>
                        </FieldSet>
                    </form>
                </CardContent>
                <CardFooter>
                    <Field orientation="horizontal" className="justify-end">
                        <Button type="button" variant="outline" onClick={() => form.reset()}>
                            Reset
                        </Button>
                        <Button type="submit" form="user-onboarding-form">
                            Complete Registration
                        </Button>
                    </Field>
                </CardFooter>
            </Card>
        </div>
    );
}
