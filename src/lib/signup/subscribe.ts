import { Effect } from "effect";
import { Contacts } from "./contacts";
import { decodeEmail } from "./email";

export type SubscribeResult = { status: "ok" } | { status: "invalid" } | { status: "error" };

export const subscribe = (input: unknown): Effect.Effect<SubscribeResult, never, Contacts> =>
  Effect.gen(function* () {
    const email = yield* decodeEmail(input);
    const contacts = yield* Contacts;
    yield* contacts.add(email);
    return { status: "ok" } as const;
  }).pipe(
    Effect.catchTags({
      InvalidEmail: () => Effect.succeed({ status: "invalid" } as const),
      ProviderError: (e) => Effect.logError("signup failed", e.cause).pipe(Effect.as({ status: "error" } as const)),
    }),
  );
