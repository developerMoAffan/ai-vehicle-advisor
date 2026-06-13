import { useState, useCallback } from 'react';

/**
 * useCarAdvisor — custom hook for the AI Vehicle Advisor API.
 *
 * Manages the full lifecycle: loading state, error handling, result storage,
 * and query history for the history strip.
 *
 * @returns {Object} API state and actions
 *   - result: the AdvisorResponse object or null
 *   - loading: boolean, true while the API call is in flight
 *   - error: string or null
 *   - history: array of past query strings
 *   - consult: function(prompt: string) — triggers the API call
 */
export function useCarAdvisor() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const consult = useCallback(async (prompt) => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(
          `Backend returned ${response.status}. Is the Python server running?`
        );
      }

      const data = await response.json();
      setResult(data);

      // Add to history only if this query isn't already the most recent
      setHistory((prev) => {
        const trimmed = prompt.trim();
        if (prev[0] === trimmed) return prev;
        return [trimmed, ...prev].slice(0, 10); // Keep last 10 queries
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { result, loading, error, history, consult };
}
