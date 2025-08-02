import { Card, CardContent } from "../ui/card";
import { UserBanner } from "../user-banner-image";
import { UserAvatar } from "../user-avatar";

type UserProfilePreviewProps = {
    avatar?: string | null;
    banner?: string | null;
    status?: string | null;
    avatarPreview?: string | null;
    bannerPreview?: string | null;
    displayName: string;
    onBannerMutate?: () => void;
    onAvatarMutate?: () => void;
};

export function UserProfilePreview({
    displayName,
    avatar,
    banner,
    status,
    avatarPreview,
    bannerPreview,
    onBannerMutate,
    onAvatarMutate,
}: UserProfilePreviewProps) {
    return (
        <Card className="h-min w-full max-w-80 p-0">
            <CardContent className="px-0 pb-3">
                <div className="relative">
                    <UserBanner banner={banner} preview={bannerPreview} onMutate={onBannerMutate} />
                    <div className="absolute -bottom-8 left-4">
                        <UserAvatar
                            displayName={displayName}
                            avatar={avatar}
                            preview={avatarPreview}
                            onMutate={onAvatarMutate}
                        />
                    </div>
                </div>
                <div className="mt-12 ml-4">
                    <h3 className="text-xl font-semibold">{displayName}</h3>
                    {status && <p className="text-sm text-muted-foreground">{status}</p>}
                </div>
            </CardContent>
        </Card>
    );
}
