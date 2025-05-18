import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

// Custom hook untuk API fetching dengan cache
const useStockAPI = () => {
  const [cache, setCache] = useState({});
  const [cacheExpiry, setCacheExpiry] = useState({});
  
  const fetchStock = useCallback(async (params, forceRefresh = false) => {
  const { symbol } = params;
  
  // Create a cache key based on all params
  const cacheKey = JSON.stringify(params);
  
  // Get current time
  const now = new Date().getTime();
  
  // Check cache first if no force refresh - gunakan fungsi ekstraksi cache
  if (!forceRefresh && cache[cacheKey] && cacheExpiry[cacheKey] && cacheExpiry[cacheKey] > now) {
    console.log(`Using cached data for ${symbol} with params:`, params);
    return cache[cacheKey];
  }
  
  // If not cached or expired, fetch from API
  try {
    const res = await axios.get("https://stockadvice-v1-0.onrender.com/stock", { params });
    
    if (res.data && res.data.data && Array.isArray(res.data.data)) {
      // Process data
      const sortedData = [...res.data.data].sort((a, b) => {
        const dateA = new Date(a.Date || a.Datetime);
        const dateB = new Date(b.Date || b.Datetime);
        return dateB - dateA; // Descending order
      });
      
      // Prepare response before cache update
      const response = {
        data: sortedData,
        status: 'success',
        timestamp: now
      };
      
      // Cache the data - update di luar path rendering utama
      setTimeout(() => {
        setCache(prevCache => ({
          ...prevCache,
          [cacheKey]: response
        }));
        
        setCacheExpiry(prevExpiry => ({
          ...prevExpiry,
          [cacheKey]: now + 300000 // 5 menit cache duration
        }));
      }, 0);
      
      return response;
    } else {
      throw new Error('Invalid data format received from server');
    }
  } catch (err) {
    console.error('Error fetching stock data:', err);
    
    // Cache error for 1 minute to prevent constant retries on same error
    const errorResponse = {
      data: [],
      status: 'error',
      error: err.response?.data?.error || err.message || 'Unknown error',
      timestamp: now
    };
    
    // Update state outside rendering path
    setTimeout(() => {
      setCache(prevCache => ({
        ...prevCache,
        [cacheKey]: errorResponse
      }));
      
      setCacheExpiry(prevExpiry => ({
        ...prevExpiry,
        [cacheKey]: now + 60000 // Cache errors for 1 minute
      }));
    }, 0);
    
    return errorResponse;
  }
}, [cache, cacheExpiry]); // Added cache and cacheExpiry as dependencies
  
  const preloadStockData = useCallback(async (symbols, interval = '1d', period = '5d') => {
  // Batch process to avoid overwhelming the API
  const batchSize = 5;
  const batches = [];
  
  // Split symbols into batches
  for (let i = 0; i < symbols.length; i += batchSize) {
    batches.push(symbols.slice(i, i + batchSize));
  }
  
  // Process each batch
  for (const batch of batches) {
    const promises = batch.map(symbol => {
      return fetchStock({
        symbol,
        interval,
        period
      });
    });
    
    await Promise.all(promises);
    
    // Small delay between batches
    if (batches.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
}, [fetchStock]); // Ditambahkan CACHE_DURATION sebagai dependency
  
  // Clear expired cache entries
  useEffect(() => {
  const cleanupInterval = setInterval(() => {
    const now = new Date().getTime();
    let hasExpired = false;
    
    setCacheExpiry(prevExpiry => {
      const newCacheExpiry = { ...prevExpiry };
      
      // Check for expired items
      Object.entries(newCacheExpiry).forEach(([key, expiry]) => {
        if (expiry < now) {
          delete newCacheExpiry[key];
          hasExpired = true;
        }
      });
      
      if (hasExpired) {
        // Jika ada yang expired, update cache di useEffect lain
        setTimeout(() => {
          setCache(prevCache => {
            const newCache = { ...prevCache };
            Object.keys(newCache).forEach(key => {
              if (!newCacheExpiry[key]) {
                delete newCache[key];
              }
            });
            return newCache;
          });
        }, 0);
      }
      
      return hasExpired ? newCacheExpiry : prevExpiry;
    });
  }, 60000); // Check every minute
  
  return () => clearInterval(cleanupInterval);
}, []);
  
  return {
    fetchStock,
    preloadStockData,
    cache,
    clearCache: () => {
      setCache({});
      setCacheExpiry({});
    }
  };
};

export default useStockAPI;