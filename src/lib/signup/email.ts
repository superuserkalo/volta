import { Data, Effect, Schema } from "effect";

export class InvalidEmail extends Data.TaggedError("InvalidEmail") {}

/** Trimmed, case preserved, at most 254 characters, a plain `local@domain.tld` shape. */
export const EmailSchema = Schema.Trim.pipe(
  Schema.check(Schema.isPattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/), Schema.isMaxLength(254)),
);

export const decodeEmail = (input: unknown): Effect.Effect<string, InvalidEmail> =>
  Schema.decodeUnknownEffect(EmailSchema)(input).pipe(Effect.mapError(() => new InvalidEmail()));
