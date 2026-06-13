import { useState, useCallback } from 'react';
import { useCarAdvisor } from './hooks/useCarAdvisor';
import HeroSection from './components/HeroSection';
import SearchBar from './components/SearchBar';
import ResultCard from './components/ResultCard';
import LoadingState from './components/LoadingState';
import HistoryStrip from './components/HistoryStrip';
import './styles/animations.css';

/**
 * App — wires together the AI Vehicle Advisor.
 *
 * Architecture:
 *   HeroSection > SearchBar (always visible in hero)
 *   LoadingState (shown during API call, below hero)
 *   ResultCard (shown after AI responds, below hero)
 *   HistoryStrip (past queries, below result card)
 */
export default function App() {
  const { result, loading, error, history, consult } = useCarAdvisor();
  const [searchValue, setSearchValue] = useState('');

  const handleConsult = useCallback((prompt) => {
    setSearchValue(prompt);
    consult(prompt);
  }, [consult]);

  const handleHistorySelect = useCallback((query) => {
    setSearchValue(query);
    consult(query);
  }, [consult]);

  return (
    <div className="min-h-screen bg-void">
      {/* ===== HERO SECTION ===== */}
      <HeroSection>
        <SearchBar
          onSubmit={handleConsult}
          loading={loading}
          initialValue={searchValue}
        />
      </HeroSection>

      {/* ===== RESULTS AREA ===== */}
      <main className="px-4 sm:px-6 pb-20">
        {/* Error state */}
        {error && (
          <div
            className="w-full max-w-3xl mx-auto mt-8 px-6 py-4 border border-danger/30
                        bg-danger/5 font-body text-sm text-danger"
            style={{ borderRadius: '2px' }}
          >
            {error}
          </div>
        )}

        {/* Loading state — dots + rotating status messages */}
        {loading && <LoadingState />}

        {/* Result card — the heart of the product */}
        {result && !loading && <ResultCard data={result} />}

        {/* History strip — past queries */}
        {!loading && (
          <div className="flex justify-center mt-8">
            <HistoryStrip history={history} onSelect={handleHistorySelect} />
          </div>
        )}
      </main>
    </div>
  );
}