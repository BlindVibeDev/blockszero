import { z } from 'zod';
import { GroqAPIError } from '../../services/groq';
import { getMarketSentiment } from '../../services/twitterApi';

// Validation schema for sentiment analysis
const SentimentArgsSchema = z.object({
  symbol: z.string(),
  timeframe: z.enum(['24h', '7d', '30d']).optional()
});

// Market sentiment tool definition
export const marketSentimentTool = {
  type: 'function' as const,
  function: {
    name: 'analyze_market_sentiment',
    description: 'Analyze market sentiment based on social media data',
    parameters: {
      type: 'object',
      required: ['symbol'],
      properties: {
        symbol: {
          type: 'string',
          description: 'The cryptocurrency symbol (e.g., BTC, ETH)'
        },
        timeframe: {
          type: 'string',
          enum: ['24h', '7d', '30d'],
          description: 'Time period for sentiment analysis'
        }
      }
    }
  }
};

// Market sentiment tool handler with improved error handling
export const handleMarketSentimentTool = async (args: unknown) => {
  try {
    // Validate arguments with proper error handling
    let validatedArgs;
    try {
      validatedArgs = SentimentArgsSchema.parse(args);
    } catch (parseError) {
      console.error('Error parsing sentiment arguments:', parseError);
      return {
        error: true,
        message: 'Invalid arguments provided for sentiment analysis',
        details: parseError instanceof Error ? parseError.message : String(parseError)
      };
    }

    const { symbol, timeframe = '24h' } = validatedArgs;

    if (!symbol) {
      return {
        error: true,
        message: 'Symbol is required for sentiment analysis'
      };
    }

    try {
      const { sentiment, tweets, volume24h } = await getMarketSentiment(symbol);

      // Format the response
      return {
        error: false,
        symbol,
        sentiment: {
          score: sentiment.score,
          label: sentiment.label,
          confidence: Math.abs(sentiment.score) * 100,
          strength: sentiment.magnitude
        },
        metrics: {
          tweet_volume_24h: volume24h,
          engagement_rate: tweets.length > 0 ? 
            tweets.reduce((sum, tweet) => 
              sum + (tweet.public_metrics ? 
                tweet.public_metrics.like_count + 
                tweet.public_metrics.retweet_count * 2 + 
                tweet.public_metrics.quote_count * 1.5 : 0
              ), 0) / tweets.length : 0
        },
        sample_tweets: tweets
          .sort((a, b) => 
            ((b.public_metrics?.like_count || 0) + (b.public_metrics?.retweet_count || 0) * 2) -
            ((a.public_metrics?.like_count || 0) + (a.public_metrics?.retweet_count || 0) * 2)
          )
          .slice(0, 5)
          .map(tweet => ({
            text: tweet.text,
            engagement: tweet.public_metrics ? {
              likes: tweet.public_metrics.like_count,
              retweets: tweet.public_metrics.retweet_count,
              quotes: tweet.public_metrics.quote_count
            } : null,
            created_at: tweet.created_at
          }))
      };
    } catch (error) {
      console.error('Error getting market sentiment:', error);
      return {
        error: true,
        message: `Failed to analyze market sentiment for ${symbol}`,
        details: error instanceof Error ? error.message : String(error),
        fallback: {
          symbol,
          sentiment: {
            label: 'neutral',
            score: 0,
            confidence: 0,
            strength: 0
          },
          note: 'Using fallback neutral sentiment due to data retrieval error'
        }
      };
    }
  } catch (error) {
    console.error('Unexpected error in sentiment analysis tool:', error);
    return {
      error: true,
      message: 'An unexpected error occurred while analyzing market sentiment',
      details: error instanceof Error ? error.message : String(error)
    };
  }
};