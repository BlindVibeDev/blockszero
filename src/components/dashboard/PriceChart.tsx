import React, { useState, useEffect } from 'react';
import { useToken } from '../../context/TokenContext';
import { useCrypto } from '../../context/CryptoContext';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/solid';
import { format } from 'date-fns';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type TimeFrame = '1D' | '1W' | '1M' | '1Y';
type ChartType = 'line' | 'candle';

interface OHLCData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

const PriceChart = () => {
  const { selectedToken } = useToken();
  const { getTokenOHLC, getTokenHistory } = useCrypto();
  const [timeframe, setTimeframe] = useState<TimeFrame>('1D');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [priceData, setPriceData] = useState<any>(null);
  const [ohlcData, setOhlcData] = useState<OHLCData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showIndicators, setShowIndicators] = useState({
    ma: false,
    rsi: false,
    macd: false,
    bollinger: false,
    volume: false,
  });

  // Convert timeframe to days for API
  const timeframeToDays = (tf: TimeFrame): number | 'max' => {
    switch (tf) {
      case '1D': return 1;
      case '1W': return 7;
      case '1M': return 30;
      case '1Y': return 365;
      default: return 1;
    }
  };

  // Convert timeframe to days for OHLC API
  const timeframeToOHLCDays = (tf: TimeFrame): 1 | 7 | 14 | 30 | 90 | 180 | 365 => {
    switch (tf) {
      case '1D': return 1;
      case '1W': return 7;
      case '1M': return 30;
      case '1Y': return 365;
      default: return 1;
    }
  };

  // Fetch price data based on timeframe
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedToken) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        if (chartType === 'line') {
          const days = timeframeToDays(timeframe);
          const interval = timeframe === '1D' ? 'hourly' : timeframe === '1Y' ? 'daily' : undefined;
          const data = await getTokenHistory(selectedToken, days, interval);
          setPriceData(data);
        } else {
          const days = timeframeToOHLCDays(timeframe);
          const data = await getTokenOHLC(selectedToken, days);
          setOhlcData(data.map((item: any) => ({
            time: item[0],
            open: item[1],
            high: item[2],
            low: item[3],
            close: item[4],
          })));
        }
      } catch (err) {
        console.error('Error fetching price data:', err);
        setError('Failed to load price data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedToken, timeframe, chartType, getTokenHistory, getTokenOHLC]);

  // Prepare chart data
  const prepareChartData = () => {
    if (!priceData || !priceData.prices) return null;

    const labels = priceData.prices.map((price: [number, number]) => 
      format(new Date(price[0]), timeframe === '1D' ? 'HH:mm' : 'MMM dd')
    );
    
    const prices = priceData.prices.map((price: [number, number]) => price[1]);
    
    return {
      labels,
      datasets: [
        {
          label: 'Price',
          data: prices,
          borderColor: prices[0] < prices[prices.length - 1] ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
          tension: 0.1,
          pointRadius: 0,
          borderWidth: 2,
        },
      ],
    };
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `$${context.raw.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        position: 'right' as const,
        ticks: {
          callback: function(value: any) {
            return '$' + value;
          }
        },
      },
    },
  };

  // Calculate price change percentage
  const calculatePriceChange = () => {
    if (!priceData || !priceData.prices || priceData.prices.length < 2) return 0;
    
    const firstPrice = priceData.prices[0][1];
    const lastPrice = priceData.prices[priceData.prices.length - 1][1];
    
    return ((lastPrice - firstPrice) / firstPrice) * 100;
  };

  const priceChangePercentage = priceData ? calculatePriceChange() : 0;
  const currentPrice = priceData && priceData.prices ? 
    priceData.prices[priceData.prices.length - 1][1] : 0;

  const toggleIndicator = (indicator: keyof typeof showIndicators) => {
    setShowIndicators(prev => ({
      ...prev,
      [indicator]: !prev[indicator]
    }));
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-900 rounded-lg">
        <div className="animate-pulse flex flex-col h-72">
          <div className="h-6 bg-gray-700 rounded mb-4 w-1/3"></div>
          <div className="flex-1 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-gray-900 rounded-lg">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-900 rounded-lg text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Price Chart</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1 rounded ${chartType === 'line' ? 'bg-indigo-600' : 'bg-gray-700'}`}
          >
            Line
          </button>
          <button
            onClick={() => setChartType('candle')}
            className={`px-3 py-1 rounded ${chartType === 'candle' ? 'bg-indigo-600' : 'bg-gray-700'}`}
          >
            Candle
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="text-3xl font-bold">
          ${currentPrice.toFixed(2)}
          <span className={`ml-2 text-lg ${priceChangePercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {priceChangePercentage >= 0 ? 
              <ArrowUpIcon className="inline h-4 w-4" /> : 
              <ArrowDownIcon className="inline h-4 w-4" />}
            {Math.abs(priceChangePercentage).toFixed(2)}%
          </span>
        </div>
      </div>
      
      <div className="h-60 relative mb-4">
        {chartType === 'line' && priceData && (
          <Line data={prepareChartData()} options={chartOptions} />
        )}
        {chartType === 'candle' && (
          <div className="text-center text-gray-400 pt-4">
            OHLC chart visualization would go here with proper charting library (e.g., lightweight-charts)
          </div>
        )}
      </div>
      
      <div className="flex justify-between mb-4">
        <div className="flex space-x-2">
          <button 
            className={`px-3 py-1 rounded ${timeframe === '1D' ? 'bg-indigo-600' : 'bg-gray-700'}`}
            onClick={() => setTimeframe('1D')}
          >
            1D
          </button>
          <button 
            className={`px-3 py-1 rounded ${timeframe === '1W' ? 'bg-indigo-600' : 'bg-gray-700'}`}
            onClick={() => setTimeframe('1W')}
          >
            1W
          </button>
          <button 
            className={`px-3 py-1 rounded ${timeframe === '1M' ? 'bg-indigo-600' : 'bg-gray-700'}`}
            onClick={() => setTimeframe('1M')}
          >
            1M
          </button>
          <button 
            className={`px-3 py-1 rounded ${timeframe === '1Y' ? 'bg-indigo-600' : 'bg-gray-700'}`}
            onClick={() => setTimeframe('1Y')}
          >
            1Y
          </button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <button 
          className={`px-3 py-1 rounded text-xs ${showIndicators.ma ? 'bg-indigo-600' : 'bg-gray-700'}`}
          onClick={() => toggleIndicator('ma')}
        >
          MA
        </button>
        <button 
          className={`px-3 py-1 rounded text-xs ${showIndicators.rsi ? 'bg-indigo-600' : 'bg-gray-700'}`}
          onClick={() => toggleIndicator('rsi')}
        >
          RSI
        </button>
        <button 
          className={`px-3 py-1 rounded text-xs ${showIndicators.macd ? 'bg-indigo-600' : 'bg-gray-700'}`}
          onClick={() => toggleIndicator('macd')}
        >
          MACD
        </button>
        <button 
          className={`px-3 py-1 rounded text-xs ${showIndicators.bollinger ? 'bg-indigo-600' : 'bg-gray-700'}`}
          onClick={() => toggleIndicator('bollinger')}
        >
          Bollinger
        </button>
        <button 
          className={`px-3 py-1 rounded text-xs ${showIndicators.volume ? 'bg-indigo-600' : 'bg-gray-700'}`}
          onClick={() => toggleIndicator('volume')}
        >
          Volume
        </button>
      </div>
    </div>
  );
};

export default PriceChart;