import { Card, CardContent } from "../ui/card";
import { UserBanner } from "../user-banner-image";
import { GuildIcon } from "../guild-icon";
import { format } from "date-fns";

type UserProfilePreviewProps = {
    icon?: string | null;
    createdAt: Date;
    description: string;
    banner?: string | null;
    iconPreview?: string | null;
    bannerPreview?: string | null;
    name: string;
    memberCount: number;
    onBannerMutate?: () => void;
    onIconMutate?: () => void;
};

export function GuildProfilePreview({
    name,
    createdAt,
    memberCount,
    description,
    icon,
    banner,
    iconPreview,
    bannerPreview,
    onBannerMutate,
    onIconMutate,
}: UserProfilePreviewProps) {
    const memberString = `${memberCount} Member${memberCount > 1 ? "s" : ""}`;
    return (
        <Card className="h-min w-full max-w-80 p-0 shrink-0">
            <CardContent className="px-0 pb-3">
                <div className="relative">
                    <UserBanner banner={banner} preview={bannerPreview} onMutate={onBannerMutate} />
                    <div className="absolute -bottom-8 left-4">
                        <GuildIcon name={name} icon={icon} preview={iconPreview} onMutate={onIconMutate} />
                    </div>
                </div>
                <div className="mt-12 px-4 space-y-2">
                    <h3 className="text-xl font-semibold">{name}</h3>
                    <div>
                        <p className="text-xs text-muted-foreground">{memberString}</p>
                        <p className="text-xs text-muted-foreground">Est. {format(createdAt, "MMM yyyy")}</p>
                    </div>
                    <p className="text-sm text-muted-foreground wrap-anywhere text-wrap">{description}</p>
                </div>
            </CardContent>
        </Card>
    );
}
