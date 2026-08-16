import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

/**
 * ScrollManager — two behaviours:
 * 1. Scroll to top on every forward navigation (link click)
 * 2. Restore scroll position when the user presses Back/Forward
 *
 * Strategy:
 * - We use history.state to store the scroll Y for each history entry.
 * - On popstate (back/forward), we read the saved Y and restore it.
 * - On regular navigation (location change that is NOT a popstate), we scroll to top.
 */
export default function ScrollManager() {
  const [location] = useLocation();
  const isPop = useRef(false);
  const savedY = useRef<number | null>(null);

  // Listen for popstate (back/forward button) BEFORE wouter processes the route change
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      isPop.current = true;
      // The state may contain our saved scroll position
      savedY.current = e.state?.__scrollY ?? null;
    };

    // Save current scroll position into history state before navigating away
    const handleBeforeUnload = () => {
      const state = window.history.state ?? {};
      window.history.replaceState({ ...state, __scrollY: window.scrollY }, "");
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Also save scroll on every scroll event (debounced) so back works mid-page
    let saveTimer: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        const state = window.history.state ?? {};
        window.history.replaceState({ ...state, __scrollY: window.scrollY }, "");
      }, 150);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(saveTimer);
    };
  }, []);

  // React to route changes
  useEffect(() => {
    if (isPop.current) {
      // Back/forward — restore saved position
      isPop.current = false;
      const y = savedY.current;
      savedY.current = null;
      if (y !== null) {
        // Use requestAnimationFrame to wait for the new page to render
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.scrollTo({ top: y, behavior: "instant" });
          });
        });
      }
    } else {
      // Forward navigation — scroll to top
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [location]);

  return null;
}
