import { z } from 'zod';
import { getCoinsMarketData, CryptoAPIError } from '../../services/cryptoApi';
import { GroqAPIError } from '../../services/groq';

// Map of common symbols to CoinGecko IDs
const SYMBOL_TO_ID_MAP: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'USDT': 'tether',
  'BNB': 'binancecoin',
  'SOL': 'solana',
  'XRP': 'ripple',
  'ADA': 'cardano',
  'DOGE': 'dogecoin',
  'AVAX': 'avalanche-2',
  'MATIC': 'matic-network',
  'LINK': 'chainlink',
  'UNI': 'uniswap',
  'ATOM': 'cosmos',
  'LTC': 'litecoin'
};

// Validation schema for market data tool arguments
const MarketDataArgsSchema = z.object({
  symbol: z.string(),
  metrics: z.array(z.enum([
    'price',
    'volume',
    'market_cap',
    'change_24h'
  ])).optional()
});

// Market data tool definition
export const marketDataTool = {
  type: 'function' as const,
  function: {
    name: 'get_market_data',
    description: 'Get current market data for a cryptocurrency',
    parameters: {
      type: 'object',
      required: ['symbol'],
      properties: {
        symbol: {
          type: 'string',
          description: 'The cryptocurrency symbol (e.g., BTC, ETH)'
        },
        metrics: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['price', 'volume', 'market_cap', 'change_24h']
          },
          description: 'The metrics to retrieve'
        }
      }
    }
  }
};

// Convert symbol to CoinGecko ID
const getTokenId = (symbol: string): string => {
  // Normalize symbol to uppercase
  const normalizedSymbol = symbol.toUpperCase();
  
  // Check if we have a direct mapping
  if (SYMBOL_TO_ID_MAP[normalizedSymbol]) {
    return SYMBOL_TO_ID_MAP[normalizedSymbol];
  }
  
  // If no mapping exists, convert to lowercase as a fallback
  return symbol.toLowerCase();
};

// Market data handler
export const handleMarketDataTool = async (args: unknown) => {
  try {
    // Validate the arguments with more robust error handling
    let validatedArgs;
    try {
      validatedArgs = MarketDataArgsSchema.parse(args);
    } catch (parseError) {
      console.error('Error parsing market data arguments:', parseError);
      return {
        error: true,
        message: 'Invalid arguments provided for market data tool',
        details: parseError instanceof Error ? parseError.message : String(parseError)
      };
    }

    const { symbol } = validatedArgs;
    
    if (!symbol) {
      return {
        error: true,
        message: 'Symbol is required for market data tool call'
      };
    }

    // Normalize symbol and get token ID
    const tokenId = getTokenId(symbol);
    
    try {
      // Direct API call with hardcoded key
      const options = {
        method: 'GET',
        headers: { 
          'accept': 'application/json', 
          'x-cg-pro-api-key': 'CG-qsva2ctaarLBpZ3KDqYmzu6p'
        }
      };
      
      const response = await fetch(`https://pro-api.coingecko.com/api/v3/coins/${tokenId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`, options);
      
      if (!response.ok) {
        console.error(`API Error: ${response.status} ${response.statusText}`);
        return {
          error: true,
          message: `No data found for ${symbol}. The API returned status ${response.status}.`,
          suggestions: [
            "This token may not exist or may not be listed on CoinGecko",
            "Double-check the token symbol for typos",
            "Try searching for the token by its full name",
            "Check if the token is listed on major exchanges"
          ]
        };
      }

      const data = await response.json();
      
      if (!data || !data.market_data) {
        console.log('Missing market data in API response for:', tokenId);
        return {
          error: true,
          message: `No market data found for ${symbol}. This may be a new or unlisted token.`,
          suggestions: [
            "This token may be too new or not yet listed on major exchanges",
            "Double-check the token symbol for typos",
            "Try searching for the token by its full name"
          ]
        };
      }

      // Return only the requested metrics or all metrics if none specified
      const metrics = validatedArgs.metrics || ['price', 'volume', 'market_cap', 'change_24h'];
      
      const response_data: Record<string, any> = {
        error: false,
        symbol: data.symbol ? data.symbol.toUpperCase() : symbol.toUpperCase(),
        name: data.name || symbol.toUpperCase()
      };

      // Add requested metrics with proper null handling
      metrics.forEach(metric => {
        switch (metric) {
          case 'price':
            response_data.price = data.market_data.current_price?.usd ?? null;
            break;
          case 'volume':
            response_data.volume = data.market_data.total_volume?.usd ?? null;
            break;
          case 'market_cap':
            response_data.market_cap = data.market_data.market_cap?.usd ?? null;
            break;
          case 'change_24h':
            response_data.change_24h = data.market_data.price_change_percentage_24h ?? null;
            break;
        }
      });

      // Add last updated timestamp
      response_data.last_updated = data.last_updated || new Date().toISOString();

      return response_data;
    } catch (error) {
      console.error('Error fetching market data:', error);
      return {
        error: true,
        message: `Failed to fetch market data for ${symbol}`,
        details: error instanceof Error ? error.message : String(error)
      };
    }
  } catch (error) {
    console.error('Unexpected error in market data tool:', error);
    return {
      error: true,
      message: 'An unexpected error occurred while processing market data request',
      details: error instanceof Error ? error.message : String(error)
    };
  }
};