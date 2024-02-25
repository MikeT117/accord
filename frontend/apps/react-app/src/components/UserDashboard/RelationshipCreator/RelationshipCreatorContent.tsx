import { useRelationshipCreateMutation } from '@/api/userRelationships/createRelationship';
import { Button } from '@/shared-components/Button';
import { Input } from '@/shared-components/Input';
import {
    relationshipCreatorStore,
    useRelationshipCreatorStore,
} from './useRelationshipCreatorstore';
import { useI18nContext } from '../../../i18n/i18n-react';
import { z } from 'zod';

const usernameSchema = z
    .string()
    .min(3)
    .max(32)
    .refine((s) => !s.includes(' '));

export const RelationshipCreatorContent = () => {
    const { LL } = useI18nContext();
    const username = useRelationshipCreatorStore((s) => s.username);
    const { mutate: createRelationship } = useRelationshipCreateMutation();

    const { success: isDisplayNameValid } = usernameSchema.safeParse(username);

    const handleCreateRelationship = () => {
        createRelationship({ status: 1, username });
    };

    return (
        <div className='flex w-full flex-col bg-grayA-4'>
            <h1 className='p-4 text-lg font-medium text-gray-12'>{LL.General.AddFriend()}</h1>
            <label className='flex w-full flex-col px-4 mb-4' id='friend-request-username'>
                <span className='mb-1.5 text-xs text-gray-11'>{LL.Inputs.Labels.Username()}</span>
                <Input
                    id='friend-request-username'
                    value={username}
                    onChange={(e) => relationshipCreatorStore.setDisplayName(e.currentTarget.value)}
                    placeholder={LL.Inputs.Placeholders.EnterUsername()}
                />
            </label>
            <div className='flex justify-between bg-grayA-3 px-4 py-3'>
                <Button intent='link' padding='s' onClick={relationshipCreatorStore.close}>
                    {LL.Actions.Cancel()}
                </Button>
                <Button
                    intent='primary'
                    onClick={handleCreateRelationship}
                    disabled={!isDisplayNameValid}
                >
                    {LL.Actions.SendRequest()}
                </Button>
            </div>
        </div>
    );
};
