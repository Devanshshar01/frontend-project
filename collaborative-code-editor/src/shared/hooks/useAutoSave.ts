import { useEffect, useRef } from 'react';
import { useDebounce } from './useDebounce';

/**
 * Hook to auto-save content with debouncing
 * Implements auto-save every 3 seconds as per requirements
 * @param content - Content to save
 * @param onSave - Save callback function
 * @param delay - Debounce delay (default 3000ms)
 * @param enabled - Whether auto-save is enabled
 */
export function useAutoSave(
  content: string,
  onSave: (content: string) => void | Promise<void>,
  delay = 3000,
  enabled = true
): { isSaving: boolean; lastSaved: Date | null } {
  const debouncedContent = useDebounce(content, delay);
  const previousContent = useRef<string>(content);
  const lastSaved = useRef<Date | null>(null);
  const isSaving = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const hasChanged = debouncedContent !== previousContent.current;

    if (hasChanged && debouncedContent) {
      isSaving.current = true;

      const savePromise = onSave(debouncedContent);

      if (savePromise instanceof Promise) {
        savePromise
          .then(() => {
            previousContent.current = debouncedContent;
            lastSaved.current = new Date();
          })
          .finally(() => {
            isSaving.current = false;
          });
      } else {
        previousContent.current = debouncedContent;
        lastSaved.current = new Date();
        isSaving.current = false;
      }
    }
  }, [debouncedContent, onSave, enabled]);

  return {
    isSaving: isSaving.current,
    lastSaved: lastSaved.current,
  };
}
