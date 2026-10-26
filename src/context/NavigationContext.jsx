import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { NavigationService } from '../services/navigationService';

const NavigationContext = createContext({
  navigationTree: [],
  loading: true,
  error: null,
  refreshNavigation: async () => {},
});

export function NavigationProvider({ children }) {
  const [navigationTree, setNavigationTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNavigation = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const tree = await NavigationService.getNavigation();
      if (Array.isArray(tree)) {
        setNavigationTree(tree);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to load navigation tree:', err);
      setError(err.message || 'Failed to load navigation');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNavigation();
    const handleNavChange = () => fetchNavigation(true);
    window.addEventListener('navigation:change', handleNavChange);
    return () => window.removeEventListener('navigation:change', handleNavChange);
  }, [fetchNavigation]);

  const refreshNavigation = useCallback(async () => {
    return fetchNavigation(true);
  }, [fetchNavigation]);

  return (
    <NavigationContext.Provider
      value={{
        navigationTree,
        loading,
        error,
        refreshNavigation
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
