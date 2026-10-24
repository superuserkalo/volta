"use client";

import { useActionState, useEffect, useRef } from "react";
import { subscribeAction } from "@/app/actions/subscribe";
import { copy } from "@/content/copy";
import { notices } from "@/content/allowed-edits";
import { cn } from "@/lib/utils";

type Props = { variant: "hero" | "cta" };

export function SignupForm({ variant }: Props) {
  const c = variant === "hero" ? copy.hero : copy.cta;
  const [state, action, pending] = useActionState(subscribeAction, null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.status === "invalid") input.current?.reportValidity();
  }, [state]);

  if (state?.status === "ok") {
    return (
      <p role="status" className="flex min-h-12 items-center gap-2 text-base text-text md:text-lg">
        <span className="size-2 rounded-full bg-ok-green" aria-hidden />
        {c.success}
      </p>
    );
  }

  return (
    <form action={action} className={cn("w-full", variant === "cta" && "mx-auto")} noValidate={false}>
      <div className={cn("flex flex-col gap-2.5 sm:flex-row sm:gap-3", variant === "cta" && "sm:justify-center")}>
        <label className="sr-only" htmlFor={`email-${variant}`}>
          Email
        </label>
        <input
          ref={input}
          id={`email-${variant}`}
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder={c.placeholder}
          aria-invalid={state?.status === "invalid" || undefined}
          className="h-12 w-full rounded-md border border-input bg-bg-raised px-4 text-base text-text placeholder:text-text-4 outline-none transition-colors focus:border-copper aria-invalid:border-destructive sm:max-w-[24rem] md:h-14"
        />
        <button
          type="submit"
          disabled={pending}
          className="meta h-12 shrink-0 rounded-md bg-copper px-7 text-sm text-bg transition-colors hover:bg-copper-light disabled:cursor-wait disabled:opacity-70 md:h-14 md:px-8"
        >
          {pending ? c.loading : c.cta}
        </button>
      </div>
      {state?.status === "error" && (
        <p aria-live="polite" className="mt-2 text-sm text-destructive">
          {notices.signupError}
        </p>
      )}
      <p className="mt-2.5 max-w-[40rem] font-mono text-[0.6rem] leading-relaxed text-text-4 md:text-[0.66rem]">
        {notices.signup}
      </p>
    </form>
  );
}
