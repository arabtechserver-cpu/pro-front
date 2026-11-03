"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const ROTATION_DELAY = 4500;

function scrollTarget(grid: HTMLDivElement, index: number) {
  const first = grid.children[0] as HTMLElement;
  const card = grid.children[index] as HTMLElement;
  const offset = card.offsetLeft - first.offsetLeft;
  const maximum = grid.scrollWidth - grid.clientWidth;
  return getComputedStyle(grid).direction === "rtl"
    ? Math.max(-maximum, Math.min(0, offset))
    : Math.min(maximum, Math.max(0, offset));
}

export default function useServiceCarousel(count: number) {
  const gridRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [mobile, setMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((index: number, behavior: ScrollBehavior = "smooth") => {
    const grid = gridRef.current;
    if (!grid) return;
    const next = (index + count) % count;
    activeRef.current = next;
    setActive(next);
    grid.scrollTo({ left: scrollTarget(grid, next), behavior: reducedMotion ? "instant" : behavior });
  }, [count, reducedMotion]);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const mobileMedia = window.matchMedia("(max-width: 760px)");
    const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMedia = () => {
      setMobile(mobileMedia.matches);
      setReducedMotion(motionMedia.matches);
    };
    const updateVisibility = () => setPageVisible(!document.hidden);
    const releasePointer = () => setDragging(false);
    let settleTimer: ReturnType<typeof setTimeout>;
    const updateActive = () => {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        let nearest = activeRef.current;
        for (let index = 0; index < count; index++) {
          if (Math.abs(grid.scrollLeft - scrollTarget(grid, index)) < Math.abs(grid.scrollLeft - scrollTarget(grid, nearest))) nearest = index;
        }
        activeRef.current = nearest;
        setActive(nearest);
      }, 140);
    };
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting && entry.intersectionRatio >= 0.35);
    }, { threshold: [0, 0.35] });
    observer.observe(grid);
    updateMedia();
    updateVisibility();
    mobileMedia.addEventListener("change", updateMedia);
    motionMedia.addEventListener("change", updateMedia);
    document.addEventListener("visibilitychange", updateVisibility);
    window.addEventListener("pointerup", releasePointer);
    window.addEventListener("pointercancel", releasePointer);
    grid.addEventListener("scroll", updateActive, { passive: true });
    return () => {
      clearTimeout(settleTimer);
      observer.disconnect();
      mobileMedia.removeEventListener("change", updateMedia);
      motionMedia.removeEventListener("change", updateMedia);
      document.removeEventListener("visibilitychange", updateVisibility);
      window.removeEventListener("pointerup", releasePointer);
      window.removeEventListener("pointercancel", releasePointer);
      grid.removeEventListener("scroll", updateActive);
    };
  }, [count]);

  const rotating = mobile && visible && pageVisible && !reducedMotion && !paused && !hovered && !focused && !dragging;
  useEffect(() => {
    if (!rotating) return;
    const timer = setTimeout(() => goTo(activeRef.current + 1), ROTATION_DELAY);
    return () => clearTimeout(timer);
  }, [rotating, active, goTo]);

  return { gridRef, active, goTo, paused, reducedMotion, setHovered, setFocused, setDragging,
    togglePaused: () => { setPaused(value => !value); setFocused(false); } };
}
