import { ACCESS_COOKIE_MAXAGE, NODE_ENV } from '../config/utils.js';
const defaultMaxAge = 3600000;
interface CookieObject {
  httpOnly: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  secure: boolean;
  maxAge: number;
}
const maxAge =
  typeof ACCESS_COOKIE_MAXAGE === 'string' ? parseInt(ACCESS_COOKIE_MAXAGE, 10) : defaultMaxAge;

const validMaxAge = isNaN(maxAge) ? defaultMaxAge : maxAge;

const isDev = NODE_ENV?.toLowerCase() === 'development';

export const cookieOptions: CookieObject = {
  httpOnly: true,
  sameSite: isDev ? 'lax' : 'none',
  secure: isDev ? false : true,
  maxAge: validMaxAge,
};
