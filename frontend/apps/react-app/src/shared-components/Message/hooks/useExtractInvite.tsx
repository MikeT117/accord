export const useExtractInvite = (content?: string | null) => {
  const invite = content?.match(
    RegExp(/invite\/[\da-f]{8}-[\da-f]{4}-[0-5][\da-f]{3}-[089ab][\da-f]{3}-[\da-f]{12}/, 'gm'),
  );
  const inviteArr = invite ? invite[0].split('/') : invite;
  const inviteId = inviteArr ? inviteArr[inviteArr.length - 1] : inviteArr;
  return inviteId;
};
