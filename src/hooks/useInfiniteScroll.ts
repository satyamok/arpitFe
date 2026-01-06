import { useRef, useCallback, useEffect, useState } from "react";

// Types
interface CacheEntry<T> {
  data: T[];
  timestamp: number;
  nextCursor: string | null;
  hasMore: boolean;
}

interface UseInfiniteScrollOptions<T> {
  fetchFn: (cursor: string | null) => Promise<{
    data: T[];
    nextCursor: string | null;
    hasMore: boolean;
  }>;
  cacheKey: string;
  ttl?: number; // Time to live in milliseconds (default 5 minutes)
  enabled?: boolean;
}

interface UseInfiniteScrollResult<T> {
  data: T[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
  resetCache: () => void;
  observerRef: (node: HTMLElement | null) => void;
}

// Global cache map
const globalCache = new Map<string, CacheEntry<unknown>>();

export function useInfiniteScroll<T>({
  fetchFn,
  cacheKey,
  ttl = 5 * 60 * 1000, // 5 minutes default
  enabled = true,
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const cursorRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreTriggerRef = useRef<HTMLElement | null>(null);

  // Check if cache is valid
  const isCacheValid = useCallback(
    (entry: CacheEntry<unknown> | undefined): boolean => {
      if (!entry) return false;
      return Date.now() - entry.timestamp < ttl;
    },
    [ttl]
  );

  // Get from cache
  const getFromCache = useCallback((): CacheEntry<T> | null => {
    const entry = globalCache.get(cacheKey) as CacheEntry<T> | undefined;
    if (isCacheValid(entry)) {
      return entry!;
    }
    return null;
  }, [cacheKey, isCacheValid]);

  // Set to cache
  const setToCache = useCallback(
    (data: T[], nextCursor: string | null, hasMore: boolean) => {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        nextCursor,
        hasMore,
      };
      globalCache.set(cacheKey, entry as CacheEntry<unknown>);
    },
    [cacheKey]
  );

  // Reset cache
  const resetCache = useCallback(() => {
    globalCache.delete(cacheKey);
    cursorRef.current = null;
    setData([]);
    setHasMore(true);
    setError(null);
  }, [cacheKey]);

  // Fetch data
  const fetchData = useCallback(
    async (isLoadMore = false) => {
      if (isFetchingRef.current) return;
      if (isLoadMore && !hasMore) return;

      isFetchingRef.current = true;

      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const cursor = isLoadMore ? cursorRef.current : null;
        const result = await fetchFn(cursor);

        if (isLoadMore) {
          setData((prev) => {
            const newData = [...prev, ...result.data];
            setToCache(newData, result.nextCursor, result.hasMore);
            return newData;
          });
        } else {
          setData(result.data);
          setToCache(result.data, result.nextCursor, result.hasMore);
        }

        cursorRef.current = result.nextCursor;
        setHasMore(result.hasMore);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        isFetchingRef.current = false;
      }
    },
    [fetchFn, hasMore, setToCache]
  );

  // Load more function
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isFetchingRef.current) {
      fetchData(true);
    }
  }, [fetchData, hasMore, isLoadingMore]);

  // Refresh function
  const refresh = useCallback(() => {
    resetCache();
    fetchData(false);
  }, [fetchData, resetCache]);

  // Observer callback ref
  const setObserverRef = useCallback(
    (node: HTMLElement | null) => {
      if (loadMoreTriggerRef.current) {
        observerRef.current?.unobserve(loadMoreTriggerRef.current);
      }

      loadMoreTriggerRef.current = node;

      if (node && hasMore) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            if (
              entries[0].isIntersecting &&
              hasMore &&
              !isFetchingRef.current
            ) {
              loadMore();
            }
          },
          {
            root: null,
            rootMargin: "100px",
            threshold: 0.1,
          }
        );

        observerRef.current.observe(node);
      }
    },
    [hasMore, loadMore]
  );

  // Initial load with cache check
  useEffect(() => {
    if (!enabled) return;

    const cached = getFromCache();
    if (cached) {
      setData(cached.data);
      cursorRef.current = cached.nextCursor;
      setHasMore(cached.hasMore);
      return;
    }

    fetchData(false);
  }, [enabled, cacheKey]); // Re-fetch when cacheKey changes

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return {
    data,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
    resetCache,
    observerRef: setObserverRef,
  };
}

// Helper to generate cache key with filters
export function generateCacheKey(
  base: string,
  params: Record<string, string | number | undefined>
): string {
  const sortedParams = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return sortedParams ? `${base}?${sortedParams}` : base;
}

// Clear all cache (useful for logout)
export function clearAllCache(): void {
  globalCache.clear();
}
