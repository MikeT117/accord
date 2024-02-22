import { Button } from '@/shared-components/Button';
import { Warning } from '@phosphor-icons/react';
import { useI18nContext } from '../../i18n/i18n-react';

export const UnsavedSettingsPrompt = ({
    isModified,
    isValid,
    onDiscard,
    onSave,
}: {
    isModified: boolean;
    isValid?: boolean;
    onSave: () => void;
    onDiscard: () => void;
}) => {
    const { LL } = useI18nContext();

    if (!isModified) {
        return null;
    }

    return (
        <div className='flex w-full items-center rounded-md bg-grayA-3 p-3'>
            <Warning size={32} weight='duotone' className='text-yellowA-9' />
            <span className='ml-3 mr-auto text-sm font-semibold text-gray-12'>
                {LL.Hints.UnsavedChanges()}
            </span>
            <div className='flex space-x-3'>
                <Button intent='link' padding='s' onClick={onDiscard}>
                    {LL.Actions.Reset()}
                </Button>
                <Button onClick={onSave} disabled={!isValid}>
                    {LL.Actions.Save()}
                </Button>
            </div>
        </div>
    );
};
