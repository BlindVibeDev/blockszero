import React, { useState, useEffect, useRef } from 'react';
import Card from './Card';
import SolanaTokenSearch from './SolanaTokenSearch';
import ApiTest from './ApiTest';
import { CoinSearchResult, getCoinDetails, getTrendingCoins } from '../services/cryptoApi';
import { 
  Coins, 
  RefreshCw, 
  ExternalLink, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  Clock,
  DollarSign,
  Link,
  Zap,
  Copy,
  Globe,
  AlertTriangle,
  Check,
  Flame,
  History,
  Layers,
  BarChart2,
  Database,
  Info
} from 'lucide-react';
import { formatCurrency, formatLargeNumber, formatPercentage } from '../utils/chartUtils';

const SolanaExplorer: React.FC = () => {
  const [selectedToken, setSelectedToken] = useState<CoinSearchResult | null>(null);
  const [tokenDetails, setTokenDetails] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [trendingTokens, setTrendingTokens] = useState<any[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [searchHistory, setSearchHistory] = useState<CoinSearchResult[]>([]);
  const [showApiTest, setShowApiTest] = useState(false);
  const [marketDataExpanded, setMarketDataExpanded] = useState(true);
  
  // Load search history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('solana-search-history');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse search history:', e);
      }
    }
  }, []);
  
  // Fetch trending tokens on component mount
  useEffect(() => {
    const fetchTrendingTokens = async () => {
      setLoadingTrending(true);
      try {
        // Direct API call with hardcoded key
        const options = {
          method: 'GET',
          headers: { 
            'accept': 'application/json', 
            'x-cg-pro-api-key': 'CG-qsva2ctaarLBpZ3KDqYmzu6p'
          }
        };
        
        const response = await fetch('https://pro-api.coingecko.com/api/v3/search/trending', options);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Trending API response:", data);
        
        // Use all trending coins instead of just Solana tokens
        setTrendingTokens(data.coins.slice(0, 6));
      } catch (err) {
        console.error('Failed to fetch trending tokens:', err);
      } finally {
        setLoadingTrending(false);
      }
    };
    
    fetchTrendingTokens();
  }, []);
  
  const handleTokenSelect = async (token: CoinSearchResult) => {
    setSelectedToken(token);
    setIsLoading(true);
    setError(null);
    
    try {
      // Direct API call with hardcoded key
      const options = {
        method: 'GET',
        headers: { 
          'accept': 'application/json', 
          'x-cg-pro-api-key': 'CG-qsva2ctaarLBpZ3KDqYmzu6p'
        }
      };
      
      const response = await fetch(`https://pro-api.coingecko.com/api/v3/coins/${token.id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`, options);
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const details = await response.json();
      console.log("Token details:", details);
      setTokenDetails(details);
      
      // Add to search history
      addToSearchHistory(token);
    } catch (err) {
      console.error('Error fetching token details:', err);
      setError('Failed to load token details. Please try again later.');
      setTokenDetails(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const addToSearchHistory = (token: CoinSearchResult) => {
    // Check if token is already in history
    const tokenIndex = searchHistory.findIndex(item => item.id === token.id);
    
    let newHistory: CoinSearchResult[];
    
    if (tokenIndex >= 0) {
      // Remove the token from its current position
      newHistory = [
        token,
        ...searchHistory.slice(0, tokenIndex),
        ...searchHistory.slice(tokenIndex + 1)
      ];
    } else {
      // Add to the beginning of history, limit to 5 items
      newHistory = [token, ...searchHistory].slice(0, 5);
    }
    
    setSearchHistory(newHistory);
    
    // Save to localStorage
    localStorage.setItem('solana-search-history', JSON.stringify(newHistory));
  };
  
  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
      .then(() => {
        setCopySuccess(address);
        // Reset the success message after 2 seconds
        setTimeout(() => setCopySuccess(null), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy address:', err);
      });
  };

  // Helper function to determine if market cap data exists and is valid
  const hasMarketCapData = (data: any) => {
    return data && 
           data.market_data && 
           (data.market_data.market_cap?.usd !== undefined || 
            data.market_data.fully_diluted_valuation?.usd !== undefined);
  };

  // Helper function to format market cap with fallbacks to other metrics
  const getFormattedMarketCap = (data: any) => {
    if (!data || !data.market_data) return 'Not available';
    
    // Try to get market cap first
    if (data.market_data.market_cap?.usd) {
      return formatCurrency(data.market_data.market_cap.usd, 'USD', true);
    }
    
    // Fall back to fully diluted valuation
    if (data.market_data.fully_diluted_valuation?.usd) {
      return `${formatCurrency(data.market_data.fully_diluted_valuation.usd, 'USD', true)} (FDV)`;
    }
    
    // If we have circulating supply and current price, calculate it
    if (data.market_data.circulating_supply && data.market_data.current_price?.usd) {
      const calculatedMcap = data.market_data.circulating_supply * data.market_data.current_price.usd;
      return `${formatCurrency(calculatedMcap, 'USD', true)} (calculated)`;
    }
    
    return 'Not available';
  };

  return (
    <div className="space-y-4">
      {showApiTest && (
        <ApiTest />
      )}
      
      <Card title="Token Explorer" icon={<Coins size={14} />}>
        <div className="mb-4">
          <SolanaTokenSearch onSelectToken={handleTokenSelect} placeholder="Search for any token..." />
          
          <div className="mt-2 text-xs text-theme-text-secondary">
            Search for any token by name or symbol (e.g., Bitcoin, BTC, Ethereum, ETH)
          </div>
        </div>
        
        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center">
            <RefreshCw size={32} className="text-theme-accent animate-spin mb-3" />
            <p className="text-sm text-theme-text-secondary">Loading token details...</p>
          </div>
        )}
        
        {error && (
          <div className="py-8 flex flex-col items-center justify-center bg-theme-accent/5 rounded-lg border border-theme-accent/20">
            <AlertTriangle size={32} className="text-theme-accent mb-3" />
            <p className="text-sm text-theme-text-primary mb-1">{error}</p>
            <p className="text-xs text-theme-text-secondary">Please try searching for another token</p>
          </div>
        )}
        
        {!isLoading && !error && tokenDetails && (
          <div className="bg-theme-bg rounded-lg border border-theme-border overflow-hidden">
            {/* Token Header */}
            <div className="p-4 border-b border-theme-border">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center">
                  {tokenDetails.image?.small ? (
                    <img 
                      src={tokenDetails.image.small} 
                      alt={tokenDetails.name} 
                      className="w-10 h-10 rounded-full mr-3"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-theme-accent/20 rounded-full flex items-center justify-center mr-3">
                      <span className="text-theme-accent font-bold">
                        {tokenDetails.symbol?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  <div>
                    <h2 className="text-lg font-bold text-theme-text-primary flex items-center flex-wrap">
                      {tokenDetails.name}
                      {tokenDetails.market_data?.market_cap_rank && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-theme-accent/10 text-theme-accent rounded-full">
                          Rank #{tokenDetails.market_data.market_cap_rank}
                        </span>
                      )}
                    </h2>
                    <div className="flex items-center flex-wrap">
                      <span className="text-sm text-theme-text-secondary mr-3">
                        {tokenDetails.symbol?.toUpperCase()}
                      </span>
                      <div className="flex items-center space-x-2 flex-wrap">
                        {tokenDetails.platforms && Object.keys(tokenDetails.platforms).some(p => 
                          p.toLowerCase() === 'solana' || p.toLowerCase().includes('sol')
                        ) && (
                          <span className="text-xs bg-theme-accent/20 text-theme-accent px-1.5 py-0.5 rounded-full">
                            Solana
                          </span>
                        )}
                        {tokenDetails.links?.homepage?.[0] && (
                          <a 
                            href={tokenDetails.links.homepage[0]} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-theme-accent hover:text-theme-accent-dark"
                            title="Visit Website"
                          >
                            <Globe size={14} />
                          </a>
                        )}
                        <a 
                          href={`https://www.coingecko.com/en/coins/${tokenDetails.id}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-theme-accent hover:text-theme-accent-dark"
                          title="View on CoinGecko"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                
                {tokenDetails.market_data?.current_price?.usd && (
                  <div className="text-right">
                    <div className="text-xl font-bold text-theme-text-primary">
                      {formatCurrency(tokenDetails.market_data.current_price.usd)}
                    </div>
                    {tokenDetails.market_data.price_change_percentage_24h && (
                      <div className={`flex items-center justify-end text-sm ${
                        tokenDetails.market_data.price_change_percentage_24h >= 0 
                          ? 'text-green-500' 
                          : 'text-red-500'
                      }`}>
                        {tokenDetails.market_data.price_change_percentage_24h >= 0 ? (
                          <TrendingUp size={16} className="mr-1" />
                        ) : (
                          <TrendingDown size={16} className="mr-1" />
                        )}
                        {formatPercentage(tokenDetails.market_data.price_change_percentage_24h)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Market Stats Grid */}
            {tokenDetails.market_data && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border-b border-theme-border">
                {/* Market Cap Section */}
                <div>
                  <div className="text-xs text-theme-text-secondary mb-1 flex items-center">
                    <BarChart2 size={12} className="mr-1 text-theme-accent" />
                    Market Cap
                  </div>
                  <div className="text-sm font-medium text-theme-text-primary flex items-center">
                    {getFormattedMarketCap(tokenDetails)}
                    
                    {/* If market cap is not directly available but calculated */}
                    {!tokenDetails.market_data.market_cap?.usd && (
                      <button 
                        className="ml-1 text-theme-accent hover:text-theme-accent-dark" 
                        title="Market cap may be calculated from circulating supply and current price"
                      >
                        <Info size={12} />
                      </button>
                    )}
                  </div>
                  
                  {/* Fully Diluted Valuation (if different from market cap) */}
                  {tokenDetails.market_data.fully_diluted_valuation?.usd && 
                   tokenDetails.market_data.market_cap?.usd &&
                   tokenDetails.market_data.fully_diluted_valuation.usd !== tokenDetails.market_data.market_cap.usd && (
                    <div className="text-xs text-theme-text-secondary mt-1">
                      FDV: {formatCurrency(tokenDetails.market_data.fully_diluted_valuation.usd, 'USD', true)}
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="text-xs text-theme-text-secondary mb-1 flex items-center">
                    <Zap size={12} className="mr-1 text-theme-accent" />
                    24h Volume
                  </div>
                  <div className="text-sm font-medium text-theme-text-primary">
                    {tokenDetails.market_data.total_volume?.usd 
                      ? formatCurrency(tokenDetails.market_data.total_volume.usd, 'USD', true)
                      : 'Not available'
                    }
                  </div>
                  
                  {/* Volume to Market Cap Ratio */}
                  {tokenDetails.market_data.total_volume?.usd && tokenDetails.market_data.market_cap?.usd && (
                    <div className="text-xs text-theme-text-secondary mt-1">
                      Vol/MCap: {((tokenDetails.market_data.total_volume.usd / tokenDetails.market_data.market_cap.usd) * 100).toFixed(2)}%
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="text-xs text-theme-text-secondary mb-1 flex items-center">
                    <Layers size={12} className="mr-1 text-theme-accent" />
                    Supply
                  </div>
                  <div className="text-sm font-medium text-theme-text-primary">
                    {tokenDetails.market_data.circulating_supply 
                      ? formatLargeNumber(tokenDetails.market_data.circulating_supply)
                      : 'Not available'
                    }
                  </div>
                  
                  {/* Total Supply and Max Supply */}
                  <div className="flex space-x-3 text-xs text-theme-text-secondary mt-1">
                    {tokenDetails.market_data.total_supply && (
                      <span>Total: {formatLargeNumber(tokenDetails.market_data.total_supply)}</span>
                    )}
                    {tokenDetails.market_data.max_supply && (
                      <span>Max: {formatLargeNumber(tokenDetails.market_data.max_supply)}</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-theme-text-secondary mb-1 flex items-center">
                    <Clock size={12} className="mr-1 text-theme-accent" />
                    Last Updated
                  </div>
                  <div className="text-sm font-medium text-theme-text-primary">
                    {new Date(tokenDetails.last_updated).toLocaleString()}
                  </div>
                </div>
              </div>
            )}
            
            {/* Advanced Market Data (Expandable) */}
            {tokenDetails.market_data && (
              <div className="p-4 border-b border-theme-border">
                <button 
                  className="w-full flex items-center justify-between mb-2 text-theme-text-primary"
                  onClick={() => setMarketDataExpanded(!marketDataExpanded)}
                >
                  <div className="flex items-center text-sm font-medium">
                    <Database size={14} className="mr-2 text-theme-accent" />
                    Advanced Market Data
                  </div>
                  <div className={`transform transition-transform ${marketDataExpanded ? 'rotate-180' : ''}`}>
                    <TrendingDown size={16} className="text-theme-accent" />
                  </div>
                </button>
                
                {marketDataExpanded && (
                  <div className="bg-theme-accent/5 rounded-lg p-3 text-xs grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* ATH & ATL */}
                    <div>
                      <h4 className="font-medium text-theme-text-primary mb-2">All-Time Highs & Lows</h4>
                      <div className="space-y-2">
                        {tokenDetails.market_data.ath?.usd && (
                          <div className="flex justify-between items-center">
                            <span className="text-theme-text-secondary">All-Time High:</span>
                            <div className="text-right">
                              <div className="text-theme-text-primary">{formatCurrency(tokenDetails.market_data.ath.usd)}</div>
                              {tokenDetails.market_data.ath_date?.usd && (
                                <div className="text-[10px] text-theme-text-secondary">
                                  {new Date(tokenDetails.market_data.ath_date.usd).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {tokenDetails.market_data.atl?.usd && (
                          <div className="flex justify-between items-center">
                            <span className="text-theme-text-secondary">All-Time Low:</span>
                            <div className="text-right">
                              <div className="text-theme-text-primary">{formatCurrency(tokenDetails.market_data.atl.usd)}</div>
                              {tokenDetails.market_data.atl_date?.usd && (
                                <div className="text-[10px] text-theme-text-secondary">
                                  {new Date(tokenDetails.market_data.atl_date.usd).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {tokenDetails.market_data.ath_change_percentage?.usd && (
                          <div className="flex justify-between items-center">
                            <span className="text-theme-text-secondary">From ATH:</span>
                            <span className="text-red-500">
                              {formatPercentage(tokenDetails.market_data.ath_change_percentage.usd)}
                            </span>
                          </div>
                        )}
                        
                        {tokenDetails.market_data.atl_change_percentage?.usd && (
                          <div className="flex justify-between items-center">
                            <span className="text-theme-text-secondary">From ATL:</span>
                            <span className="text-green-500">
                              {formatPercentage(tokenDetails.market_data.atl_change_percentage.usd)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Market Cap & Supply Details */}
                    <div>
                      <h4 className="font-medium text-theme-text-primary mb-2">Market Cap & Supply Details</h4>
                      <div className="space-y-2">
                        {tokenDetails.market_data.market_cap?.usd && (
                          <div className="flex justify-between items-center">
                            <span className="text-theme-text-secondary">Market Cap:</span>
                            <span className="text-theme-text-primary">
                              {formatCurrency(tokenDetails.market_data.market_cap.usd, 'USD', true)}
                            </span>
                          </div>
                        )}
                        
                        {tokenDetails.market_data.fully_diluted_valuation?.usd && (
                          <div className="flex justify-between items-center">
                            <span className="text-theme-text-secondary">Fully Diluted Valuation:</span>
                            <span className="text-theme-text-primary">
                              {formatCurrency(tokenDetails.market_data.fully_diluted_valuation.usd, 'USD', true)}
                            </span>
                          </div>
                        )}
                        
                        {tokenDetails.market_data.circulating_supply && (
                          <div className="flex justify-between items-center">
                            <span className="text-theme-text-secondary">Circulating Supply:</span>
                            <span className="text-theme-text-primary">
                              {formatLargeNumber(tokenDetails.market_data.circulating_supply)}
                            </span>
                          </div>
                        )}
                        
                        {tokenDetails.market_data.total_supply && (
                          <div className="flex justify-between items-center">
                            <span className="text-theme-text-secondary">Total Supply:</span>
                            <span className="text-theme-text-primary">
                              {formatLargeNumber(tokenDetails.market_data.total_supply)}
                            </span>
                          </div>
                        )}
                        
                        {tokenDetails.market_data.max_supply && (
                          <div className="flex justify-between items-center">
                            <span className="text-theme-text-secondary">Max Supply:</span>
                            <span className="text-theme-text-primary">
                              {formatLargeNumber(tokenDetails.market_data.max_supply)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Price Change Percentages */}
            {tokenDetails.market_data?.price_change_percentage_7d && (
              <div className="p-4 border-b border-theme-border">
                <h3 className="text-sm font-medium text-theme-text-primary mb-3">Price Change</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {tokenDetails.market_data.price_change_percentage_24h && (
                    <div className="bg-theme-accent/10 p-2 rounded-lg">
                      <div className="text-xs text-theme-text-secondary mb-1">24h</div>
                      <div className={`flex items-center text-sm font-medium ${
                        tokenDetails.market_data.price_change_percentage_24h >= 0 
                          ? 'text-green-500' 
                          : 'text-red-500'
                      }`}>
                        {tokenDetails.market_data.price_change_percentage_24h >= 0 ? (
                          <TrendingUp size={14} className="mr-1" />
                        ) : (
                          <TrendingDown size={14} className="mr-1" />
                        )}
                        {formatPercentage(tokenDetails.market_data.price_change_percentage_24h)}
                      </div>
                    </div>
                  )}
                  
                  {tokenDetails.market_data.price_change_percentage_7d && (
                    <div className="bg-theme-accent/10 p-2 rounded-lg">
                      <div className="text-xs text-theme-text-secondary mb-1">7d</div>
                      <div className={`flex items-center text-sm font-medium ${
                        tokenDetails.market_data.price_change_percentage_7d >= 0 
                          ? 'text-green-500' 
                          : 'text-red-500'
                      }`}>
                        {tokenDetails.market_data.price_change_percentage_7d >= 0 ? (
                          <TrendingUp size={14} className="mr-1" />
                        ) : (
                          <TrendingDown size={14} className="mr-1" />
                        )}
                        {formatPercentage(tokenDetails.market_data.price_change_percentage_7d)}
                      </div>
                    </div>
                  )}
                  
                  {tokenDetails.market_data.price_change_percentage_30d && (
                    <div className="bg-theme-accent/10 p-2 rounded-lg">
                      <div className="text-xs text-theme-text-secondary mb-1">30d</div>
                      <div className={`flex items-center text-sm font-medium ${
                        tokenDetails.market_data.price_change_percentage_30d >= 0 
                          ? 'text-green-500' 
                          : 'text-red-500'
                      }`}>
                        {tokenDetails.market_data.price_change_percentage_30d >= 0 ? (
                          <TrendingUp size={14} className="mr-1" />
                        ) : (
                          <TrendingDown size={14} className="mr-1" />
                        )}
                        {formatPercentage(tokenDetails.market_data.price_change_percentage_30d)}
                      </div>
                    </div>
                  )}
                  
                  {tokenDetails.market_data.price_change_percentage_1y && (
                    <div className="bg-theme-accent/10 p-2 rounded-lg">
                      <div className="text-xs text-theme-text-secondary mb-1">1y</div>
                      <div className={`flex items-center text-sm font-medium ${
                        tokenDetails.market_data.price_change_percentage_1y >= 0 
                          ? 'text-green-500' 
                          : 'text-red-500'
                      }`}>
                        {tokenDetails.market_data.price_change_percentage_1y >= 0 ? (
                          <TrendingUp size={14} className="mr-1" />
                        ) : (
                          <TrendingDown size={14} className="mr-1" />
                        )}
                        {formatPercentage(tokenDetails.market_data.price_change_percentage_1y)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Token Contract Information */}
            {tokenDetails.platforms && Object.keys(tokenDetails.platforms).some(p => tokenDetails.platforms[p]) && (
              <div className="p-4 border-b border-theme-border">
                <h3 className="text-sm font-medium text-theme-text-primary mb-2 flex items-center">
                  <Link size={14} className="mr-1 text-theme-accent" />
                  Token Contract
                </h3>
                
                {Object.entries(tokenDetails.platforms).map(([platform, address]) => {
                  if (platform && address) {
                    return (
                      <div key={platform} className="bg-theme-accent/10 p-3 rounded-lg mb-2 last:mb-0">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center flex-wrap gap-2">
                            <span className="text-xs font-medium text-theme-accent bg-theme-accent/20 px-2 py-0.5 rounded">
                              {platform}
                            </span>
                            <span className="text-xs text-theme-text-secondary truncate max-w-xs">
                              {address as string}
                            </span>
                          </div>
                          <button
                            onClick={() => handleCopyAddress(address as string)}
                            className={`p-1 rounded-md ${copySuccess === address ? 'bg-theme-accent/20' : ''} text-theme-accent hover:text-theme-accent-dark hover:bg-theme-accent/10`}
                            title="Copy address"
                          >
                            {copySuccess === address ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                        
                        {copySuccess === address && (
                          <div className="mt-1 text-xs text-theme-accent flex items-center">
                            <Check size={12} className="mr-1" />
                            Address copied to clipboard
                          </div>
                        )}
                        
                        <div className="mt-2 text-xs">
                          {platform.toLowerCase() === 'solana' || platform.toLowerCase().includes('sol') ? (
                            <a
                              href={`https://solscan.io/token/${address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-theme-accent hover:text-theme-accent-dark flex items-center"
                            >
                              <ExternalLink size={12} className="mr-1" />
                              View on Solscan
                            </a>
                          ) : platform.toLowerCase() === 'ethereum' ? (
                            <a
                              href={`https://etherscan.io/token/${address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-theme-accent hover:text-theme-accent-dark flex items-center"
                            >
                              <ExternalLink size={12} className="mr-1" />
                              View on Etherscan
                            </a>
                          ) : (
                            <a
                              href={`https://www.coingecko.com/en/coins/${tokenDetails.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-theme-accent hover:text-theme-accent-dark flex items-center"
                            >
                              <ExternalLink size={12} className="mr-1" />
                              View on CoinGecko
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            )}
            
            {/* Token Description */}
            {tokenDetails.description?.en && (
              <div className="p-4">
                <h3 className="text-sm font-medium text-theme-text-primary mb-2">About {tokenDetails.name}</h3>
                <div 
                  className="text-xs text-theme-text-secondary prose prose-sm max-w-none scrollbar-thin"
                  style={{ maxHeight: '200px', overflow: 'auto' }}
                  dangerouslySetInnerHTML={{ 
                    __html: tokenDetails.description.en.substring(0, 500) + 
                            (tokenDetails.description.en.length > 500 ? '...' : '')
                  }}
                />
                
                {tokenDetails.description.en.length > 500 && (
                  <a 
                    href={`https://www.coingecko.com/en/coins/${tokenDetails.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-xs text-theme-accent hover:text-theme-accent-dark inline-flex items-center"
                  >
                    Read more
                    <ExternalLink size={12} className="ml-1" />
                  </a>
                )}
              </div>
            )}
          </div>
        )}
        
        {!isLoading && !error && !tokenDetails && !selectedToken && (
          <div>
            {/* Recent searches section */}
            {searchHistory.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-theme-text-primary mb-3 flex items-center">
                  <History size={16} className="mr-2 text-theme-accent" />
                  Recent Searches
                </h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {searchHistory.map((token) => (
                    <div 
                      key={token.id}
                      className="bg-theme-bg border border-theme-border rounded-lg p-3 hover:bg-theme-accent/5 transition-colors cursor-pointer flex flex-col items-center text-center"
                      onClick={() => handleTokenSelect(token)}
                    >
                      {token.thumb ? (
                        <img src={token.thumb} alt={token.name} className="w-10 h-10 rounded-full mb-2" />
                      ) : (
                        <div className="w-10 h-10 bg-theme-accent/20 rounded-full flex items-center justify-center mb-2">
                          <span className="text-sm font-bold text-theme-accent">
                            {token.symbol.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <h4 className="text-xs font-medium text-theme-text-primary">{token.name}</h4>
                      <span className="text-[10px] text-theme-text-secondary">{token.symbol.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Empty state with instructions */}
            <div className="py-12 flex flex-col items-center justify-center bg-theme-accent/5 rounded-lg">
              <Coins size={48} className="text-theme-accent mb-4" />
              <h3 className="text-lg font-medium text-theme-text-primary mb-2">Explore Tokens</h3>
              <p className="text-sm text-theme-text-secondary text-center max-w-md mb-4">
                Search for any token to view detailed information including price, 
                market stats, contract address, and more.
              </p>
              <div className="text-xs text-theme-accent bg-theme-accent/10 px-3 py-1.5 rounded-full">
                Start by entering a token name or symbol above
              </div>
            </div>
            
            {/* Trending tokens section */}
            {trendingTokens.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-theme-text-primary mb-3 flex items-center">
                  <Flame size={16} className="mr-2 text-theme-accent" />
                  Trending Tokens
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {trendingTokens.map((trend: any) => (
                    <div 
                      key={trend.item.id}
                      className="bg-theme-bg border border-theme-border rounded-lg p-3 hover:bg-theme-accent/5 transition-colors cursor-pointer"
                      onClick={() => handleTokenSelect({
                        id: trend.item.id,
                        name: trend.item.name,
                        symbol: trend.item.symbol,
                        api_symbol: trend.item.symbol,
                        market_cap_rank: trend.item.market_cap_rank,
                        thumb: trend.item.thumb,
                        large: trend.item.large,
                        platforms: trend.item.platforms || {}
                      })}
                    >
                      <div className="flex items-center">
                        {trend.item.thumb ? (
                          <img src={trend.item.thumb} alt={trend.item.name} className="w-8 h-8 rounded-full mr-3" />
                        ) : (
                          <div className="w-8 h-8 bg-theme-accent/20 rounded-full flex items-center justify-center mr-3">
                            <span className="text-xs font-bold text-theme-accent">
                              {trend.item.symbol.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        
                        <div>
                          <h4 className="text-sm font-medium text-theme-text-primary">{trend.item.name}</h4>
                          <div className="flex items-center">
                            <span className="text-xs text-theme-text-secondary mr-2">{trend.item.symbol.toUpperCase()}</span>
                            {trend.item.market_cap_rank && (
                              <span className="text-[10px] bg-theme-accent/10 text-theme-accent px-1.5 py-0.5 rounded-full">
                                #{trend.item.market_cap_rank}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {trend.item.data?.price_change_percentage_24h?.usd && (
                        <div className={`mt-2 text-xs ${
                          trend.item.data.price_change_percentage_24h.usd >= 0 
                            ? 'text-green-500' 
                            : 'text-red-500'
                        } flex items-center`}>
                          {trend.item.data.price_change_percentage_24h.usd >= 0 ? (
                            <TrendingUp size={12} className="mr-1" />
                          ) : (
                            <TrendingDown size={12} className="mr-1" />
                          )}
                          {formatPercentage(trend.item.data.price_change_percentage_24h.usd)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default SolanaExplorer;