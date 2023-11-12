export const useExtractInvite = (content?: string | null) => {
  const invite = content?.match(
    RegExp(
      /\/api\/v[0-9]\/invites\/([a-f]|[0-9]){8}-([a-f]|[0-9]){4}-([a-f]|[0-9]){4}-([a-f]|[0-9]){4}-([a-f]|[0-9]){12}$/,
      'gm',
    ),
  );
  const inviteArr = invite ? invite[0].split('/') : invite;
  const inviteId = inviteArr ? inviteArr[inviteArr.length - 1] : inviteArr;
  return inviteId;
};
