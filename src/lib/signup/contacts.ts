import { Context, Data, Effect, Layer } from "effect";
import { Resend } from "resend";

export class ProviderError extends Data.TaggedError("ProviderError")<{ cause: unknown }> {}

export class Contacts extends Context.Service<
  Contacts,
  { readonly add: (email: string) => Effect.Effect<void, ProviderError> }
>()("Contacts") {}

/** Resend answers a second signup for the same address with a validation error; that is not a failure for the visitor. */
export const isAlreadyExists = (error: { name?: string; message?: string }) =>
  error.name === "validation_error" && /already exist/i.test(error.message ?? "");

export const ContactsResend = Layer.effect(
  Contacts,
  Effect.sync(() => {
    const apiKey = process.env.RESEND_API_KEY;
    const segmentId = process.env.RESEND_SEGMENT_ID;
    const resend = apiKey ? new Resend(apiKey) : null;
    return {
      add: (email: string) =>
        Effect.gen(function* () {
          if (!resend || !segmentId) {
            return yield* Effect.fail(new ProviderError({ cause: "RESEND_API_KEY or RESEND_SEGMENT_ID missing" }));
          }
          const { error } = yield* Effect.tryPromise({
            try: () => resend.contacts.create({ email, segments: [{ id: segmentId }] }),
            catch: (cause) => new ProviderError({ cause }),
          });
          if (error && !isAlreadyExists(error)) return yield* Effect.fail(new ProviderError({ cause: error }));
        }),
    };
  }),
);

export const ContactsDryRun = Layer.succeed(Contacts, {
  add: (email: string) => Effect.log(`[signup dry run] ${email}`),
});
