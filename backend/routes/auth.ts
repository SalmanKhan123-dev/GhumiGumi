import { Router, Request, Response } from 'express';
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';

import {
  signUpWithEmail,
  signInWithEmailOrUsername,
  signOutUser,
  isLoggedIn,
} from '../controllers/auth-controller.js';

import { authMiddleware } from '../middlewares/auth-middleware.js';

const router = Router();

/* =========================================================
   EMAIL / PASSWORD AUTHENTICATION
========================================================= */

router.post('/email-password/signup', signUpWithEmail);

router.post('/email-password/signin', signInWithEmailOrUsername);


/* =========================================================
   GOOGLE OAUTH
========================================================= */

// Step 1: Send user to Google
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);


// Step 2: Google redirects here
router.get(
  '/google/callback',

  passport.authenticate('google', {
    failureRedirect: '/',
    session: false,
  }),

  (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/signin?error=google-auth-failed`
        );
      }

      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined');

        return res.redirect(
          `${process.env.FRONTEND_URL}/signin?error=server-config`
        );
      }

      // Create JWT
      const token = jwt.sign(
        {
          id: req.user._id,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '1h',
        }
      );

      // Store JWT in HTTP-only cookie
      res.cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 60 * 60 * 1000,
      });

      // Redirect to frontend
      return res.redirect(
        `${process.env.FRONTEND_URL}/signup?google-callback=true`
      );

    } catch (error) {
      console.error('Google callback error:', error);

      return res.redirect(
        `${process.env.FRONTEND_URL}/signin?error=google-auth-failed`
      );
    }
  }
);


/* =========================================================
   CHECK AUTHENTICATION
========================================================= */

router.get('/check', authMiddleware, (req, res) => {
  const token = req.cookies.access_token;

  res.json({
    success: true,

    token,

    user: {
      _id: req.user._id,
      role: req.user.role,
    },
  });
});


/* =========================================================
   SIGN OUT
========================================================= */

router.post(
  '/signout',
  authMiddleware,
  signOutUser
);


/* =========================================================
   CHECK USER STATUS
========================================================= */

router.get(
  '/check/:_id',
  authMiddleware,
  isLoggedIn
);


export default router;