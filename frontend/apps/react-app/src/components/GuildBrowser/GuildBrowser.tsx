import { GuildBrowserGuildsList } from './GuildBrowserGuildsList';
import { MainSidebarContentFullHeightLayout } from '../../shared-components/Layouts/MainContentFullHeightLayout';
import { GuildBrowserBanner } from '../../assets/GuildBrowserBanner';
import { GuildBrowserSearchInput } from './GuildBrowserSearchInput';
import { useI18nContext } from '../../i18n/i18n-react';

export const GuildBrowser = () => {
    const { LL } = useI18nContext();
    return (
        <MainSidebarContentFullHeightLayout>
            <div className='relative mb-6 flex'>
                <GuildBrowserBanner />
                <div className='absolute top-[50%] left-[50%] z-50 flex w-full max-w-[50%] translate-x-[-50%] translate-y-[-50%] flex-col'>
                    <div className='mb-3 flex flex-col items-center space-y-1'>
                        <h1 className='text-2xl font-bold text-gray-12'>
                            {LL.General.FindCommunity()}{' '}
                        </h1>
                        <span className='text-sm text-gray-12'>{LL.General.Community()}</span>
                    </div>
                    <GuildBrowserSearchInput />
                </div>
            </div>
            <GuildBrowserGuildsList />
        </MainSidebarContentFullHeightLayout>
    );
};
