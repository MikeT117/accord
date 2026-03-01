import { Button } from "@/components/ui/button";
import { env } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Field, FieldGroup, FieldSet } from "../ui/field";
import { AccordLogo } from "../accord-logo";

export function OnboardingSocialProviderSelect() {
    function handleGithubLogin() {
        window.location.href = `${env.API_URL}/v1/auth/github`;
    }

    function handleGitlabLogin() {
        window.location.href = `${env.API_URL}/v1/auth/gitlab`;
    }
    return (
        <div className="flex min-h-svh flex-col place-content-center place-items-center gap-6">
            <div className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-background bg-clip-padding px-2.5 text-sm font-medium whitespace-nowrap select-none has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 dark:border-input dark:bg-input/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
                <AccordLogo />
                <span className="font-medium">Accord</span>
            </div>
            <Card className="w-xs border-border bg-background bg-clip-padding dark:border-input dark:bg-input/30">
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Welcome back</CardTitle>
                    <CardDescription>Login with your Github or Gitlab account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                        <FieldSet>
                            <FieldGroup>
                                <Field>
                                    <Button variant="outline" type="button" onClick={handleGithubLogin}>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            className="fill-white"
                                        >
                                            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                        </svg>
                                        <span>Login with Github</span>
                                    </Button>
                                    <Button variant="outline" type="button" onClick={handleGitlabLogin}>
                                        <svg
                                            className="fill-white"
                                            viewBox="0 0 1024 1024"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path d="M910.5 553.2l-109-370.8c-6.8-20.4-23.1-34.1-44.9-34.1s-39.5 12.3-46.3 32.7l-72.2 215.4H386.2L314 181.1c-6.8-20.4-24.5-32.7-46.3-32.7s-39.5 13.6-44.9 34.1L113.9 553.2c-4.1 13.6 1.4 28.6 12.3 36.8l385.4 289 386.7-289c10.8-8.1 16.3-23.1 12.2-36.8z"></path>
                                        </svg>
                                        <span>Login with Gitlab</span>
                                    </Button>
                                </Field>
                            </FieldGroup>
                        </FieldSet>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
