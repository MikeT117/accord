import { useGuildsArray } from "@/lib/valtio/queries/guild-store-queries";
import { GuildCard } from "../guild-browser/guild-card";
import { SettingsDialogContentSection } from "../settings-dialog/settings-dialog-content-section";
import { useDeleteGuildMemberMutation } from "@/lib/react-query/mutations/delete-guild-member-mutation";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";
import { CastleIcon, EarthIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "@tanstack/react-router";
import { openCreateGuildDialog } from "@/lib/valtio/mutations/create-guild-dialog-ui-store-mutations";

export function UserSettingsGuildsSection({ userId }: { userId: string }) {
    const guilds = useGuildsArray();
    const { mutate: leaveGuild } = useDeleteGuildMemberMutation();
    const router = useRouter();

    function handleLeaveGuildClick(guildId: string) {
        leaveGuild({ guildId, userId });
    }

    function handleGuildBrowserClick() {
        router.navigate({ to: "/app/guild-browser" });
    }

    return (
        <SettingsDialogContentSection title="Guilds" description="View and manage guild memberships.">
            {!guilds.length ? (
                <div className="flex h-full">
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <CastleIcon />
                            </EmptyMedia>
                            <EmptyTitle>No Guilds yet</EmptyTitle>
                            <EmptyDescription>
                                You can join existing public guilds via the guild browser or start your own community by
                                creating a guild.
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent className="flex-row justify-center gap-2">
                            <Button variant="outline" onClick={openCreateGuildDialog}>
                                <CastleIcon />
                                <span>Create Guild</span>
                            </Button>
                            <Button variant="outline" onClick={handleGuildBrowserClick}>
                                <EarthIcon />
                                <span>Guild Browser</span>
                            </Button>
                        </EmptyContent>
                    </Empty>
                </div>
            ) : (
                <div className="flex flex-wrap gap-4">
                    {guilds.map((g) => (
                        <GuildCard
                            key={g.id}
                            banner={g.banner}
                            createdAt={g.createdAt}
                            description={g.description}
                            icon={g.icon}
                            id={g.id}
                            memberCount={g.memberCount}
                            name={g.name}
                            onLeave={() => handleLeaveGuildClick(g.id)}
                        />
                    ))}
                </div>
            )}
        </SettingsDialogContentSection>
    );
}
