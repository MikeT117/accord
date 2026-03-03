import type { GuildType } from "@/lib/types/types";
import {
    CalendarRangeIcon,
    CameraIcon,
    DoorOpenIcon,
    PlusCircleIcon,
    SquareArrowRightEnterIcon,
    UsersIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AvatarWithFallback } from "./avatar-with-fallback";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Image } from "@/components/image";
import { ButtonWithTooltip } from "./button-with-tooltip";
import { Badge } from "./ui/badge";
import { useIsGuildMember } from "@/lib/zustand/stores/guild-store";

type GuildCardProps = {
    ref?: (elem: HTMLDivElement | null) => void;
    onJoin?: () => void;
    onLeave?: () => void;
    onGoTo?: () => void;
    onIconMutate?: () => void;
    onBannerMutate?: () => void;
    bannerPreview?: string | null;
    iconPreview?: string | null;
} & Pick<GuildType, "id" | "banner" | "name" | "icon" | "description" | "memberCount" | "createdAt">;

export function GuildCard({
    id,
    banner,
    bannerPreview,
    createdAt,
    description,
    icon,
    iconPreview,
    memberCount,
    name,
    onJoin,
    onLeave,
    onGoTo,
    onIconMutate,
    onBannerMutate,
    ref,
}: GuildCardProps) {
    const isMember = useIsGuildMember(id);
    return (
        <Card
            ref={ref}
            className="group relative h-82 w-66 shrink-0 overflow-hidden pt-0 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
        >
            <div className="relative h-30 overflow-hidden">
                <Image
                    src={banner}
                    preview={bannerPreview}
                    alt="Profile banner"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />
            </div>
            <AvatarWithFallback
                size="xl"
                className="absolute top-22 left-4"
                fallback={name}
                src={icon}
                preview={iconPreview}
                onMutate={onIconMutate}
            />
            {onJoin && !isMember && (
                <Button className="absolute top-2 right-2 cursor-pointer" disabled={isMember} onClick={onJoin}>
                    <PlusCircleIcon />
                    <span>Join</span>
                </Button>
            )}
            {onGoTo && isMember && (
                <Button className="absolute top-2 right-2 cursor-pointer" onClick={onGoTo}>
                    <SquareArrowRightEnterIcon />
                    <span>Open</span>
                </Button>
            )}
            {onBannerMutate && (
                <Button className="absolute top-2 right-2 cursor-pointer" onClick={onBannerMutate}>
                    <CameraIcon />
                    <span>Edit Banner</span>
                </Button>
            )}
            <CardHeader className="mt-4 px-4">
                <CardTitle>{name}</CardTitle>
                <CardDescription className="col-span-2 mt-2 text-xs">{description}</CardDescription>
                <CardAction>
                    {isMember && (
                        <Badge variant="secondary" className="">
                            Joined
                        </Badge>
                    )}
                </CardAction>
            </CardHeader>
            <CardFooter className="mt-auto flex justify-between px-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <UsersIcon className="size-3.5" />
                        <span>{memberCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarRangeIcon className="size-3.5" />
                        <span>{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
                    </div>
                </div>
                {onLeave && (
                    <ButtonWithTooltip
                        className="cursor-pointer"
                        onClick={onLeave}
                        variant="destructive"
                        size="icon-sm"
                        tooltipText="Leave Guild"
                    >
                        <DoorOpenIcon />
                    </ButtonWithTooltip>
                )}
            </CardFooter>
        </Card>
    );
}
