import { JWT_SECRET } from '../config/utils.js';
import { ApiError } from '../utils/api-error.js';
import {
  HTTP_STATUS,
  RESPONSE_MESSAGES,
} from '../utils/constants.js';
import jwt from 'jsonwebtoken';
import { Role } from '../types/role-type.js';
import User from '../models/user.js';

import {
  Request,
  Response,
  NextFunction,
} from 'express';

interface JwtPayload {
  id: string;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies?.access_token;

    if (!token) {
      return next(
        new ApiError({
          status: HTTP_STATUS.UNAUTHORIZED,
          message:
            RESPONSE_MESSAGES.USERS.RE_LOGIN,
        }),
      );
    }

    const decoded = jwt.verify(
      token,
      JWT_SECRET as string,
    ) as JwtPayload;

    if (!decoded?.id) {
      return next(
        new ApiError({
          status: HTTP_STATUS.UNAUTHORIZED,
          message:
            RESPONSE_MESSAGES.USERS.INVALID_TOKEN,
        }),
      );
    }

    const foundUser = await User.findById(
      decoded.id,
    );

    if (!foundUser) {
      return next(
        new ApiError({
          status: HTTP_STATUS.UNAUTHORIZED,
          message:
            RESPONSE_MESSAGES.USERS.RE_LOGIN,
        }),
      );
    }

    req.user = foundUser;

    return next();
  } catch (error) {
    console.error(
      'Auth middleware error:',
      error,
    );

    return next(
      new ApiError({
        status: HTTP_STATUS.UNAUTHORIZED,
        message:
          RESPONSE_MESSAGES.USERS.INVALID_TOKEN,
      }),
    );
  }
};

export const isAdminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const role = req.user?.role;

  if (role !== Role.Admin) {
    return next(
      new ApiError({
        status: HTTP_STATUS.UNAUTHORIZED,
        message:
          RESPONSE_MESSAGES.USERS.UNAUTHORIZED_USER,
      }),
    );
  }

  return next();
};