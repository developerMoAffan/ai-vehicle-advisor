import { useState, useEffect, useRef, memo } from 'react';

/**
 * SearchBar — the hero's main interaction.
 * Auto-expanding textarea with a separate, sharp-cornered amber CTA.
 */
export default memo(function SearchBar({ onSubmit, loading = false, initialValue = '' }) {
  const [prompt, setPrompt] = useState(initialValue);
  const textareaRef = useRef(null);

  // Auto-resize the textarea
  const handleResize = () => {
    if (textareaRef.current) {
      // Reset height to auto to get the true scrollHeight (shrink if text deleted)
      textareaRef.current.style.height = 'auto';
      // Set height to scrollHeight
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Sync with initialValue when it changes (history pill click)
  useEffect(() => {
    setPrompt(initialValue);
    // Timeout needed to let the DOM update the value before resizing
    setTimeout(handleResize, 0);
  }, [initialValue]);

  const handleChange = (e) => {
    setPrompt(e.target.value);
    handleResize();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;
    onSubmit(prompt.trim());
  };

  // Allow submitting with Shift + Enter. Regular Enter adds a new line.
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault(); // Prevent default new line behavior
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-[680px] mx-auto flex flex-col gap-4"
    >
      <textarea
        ref={textareaRef}
        value={prompt}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={loading}
        placeholder='Budget, city, use-case — describe your perfect car...'
        rows={1}
        className="w-full px-5 py-4 bg-surface border border-border-subtle
                   text-text-warm font-mono text-base
                   placeholder:text-text-ghost placeholder:font-mono
                   outline-none transition-shadow duration-200
                   focus:border-amber focus:shadow-[0_0_0_3px_rgba(232,168,56,0.12)]
                   disabled:opacity-50 resize-none overflow-hidden leading-relaxed"
        style={{ minHeight: '56px' }}
      />
      <button
        type="submit"
        disabled={loading}
        className="px-8 py-4 bg-amber text-[#080A0F] font-body text-base font-semibold
                   tracking-wide uppercase
                   transition-all duration-150 cursor-pointer
                   hover:brightness-110 hover:scale-[1.01]
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                   w-full sm:w-auto sm:self-end"
        style={{ borderRadius: 0 }}
      >
        {loading ? 'Consulting...' : 'Consult AI →'}
      </button>
    </form>
  );
});
