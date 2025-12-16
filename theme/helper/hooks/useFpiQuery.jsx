import { useEffect, useState, useCallback, useRef } from 'react';
import { subscribeToCacheKey } from '../fpi-swr-wrapper';

/**
 * React hook to subscribe to fpi.executeGQL with automatic updates
 * 
 * Usage:
 *   const { data, isLoading, mutate } = useFpiQuery(fpi, QUERY, variables);
 * 
 * This hook automatically updates when background revalidation completes.
 * 
 * @param {Object} fpi - The FPI client instance
 * @param {string} query - GraphQL query string
 * @param {Object} variables - Query variables (default: {})
 * @param {Object} options - Configuration options
 * @param {*} options.initialData - Initial data to use before first fetch
 * @param {boolean} options.enabled - Enable/disable the query (default: true)
 * @returns {Object} { data, error, isLoading, isValidating, mutate }
 */
export function useFpiQuery(fpi, query, variables = {}, options = {}) {
  const [data, setData] = useState(options.initialData ?? null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(!options.initialData);
  const [isValidating, setIsValidating] = useState(false);
  const mountedRef = useRef(true);
  const enabled = options.enabled !== false;

  const cacheKey = fpi.getCacheKey?.(query, variables) ?? 
    JSON.stringify({ query, variables });

  // Fetch function
  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    setIsValidating(true);
    try {
      const result = await fpi.executeGQL(query, variables);
      if (mountedRef.current) {
        if (result?.errors?.length) {
          setError(result.errors[0]);
        } else {
          setData(result);
          setError(null);
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        setIsValidating(false);
      }
    }
  }, [fpi, query, JSON.stringify(variables), enabled]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [fetchData, enabled]);

  // Subscribe to background updates
  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = subscribeToCacheKey(cacheKey, (newData) => {
      if (mountedRef.current) {
        console.log('📡 Received background update for:', cacheKey.substring(0, 50));
        setData(newData);
        setError(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [cacheKey, enabled]);

  // Cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Manual revalidation
  const mutate = useCallback((newData) => {
    if (newData !== undefined) {
      // Allow manual data updates
      setData(newData);
      return Promise.resolve(newData);
    }
    // Or trigger a refetch
    return fetchData();
  }, [fetchData]);

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}

/**
 * Hook for mutations (create, update, delete operations)
 * 
 * Usage:
 *   const { trigger, isMutating } = useFpiMutation(fpi, MUTATION_QUERY);
 *   await trigger({ variables: { ... } });
 * 
 * @param {Object} fpi - The FPI client instance
 * @param {string} query - GraphQL mutation string
 * @param {Object} options - Configuration options
 * @param {Function} options.onSuccess - Callback on success
 * @param {Function} options.onError - Callback on error
 * @returns {Object} { trigger, isMutating, error }
 */
export function useFpiMutation(fpi, query, options = {}) {
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const trigger = useCallback(async (variables = {}, executeOptions = {}) => {
    setIsMutating(true);
    setError(null);

    try {
      const result = await fpi.executeGQL(query, variables, executeOptions);
      
      if (mountedRef.current) {
        setIsMutating(false);
        
        if (result?.errors?.length) {
          const err = result.errors[0];
          setError(err);
          if (options.onError) {
            options.onError(err);
          }
          throw err;
        }
        
        if (options.onSuccess) {
          options.onSuccess(result);
        }
        
        return result;
      }
    } catch (err) {
      if (mountedRef.current) {
        setIsMutating(false);
        setError(err);
        if (options.onError) {
          options.onError(err);
        }
      }
      throw err;
    }
  }, [fpi, query, options.onSuccess, options.onError]);

  return {
    trigger,
    isMutating,
    error,
  };
}

