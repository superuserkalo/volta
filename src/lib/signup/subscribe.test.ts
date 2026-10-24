import { Effect, Layer } from "effect";
import { describe, expect, it } from "vitest";
import { Contacts, ProviderError, isAlreadyExists } from "./contacts";
import { subscribe } from "./subscribe";

function recorder(fail = false) {
  const calls: string[] = [];
  const layer = Layer.succeed(Contacts, {
    add: (email: string) =>
      fail
        ? Effect.fail(new ProviderError({ cause: "boom" }))
        : Effect.sync(() => {
            calls.push(email);
          }),
  });
  return { calls, layer };
}

const run = (input: unknown, layer: Layer.Layer<Contacts>) =>
  Effect.runPromise(subscribe(input).pipe(Effect.provide(layer)));

describe("subscribe", () => {
  it("trims and accepts a valid email, keeping its case", async () => {
    const r = recorder();
    expect(await run("  Ana@Example.com  ", r.layer)).toEqual({ status: "ok" });
    expect(r.calls).toEqual(["Ana@Example.com"]);
  });

  it.each(["nope", "", "a@b", 42, null, "two words@x.com"])("rejects %j without calling the provider", async (input) => {
    const r = recorder();
    expect(await run(input, r.layer)).toEqual({ status: "invalid" });
    expect(r.calls).toEqual([]);
  });

  it("rejects addresses longer than 254 characters", async () => {
    const r = recorder();
    expect(await run(`${"a".repeat(250)}@x.com`, r.layer)).toEqual({ status: "invalid" });
  });

  it("maps provider failure to error", async () => {
    expect(await run("ana@example.com", recorder(true).layer)).toEqual({ status: "error" });
  });
});

describe("isAlreadyExists", () => {
  it("recognises Resend's duplicate-contact error", () => {
    expect(isAlreadyExists({ name: "validation_error", message: "Contact already exists" })).toBe(true);
    expect(isAlreadyExists({ name: "validation_error", message: "Invalid email" })).toBe(false);
    expect(isAlreadyExists({ name: "rate_limit_exceeded", message: "slow down" })).toBe(false);
  });
});
