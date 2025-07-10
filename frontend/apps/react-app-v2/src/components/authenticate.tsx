import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { env } from "@/lib/constants";
import { GithubLogoIcon } from "@phosphor-icons/react";

export function Authenticate() {
    function handleGithubLogin() {
        window.location.href = `${env.API_URL}/v1/auth/github`;
    }
    return (
        <div className="flex place-content-center place-items-center min-h-svh">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">
                        Welcome back
                    </CardTitle>
                    <CardDescription>
                        Sign in to your account to continue
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        className="w-full"
                        size="lg"
                        onClick={handleGithubLogin}
                    >
                        <GithubLogoIcon className="w-5 h-5 mr-2" />
                        Continue with GitHub
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
