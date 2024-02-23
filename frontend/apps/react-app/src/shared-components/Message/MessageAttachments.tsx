import { env } from '../../env';
import { Image } from '../Image';

export const MessageAttachments = ({ attachmentIds }: { attachmentIds: string[] }) => {
    return (
        <div className='mt-2 flex flex-wrap space-x-2'>
            {attachmentIds.map((id) => (
                <Image key={id} src={`${env.cloudinaryResUrl}${id}`} />
            ))}
        </div>
    );
};
