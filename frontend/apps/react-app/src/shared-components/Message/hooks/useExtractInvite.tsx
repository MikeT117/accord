import { env } from '../../../env';

export const useExtractInvite = (content: string) => {
    const regexString = `https://${env.host}/api/v1/invites/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}`;

    const invite = content.match(RegExp(regexString, 'gm'));

    if (!invite) {
        return null;
    }

    const inviteStringArray = invite[0].split('/');
    return inviteStringArray[inviteStringArray.length - 1];
};
