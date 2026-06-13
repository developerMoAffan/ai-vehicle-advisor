import '../styles/animations.css';

/**
 * HeroSection — full-viewport cinematic entrance.
 * Radial gradient background with a barely-perceptible scan-line animation.
 * "Automotive showroom meets terminal intelligence."
 */
export default function HeroSection({ children }) {
  return (
    <section
      className="relative flex flex-col items-center justify-center
                 min-h-[80vh] sm:min-h-screen px-6 overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 50% 50%, #0D1420, #080A0F)',
        boxShadow: '0 1px 40px -10px rgba(232,168,56,0.15)',
      }}
    >
      {/* Scan-line — atmospheric, barely perceptible */}
      <div
        className="absolute inset-0 pointer-events-none animate-scanline"
        aria-hidden="true"
      >
        <div
          className="w-full h-px"
          style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center w-full">
        {/* Title — Bebas Neue, cinematic scale */}
        <h1
          className="font-display text-text-warm
                     text-[52px] sm:text-[72px] lg:text-[96px]
                     leading-none tracking-[0.08em] mb-4"
        >
          AI VEHICLE ADVISOR
        </h1>

        {/* Subtitle */}
        <p className="font-body text-lg sm:text-xl text-text-muted mb-10 max-w-lg">
          Describe your car. Your budget. Your city. Get one perfect answer.
        </p>

        {/* Search bar slot */}
        {children}
      </div>
    </section>
  );
}
