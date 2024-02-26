import { useDeleteRelationshipMutation } from '@/api/userRelationships/deleteRelationship';
import { Input } from '@/shared-components/Input';
import { MainContentHeaderLayout, MainContentBodyLayout } from '@/shared-components/Layouts';
import { RelationshipListItem } from '../RelationshipListItem';
import { useFilteredRelationships } from '../hooks/useFilteredRelationships';
import { Prohibit } from '@phosphor-icons/react';
import { useI18nContext } from '../../../../i18n/i18n-react';

export const UserDashboardBlockedRelationships = () => {
    const { LL } = useI18nContext();

    const { data, filter, setFilter } = useFilteredRelationships(2);
    const deleteRelationship = useDeleteRelationshipMutation();

    return (
        <>
            <MainContentHeaderLayout>
                <div className='mr-6 flex items-center space-x-2'>
                    <Prohibit size={26} />
                    <span className='text-lg font-medium'>{LL.General.Blocked()}</span>
                </div>
            </MainContentHeaderLayout>
            <MainContentBodyLayout>
                <div className='my-3 flex items-center px-4'>
                    <Input
                        id='relationship-filter'
                        placeholder={LL.Inputs.Placeholders.FilterBlocks()}
                        onChange={(e) => setFilter(e.currentTarget.value)}
                        value={filter}
                    />
                </div>
                <ul className='px-4 space-y-1'>
                    {data?.map((r) => (
                        <RelationshipListItem
                            key={r.id}
                            relationship={r}
                            onDelete={() => deleteRelationship.mutate(r.id)}
                        />
                    ))}
                </ul>
            </MainContentBodyLayout>
        </>
    );
};
