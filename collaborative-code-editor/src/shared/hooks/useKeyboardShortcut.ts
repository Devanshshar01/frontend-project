import { useEffect, useCallback } from 'react';

/**
 * Hook to handle keyboard shortcuts
 * Implements keyboard navigation for accessibility
 * @param key - Key to listen for
 * @param callback - Function to call when shortcut is pressed
 * @param options - Modifier keys (ctrl, shift, alt, meta)
 */
interface KeyboardShortcutOptions {
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  preventDefault?: boolean;
}

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: KeyboardShortcutOptions = {}
): void {
  const {
    ctrl = false,
    shift = false,
    alt = false,
    meta = false,
    preventDefault = true,
  } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const matchesKey = event.key.toLowerCase() === key.toLowerCase();
      const matchesCtrl = ctrl === event.ctrlKey;
      const matchesShift = shift === event.shiftKey;
      const matchesAlt = alt === event.altKey;
      const matchesMeta = meta === event.metaKey;

      if (matchesKey && matchesCtrl && matchesShift && matchesAlt && matchesMeta) {
        if (preventDefault) {
          event.preventDefault();
        }
        callback();
      }
    },
    [key, callback, ctrl, shift, alt, meta, preventDefault]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
