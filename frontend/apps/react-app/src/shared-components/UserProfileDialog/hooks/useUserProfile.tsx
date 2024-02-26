import { useParams } from 'react-router-dom';
import { useGetUserProfileQuery } from '../../../api/userProfiles/getUserProfile';

export const userUserProfile = (userId: string) => {
    const { guildId = '' } = useParams();
    const { data: profile } = useGetUserProfileQuery(userId, guildId);
    return { profile, guildId };
};
