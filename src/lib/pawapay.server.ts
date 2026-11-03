import { paymentKey } from "./payment-keys.server";

/** Server-only pawaPay (live, API v2) helper. The token never reaches the browser. */
const PAWAPAY_API = "https://api.pawapay.io";

/* eslint-disable @typescript-eslint/no-explicit-any */
async function call(method: "GET" | "POST", path: string, body?: unknown): Promise<any> {
  const token = paymentKey("PAWAPAY_API_TOKEN");
  if (!token) throw new Error("Mobile money is not configured yet.");
  const res = await fetch(`${PAWAPAY_API}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.failureReason?.failureMessage ?? `Mobile money error ${res.status}`);
  return json;
}

/** Asks pawaPay which network a phone number belongs to. */
export async function predictProvider(phone: string): Promise<{ provider: string; phoneNumber: string }> {
  const r = await call("POST", "/v2/predict-provider", { phoneNumber: phone.replace(/\D/g, "") });
  if (!r?.provider) throw new Error("We couldn't recognise that mobile money number.");
  return { provider: r.provider, phoneNumber: r.phoneNumber };
}

/** pawaPay customer messages must be 4–22 letters, digits or spaces. */
export function customerMessage(text: string) {
  const clean = text.replace(/[^A-Za-z0-9 ]/g, " ").replace(/\s+/g, " ").trim().slice(0, 22);
  return clean.length >= 4 ? clean : "MOVIEMAX payment";
}

export async function startDeposit(input: { phone: string; amount: number; currency: string; reference: string; description?: string }) {
  const { provider, phoneNumber } = await predictProvider(input.phone);
  const depositId = crypto.randomUUID();
  const r = await call("POST", "/v2/deposits", {
    depositId,
    payer: { type: "MMO", accountDetails: { phoneNumber, provider } },
    amount: String(Math.round(Number(input.amount))),
    currency: input.currency.toUpperCase(),
    clientReferenceId: input.reference.slice(0, 64),
    customerMessage: customerMessage(input.description ?? "MOVIEMAX payment"),
  });
  if (r?.status === "REJECTED")
    return { internal_reference: null, status: "failed", message: r?.failureReason?.failureMessage ?? "Payment rejected" };
  return { internal_reference: depositId, status: "pending", provider, message: "Approve the prompt on your phone" };
}

/** Maps pawaPay's deposit state to the app's success / failed / pending. */
export function mapDepositStatus(r: any): { status: "success" | "failed" | "pending"; message: string } {
  if (r?.status === "NOT_FOUND") return { status: "pending", message: "Waiting for confirmation" };
  const s = String(r?.data?.status ?? "");
  if (s === "COMPLETED") return { status: "success", message: "Payment received" };
  if (s === "FAILED")
    return { status: "failed", message: r?.data?.failureReason?.failureMessage ?? "Payment failed" };
  return { status: "pending", message: "Waiting for confirmation" };
}

export async function depositStatus(depositId: string) {
  return mapDepositStatus(await call("GET", `/v2/deposits/${encodeURIComponent(depositId)}`));
}
