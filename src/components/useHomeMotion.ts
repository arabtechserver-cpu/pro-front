"use client";

import { useEffect, useRef } from "react";

// One observer for the homepage. Scrolling only writes the progress transform
// once per animation frame; it never triggers a React render or scans services.
export default function useHomeMotion() {
  const rootRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    const scene = root.querySelector<HTMLElement>("[data-motion-scene]");
    let observer: IntersectionObserver | undefined;
    let frame = 0;

    const updateProgress = () => {
      frame = 0;
      const distance = document.documentElement.scrollHeight - window.innerHeight;
      const progress = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`;
    };
    const onScroll = () => { if (!frame && !media.matches) frame = requestAnimationFrame(updateProgress); };
    const enable = () => {
      observer?.disconnect();
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      items.forEach(item => item.setAttribute("data-entered", "true"));
      scene?.removeAttribute("data-in-view");
      if (media.matches || !("IntersectionObserver" in window)) return;
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.target === scene) {
            scene.setAttribute("data-in-view", String(entry.isIntersecting));
          } else if (entry.isIntersecting) {
            entry.target.setAttribute("data-entered", "true");
            observer?.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: "0px 0px -24px 0px" });
      items.forEach(item => {
        // Keep content above the viewport visible when restoring scroll/history.
        if (item.getBoundingClientRect().bottom > 0) {
          item.setAttribute("data-entered", "false");
          observer!.observe(item);
        }
      });
      if (scene) observer.observe(scene);
      updateProgress();
    };
    const revealFocused = (event: FocusEvent) => {
      const item = (event.target as HTMLElement).closest<HTMLElement>("[data-reveal]");
      if (item) { item.setAttribute("data-entered", "true"); observer?.unobserve(item); }
    };
    enable();
    media.addEventListener("change", enable);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    root.addEventListener("focusin", revealFocused);
    return () => {
      observer?.disconnect();
      if (frame) cancelAnimationFrame(frame);
      media.removeEventListener("change", enable);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      root.removeEventListener("focusin", revealFocused);
      items.forEach(item => item.removeAttribute("data-entered"));
      scene?.removeAttribute("data-in-view");
    };
  }, []);

  return { rootRef, progressRef };
}
