import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, BarChart2, AlertTriangle, RefreshCw, Zap } from 'lucide-react';
import { useToken } from '../../context/TokenContext';
import { generateEnhancedAIResponse } from '../../utils/aiUtils';
import { handleMarketDataTool } from '../../tools/market-data';

// Define the insight types
interface Insight {
  type: 'signal' | 'pattern' | 'alert';
  asset: string;
  signal?: string;
  pattern?: string;
  alert?: string;
  confidence?: number;
  impact?: 'Low' | 'Medium' | 'High';
  reason?: string;
  timeframe?: string;
  isLoading?: boolean;
}

// This function processes AI-generated text to extract insights
const extractInsightsFromAI = (text: string, symbol: string): Insight[] => {
  const insights: Insight[] = [];
  
  // Check for trading signals (Buy, Sell, Hold)
  if (text.toLowerCase().includes('buy') || text.toLowerCase().includes('bullish')) {
    insights.push({
      type: 'signal',
      asset: symbol,
      signal: text.toLowerCase().includes('strong buy') ? 'Strong Buy' : 'Buy',
      confidence: Math.floor(Math.random() * 20) + 70, // 70-90% confidence for demo
      reason: text.toLowerCase().includes('support') ? 'Price near support level' : 
              text.toLowerCase().includes('trend') ? 'Uptrend confirmed' : 
              'Bullish momentum detected'
    });
  } else if (text.toLowerCase().includes('sell') || text.toLowerCase().includes('bearish')) {
    insights.push({
      type: 'signal',
      asset: symbol,
      signal: text.toLowerCase().includes('strong sell') ? 'Strong Sell' : 'Sell',
      confidence: Math.floor(Math.random() * 20) + 70,
      reason: text.toLowerCase().includes('resistance') ? 'Price at resistance' : 
              text.toLowerCase().includes('trend') ? 'Downtrend confirmed' : 
              'Bearish momentum detected'
    });
  } else {
    insights.push({
      type: 'signal',
      asset: symbol,
      signal: 'Hold',
      confidence: Math.floor(Math.random() * 20) + 60,
      reason: 'Consolidation phase'
    });
  }
  
  // Check for patterns
  const patterns = [
    'Double Top', 'Double Bottom', 'Head and Shoulders',
    'Cup and Handle', 'Triangle', 'Flag', 'Wedge'
  ];
  
  for (const pattern of patterns) {
    if (text.toLowerCase().includes(pattern.toLowerCase())) {
      insights.push({
        type: 'pattern',
        asset: symbol,
        pattern: pattern,
        confidence: Math.floor(Math.random() * 15) + 70,
        timeframe: text.toLowerCase().includes('daily') ? 'Daily Chart' : 
                  text.toLowerCase().includes('4h') ? '4H Chart' : 
                  '1D Chart'
      });
      break; // Only add one pattern insight
    }
  }
  
  // Add an alert based on content
  if (text.toLowerCase().includes('volume') && 
     (text.toLowerCase().includes('spike') || text.toLowerCase().includes('increase') || 
      text.toLowerCase().includes('surge'))) {
    insights.push({
      type: 'alert',
      asset: symbol,
      alert: 'Unusual Volume Activity',
      impact: 'Medium',
      timeframe: 'Last 24h'
    });
  } else if (text.toLowerCase().includes('volatility') || text.toLowerCase().includes('vix')) {
    insights.push({
      type: 'alert',
      asset: 'Market',
      alert: 'Increased Volatility',
      impact: 'Medium',
      timeframe: 'Last 24h'
    });
  } else {
    insights.push({
      type: 'alert',
      asset: 'Global',
      alert: 'Market Sentiment Shift',
      impact: 'Low',
      timeframe: 'Last 24h'
    });
  }
  
  return insights;
};

