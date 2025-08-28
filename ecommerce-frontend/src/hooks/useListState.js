import { useCallback, useEffect, useState } from 'react';

// Generic hook to manage list states: page, pageSize, filters, loading, items, total.
// loader: async ({ page, pageSize, filters }) => ({ items, total, pageSize? })
export default function useListState(loader, { initialFilters = {}, initialPage = 1, initialPageSize = 20 } = {}) {
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (overrides = {}) => {
    setLoading(true);
    try {
      const p = overrides.page ?? page;
      const ps = overrides.pageSize ?? pageSize;
      const f = overrides.filters ?? filters;
      const res = await loader({ page: p, pageSize: ps, filters: f });
      setItems(res.items || []);
      if (typeof res.total === 'number') setTotal(res.total);
      if (typeof res.pageSize === 'number') setPageSize(res.pageSize);
    } finally {
      setLoading(false);
    }
  }, [loader, page, pageSize, filters]);

  // Auto load on mount and when deps change
  useEffect(() => { load(); }, [load]);

  const changePage = useCallback(async (nextPage) => {
    setPage(nextPage);
    await load({ page: nextPage });
  }, [load]);

  const changePageSize = useCallback(async (nextSize) => {
    setPageSize(nextSize);
    setPage(1);
    await load({ page: 1, pageSize: nextSize });
  }, [load]);

  const applyFilters = useCallback(async (nextFilters) => {
    setFilters((prev) => ({ ...prev, ...nextFilters }));
    setPage(1);
    await load({ page: 1, filters: { ...filters, ...nextFilters } });
  }, [filters, load]);

  return {
    filters, setFilters, page, pageSize, items, total, loading,
    load, changePage, changePageSize, applyFilters, setItems, setTotal,
  };
}
