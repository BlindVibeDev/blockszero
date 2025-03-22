import React, { useState, useEffect, useRef } from 'react';
import { searchSolanaTokens, CoinSearchResult } from '../services/cryptoApi';
import { 
  Search, 
  Loader2, 
  ExternalLink, 
  X, 
  AlertCircle,
  Coins,
  CheckCircle,
  AlertOctagon,
  ChevronRight
} from 'lucide-react';

interface SolanaTokenSearchProps {
  onSelectToken?: (token: CoinSearchResult) => void;
  className?: string;
  placeholder?: string;
}

const SolanaTokenSearch: React.FC<SolanaTokenSearchProps> = ({ 
  onSelectToken,
  className = '',
  placeholder = 'Search Solana tokens...'
}) => {
  const [query, setQuery] = useState('');
  const [displayQuery, setDisplayQuery] = useState(''); // Separate state for displaying selected token
  const [results, setResults] = useState<CoinSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // New state to track typing
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [selectedToken, setSelectedToken] = useState<CoinSearchResult | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [showFullResults, setShowFullResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const queryChangeTimeout = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [lastSearchedQuery, setLastSearchedQuery] = useState('');

  // Handle clicks outside of the search component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Clear the search timeout when component unmounts
  useEffect(() => {
    return () => {
      if (queryChangeTimeout.current) {
        clearTimeout(queryChangeTimeout.current);
      }
    };
  }, []);

  const handleSearch = async () => {
    if (!query || query.length < 2) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setRateLimited(false);
    setIsTyping(false);
    setLastSearchedQuery(query);

    try {
      // Direct API call using the provided API key
      const options = {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'x-cg-pro-api-key': 'CG-qsva2ctaarLBpZ3KDqYmzu6p'
        }
      };
      
      console.log(`Searching for: "${query}"`); // Log the search term
      const response = await fetch(`https://pro-api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`, options);
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Raw search results:", data);
      
      // Use all coins if no platforms data is available
      const allCoins = data.coins.map((coin: any) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        api_symbol: coin.symbol,
        market_cap_rank: coin.market_cap_rank,
        thumb: coin.thumb,
        large: coin.large,
        platforms: coin.platforms || {}
      }));
      
      setResults(allCoins);
      
      if (allCoins.length === 0) {
        setError(`No tokens found matching "${query}"`);
      }
    } catch (err: any) {
      console.error('Error searching Solana tokens:', err);
      
      if (err.message && err.message.includes('429')) {
        setRateLimited(true);
        setError('API rate limit exceeded. Please try again in a moment.');
      } else {
        setError('Failed to search tokens. Please try again later.');
      }
      
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Separate function to handle debounced search
  const debouncedSearch = (searchValue: string) => {
    // Clear previous timeout
    if (queryChangeTimeout.current) {
      clearTimeout(queryChangeTimeout.current);
    }
    
    // Set a new timeout
    queryChangeTimeout.current = setTimeout(() => {
      // Only search if the value hasn't changed since timeout was set
      if (searchValue === query) {
        handleSearch();
      }
    }, 500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (selectedToken && value !== displayQuery) {
      // User is typing a new search after selecting a token
      setSelectedToken(null);
      setDisplayQuery('');
    }
    
    setQuery(value);
    setIsTyping(true);
    setShowFullResults(false);
    
    // Only search if input has at least 2 characters
    if (value.length >= 2) {
      // Show results if they were previously hidden
      setShowResults(true);
      // Trigger debounced search
      debouncedSearch(value);
    } else {
      setResults([]);
      setError(null);
      setRateLimited(false);
      setShowResults(false);
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  const handleInputFocus = () => {
    if (selectedToken) {
      // When focusing on input with a selected token, show the original query
      setQuery(query);
      inputRef.current?.select();
    } else if (query.length >= 2 && (results.length > 0 || error)) {
      setShowResults(true);
    }
  };

  const handleTokenSelect = (token: CoinSearchResult) => {
    setSelectedToken(token);
    setShowResults(false);
    setDisplayQuery(`${token.name} (${token.symbol.toUpperCase()})`);
    
    if (onSelectToken) {
      onSelectToken(token);
    }
  };

  const handleClearSearch = () => {
    setQuery('');
    setDisplayQuery('');
    setResults([]);
    setSelectedToken(null);
    setError(null);
    setRateLimited(false);
    setShowFullResults(false);
    setIsTyping(false);
    setIsLoading(false);
    
    // Focus the input after clearing
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  // Trigger an immediate search when Enter key is pressed
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.length >= 2) {
      if (queryChangeTimeout.current) {
        clearTimeout(queryChangeTimeout.current);
      }
      handleSearch();
    }
  };

  // Filter visible results - show all if showFullResults is true, otherwise limit to 5
  const visibleResults = showFullResults ? results : results.slice(0, 5);

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Coins size={16} className="text-theme-accent" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={selectedToken && !isTyping ? displayQuery : query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-10 py-2.5 text-sm bg-theme-bg border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent text-theme-text-primary"
          placeholder={placeholder}
          aria-label="Search for Solana tokens"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {isLoading ? (
            <Loader2 size={16} className="text-theme-accent animate-spin" />
          ) : isTyping ? (
            <div className="text-theme-text-secondary text-xs italic">Typing...</div>
          ) : query ? (
            <button 
              onClick={handleClearSearch}
              className="text-theme-text-secondary hover:text-theme-text-primary focus:outline-none"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          ) : (
            <Search size={16} className="text-theme-text-secondary" />
          )}
        </div>
      </div>

      {query && (
        <div className="mt-1 text-xs text-theme-text-secondary">
          {lastSearchedQuery && <span>Last search: "<span className="font-medium">{lastSearchedQuery}</span>"</span>}
        </div>
      )}
      
      {showResults && (results.length > 0 || error) && (
        <div className="absolute mt-1 w-full bg-theme-bg border border-theme-border rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto scrollbar-thin">
          {error ? (
            <div className="p-3 text-center">
              {rateLimited ? (
                <>
                  <AlertOctagon size={20} className="mx-auto mb-2 text-theme-accent" />
                  <p className="text-sm text-theme-text-primary mb-2">{error}</p>
                  <p className="text-xs text-theme-text-secondary">
                    The CoinGecko API has rate limits. Try again in a few moments.
                  </p>
                </>
              ) : (
                <>
                  <AlertCircle size={20} className="mx-auto mb-2 text-theme-accent" />
                  <p className="text-sm text-theme-text-secondary">{error}</p>
                </>
              )}
            </div>
          ) : (
            <>
              <ul className="divide-y divide-theme-border">
                {visibleResults.map((token) => (
                  <li 
                    key={token.id}
                    className={`p-3 hover:bg-theme-accent/10 cursor-pointer ${
                      selectedToken?.id === token.id ? 'bg-theme-accent/20' : ''
                    }`}
                    onClick={() => handleTokenSelect(token)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-3">
                        {token.thumb ? (
                          <img src={token.thumb} alt={token.name} className="w-6 h-6 rounded-full" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-theme-accent/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-theme-accent">
                              {token.symbol.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-theme-text-primary truncate">
                            {token.name}
                          </p>
                          {selectedToken?.id === token.id && (
                            <CheckCircle size={14} className="text-theme-accent ml-2" />
                          )}
                        </div>
                        <div className="flex items-center">
                          <p className="text-xs text-theme-text-secondary truncate mr-2">
                            {token.symbol.toUpperCase()}
                          </p>
                          {Object.keys(token.platforms || {}).some(p => 
                            p.toLowerCase() === 'solana' || p.toLowerCase().includes('sol')
                          ) && (
                            <p className="text-xs text-theme-accent bg-theme-accent/10 px-1.5 py-0.5 rounded-full">
                              Solana
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              
              {results.length > 5 && !showFullResults && (
                <div 
                  className="p-2 border-t border-theme-border text-center cursor-pointer hover:bg-theme-accent/5"
                  onClick={() => setShowFullResults(true)}
                >
                  <span className="text-xs text-theme-accent flex items-center justify-center">
                    Show all {results.length} results
                    <ChevronRight size={14} className="ml-1 transform rotate-90" />
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      {selectedToken && (
        <div className="mt-2 p-3 bg-theme-accent/10 rounded-lg border border-theme-accent/20">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              {selectedToken.thumb ? (
                <img src={selectedToken.thumb} alt={selectedToken.name} className="w-8 h-8 rounded-full mr-3" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-theme-accent/20 flex items-center justify-center mr-3">
                  <span className="text-sm font-bold text-theme-accent">
                    {selectedToken.symbol.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium text-theme-text-primary">{selectedToken.name}</h3>
                <div className="flex items-center">
                  <span className="text-xs text-theme-text-secondary mr-2">
                    {selectedToken.symbol.toUpperCase()}
                  </span>
                  <span className="text-[10px] bg-theme-accent/20 text-theme-accent px-1.5 py-0.5 rounded-full">
                    {Object.keys(selectedToken.platforms || {}).some(p => 
                      p.toLowerCase() === 'solana' || p.toLowerCase().includes('sol')
                    ) ? 'Solana Token' : 'Token'}
                  </span>
                </div>
              </div>
            </div>
            <a 
              href={`https://www.coingecko.com/en/coins/${selectedToken.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-theme-accent hover:text-theme-accent-dark"
              title="View on CoinGecko"
            >
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolanaTokenSearch;