import type { UserAccount } from '@accord/common';
import { ListItem } from '@/shared-components/ListItem';
import { Avatar } from '@/shared-components/Avatar';
import { useLoggedInUserId } from '../../../shared-stores/loggedInUserStore';

export const PrivateChannelListItem = ({
  type,
  members,
  isActive,
  onClick,
}: {
  type: 2 | 3;
  members: Pick<UserAccount, 'id' | 'displayName' | 'avatar'>[];
  isActive: boolean;
  onClick: () => void;
}) => {
  const userId = useLoggedInUserId();
  const recipients = members.filter((m) => m.id !== userId);
  return (
    <ListItem isActive={isActive} onClick={onClick} intent='secondary' baseBg={false} isActionable>
      <div className='flex items-center space-x-3'>
        {type === 2 ? (
          <>
            <Avatar src={recipients[0].avatar} fallback={recipients[0]?.displayName} />
            <span className='ml-1 text-sm'>{recipients[0]?.displayName}</span>
          </>
        ) : (
          <>
            <div className='flex space-x-1'>
              {recipients.map((m) => (
                <Avatar key={m.id} src={m.avatar} fallback={m.displayName} />
              ))}
            </div>
            <span className='ml-1 text-gray-11'>Group Channel</span>
          </>
        )}
      </div>
    </ListItem>
  );
};
