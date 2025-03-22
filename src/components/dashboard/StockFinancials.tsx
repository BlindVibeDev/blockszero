import React, { useState, useEffect } from 'react';
import { getCompanyCashFlow, formatFinancialValue, formatFinancialDate, CashFlowItem } from '../../services/financialApi';
import Card from '../Card';
import { BarChart2, DollarSign, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../../utils/chartUtils';

const StockFinancials: React.FC = () => {
  const [cashFlowData, setCashFlowData] = useState<CashFlowItem[]>([]);
  const [symbol, setSymbol] = useState('AAPL:NASDAQ');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'QUARTERLY' | 'ANNUAL'>('QUARTERLY');

  const fetchCashFlowData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCompanyCashFlow(symbol, period);
      setCashFlowData(data.cash_flow);
    } catch (err) {
      console.error('Error fetching cash flow data:', err);
      setError('Failed to load financial data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCashFlowData();
  }, [symbol, period]);

  const handleSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSymbol(e.target.value);
  };

  const handlePeriodChange = (newPeriod: 'QUARTERLY' | 'ANNUAL') => {
    setPeriod(newPeriod);
  };

  const handleRefresh = () => {
    fetchCashFlowData();
  };

  return (
    <Card title="Stock Financial Data" icon={<BarChart2 size={14} />}>
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={symbol}
            onChange={handleSymbolChange}
            placeholder="Stock Symbol (e.g., AAPL:NASDAQ)"
            className="px-3 py-1.5 text-xs bg-theme-bg border border-theme-border rounded-lg focus:outline-none focus:ring-1 focus:ring-theme-accent w-48"
          />
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center text-xs bg-theme-accent hover:bg-theme-accent-dark text-theme-bg px-3 py-1.5 rounded-lg transition-colors"
          >
            {isLoading ? (
              <RefreshCw size={14} className="mr-1 animate-spin" />
            ) : (
              <RefreshCw size={14} className="mr-1" />
            )}
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => handlePeriodChange('QUARTERLY')}
            className={`text-xs px-3 py-1.5 rounded-lg ${
              period === 'QUARTERLY' ? 'bg-theme-accent text-theme-bg' : 'bg-theme-accent/10 text-theme-accent'
            }`}
          >
            Quarterly
          </button>
          <button
            onClick={() => handlePeriodChange('ANNUAL')}
            className={`text-xs px-3 py-1.5 rounded-lg ${
              period === 'ANNUAL' ? 'bg-theme-accent text-theme-bg' : 'bg-theme-accent/10 text-theme-accent'
            }`}
          >
            Annual
          </button>
        </div>
      </div>

      {error && (
        <div className="text-red-500 p-3 mb-4 text-sm bg-red-50 dark:bg-red-900/20 rounded-lg">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs text-theme-accent border-b border-theme-border">
              <th className="pb-2 font-medium">Period</th>
              <th className="pb-2 font-medium text-right">Net Income</th>
              <th className="pb-2 font-medium text-right">Operating Cash</th>
              <th className="pb-2 font-medium text-right">Free Cash Flow</th>
              <th className="pb-2 font-medium text-right">Net Change</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-4 text-center">
                  <RefreshCw size={20} className="inline-block animate-spin text-theme-accent" />
                </td>
              </tr>
            ) : cashFlowData.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-center text-theme-text-secondary">
                  No financial data available
                </td>
              </tr>
            ) : (
              cashFlowData.slice(0, 6).map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-theme-accent/5' : ''}>
                  <td className="py-2 font-medium">
                    {formatFinancialDate(item.date)}
                  </td>
                  <td className="py-2 text-right">
                    <div className="flex items-center justify-end">
                      <DollarSign size={10} className="text-theme-accent mr-1" />
                      {formatFinancialValue(item.net_income)}
                    </div>
                  </td>
                  <td className="py-2 text-right">
                    {formatFinancialValue(item.cash_from_operations)}
                  </td>
                  <td className="py-2 text-right">
                    {formatFinancialValue(item.free_cash_flow)}
                  </td>
                  <td className={`py-2 text-right ${item.net_change_in_cash >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    <div className="flex items-center justify-end">
                      {item.net_change_in_cash >= 0 ? (
                        <ArrowUp size={10} className="mr-1" />
                      ) : (
                        <ArrowDown size={10} className="mr-1" />
                      )}
                      {formatFinancialValue(Math.abs(item.net_change_in_cash))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-xs text-theme-text-secondary">
        <p>Cash flow metrics shown in {cashFlowData[0]?.currency || 'USD'}. Data is for reference only.</p>
      </div>
    </Card>
  );
};

export default StockFinancials;