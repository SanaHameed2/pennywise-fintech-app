// src/hooks/useIdleTimer.ts
import { useEffect, useRef } from 'react';

export function useIdleTimer(timeoutMs: number, onTimeout: () => void, isEnabled: boolean = true) {
  const timeoutRef = useRef(onTimeout);
  const lastActivityRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isTimedOutRef = useRef<boolean>(false);

  useEffect(() => {
    timeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    // ✅ Fix 2: Do not run timer if not enabled (user not logged in)
    if (!isEnabled) {
      isTimedOutRef.current = false; // Reset state when disabled
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (!timeoutMs || timeoutMs <= 0) {
      console.warn('useIdleTimer: timeoutMs must be greater than 0');
      return;
    }

    isTimedOutRef.current = false; // Reset on enable
    lastActivityRef.current = Date.now();

    const handleTimeout = () => {
      if (isTimedOutRef.current) return; 
      isTimedOutRef.current = true;
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      timeoutRef.current();
    };

    const updateActivity = () => {
      if (isTimedOutRef.current) return; 
      lastActivityRef.current = Date.now();
    };

    const events = ['mousemove', 'keydown', 'pointerdown', 'wheel', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, updateActivity, { passive: true }));

    timerRef.current = setInterval(() => {
      if (isTimedOutRef.current) return; 
      const timeElapsed = Date.now() - lastActivityRef.current;
      if (timeElapsed >= timeoutMs) {
        handleTimeout();
      }
    }, 1000); 

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isTimedOutRef.current) {
        const timeElapsed = Date.now() - lastActivityRef.current;
        if (timeElapsed >= timeoutMs) {
          handleTimeout();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      events.forEach((event) => window.removeEventListener(event, updateActivity));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [timeoutMs, isEnabled]);
}