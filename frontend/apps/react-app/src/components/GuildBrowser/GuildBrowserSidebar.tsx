import { MainSidebarHeaderLayout, MainSidebarContentLayout } from '@/shared-components/Layouts';
import { ListItem } from '@/shared-components/ListItem';
import { guildCategoryFilterStore, useGuildCategoryFilter } from './stores/useGuildCategoryFilter';
import { useGetGuildCategoriesQuery } from '../../api/guildCategories/getGuildCategories';
import { House, Waveform, Monitor, Atom, GameController } from '@phosphor-icons/react';
import { useI18nContext } from '../../i18n/i18n-react';

const { setGuildCategoryId } = guildCategoryFilterStore;

export const GuildBrowserSidebar = () => {
    const { LL } = useI18nContext();
    const guildCategoryId = useGuildCategoryFilter((s) => s.guildCategoryId);
    const { data } = useGetGuildCategoriesQuery();

    if (!data) {
        return null;
    }

    return (
        <>
            <MainSidebarHeaderLayout>
                <h1 className='mx-4 mr-auto text-2xl font-bold text-gray-12'>
                    {LL.General.Discover()}
                </h1>
            </MainSidebarHeaderLayout>
            <MainSidebarContentLayout>
                <ul className='space-y-1 px-2 py-2'>
                    <ListItem
                        isActive={!guildCategoryId}
                        onClick={() => setGuildCategoryId(undefined)}
                        intent='secondary'
                        className='space-x-2'
                        baseBg={false}
                        padding='lg'
                        isActionable
                    >
                        <House size={24} weight='duotone' />
                        <span>{LL.General.Home()}</span>
                    </ListItem>
                    {data?.map((gc) => (
                        <ListItem
                            key={gc.id}
                            isActive={gc.id === guildCategoryId}
                            onClick={() => setGuildCategoryId(gc.id)}
                            intent='secondary'
                            className='space-x-2'
                            baseBg={false}
                            padding='lg'
                            isActionable
                        >
                            {gc.name === 'Music' && <Waveform weight='duotone' size={24} />}
                            {gc.name === 'Entertainment' && <Monitor weight='duotone' size={24} />}
                            {gc.name === 'Science & Tech' && <Atom weight='duotone' size={24} />}
                            {gc.name === 'Gaming' && <GameController weight='duotone' size={24} />}
                            <span>{gc.name}</span>
                        </ListItem>
                    ))}
                </ul>
            </MainSidebarContentLayout>
        </>
    );
};
