import { useEffect, useRef, useState, memo } from 'react';
import ScoreCounter from './ScoreCounter';
import '../styles/animations.css';

/**
 * ResultCard — the heart of the product.
 * Displays the AI's single car recommendation with rich specs.
 * Entrance animation triggered by IntersectionObserver.
 */
export default memo(function ResultCard({ data }) {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [annualKm, setAnnualKm] = useState(10000);

  // Parse numeric fields (they come as strings from the API)
  const score = parseInt(data.road_adaptability_score, 10) || 0;
  const mileage = parseFloat(data.fuel_efficiency) || 0;
  const maintenancePerKm = parseFloat(data.base_maintenance_per_km) || 0;
  
  // Interactive math: recalculates instantly when annualKm changes
  const annualService = (maintenancePerKm * annualKm).toLocaleString('en-IN');

  // IntersectionObserver — trigger entrance animation on scroll into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className={`w-full max-w-3xl mx-auto bg-surface border border-border-subtle
                  overflow-hidden mt-12 ${
                    isVisible ? 'animate-card-reveal' : 'opacity-0'
                  }`}
      style={{ borderRadius: '2px' }}
    >
      {/* ===== a) CAR IMAGE HEADER ===== */}
      <div className="relative w-full h-[280px] sm:h-[400px] bg-elevated overflow-hidden">
        {data.image_url ? (
          <img
            src={data.image_url}
            alt={data.car_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-mono text-base text-text-ghost">No image available</span>
          </div>
        )}

        {/* Gradient overlay — fades image into card surface */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent 60%, #0D1117)',
          }}
        />

        {/* Car name — overlaps bottom of image */}
        <h2
          className="absolute bottom-5 left-6 sm:left-8 font-display
                     text-[36px] sm:text-[56px] leading-none text-text-warm z-10"
        >
          {data.car_name}
        </h2>

        {/* Road Score badge — top-right corner */}
        <div
          className="absolute top-4 right-4 sm:top-6 sm:right-6 px-4 py-3
                     border border-border-active text-center z-10"
          style={{ backgroundColor: 'rgba(8,10,15,0.85)', borderRadius: '2px' }}
        >
          <div className="flex items-baseline justify-center gap-0.5">
            <span className="font-mono text-[32px] text-amber leading-none">
              <ScoreCounter target={score} />
            </span>
            <span className="font-mono text-lg text-text-muted">/10</span>
          </div>
          <p className="font-body text-xs tracking-[0.2em] uppercase text-text-ghost mt-1">
            Road Score
          </p>
        </div>
      </div>

      {/* ===== b) PRICE ROW ===== */}
      <div className="px-6 sm:px-8 py-5 border-b border-border-subtle">
        <span className="font-mono text-2xl sm:text-3xl text-amber">
          {data.estimated_on_road_price}
        </span>
      </div>

      {/* ===== c) AI PITCH TEXT ===== */}
      <div className="px-6 sm:px-8 py-6">
        <p
          className="font-body text-lg sm:text-xl text-text-muted italic
                     border-l-[3px] border-amber-dim pl-5"
          style={{ lineHeight: '1.75' }}
        >
          &ldquo;{data.verdict_reasoning}&rdquo;
        </p>
      </div>

      {/* ===== d) STRENGTHS / DEALBREAKERS GRID ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-border-subtle">
        {/* Strengths */}
        <FeatureList 
          title="Top Strengths" 
          items={data.pros} 
          dotColor="bg-success" 
          textColor="text-success" 
          arrowColor="text-amber" 
        />

        {/* Dealbreakers */}
        <FeatureList 
          title="Watch Out" 
          items={data.cons} 
          dotColor="bg-amber" 
          textColor="text-amber" 
          arrowColor="text-danger" 
          className="border-t sm:border-t-0 sm:border-l border-border-subtle"
        />
      </div>

      {/* ===== e) STATS ROW ===== */}
      <div className="grid grid-cols-2 bg-elevated border-t border-border-subtle">
        {/* Real Mileage */}
        <div className="p-5 sm:p-6">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-2xl sm:text-3xl text-text-warm">
              {mileage}
            </span>
            <span className="font-mono text-sm text-text-muted">kmpl</span>
          </div>
          <p className="font-body text-sm sm:text-base tracking-[0.1em] uppercase text-text-ghost mt-2">
            Real Mileage
          </p>
        </div>

        {/* Est. Annual Service */}
        <div className="p-5 sm:p-6 border-l border-border-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-2xl sm:text-3xl text-text-warm transition-all">
                ₹{annualService}
              </span>
            </div>
            <p className="font-body text-sm sm:text-base tracking-[0.1em] uppercase text-text-ghost mt-2">
              Est. Annual Service
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-border-subtle/50">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="km-slider" className="font-body text-xs text-text-muted">
                Annual Usage
              </label>
              <span className="font-mono text-xs text-amber">{annualKm.toLocaleString('en-IN')} km</span>
            </div>
            <input
              id="km-slider"
              type="range"
              min="2000"
              max="50000"
              step="1000"
              value={annualKm}
              onChange={(e) => setAnnualKm(parseInt(e.target.value, 10))}
              className="w-full h-1 bg-surface rounded-full appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-4
                         [&::-webkit-slider-thumb]:h-4
                         [&::-webkit-slider-thumb]:bg-amber
                         [&::-webkit-slider-thumb]:rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
});

// Extracted reusable component for Strengths and Dealbreakers
const FeatureList = memo(({ title, items, dotColor, textColor, arrowColor, className = '' }) => (
  <div className={`px-6 sm:px-8 py-5 ${className}`}>
    <div className="flex items-center gap-2 mb-3">
      <span className={`w-2 h-2 rounded-full ${dotColor} inline-block`} />
      <span className={`font-body text-base sm:text-lg font-semibold ${textColor}`}>
        {title}
      </span>
    </div>
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="text-base sm:text-lg text-text-muted leading-relaxed">
          <span className={`${arrowColor} mr-3`}>→</span>
          {item}
        </li>
      ))}
    </ul>
  </div>
));
