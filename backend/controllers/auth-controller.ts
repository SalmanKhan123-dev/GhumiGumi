import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import {
  HTTP_STATUS,
  RESPONSE_MESSAGES,
} from '../utils/constants.js';
import { cookieOptions } from '../utils/cookie_options.js';
import { JWT_SECRET } from '../config/utils.js';
import { ApiError } from '../utils/api-error.js';
import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';
import { NextFunction, Request, Response } from 'express';


// ==========================================
// SIGN UP WITH EMAIL / PASSWORD
// ==========================================

export const signUpWithEmail = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      userName,
      fullName,
      email,
      password,
    } = req.body;

    if (
      !userName ||
      !fullName ||
      !email ||
      !password
    ) {
      throw new ApiError({
        status: HTTP_STATUS.BAD_REQUEST,
        message:
          RESPONSE_MESSAGES.COMMON.REQUIRED_FIELDS,
      });
    }

    const existingUser = await User.findOne({
      $or: [
        { userName },
        { email },
      ],
    });

    if (existingUser) {
      if (
        existingUser.userName === userName
      ) {
        throw new ApiError({
          status: HTTP_STATUS.BAD_REQUEST,
          message:
            RESPONSE_MESSAGES.USERS
              .USER_USERNAME_EXISTS,
        });
      }

      if (
        existingUser.email === email
      ) {
        throw new ApiError({
          status: HTTP_STATUS.BAD_REQUEST,
          message:
            RESPONSE_MESSAGES.USERS
              .USER_EMAIL_EXISTS,
        });
      }
    }

    const user = new User({
      userName,
      fullName,
      email,
      password,
    });

    try {
      await user.validate();
    } catch (error: any) {
      const validationErrors: string[] = [];

      if (error?.errors) {
        for (const key in error.errors) {
          validationErrors.push(
            error.errors[key].message as string,
          );
        }
      }

      throw new ApiError({
        status: HTTP_STATUS.BAD_REQUEST,
        errors: validationErrors,
      });
    }

    const accessToken =
      await user.generateAccessToken();

    const refreshToken =
      await user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save();

    user.password = undefined;

    return res
      .status(HTTP_STATUS.OK)
      .cookie(
        'access_token',
        accessToken,
        cookieOptions,
      )
      .cookie(
        'refresh_token',
        refreshToken,
        cookieOptions,
      )
      .json(
        new ApiResponse(
          HTTP_STATUS.OK,
          {
            accessToken,
            refreshToken,
            user,
          },
          RESPONSE_MESSAGES.USERS.SIGNED_UP,
        ),
      );
  },
);


// ==========================================
// SIGN IN WITH EMAIL / USERNAME
// ==========================================

export const signInWithEmailOrUsername =
  asyncHandler(
    async (
      req: Request,
      res: Response,
    ) => {
      const {
        userNameOrEmail,
        password,
      } = req.body;

      if (
        !userNameOrEmail ||
        !password
      ) {
        throw new ApiError({
          status: HTTP_STATUS.BAD_REQUEST,
          message:
            RESPONSE_MESSAGES.COMMON
              .REQUIRED_FIELDS,
        });
      }

      const user =
        await User.findOne({
          $or: [
            {
              email: userNameOrEmail,
            },
            {
              userName: userNameOrEmail,
            },
          ],
        }).select('+password');

      if (!user) {
        throw new ApiError({
          status: HTTP_STATUS.BAD_REQUEST,
          message:
            RESPONSE_MESSAGES.USERS
              .USER_NOT_EXISTS,
        });
      }

      const isCorrectPassword =
        await user.isPasswordCorrect(
          password,
        );

      if (!isCorrectPassword) {
        throw new ApiError({
          status: HTTP_STATUS.UNAUTHORIZED,
          message:
            RESPONSE_MESSAGES.USERS
              .INVALID_PASSWORD,
        });
      }

      const accessToken =
        await user.generateAccessToken();

      const refreshToken =
        await user.generateRefreshToken();

      user.refreshToken = refreshToken;

      await user.save();

      user.password = undefined;

      return res
        .status(HTTP_STATUS.OK)
        .cookie(
          'access_token',
          accessToken,
          cookieOptions,
        )
        .cookie(
          'refresh_token',
          refreshToken,
          cookieOptions,
        )
        .json(
          new ApiResponse(
            HTTP_STATUS.OK,
            {
              accessToken,
              refreshToken,
              user,
            },
            RESPONSE_MESSAGES.USERS
              .SIGNED_IN,
          ),
        );
    },
  );


// ==========================================
// SIGN OUT
// ==========================================

export const signOutUser =
  asyncHandler(
    async (
      req: Request,
      res: Response,
      next: NextFunction,
    ) => {
      try {
        if (req.user?._id) {
          await User.findByIdAndUpdate(
            req.user._id,
            {
              $set: {
                refreshToken: '',
              },
            },
            {
              new: true,
            },
          );
        }

        return res
          .status(HTTP_STATUS.OK)
          .clearCookie(
            'access_token',
            cookieOptions,
          )
          .clearCookie(
            'refresh_token',
            cookieOptions,
          )
          .clearCookie(
            'jwt',
            cookieOptions,
          )
          .json(
            new ApiResponse(
              HTTP_STATUS.OK,
              '',
              RESPONSE_MESSAGES.USERS
                .SIGNED_OUT,
            ),
          );
      } catch (error) {
        return next(
          new ApiError({
            status:
              HTTP_STATUS
                .INTERNAL_SERVER_ERROR,
            message: 'Logout failed',
          }),
        );
      }
    },
  );


