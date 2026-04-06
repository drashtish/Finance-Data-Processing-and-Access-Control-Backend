import type { Role, UserStatus } from '../generated/prisma/enums';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: Role;
        status: UserStatus;
      };
    }
  }
}

export {};
