import { memo } from 'react';

/**
 * HistoryStrip — displays recent queries as clickable pills.
 * Has a fade-in animation on mount.
 */
export default memo(function HistoryStrip({ history, onSelect }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="w-full max-w-[680px] animate-fade-in">
      <div className="flex items-center gap-3 mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-border-active inline-block" />
        <span className="font-mono text-xs uppercase tracking-widest text-text-ghost">
          Recent Consultations
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {history.map((query, index) => (
          <button
            key={index}
            onClick={() => onSelect(query)}
            className="group relative px-4 py-2 border border-border-subtle bg-elevated
                       text-text-muted font-body text-sm text-left
                       transition-all duration-200
                       hover:border-amber-dim hover:text-text-warm
                       overflow-hidden"
            style={{ borderRadius: '2px' }}
          >
            {/* Subtle highlight effect on hover */}
            <div className="absolute inset-0 bg-amber opacity-0 group-hover:opacity-5 transition-opacity" />
            
            <span className="relative z-10 flex items-center gap-2">
              <span className="text-amber/50 group-hover:text-amber transition-colors">↳</span>
              <span className="truncate max-w-[200px] sm:max-w-[300px]">
                {query}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
});
