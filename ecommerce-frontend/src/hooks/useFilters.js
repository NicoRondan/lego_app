import { useCallback, useState } from 'react';

// useFilters
// Small helper to manage filters as a single object with helpers.
export default function useFilters(initial = {}) {
  const [filters, setFilters] = useState({ ...initial });

  const set = useCallback((key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
  }, []);

  const reset = useCallback(() => setFilters({ ...initial }), [initial]);

  const bind = useCallback((key) => ({
    value: filters[key] ?? '',
    onChange: (val) => set(key, val),
  }), [filters, set]);

  return { filters, set, reset, bind };
}

