import { createSigner, createVerifier } from 'fast-jwt';
import { REFRESH_TOKEN_SECRET } from '../../constants';

import { AuthRepository } from './authRepository';

export const verifyAccordRefreshToken = createVerifier({
  key: REFRESH_TOKEN_SECRET,
  allowedIss: process.env.HOST,
  maxAge: 604800000,
});

export const createAccordRefreshtoken = createSigner({
  key: REFRESH_TOKEN_SECRET,
  iss: process.env.HOST,
  expiresIn: 604800000,
});

export const verifyToken = async ({ refreshToken }: { refreshToken: string }) => {
  try {
    await verifyAccordRefreshToken(refreshToken);

    const sessionAndUser = await AuthRepository.getSessionAndUser(refreshToken);

    if (!sessionAndUser) {
      return;
    }
    return sessionAndUser.user.id;
  } catch (e) {
    return;
  }
};