// ==========================================
// CHECK USER LOGIN / REFRESH TOKEN
// ==========================================

export const isLoggedIn =
  asyncHandler(
    async (
      req: Request,
      res: Response,
    ) => {
      const accessToken =
        req.cookies?.access_token;

      const refreshToken =
        req.cookies?.refresh_token;

      const { _id } = req.params;

      if (!_id) {
        return res
          .status(
            HTTP_STATUS.BAD_REQUEST,
          )
          .json(
            new ApiResponse(
              HTTP_STATUS.BAD_REQUEST,
              '',
              'User ID is required',
            ),
          );
      }

      // ==================================
      // CHECK ACCESS TOKEN
      // ==================================

      if (accessToken) {
        try {
          jwt.verify(
            accessToken,
            JWT_SECRET as string,
          );

          const user =
            await User.findById(_id);

          if (!user) {
            return res
              .status(
                HTTP_STATUS.NOT_FOUND,
              )
              .json(
                new ApiResponse(
                  HTTP_STATUS.NOT_FOUND,
                  '',
                  RESPONSE_MESSAGES.USERS
                    .USER_NOT_EXISTS,
                ),
              );
          }

          return res
            .status(HTTP_STATUS.OK)
            .json(
              new ApiResponse(
                HTTP_STATUS.OK,
                {
                  accessToken,
                  user: {
                    _id: user._id,
                    userName:
                      user.userName,
                    fullName:
                      user.fullName,
                    email: user.email,
                    role: user.role,
                  },
                },
                RESPONSE_MESSAGES.USERS
                  .VALID_TOKEN,
              ),
            );
        } catch (error: any) {
          console.log(
            'Access token verification error:',
            error?.message,
          );
        }
      }

      // ==================================
      // CHECK REFRESH TOKEN
      // ==================================

      if (refreshToken) {
        try {
          jwt.verify(
            refreshToken,
            JWT_SECRET as string,
          );

          const user =
            await User.findById(_id);

          if (!user) {
            return res
              .status(
                HTTP_STATUS.NOT_FOUND,
              )
              .json(
                new ApiResponse(
                  HTTP_STATUS.NOT_FOUND,
                  '',
                  RESPONSE_MESSAGES.USERS
                    .USER_NOT_EXISTS,
                ),
              );
          }

          if (
            !user.refreshToken ||
            user.refreshToken !==
              refreshToken
          ) {
            throw new Error(
              'Refresh token is invalid',
            );
          }

          const newAccessToken =
            await user.generateAccessToken();

          return res
            .status(HTTP_STATUS.OK)
            .cookie(
              'access_token',
              newAccessToken,
              cookieOptions,
            )
            .json(
              new ApiResponse(
                HTTP_STATUS.OK,
                {
                  accessToken:
                    newAccessToken,
                  user: {
                    _id: user._id,
                    userName:
                      user.userName,
                    fullName:
                      user.fullName,
                    email: user.email,
                    role: user.role,
                  },
                },
                RESPONSE_MESSAGES.USERS
                  .VALID_TOKEN,
              ),
            );
        } catch (error: any) {
          console.log(
            'Refresh token verification error:',
            error?.message,
          );
        }
      }

      // ==================================
      // CHECK DATABASE REFRESH TOKEN
      // ==================================

      const user =
        await User.findById(_id);

      if (!user) {
        return res
          .status(
            HTTP_STATUS.NOT_FOUND,
          )
          .json(
            new ApiResponse(
              HTTP_STATUS.NOT_FOUND,
              '',
              RESPONSE_MESSAGES.USERS
                .USER_NOT_EXISTS,
            ),
          );
      }

      if (!user.refreshToken) {
        return res
          .status(
            HTTP_STATUS.UNAUTHORIZED,
          )
          .json(
            new ApiResponse(
              HTTP_STATUS.UNAUTHORIZED,
              '',
              RESPONSE_MESSAGES.USERS
                .INVALID_TOKEN,
            ),
          );
      }

      try {
        jwt.verify(
          user.refreshToken,
          JWT_SECRET as string,
        );

        const newAccessToken =
          await user.generateAccessToken();

        const newRefreshToken =
          await user.generateRefreshToken();

        user.refreshToken =
          newRefreshToken;

        await user.save();

        return res
          .status(HTTP_STATUS.OK)
          .cookie(
            'access_token',
            newAccessToken,
            cookieOptions,
          )
          .cookie(
            'refresh_token',
            newRefreshToken,
            cookieOptions,
          )
          .json(
            new ApiResponse(
              HTTP_STATUS.OK,
              {
                accessToken:
                  newAccessToken,
                user: {
                  _id: user._id,
                  userName:
                    user.userName,
                  fullName:
                    user.fullName,
                  email: user.email,
                  role: user.role,
                },
              },
              RESPONSE_MESSAGES.USERS
                .VALID_TOKEN,
            ),
          );
      } catch (error: any) {
        console.log(
          'Database refresh token verification error:',
          error?.message,
        );

        return res
          .status(
            HTTP_STATUS.UNAUTHORIZED,
          )
          .json(
            new ApiResponse(
              HTTP_STATUS.UNAUTHORIZED,
              '',
              RESPONSE_MESSAGES.USERS
                .INVALID_TOKEN,
            ),
          );
      }
    },
  );