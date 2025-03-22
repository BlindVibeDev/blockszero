import { generateAIResponse } from '../services/groq';
import { generatePerplexityResponse } from '../services/perplexity';

// Determine which AI service to use based on availability and configuration
const getPreferredAIService = (): 'perplexity' | 'groq' | 'fallback' => {
  if (import.meta.env.VITE_PERPLEXITY_API_KEY) {
    return 'perplexity';
  } else if (import.meta.env.VITE_GROQ_API_KEY) {
    return 'groq';
  } else {
    return 'fallback';
  }
};

export const generateEnhancedAIResponse = async (message: string): Promise<string> => {
  try {
    console.log('Generating enhanced AI response for message:', message);
    
    const preferredService = getPreferredAIService();
    console.log(`Using AI service: ${preferredService}`);
    
    let response: string;
    
    if (preferredService === 'perplexity') {
      // Use Perplexity AI
      try {
        response = await generatePerplexityResponse(message, {
          model: 'sonar', // Updated to use a valid model name
          temperature: 0.2,
          systemPrompt: `You are TradesXBT AI, an expert cryptocurrency market analyst. Your role is to provide detailed, actionable market analysis with clear trading signals.

When analyzing market data, focus on:
- Current price and market cap
- Volume and liquidity
- Price trends and momentum
- Support and resistance levels
- Risk assessment

Always structure your responses clearly with sections for:
1. Market Overview
2. Technical Analysis
3. Trading Signal
4. Risk Assessment
5. Action Items

Be specific with numbers and avoid vague statements.
If you encounter errors retrieving data, gracefully inform the user and suggest alternatives.`
        });
      } catch (error) {
        console.error("Error with Perplexity response:", error);
        // If Perplexity fails, fallback to Groq if available
        if (import.meta.env.VITE_GROQ_API_KEY) {
          console.log("Falling back to Groq API");
          response = await generateGroqResponse(message);
        } else {
          // If no Groq API available, throw to trigger the fallback response
          throw error;
        }
      }
    } else if (preferredService === 'groq') {
      // Use Groq
      response = await generateGroqResponse(message);
    } else {
      // Fallback response if no API keys are available
      response = `I don't have access to real-time data at the moment, but here's some general guidance on your query: "${message}"

Based on general cryptocurrency principles:

1. Market Overview: Cryptocurrency markets are highly volatile and influenced by various factors including regulatory news, technological developments, and market sentiment.

2. Technical Analysis: Without current data, I can't provide specific technical analysis. Generally, traders look at moving averages, RSI, MACD, and support/resistance levels.

3. Trading Signal: Without real-time data, I cannot provide a specific trading signal. Always do your own research before making trading decisions.

4. Risk Assessment: Cryptocurrency trading carries significant risk. Never invest more than you can afford to lose.

5. Action Items:
   - Research the asset thoroughly before investing
   - Set strict stop-loss levels
   - Diversify your portfolio
   - Stay updated with reliable news sources

Would you like me to explain any of these concepts in more detail?`;
    }

    console.log('Received AI response:', response.substring(0, 200) + '...');
    return response;
  } catch (error) {
    console.error('Error generating enhanced AI response:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return `I'm sorry, I encountered an error while processing your request: ${errorMessage}. Please try again with a different question or check back later when our services have been restored.`;
  }
};

// Helper function to generate response using Groq
const generateGroqResponse = async (message: string): Promise<string> => {
  return await generateAIResponse(message, {
    tools: [
      {
        type: 'function',
        function: {
          name: 'get_market_data',
          description: 'Get current market data for a cryptocurrency',
          parameters: {
            type: 'object',
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
            },
            required: ['symbol']
          }
        }
      }
    ]
  });
};