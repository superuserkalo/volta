"use client";

import { animate, onScroll, stagger, utils } from "animejs";
import { useEffect } from "react";
import { BEATS } from "./beats";
import { positionFromScroll, scrollFromPosition } from "./position";
import { sceneStateAt } from "./scene-state";
import { story } from "./store";

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Keeps `story` in sync with the scroll position and plays the text reveals. Mount once. */
export function useStoryScroll() {
  useEffect(() => {
    const sections = BEATS.map((b) => document.getElementById(b.id)).filter((s): s is HTMLElement => !!s);
    let tops: number[] = [];
    let heights: number[] = [];

    let measuredFor = "";
    const layoutKey = () => `${window.innerWidth}x${window.innerHeight}:${document.documentElement.scrollHeight}`;
    const measure = () => {
      tops = sections.map((s) => s.getBoundingClientRect().top + window.scrollY);
      heights = sections.map((s) => s.offsetHeight);
      measuredFor = layoutKey();
    };

    // When the layout changes (rotation, resize, late fonts) keep the story
    // where it was instead of keeping the raw pixel offset.
    const relayout = () => {
      const p = story.get();
      measure();
      const y = scrollFromPosition(p, tops, heights);
      if (Math.abs(y - window.scrollY) > 1) window.scrollTo(0, y);
    };

    const update = () => {
      if (layoutKey() !== measuredFor) relayout();
      const p = positionFromScroll(window.scrollY, tops, heights);
      story.set(p);
      // Header and other fixed chrome follow the paper/dark background.
      document.documentElement.dataset.tone = sceneStateAt(p, "landscape").paper > 0.5 ? "light" : "dark";
    };

    measure();
    update();
    const ro = new ResizeObserver(update);
    ro.observe(document.body);
    window.addEventListener("scroll", update, { passive: true });


    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __volta: unknown }).__volta = { story };
    }

    // Text reveals: each section's copy rises in once per direction.
    const observers = prefersReducedMotion()
      ? []
      : sections.map((section) => {
          const items = section.querySelectorAll<HTMLElement>("[data-reveal]");
          const inView = section.getBoundingClientRect().top < window.innerHeight * 0.8;
          if (!inView) utils.set(items, { opacity: 0, translateY: 18 });
          const show = () =>
            animate(items, { opacity: 1, translateY: 0, duration: 700, delay: stagger(70), ease: "out(3)" });
          const hide = () => animate(items, { opacity: 0, translateY: 18, duration: 300, ease: "in(2)" });
          return onScroll({
            target: section,
            enter: "bottom-=20% top",
            leave: "top bottom",
            repeat: true,
            onEnterForward: show,
            onEnterBackward: show,
            onLeaveBackward: hide,
          });
        });

    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", update);
      observers.forEach((o) => o.revert());
    };
  }, []);
}