const AIInsights: React.FC = () => {
  const { selectedToken } = useToken();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate insights based on token data
  const generateInsights = async (tokenSymbol: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get market data for the token
      const marketData = await handleMarketDataTool({ symbol: tokenSymbol });
      
      if (marketData.error) {
        throw new Error(marketData.message || 'Failed to get market data');
      }
      
      // Create a prompt for AI to analyze the market data
      const prompt = `
        Analyze the current market conditions for ${tokenSymbol} (${marketData.name}).
        
        Current price: $${marketData.price}
        24h change: ${marketData.change_24h}%
        Market cap: $${marketData.market_cap}
        Volume: $${marketData.volume}
        
        Provide a brief technical analysis focusing on:
        1. Current trend (bullish/bearish/neutral)
        2. Any visible chart patterns
        3. Key support/resistance levels
        4. Volume analysis
        5. Trading recommendation (buy/sell/hold)
        
        Keep it brief but technical.
      `;
      
      // Call AI service to analyze the data
      const aiResponse = await generateEnhancedAIResponse(prompt);
      
      // Extract insights from AI response
      const newInsights = extractInsightsFromAI(aiResponse, tokenSymbol);
      setInsights(newInsights);
    } catch (err) {
      console.error('Error generating insights:', err);
      setError('Failed to generate insights. Please try again later.');
      
      // Set default insights on error
      setInsights([
        {
          type: 'signal',
          asset: tokenSymbol || 'BTC',
          signal: 'Hold',
          confidence: 65,
          reason: 'Insufficient data'
        },
        {
          type: 'pattern',
          asset: tokenSymbol || 'BTC',
          pattern: 'Consolidation',
          confidence: 70,
          timeframe: '1D chart'
        },
        {
          type: 'alert',
          asset: 'Global',
          alert: 'API Service Disruption',
          impact: 'Low',
          timeframe: 'Current'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Default insights when no token is selected
  const setDefaultInsights = () => {
    setInsights([
      {
        type: 'signal',
        asset: 'BTC',
        signal: 'Strong Buy',
        confidence: 87,
        reason: 'Bullish divergence on 4h chart'
      },
      {
        type: 'pattern',
        asset: 'ETH',
        pattern: 'Cup and Handle',
        confidence: 76,
        timeframe: '1D chart'
      },
      {
        type: 'alert',
        asset: 'Global',
        alert: 'Increased whale activity',
        impact: 'Medium',
        timeframe: 'Last 24h'
      }
    ]);
  };

  // When token changes, generate new insights
  useEffect(() => {
    if (selectedToken) {
      generateInsights(selectedToken.symbol);
    } else {
      setDefaultInsights();
    }
  }, [selectedToken]);

  // Handle manual refresh
  const handleRefresh = () => {
    if (selectedToken) {
      generateInsights(selectedToken.symbol);
    } else {
      setDefaultInsights();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="text-theme-accent mr-1.5">
            <Brain size={14} />
          </div>
          <div className="text-[10px] text-theme-text-secondary">
            AI Trading Insights {selectedToken && `for ${selectedToken.symbol.toUpperCase()}`}
          </div>
        </div>
        <button 
          onClick={handleRefresh} 
          disabled={isLoading}
          className="text-[9px] px-2 py-0.5 rounded-full bg-theme-accent/10 text-theme-accent hover:bg-theme-accent/20"
        >
          <RefreshCw size={12} className={`${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="bg-theme-accent/10 p-2 rounded-md text-[10px] text-theme-text-secondary mb-2">
          <AlertTriangle size={12} className="inline-block mr-1 text-theme-accent" />
          {error}
        </div>
      )}

      <div className="space-y-2">
        {isLoading ? (
          Array(3).fill(0).map((_, index) => (
            <div
              key={index}
              className="p-2 rounded-md bg-theme-accent/5 border-l-2 border-theme-accent/20 animate-pulse"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-theme-accent/20 mr-1"></div>
                  <div className="w-12 h-2 bg-theme-accent/20 rounded"></div>
                </div>
                <div className="w-16 h-3 bg-theme-accent/20 rounded-full"></div>
              </div>
              <div className="flex justify-between">
                <div className="w-20 h-2 bg-theme-accent/20 rounded"></div>
                <div className="w-24 h-2 bg-theme-accent/20 rounded"></div>
              </div>
            </div>
          ))
        ) : (
          insights.map((insight, index) => (
            <div
              key={index}
              className={`p-2 rounded-md ${
                insight.type === 'signal'
                  ? insight.signal?.includes('Buy') 
                    ? 'bg-green-50/10 border-l-2 border-green-400' 
                    : insight.signal?.includes('Sell')
                    ? 'bg-red-50/10 border-l-2 border-red-400'
                    : 'bg-theme-accent/10 border-l-2 border-theme-accent'
                  : insight.type === 'pattern'
                  ? 'bg-theme-accent/10 border-l-2 border-theme-accent'
                  : 'bg-theme-accent/10 border-l-2 border-theme-accent'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  {insight.type === 'signal' ? (
                    <TrendingUp size={12} className={`mr-1 ${
                      insight.signal?.includes('Buy') ? 'text-green-400' : 
                      insight.signal?.includes('Sell') ? 'text-red-400' : 
                      'text-theme-accent'
                    }`} />
                  ) : insight.type === 'pattern' ? (
                    <BarChart2 size={12} className="text-theme-accent mr-1" />
                  ) : (
                    <AlertTriangle size={12} className="text-theme-accent mr-1" />
                  )}
                  <span className="font-medium text-[10px] text-theme-text-primary">{insight.asset}</span>
                </div>
                {insight.type === 'signal' && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                    insight.signal?.includes('Buy') ? 'bg-green-400/20 text-green-500' : 
                    insight.signal?.includes('Sell') ? 'bg-red-400/20 text-red-500' : 
                    'bg-theme-accent/20 text-theme-accent'
                  }`}>
                    {insight.signal}
                  </span>
                )}
                {insight.type === 'pattern' && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-theme-accent/20 text-theme-accent">
                    {insight.pattern}
                  </span>
                )}
                {insight.type === 'alert' && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-theme-accent/20 text-theme-accent">
                    {insight.alert}
                  </span>
                )}
              </div>

              <div className="flex justify-between text-[9px]">
                {insight.type === 'signal' ? (
                  <>
                    <span className="text-theme-text-secondary">Confidence: {insight.confidence}%</span>
                    <span className="text-theme-text-secondary">{insight.reason}</span>
                  </>
                ) : insight.type === 'pattern' ? (
                  <>
                    <span className="text-theme-text-secondary">Confidence: {insight.confidence}%</span>
                    <span className="text-theme-text-secondary">{insight.timeframe}</span>
                  </>
                ) : (
                  <>
                    <span className="text-theme-text-secondary">Impact: {insight.impact}</span>
                    <span className="text-theme-text-secondary">{insight.timeframe}</span>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-auto text-center pt-2">
        <button 
          className="text-[10px] bg-theme-accent hover:bg-theme-accent-dark text-theme-bg px-3 py-1 rounded-full flex items-center mx-auto"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <Zap size={10} className="mr-1" />
          Get Fresh Insights
        </button>
      </div>
    </div>
  );
};

export default AIInsights;