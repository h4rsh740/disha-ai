export const ONBOARDING_DESTINATION = '/onboarding';
export const JOURNEY_SIGN_IN_URL = '/sign-in?redirect_url=%2Fonboarding';
export const JOURNEY_SIGN_UP_URL = '/sign-up?redirect_url=%2Fonboarding';

/** Unknown or signed-out auth state goes to sign-in first, never bypasses authentication. */
export function journeyEntryUrl(isSignedIn: boolean | undefined) {
  return isSignedIn === true ? ONBOARDING_DESTINATION : JOURNEY_SIGN_IN_URL;
}

/** Preserves the onboarding destination for user journeys after authentication. */
export function journeyAuthDestination(redirectUrl: unknown) {
  return redirectUrl === ONBOARDING_DESTINATION ? ONBOARDING_DESTINATION : undefined;
}
