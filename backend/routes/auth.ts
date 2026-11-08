import {
  Router,
  Request,
  Response,
} from 'express';

import {
  authMiddleware,
} from '../middlewares/auth-middleware.js';

import passport from '../config/passport.js';

import jwt from 'jsonwebtoken';

import {
  JWT_SECRET,
} from '../config/utils.js';

import {
  HTTP_STATUS,
} from '../utils/constants.js';

import {
  signUpWithEmail,
  signInWithEmailOrUsername,
  signOutUser,
  isLoggedIn,
} from '../controllers/auth-controller.js';

const router = Router();


// ================================
// EMAIL / PASSWORD
// ================================

router.post(
  '/email-password/signup',
  signUpWithEmail,
);

router.post(
  '/email-password/signin',
  signInWithEmailOrUsername,
);


// ================================
// GOOGLE LOGIN
// ================================

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  }),
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/',
    session: false,
  }),
  (req: Request, res: Response) => {
    try {
      const user = req.user as any;

      if (!user?._id) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/signup?error=auth`,
        );
      }

      const token = jwt.sign(
        {
          id: user._id.toString(),
        },
        JWT_SECRET as string,
        {
          expiresIn: '1h',
        },
      );

      const isProduction =
        process.env.NODE_ENV === 'production';

      res.cookie(
        'access_token',
        token,
        {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction
            ? 'none'
            : 'lax',
          maxAge:
            60 * 60 * 1000,
        },
      );

      return res.redirect(
        `${process.env.FRONTEND_URL}/signup?google-callback=true`,
      );
    } catch (error) {
      console.error(
        'Google authentication callback error:',
        error,
      );

      return res.redirect(
        `${process.env.FRONTEND_URL}/signup?error=auth`,
      );
    }
  },
);


// ================================
// CHECK LOGIN
// ================================

router.get(
  '/check',
  authMiddleware,
  (req: Request, res: Response) => {
    return res.status(
      HTTP_STATUS.OK,
    ).json({
      user: {
        _id: req.user?._id,
        role: req.user?.role,
      },
    });
  },
);


// ================================
// SIGN OUT
// ================================

router.post(
  '/signout',
  authMiddleware,
  signOutUser,
);


// ================================
// CHECK USER STATUS
// ================================

router.get(
  '/check/:_id',
  authMiddleware,
  isLoggedIn,
);


export default router;