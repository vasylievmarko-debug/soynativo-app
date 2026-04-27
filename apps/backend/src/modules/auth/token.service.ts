import jwt from 'jsonwebtoken';
import { injectable } from 'tsyringe';
import { env } from '@config/env';
import type { UserRole } from '@soynativo/shared';
import { UnauthorizedException } from '@shared/exceptions/http.exception';
import type { TokenPair } from './dto/auth.dto';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

@injectable()
export class TokenService {
  issuePair(user: AccessTokenPayload): TokenPair {
    const accessToken = jwt.sign(user, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_TTL,
    });
    const refreshToken = jwt.sign({ sub: user.sub }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_TTL,
    });
    return { accessToken, refreshToken };
  }

  verifyAccess(token: string): AccessTokenPayload {
    try {
      return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  verifyRefresh(token: string): { sub: string } {
    try {
      return jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
