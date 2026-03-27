import { useEffect } from "react";

/**
 * @param {React.RefObject<HTMLElement | null>} ref
 * @param {boolean} enabled
 * @param {() => void} onOutside
 */
export function useClickOutside(ref, enabled, onOutside) {
  useEffect(() => {
    if (!enabled) return undefined;
    const handler = (e) => {
      const el = ref.current;
      if (!el) return;
      if (el.contains(e.target)) return;
      onOutside();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [ref, enabled, onOutside]);
}
