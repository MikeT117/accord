import { Avatar } from '@/shared-components/Avatar';
import { IconButton } from '@/shared-components/IconButton';
import { ListItem } from '@/shared-components/ListItem';
import { UserRelationship } from '../../../types';
import { ChatTeardropText, Check, X } from '@phosphor-icons/react';
import { useI18nContext } from '../../../i18n/i18n-react';

export const RelationshipListItem = ({
    relationship,
    isOutgoing,
    onDelete,
    onChat,
    onAccept,
}: {
    relationship: UserRelationship;
    isOutgoing?: boolean;
    onChat?: () => void;
    onDelete?: () => void;
    onAccept?: () => void;
}) => {
    const { LL } = useI18nContext();

    return (
        <ListItem padding='lg' intent='secondary' isHoverable={false}>
            <div className='mr-auto flex items-center space-x-2'>
                <Avatar size='md' src={relationship.user.avatar} />
                <div className='flex flex-col space-y-0.5'>
                    <span className='text-sm font-semibold text-gray-12'>
                        {relationship.user.displayName}
                    </span>
                    {relationship.status === 1 && (
                        <span className='text-xs font-medium text-gray-11'>
                            {isOutgoing
                                ? LL.General.OutgoingRequest()
                                : LL.General.IncomingRequest()}
                        </span>
                    )}
                </div>
            </div>
            <div className='flex items-center space-x-2'>
                {relationship.status === 0 && (
                    <>
                        <IconButton
                            onClick={onChat}
                            intent='secondary'
                            tooltipText={LL.Tooltips.MessageUser({
                                displayName: relationship.user.displayName,
                            })}
                            tooltipPosition='top'
                        >
                            <ChatTeardropText size={20} />
                        </IconButton>
                        <IconButton
                            onClick={onDelete}
                            intent='danger'
                            tooltipText={LL.Tooltips.UnfriendUser({
                                displayName: relationship.user.displayName,
                            })}
                            tooltipPosition='top'
                        >
                            <X size={20} />
                        </IconButton>
                    </>
                )}
                {relationship.status === 2 && (
                    <IconButton
                        onClick={onDelete}
                        intent='danger'
                        tooltipText={LL.Tooltips.UnblockUser({
                            displayName: relationship.user.displayName,
                        })}
                        tooltipPosition='top'
                    >
                        <X size={20} />
                    </IconButton>
                )}
                {relationship.status === 1 && !isOutgoing && (
                    <>
                        <IconButton
                            onClick={onAccept}
                            intent='success'
                            tooltipText={LL.Tooltips.AcceptUserRequest({
                                displayName: relationship.user.displayName,
                            })}
                            tooltipPosition='top'
                        >
                            <Check size={20} />
                        </IconButton>

                        <IconButton
                            onClick={onDelete}
                            intent='danger'
                            tooltipText={LL.Tooltips.DeclineUserRequest({
                                displayName: relationship.user.displayName,
                            })}
                            tooltipPosition='top'
                        >
                            <X size={20} />
                        </IconButton>
                    </>
                )}
                {relationship.status === 1 && isOutgoing && (
                    <IconButton
                        onClick={onDelete}
                        intent='danger'
                        tooltipText={LL.Tooltips.CancelUserRequest({
                            displayName: relationship.user.displayName,
                        })}
                        tooltipPosition='top'
                    >
                        <X size={20} />
                    </IconButton>
                )}
            </div>
        </ListItem>
    );
};
