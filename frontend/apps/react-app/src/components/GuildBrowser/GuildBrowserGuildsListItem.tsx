import { Avatar } from '@/shared-components/Avatar';
import { Button } from '@/shared-components/Button';
import { Image } from '@/shared-components/Image';
import { useIsGuildMember } from '../../shared-hooks/useIsMember';
import { env } from '../../env';
import { Guild } from '../../types';
import { useI18nContext } from '../../i18n/i18n-react';

export const GuildBrowserGuildsListItem = ({
    guild,
    onJoinGuild,
}: {
    guild: Pick<
        Guild,
        'id' | 'guildCategoryId' | 'name' | 'description' | 'memberCount' | 'banner' | 'icon'
    >;
    onJoinGuild: () => void;
}) => {
    const { LL } = useI18nContext();
    const isGuildMember = useIsGuildMember(guild.id);
    return (
        <div className='group flex min-h-[320px] min-w-[240px] max-w-[20%] transform-gpu flex-col overflow-hidden rounded-md bg-gray-2 transition ease-in-out hover:scale-[101%] hover:bg-gray-3'>
            <Image
                src={env.cloudinaryResUrl + guild.banner}
                isActionable={false}
                h='160px'
                w='auto'
            />
            <Avatar src={guild.icon} size='xxl' className='relative top-[-40px] left-[8px]' />
            <div className='flex flex-col -mt-[42px] p-3 grow justify-between'>
                <div className='flex flex-col space-y-2'>
                    <span className='font-semibold text-gray-12'>{guild.name}</span>
                    <span className='text-xs text-gray-11'>{guild.description}</span>
                </div>
                <div className='mt-2'>
                    <Button onClick={onJoinGuild} disabled={isGuildMember} fullWidth>
                        {isGuildMember ? LL.General.Joined() : LL.Actions.Join()}
                    </Button>
                    <span className='text-xs text-gray-11'>
                        {LL.General.GuildMemberCount({ count: guild.memberCount })}
                    </span>
                </div>
            </div>
        </div>
    );
};
