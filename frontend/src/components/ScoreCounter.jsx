import { useState, useEffect, useRef } from 'react';

/**
 * ScoreCounter — animated number counter using requestAnimationFrame.
 * Counts from 0 to `target` over `duration` ms with easeOutCubic easing.
 * Used for the Road Score badge on the result card.
 */
export default function ScoreCounter({ target, duration = 800 }) {
  const [current, setCurrent] = useState(0);
  const startTimeRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    // Reset on target change
    setCurrent(0);
    startTimeRef.current = null;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      setCurrent(Math.round(easedProgress * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return <span>{current}</span>;
}
