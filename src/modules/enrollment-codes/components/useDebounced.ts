import { useEffect, useState } from 'react';

const DELAY_MS = 300;

/** A value that follows `value` after it has stopped changing for a moment, so typing does not query on every key. */
function useDebounced<T>(value: T, delay = DELAY_MS): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default useDebounced;
