import { ListItem } from '@/shared-components/ListItem';
import { Avatar } from '@/shared-components/Avatar';
import { useCurrentUserId } from '../../../shared-stores/currentUserStore';
import { UserLimited } from '../../../types';

export const PrivateChannelListItem = ({
  channelType,
  users,
  isActive,
  onClick,
}: {
  channelType: 2 | 3;
  users: UserLimited[];
  isActive: boolean;
  onClick: () => void;
}) => {
  console.log({ users });
  const userId = useCurrentUserId();
  const recipients = users.filter((m) => m.id !== userId);
  return (
    <ListItem isActive={isActive} onClick={onClick} intent='secondary' baseBg={false} isActionable>
      <div className='flex items-center space-x-3'>
        {channelType === 2 ? (
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
