import type { DiscoverableGuildType } from "@/lib/types/types";
import { CalendarRangeIcon, CheckCircle2Icon, PlusCircleIcon, UsersIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { env } from "@/lib/constants";
import { GuildIcon } from "../guild-icon";
import { Card, CardFooter, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { useIsGuildMember } from "@/lib/valtio/queries/guild-store-queries";

type GuildCardProps = {
    ref: (elem: HTMLDivElement | null) => void;
    guild: DiscoverableGuildType;
    onJoin: () => void;
};

export function GuildCard({ guild, onJoin, ref }: GuildCardProps) {
    const isMember = useIsGuildMember(guild.id);
    return (
        <Card
            ref={ref}
            className="group relative w-xs overflow-hidden pt-0 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
        >
            <div className="relative h-30 overflow-hidden">
                <img
                    src={`${env.CLOUDINARY_RES_URL}/${guild.banner}`}
                    alt="Profile banner"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />
            </div>
            <GuildIcon size="xl" className="absolute top-22 left-4" name={guild.name} icon={guild.icon} />
            <Button className="absolute top-4 right-4 cursor-pointer" disabled={isMember} onClick={onJoin}>
                {isMember ? (
                    <>
                        <CheckCircle2Icon /> Joined
                    </>
                ) : (
                    <>
                        <PlusCircleIcon /> Join
                    </>
                )}
            </Button>
            <CardHeader className="mt-4 px-4">
                <h3 className="truncate text-base font-semibold text-foreground">{guild.name}</h3>
                <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{guild.description}</p>
            </CardHeader>
            <CardFooter className="flex flex-col items-start px-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <UsersIcon className="h-3.5 w-3.5 text-primary" />
                        <span>{guild.memberCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarRangeIcon className="h-3.5 w-3.5 text-primary" />
                        <span>{formatDistanceToNow(guild.createdAt, { addSuffix: true })}</span>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}
