import { useState, useEffect } from 'react';

/**
 * LoadingState — three pulsing amber dots + rotating status messages.
 * Designed to feel like a system terminal scanning databases,
 * not a generic loading spinner.
 */

const STATUS_MESSAGES = [
  'Scanning 847 models...',
  'Analysing Delhi road conditions...',
  'Calculating real-world mileage...',
  'Cross-referencing service costs...',
];

export default function LoadingState() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Trigger fade-out
      setFading(true);

      // After fade-out completes (200ms), switch message and fade-in
      setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
        setFading(false);
      }, 200);
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      {/* Three pulsing dots */}
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`block w-2.5 h-2.5 rounded-full bg-amber animate-dot-pulse dot-delay-${i}`}
          />
        ))}
      </div>

      {/* Rotating status message */}
      <p
        className={`font-mono text-base text-text-ghost transition-opacity duration-200 ${
          fading ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {STATUS_MESSAGES[messageIndex]}
      </p>
    </div>
  );
}
