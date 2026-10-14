/**
 * Does a buyer whose card was refused hear how to fix it?
 *
 * Run with:  pnpm vitest run app/api/webhooks/dodo/__tests__
 *
 * A failed checkout used to fall through to the default branch, and a guest's
 * never even got that far — no account to find. The buyer saw "declined" on
 * Dodo's page and nothing else. Most of these are a bank blocking a foreign
 * charge (Nepal, 2026-10-13), which only the buyer can fix, so they get one
 * mail saying how — and a failed *renewal*, which Dodo retries itself, gets
 * none, because "try again" there would sell a second subscription.
 */

import { createHmac, randomBytes } from "node:crypto";
import { beforeEach, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const h = vi.hoisted(() => ({
  sent: [] as Array<{ to: string; code: string | null; url: string }>,
}));

vi.mock("@/lib/analytics-server", () => ({ captureServer: async () => {} }));
vi.mock("@/lib/server/db", () => ({ isDbConfigured: true }));
vi.mock("@/lib/server/entitlements", () => ({
  activatePlan: async () => {},
  billingFor: async () => null,
  userIdForEmail: async () => null,
}));
vi.mock("@/lib/server/email", () => ({
  sendEmail: async () => true,
  proReadyEmail: () => ({}),
  paymentFailedEmail: (to: string, code: string | null, url: string) => {
    h.sent.push({ to, code, url });
    return {};
  },
}));

import { POST } from "@/app/api/webhooks/dodo/route";

const SECRET = `whsec_${randomBytes(32).toString("base64")}`;

function signed(body: unknown): Request {
  const raw = JSON.stringify(body);
  const ts = Math.floor(Date.now() / 1000);
  const key = Buffer.from(SECRET.replace(/^whsec_/, ""), "base64");
  const sig = createHmac("sha256", key)
    .update(`msg_1.${ts}.${raw}`)
    .digest("base64");
  return new Request("https://snapcn.dev/api/webhooks/dodo", {
    method: "POST",
    headers: {
      "webhook-id": "msg_1",
      "webhook-timestamp": String(ts),
      "webhook-signature": `v1,${sig}`,
    },
    body: raw,
  });
}

const failed = (data: Record<string, unknown> = {}) => ({
  type: "payment.failed",
  data: {
    metadata: { product: "lifetime" },
    customer: { email: "buyer@example.com" },
    checkout_session_id: "cks_1",
    payment_link: "https://checkout.dodopayments.com/abc",
    error_code: "TRANSACTION_NOT_ALLOWED",
    ...data,
  },
});

beforeEach(() => {
  h.sent.length = 0;
  process.env.DODO_WEBHOOK_SECRET = SECRET;
});

it("mails a guest the reason and the link back into the same checkout", async () => {
  const res = await POST(signed(failed()));
  expect(res.status).toBe(200);
  expect(h.sent).toEqual([
    {
      to: "buyer@example.com",
      code: "TRANSACTION_NOT_ALLOWED",
      url: "https://checkout.dodopayments.com/abc",
    },
  ]);
});

it("mails a signed-in buyer too", async () => {
  await POST(
    signed(failed({ metadata: { product: "lifetime", user_id: "user_1" } })),
  );
  expect(h.sent).toHaveLength(1);
});

it("stays silent on a failed renewal — no checkout behind it", async () => {
  await POST(
    signed(failed({ checkout_session_id: undefined, payment_link: undefined })),
  );
  expect(h.sent).toHaveLength(0);
});

it("stays silent for the other brand on the same Dodo account", async () => {
  await POST(
    signed(failed({ metadata: { type: "template_purchase_public" } })),
  );
  expect(h.sent).toHaveLength(0);
});
