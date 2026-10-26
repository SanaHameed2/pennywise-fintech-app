import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  // ✅ Lazy initializer — computes the correct value synchronously at first
  //    render, so no setState is needed inside the effect for the initial value.
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false; // SSR-safe
    return window.innerWidth < MOBILE_BREAKPOINT;
  });

  // ✅ Effect only subscribes to change events — the initial value is
  //    already correct thanks to the useState initializer above.
  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}