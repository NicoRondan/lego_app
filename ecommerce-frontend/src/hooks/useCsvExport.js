// Small helper to construct a CSV export URL and trigger navigation
export default function useCsvExport(baseUrl) {
  return (path, paramsObj = {}) => {
    const params = new URLSearchParams();
    Object.entries(paramsObj).forEach(([k, v]) => {
      if (v != null && v !== '') params.set(k, v);
    });
    params.set('format', 'csv');
    const url = `${baseUrl}${path}${path.includes('?') ? '&' : '?'}${params.toString()}`;
    if (typeof window !== 'undefined') window.location.href = url;
    return url;
  };
}

