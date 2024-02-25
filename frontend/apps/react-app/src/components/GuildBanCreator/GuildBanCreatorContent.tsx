import { useState } from 'react';
import { useCreateGuildBanMutation } from '../../api/guildBans/createGuildBan';

import { User } from '../../types';
import { Button } from '../../shared-components/Button';
import { Input } from '../../shared-components/Input';
import { guildBanCreatorStore } from './stores/guildBanCreatorStore';
import { z } from 'zod';
import { useI18nContext } from '../../i18n/i18n-react';

const reasonSchema = z.string().trim().min(1).max(500);

export const GuildBanCreatorContent = ({
    guildId,
    user,
}: {
    guildId: string;
    user: Pick<User, 'id' | 'displayName' | 'avatar'>;
}) => {
    const { LL } = useI18nContext();
    const [reason, setReason] = useState('');
    const { mutate: createBan } = useCreateGuildBanMutation();

    const { success: isValid } = reasonSchema.safeParse(reason);

    const handleBanClick = () => {
        createBan({ guildId, reason, userId: user.id });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setReason(e.currentTarget.value);
    };

    return (
        <div className='flex w-full flex-col bg-grayA-4'>
            <h1 className='p-4 text-lg font-medium text-gray-12'>{LL.General.BanUser()}</h1>
            <span className='mb-6 bg-yellow-9 p-2 px-4 text-sm text-black'>
                {LL.Hints.BanUser({ displayName: user.displayName })}
            </span>
            <div className='mb-6 px-4'>
                <Input
                    value={reason}
                    onChange={handleInputChange}
                    placeholder={LL.Inputs.Placeholders.BanReason()}
                    isError={!isValid}
                />
            </div>
            <div className='flex justify-between bg-grayA-3 px-4 py-3'>
                <Button intent='link' padding='s' onClick={guildBanCreatorStore.close}>
                    {LL.Actions.Cancel()}
                </Button>
                <Button intent='danger' onClick={handleBanClick} disabled={!isValid}>
                    {LL.Actions.Ban()}
                </Button>
            </div>
        </div>
    );
};
