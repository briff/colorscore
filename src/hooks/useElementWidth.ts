/**
 * ULWILA Color Score Editor - useElementWidth hook
 *
 * Tracks the inner (content-box) width of a DOM element and keeps it in sync
 * as the element resizes. Used to make the SVG score renderers responsive so
 * the notation fits the available width on phones, tablets, and desktops.
 *
 * Falls back gracefully in environments without ResizeObserver (e.g. jsdom in
 * tests), where the returned width stays at the provided fallback value.
 */

import { useEffect, useState, type RefObject } from "react";

/**
 * Measure the content-box width of `ref` (clientWidth minus horizontal padding).
 * Returns `fallback` until a real measurement is available.
 */
export function useElementWidth(
  ref: RefObject<HTMLElement>,
  fallback: number
): number {
  const [width, setWidth] = useState(fallback);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const style = window.getComputedStyle(el);
      const paddingX =
        (parseFloat(style.paddingLeft) || 0) +
        (parseFloat(style.paddingRight) || 0);
      const inner = el.clientWidth - paddingX;
      if (inner > 0) {
        setWidth(inner);
      }
    };

    measure();

    if (typeof ResizeObserver === "undefined") {
      // Fallback: re-measure on window resize.
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return width;
}
