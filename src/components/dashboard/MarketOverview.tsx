import React from 'react';
import { useCrypto } from '../../context/CryptoContext';
import { useToken } from '../../context/TokenContext';
import { formatCurrency, formatPercentage } from '../../utils/chartUtils';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MarketOverview: React.FC = () => {
  const { globalData, isLoading, error } = useCrypto();
  const { tokenDetails } = useToken();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-theme-accent"></div>
      </div>
    );
  }

  if (error || (!globalData && !tokenDetails)) {
    return (
      <div className="text-red-500 p-4 text-sm">
        Error loading market data. Please try again later.
      </div>
    );
  }

  // If we have token details, show token-specific overview
  if (tokenDetails && tokenDetails.market_data) {
    const marketData = tokenDetails.market_data;
    
    return (
      <div className="h-full flex flex-col space-y-4">
        {/* Token Market Sentiment Bar */}
        <div className="bg-theme-accent/10 p-3 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-theme-text-primary">Token Market Sentiment</span>
            <span className="text-sm font-medium text-theme-accent">
              Rank #{marketData.market_cap_rank || 'N/A'}
            </span>
          </div>
          <div className="h-2 bg-theme-accent/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-theme-accent to-theme-accent-dark rounded-full transition-all duration-300"
              style={{ width: `${Math.max(0, Math.min(100, 50 + (marketData.price_change_percentage_24h || 0)))}%` }}
            ></div>
          </div>
        </div>

        {/* Token Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-theme-accent/10 p-3 rounded-lg">
            <div className="text-xs text-theme-accent mb-1">Current Price</div>
            <div className="text-sm font-semibold text-theme-text-primary">
              {formatCurrency(marketData.current_price?.usd)}
            </div>
            <div className={`flex items-center text-xs ${marketData.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {marketData.price_change_percentage_24h >= 0 ? (
                <TrendingUp size={12} className="mr-1" />
              ) : (
                <TrendingDown size={12} className="mr-1" />
              )}
              {formatPercentage(marketData.price_change_percentage_24h)}
            </div>
          </div>

          <div className="bg-theme-accent/10 p-3 rounded-lg">
            <div className="text-xs text-theme-accent mb-1">24h Volume</div>
            <div className="text-sm font-semibold text-theme-text-primary">
              {formatCurrency(marketData.total_volume?.usd)}
            </div>
            <div className="text-xs text-theme-accent">
              {marketData.total_volume?.usd && marketData.market_cap?.usd
                ? `${((marketData.total_volume.usd / marketData.market_cap.usd) * 100).toFixed(2)}% of MCap`
                : 'N/A'
              }
            </div>
          </div>

          <div className="bg-theme-accent/10 p-3 rounded-lg">
            <div className="text-xs text-theme-accent mb-1">Market Cap</div>
            <div className="text-sm font-semibold text-theme-text-primary">
              {formatCurrency(marketData.market_cap?.usd)}
            </div>
            <div className={`flex items-center text-xs ${marketData.market_cap_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {marketData.market_cap_change_percentage_24h >= 0 ? (
                <TrendingUp size={12} className="mr-1" />
              ) : (
                <TrendingDown size={12} className="mr-1" />
              )}
              {formatPercentage(marketData.market_cap_change_percentage_24h)}
            </div>
          </div>

          <div className="bg-theme-accent/10 p-3 rounded-lg">
            <div className="text-xs text-theme-accent mb-1">Circulating Supply</div>
            <div className="text-sm font-semibold text-theme-text-primary">
              {marketData.circulating_supply
                ? `${Number(marketData.circulating_supply).toLocaleString()} ${tokenDetails.symbol?.toUpperCase()}`
                : 'N/A'
              }
            </div>
            {marketData.max_supply && (
              <div className="text-xs text-theme-accent">
                {((marketData.circulating_supply / marketData.max_supply) * 100).toFixed(2)}% of Max Supply
              </div>
            )}
          </div>
        </div>

        {/* Price Changes Table */}
        <div className="flex-1 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-theme-accent">
                <th className="pb-2 font-medium">Timeframe</th>
                <th className="pb-2 font-medium text-right">Price Change</th>
                <th className="pb-2 font-medium text-right">Price</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {[
                { label: '1h', change: marketData.price_change_percentage_1h_in_currency?.usd },
                { label: '24h', change: marketData.price_change_percentage_24h },
                { label: '7d', change: marketData.price_change_percentage_7d },
                { label: '30d', change: marketData.price_change_percentage_30d },
                { label: '1y', change: marketData.price_change_percentage_1y }
              ].map((period, index) => (
                period.change !== undefined && (
                  <tr key={period.label} className="border-t border-theme-border">
                    <td className="py-2 font-medium text-theme-text-primary">
                      {period.label}
                    </td>
                    <td className={`py-2 text-right ${period.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatPercentage(period.change)}
                    </td>
                    <td className="py-2 text-right text-theme-text-secondary">
                      {formatCurrency(marketData.current_price?.usd * (1 + period.change/100))}
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Otherwise show global market overview
  const totalMarketCap = globalData.total_market_cap.usd;
  const totalVolume = globalData.total_volume.usd;
  const btcDominance = globalData.market_cap_percentage.btc;
  const ethDominance = globalData.market_cap_percentage.eth;
  const marketCapChange = globalData.market_cap_change_percentage_24h_usd;

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Market Sentiment Bar */}
      <div className="bg-theme-accent/10 p-3 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-theme-text-primary">Market Sentiment</span>
          <span className="text-sm font-medium text-theme-accent">{btcDominance.toFixed(2)}% BTC Dom.</span>
        </div>
        <div className="h-2 bg-theme-accent/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-theme-accent to-theme-accent-dark rounded-full transition-all duration-300"
            style={{ width: `${btcDominance}%` }}
          ></div>
        </div>
      </div>

      {/* Market Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-theme-accent/10 p-3 rounded-lg">
          <div className="text-xs text-theme-accent mb-1">Total Market Cap</div>
          <div className="text-sm font-semibold text-theme-text-primary">{formatCurrency(totalMarketCap)}</div>
          <div className={`flex items-center text-xs ${marketCapChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatPercentage(marketCapChange)}
          </div>
        </div>

        <div className="bg-theme-accent/10 p-3 rounded-lg">
          <div className="text-xs text-theme-accent mb-1">24h Volume</div>
          <div className="text-sm font-semibold text-theme-text-primary">{formatCurrency(totalVolume)}</div>
          <div className="text-xs text-theme-accent">
            {((totalVolume / totalMarketCap) * 100).toFixed(2)}% of MCap
          </div>
        </div>

        <div className="bg-theme-accent/10 p-3 rounded-lg">
          <div className="text-xs text-theme-accent mb-1">BTC Dominance</div>
          <div className="text-sm font-semibold text-theme-text-primary">{btcDominance.toFixed(2)}%</div>
          <div className="w-full h-1.5 bg-theme-accent/20 rounded-full overflow-hidden mt-1">
            <div 
              className="h-full bg-theme-accent rounded-full" 
              style={{ width: `${btcDominance}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-theme-accent/10 p-3 rounded-lg">
          <div className="text-xs text-theme-accent mb-1">ETH Dominance</div>
          <div className="text-sm font-semibold text-theme-text-primary">{ethDominance.toFixed(2)}%</div>
          <div className="w-full h-1.5 bg-theme-accent/20 rounded-full overflow-hidden mt-1">
            <div 
              className="h-full bg-theme-accent rounded-full" 
              style={{ width: `${ethDominance}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Market Table */}
      <div className="flex-1 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs text-theme-accent">
              <th className="pb-2 font-medium">Asset</th>
              <th className="pb-2 font-medium text-right">Price</th>
              <th className="pb-2 font-medium text-right">24h Change</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {Object.entries(globalData.market_cap_percentage)
              .slice(0, 5)
              .map(([symbol, percentage]) => {
                const price = totalMarketCap * (percentage / 100);
                return (
                  <tr key={symbol} className="border-t border-theme-border">
                    <td className="py-2">
                      <div className="font-medium text-theme-text-primary">{symbol.toUpperCase()}</div>
                    </td>
                    <td className="py-2 text-right text-theme-text-secondary">
                      {formatCurrency(price)}
                    </td>
                    <td className={`py-2 text-right ${marketCapChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatPercentage(marketCapChange)}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarketOverview;