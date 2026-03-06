import { Card, CardContent, CardHeader } from "./ui/card";
import { AvatarWithFallback } from "./avatar-with-fallback";
import { Image } from "@/components/image";
import { Button } from "./ui/button";
import { CheckCircle2Icon } from "lucide-react";
import { GuildRoleBadges } from "./guild-role-badges";

type UserProfilePreviewProps = {
    guildId?: string;
    roleIds?: string[];
    displayName: string;
    avatar?: string | null;
    banner?: string | null;
    avatarPreview?: string | null;
    bannerPreview?: string | null;
    onBannerMutate?: () => void;
    onAvatarMutate?: () => void;
};

export function UserCard({
    guildId,
    roleIds,
    displayName,
    avatar,
    avatarPreview,
    banner,
    bannerPreview,
    onBannerMutate,
    onAvatarMutate,
}: UserProfilePreviewProps) {
    return (
        <Card className="group relative m-0 h-min w-xs shrink-0 overflow-hidden pt-0 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
            <div className="relative h-30 overflow-hidden">
                <Image
                    src={banner}
                    preview={bannerPreview}
                    alt="Profile banner"
                    className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />
            </div>
            <AvatarWithFallback
                size="xl"
                className="absolute top-22 left-4"
                fallback={displayName}
                src={avatar}
                preview={avatarPreview}
                onMutate={onAvatarMutate}
            />
            {onBannerMutate && (
                <Button className="absolute top-4 right-4 cursor-pointer" onClick={onBannerMutate}>
                    <CheckCircle2Icon /> Edit Banner
                </Button>
            )}
            <CardHeader className="mt-4 px-4">
                <h3 className="truncate text-base font-semibold text-foreground">{displayName}</h3>
            </CardHeader>
            <CardContent>
                {guildId && Array.isArray(roleIds) && <GuildRoleBadges guildId={guildId} roleIDs={roleIds} />}
            </CardContent>
        </Card>
    );
}
