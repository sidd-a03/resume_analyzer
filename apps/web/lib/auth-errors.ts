type AuthError = { code?: string; status?: number; message?: string } | null | undefined

/**
 * better-auth error codes in plain words. Phone codes are worded so a reply never
 * tells the caller whether a number belongs to someone else.
 */
const messages: Record<string, string> = {
  // phone (PHONE_NUMBER_EXIST reads like a wrong code on purpose)
  INVALID_PHONE_NUMBER: "Enter a valid mobile number.",
  INVALID_OTP: "That code didn't work. Check it and try again.",
  PHONE_NUMBER_EXIST: "That code didn't work. Check it and try again.",
  OTP_NOT_FOUND: "That code has expired. Request a new one.",
  OTP_EXPIRED: "That code has expired. Request a new one.",
  TOO_MANY_ATTEMPTS: "Too many wrong tries. Request a new code.",
  OTP_QUOTA_EXCEEDED: "Too many codes requested. Try again in an hour.",
  SIGN_IN_REQUIRED: "Your session ended. Sign in again.",
  // captcha
  MISSING_RESPONSE: "Couldn't confirm you're human. Wait for the check to finish and retry.",
  VERIFICATION_FAILED: "Couldn't confirm you're human. Refresh the page and try again.",
  // account
  SESSION_EXPIRED: "For your safety, sign out and sign in again, then retry.",
  SESSION_NOT_FRESH: "For your safety, sign out and sign in again, then retry.",
  FAILED_TO_UNLINK_LAST_ACCOUNT: "You need at least one way to sign in. Connect another account first.",
  ACCOUNT_NOT_FOUND: "That account isn't connected anymore. Refresh the page.",
  SOCIAL_ACCOUNT_ALREADY_LINKED: "That account is already connected.",
  // admin
  YOU_CANNOT_BAN_YOURSELF: "You can't ban yourself.",
  YOU_CANNOT_REMOVE_YOURSELF: "You can't delete yourself.",
  YOU_CANNOT_IMPERSONATE_ADMINS: "You can't sign in as another admin.",
  BANNED_USER: "This account is banned.",
}

export function authErrorMessage(error: AuthError, fallback: string) {
  if (!error) return fallback
  if (error.code && messages[error.code]) return messages[error.code]
  if (error.code?.startsWith("YOU_ARE_NOT_ALLOWED")) return "Your role doesn't allow this."
  if (error.status === 429) return "Too many tries. Wait a minute and try again."
  return fallback
}
