import { useState, useEffect, useCallback } from 'react';

interface FetchResult<T> {
  /** Qué request produjo este resultado (para saber si sigue vigente). */
  fetcher: () => Promise<T>;
  reloadKey: number;
  data: T | null;
  error: string | null;
}

/**
 * Carga datos de la API y expone { data, loading, error, refresh, setData }.
 *
 * `loading` no se guarda en el estado: se deriva comparando el último
 * resultado recibido con la request actual. Así el efecto solo llama a
 * setState cuando la respuesta llega (nunca de forma síncrona), que es lo
 * que pide la regla react-hooks/set-state-in-effect.
 *
 * `fetcher` debe ser estable (useCallback): cuando cambia, se vuelve a cargar.
 */
export function useApiData<T>(fetcher: () => Promise<T>, errorMessage: string) {
  const [result, setResult] = useState<FetchResult<T> | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetcher()
      .then((data) => {
        if (!cancelled) setResult({ fetcher, reloadKey, data, error: null });
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : errorMessage;
        if (!cancelled) setResult({ fetcher, reloadKey, data: null, error: message });
      });

    // Si el componente se desmonta o la request cambia, se ignora la respuesta vieja.
    return () => {
      cancelled = true;
    };
  }, [fetcher, reloadKey, errorMessage]);

  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

  /** Reemplaza los datos localmente (por ejemplo, después de guardar). */
  const setData = useCallback((data: T) => {
    setResult((prev) => (prev ? { ...prev, data } : prev));
  }, []);

  const isCurrent = result !== null && result.fetcher === fetcher && result.reloadKey === reloadKey;

  return {
    data: result?.data ?? null,
    loading: !isCurrent,
    error: isCurrent ? result.error : null,
    refresh,
    setData,
  };
}
