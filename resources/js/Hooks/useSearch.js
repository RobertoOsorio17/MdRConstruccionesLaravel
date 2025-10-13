import { useState, useEffect, useCallback, useRef } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';

const SEARCH_HISTORY_KEY = 'blog_search_history';
const MAX_HISTORY_ITEMS = 10;
const DEBOUNCE_DELAY = 300;

export const useSearch = (initialQuery = '', initialFilters = {}) => {
    const [query, setQuery] = useState(initialQuery);
    const [filters, setFilters] = useState(initialFilters);
    const [results, setResults] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [popularSearches, setPopularSearches] = useState([]);
    const [searchHistory, setSearchHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalResults, setTotalResults] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasSearched, setHasSearched] = useState(false);

    const debounceTimeoutRef = useRef(null);
    const suggestionsTimeoutRef = useRef(null);
    const abortControllerRef = useRef(null);
    // ✅ FIX: Add abort controller for quick search
    const quickSearchAbortControllerRef = useRef(null);

    // Load search history from localStorage
    useEffect(() => {
        try {
            const history = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
            setSearchHistory(history);
        } catch (error) {
            console.error('Failed to load search history:', error);
        }
    }, []);

    // Load popular searches on mount
    useEffect(() => {
        loadPopularSearches();
    }, []);

    // Debounced search effect
    useEffect(() => {
        if (query.length >= 2) {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }

            debounceTimeoutRef.current = setTimeout(() => {
                performSearch();
            }, DEBOUNCE_DELAY);
        } else {
            setResults([]);
            setTotalResults(0);
            setHasSearched(false);
        }

        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [query, filters, currentPage]);

    // Debounced suggestions effect
    useEffect(() => {
        if (query.length >= 2) {
            if (suggestionsTimeoutRef.current) {
                clearTimeout(suggestionsTimeoutRef.current);
            }

            suggestionsTimeoutRef.current = setTimeout(() => {
                loadSuggestions();
            }, DEBOUNCE_DELAY);
        } else {
            setSuggestions([]);
        }

        return () => {
            if (suggestionsTimeoutRef.current) {
                clearTimeout(suggestionsTimeoutRef.current);
            }
        };
    }, [query]);

    const performSearch = useCallback(async () => {
        if (query.length < 2) return;

        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                q: query,
                page: currentPage,
                per_page: 12,
                ...filters
            });

            const response = await axios.get(`/api/search?${params}`, {
                signal: abortControllerRef.current.signal
            });

            if (response.data.success) {
                setResults(response.data.data.data);
                setTotalResults(response.data.data.total);
                setHasSearched(true);
                
                // Add to search history
                addToSearchHistory(query);
            } else {
                setError(response.data.message || 'Search failed');
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Search error:', error);
                setError('Search temporarily unavailable. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [query, filters, currentPage]);

    const loadSuggestions = useCallback(async () => {
        if (query.length < 2) return;

        setIsSuggestionsLoading(true);

        try {
            const response = await axios.get(`/api/search/suggestions?q=${encodeURIComponent(query)}&limit=8`);
            
            if (response.data.success) {
                setSuggestions(response.data.data);
            }
        } catch (error) {
            console.error('Suggestions error:', error);
        } finally {
            setIsSuggestionsLoading(false);
        }
    }, [query]);

    const loadPopularSearches = useCallback(async () => {
        try {
            const response = await axios.get('/api/search/popular?limit=8');
            
            if (response.data.success) {
                const popular = Object.keys(response.data.data).map(term => ({
                    term,
                    count: response.data.data[term]
                }));
                setPopularSearches(popular);
            }
        } catch (error) {
            console.error('Popular searches error:', error);
        }
    }, []);

    const addToSearchHistory = useCallback((searchTerm) => {
        try {
            const history = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
            const newHistory = [
                searchTerm,
                ...history.filter(item => item !== searchTerm)
            ].slice(0, MAX_HISTORY_ITEMS);
            
            localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
            setSearchHistory(newHistory);
        } catch (error) {
            console.error('Failed to save search history:', error);
        }
    }, []);

    const clearSearchHistory = useCallback(() => {
        try {
            localStorage.removeItem(SEARCH_HISTORY_KEY);
            setSearchHistory([]);
        } catch (error) {
            console.error('Failed to clear search history:', error);
        }
    }, []);

    const quickSearch = useCallback(async (searchQuery) => {
        // ✅ FIX: Cancel previous quick search request
        if (quickSearchAbortControllerRef.current) {
            quickSearchAbortControllerRef.current.abort();
        }

        // Create new abort controller
        quickSearchAbortControllerRef.current = new AbortController();

        try {
            const response = await axios.get(
                `/api/search/quick?q=${encodeURIComponent(searchQuery)}&limit=5`,
                { signal: quickSearchAbortControllerRef.current.signal }
            );

            if (response.data.success) {
                return response.data.data;
            }
            return [];
        } catch (error) {
            // Ignore abort errors
            if (error.name === 'AbortError' || error.name === 'CanceledError') {
                return [];
            }
            console.error('Quick search error:', error);
            return [];
        }
    }, []);

    const updateQuery = useCallback((newQuery) => {
        setQuery(newQuery);
        setCurrentPage(1);
    }, []);

    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setCurrentPage(1);
    }, []);

    const clearFilters = useCallback(() => {
        setFilters({});
        setCurrentPage(1);
    }, []);

    const goToPage = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    const reset = useCallback(() => {
        setQuery('');
        setFilters({});
        setResults([]);
        setSuggestions([]);
        setError(null);
        setTotalResults(0);
        setCurrentPage(1);
        setHasSearched(false);
        
        // Cancel any pending requests
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        if (suggestionsTimeoutRef.current) {
            clearTimeout(suggestionsTimeoutRef.current);
        }
    }, []);

    // Navigate to search results page
    const navigateToResults = useCallback((searchQuery = query, searchFilters = filters) => {
        const params = new URLSearchParams({
            q: searchQuery,
            ...searchFilters
        });
        
        router.get(`/blog/search?${params}`);
    }, [query, filters]);

    return {
        // State
        query,
        filters,
        results,
        suggestions,
        popularSearches,
        searchHistory,
        isLoading,
        isSuggestionsLoading,
        error,
        totalResults,
        currentPage,
        hasSearched,

        // Actions
        updateQuery,
        updateFilters,
        clearFilters,
        goToPage,
        reset,
        performSearch,
        quickSearch,
        navigateToResults,
        addToSearchHistory,
        clearSearchHistory,
        loadPopularSearches,
    };
};
