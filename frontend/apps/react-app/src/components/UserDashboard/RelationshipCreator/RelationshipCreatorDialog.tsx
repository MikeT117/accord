import { Dialog } from '../../../shared-components/Dialog';
import { RelationshipCreatorContent } from './RelationshipCreatorContent';
import {
    useRelationshipCreatorStore,
    relationshipCreatorStore,
} from './useRelationshipCreatorstore';

export const RelationshipCreatorDialog = () => {
    const isOpen = useRelationshipCreatorStore((s) => s.isOpen);
    return (
        <Dialog
            isOpen={isOpen}
            onClose={relationshipCreatorStore.open}
            className='flex-col space-y-3'
        >
            <RelationshipCreatorContent />
        </Dialog>
    );
};
