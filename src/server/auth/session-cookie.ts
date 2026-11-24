export const SESSION_EXPIRES_IN_MS = 5 * 24 * 60 * 60 * 1000;

export function getSessionCookieOptions(
  rememberMe: boolean,
  isProduction: boolean
) {
  const options = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
  };

  return rememberMe
    ? { ...options, maxAge: SESSION_EXPIRES_IN_MS / 1000 }
    : options;
}
