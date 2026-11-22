// Switches for features that depend on outside setup. Keep a feature OFF until
// it actually works end to end, so users never meet a button that fails.
export const FEATURES = {
  /** Phone OTP login. Needs an SMS provider configured in Supabase Auth. */
  phoneLogin: false,
  /** "Continue with Google". Needs the Google provider enabled in Supabase Auth. */
  googleLogin: false,
  /**
   * Loan applications. OFF until a licensed NBFC/bank partner is live (and the
   * app is on RBI's list of lending apps). The server enforces the same rule via
   * app_settings.lending_enabled — keep the two in step.
   */
  lending: false,
};

/**
 * Screens that are demos only (no licensed partner or real provider yet).
 * They show a "Coming soon" screen instead of simulated money features.
 * Turn one on only when its partner integration is live.
 */
export const LIVE_SERVICES = {
  upiQr: false,
  bnpl: false,
  gold: false,
  insurance: false,
  bills: false,
  groupSavings: false,
  rewards: false,
};
