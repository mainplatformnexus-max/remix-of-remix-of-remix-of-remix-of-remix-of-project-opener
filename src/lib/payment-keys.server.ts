/**
 * Payment keys kept in server-only code (owner's choice) so they survive remixes.
 * Fill the values below. An environment variable with the same name still wins if set.
 * Never import this file from browser code.
 */
const KEYS = {
  PAYPAL_CLIENT_SECRET: "",
  WHOP_API_KEY: "",
  WHOP_COMPANY_ID: "",
  PAWAPAY_API_TOKEN: "",
} as const;

export type PaymentKey = keyof typeof KEYS;

export function paymentKey(name: PaymentKey): string | undefined {
  return process.env[name] || KEYS[name] || undefined;
}
