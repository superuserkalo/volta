"use server";

import { Effect } from "effect";
import { ContactsDryRun, ContactsResend } from "@/lib/signup/contacts";
import { subscribe, type SubscribeResult } from "@/lib/signup/subscribe";

// Dry run only when asked for, or in development without a key. Production
// without a key fails loudly instead of pretending to store the email.
const useDryRun =
  process.env.SIGNUP_DRY_RUN === "1" ||
  (process.env.NODE_ENV !== "production" && !process.env.RESEND_API_KEY);

export async function subscribeAction(_prev: SubscribeResult | null, form: FormData): Promise<SubscribeResult> {
  const layer = useDryRun ? ContactsDryRun : ContactsResend;
  return Effect.runPromise(subscribe(form.get("email")).pipe(Effect.provide(layer)));
}
