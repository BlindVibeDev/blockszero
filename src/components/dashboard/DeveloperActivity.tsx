import React, { useState, useEffect } from 'react';
import { useToken } from '../../context/TokenContext';
import { useCrypto } from '../../context/CryptoContext';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type TimeRange = '30d' | '90d' | '1y';

const DeveloperActivity: React.FC = () => {
  const { selectedToken } = useToken();
  const { getTokenDeveloperData, getTokenRepoStats, getTokenStatusUpdates } = useCrypto();
  const [devData, setDevData] = useState<any>(null);
  const [repoData, setRepoData] = useState<any[]>([]);
  const [statusUpdates, setStatusUpdates] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('90d');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedToken) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch data in parallel
        const [developerData, repositoryData, updates] = await Promise.all([
          getTokenDeveloperData(selectedToken),
          getTokenRepoStats(selectedToken),
          getTokenStatusUpdates(selectedToken, 1, 5)
        ]);
        
        setDevData(developerData);
        setRepoData(Array.isArray(repositoryData) ? repositoryData : []);
        setStatusUpdates(updates || []);
      } catch (err) {
        console.error('Error fetching developer data:', err);
        setError('Failed to load developer data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedToken, getTokenDeveloperData, getTokenRepoStats, getTokenStatusUpdates]);

  // Prepare chart data for commit activity
  const prepareChartData = () => {
    if (!devData || !devData.commit_count_4_weeks) return null;
    
    const commitData = Array.isArray(devData.commit_count_4_weeks) 
      ? devData.commit_count_4_weeks 
      : [];
    
    // Generate labels for the last 4 weeks
    const labels = [];
    const now = new Date();
    for (let i = 27; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      labels.push(date.getDate().toString());
    }
    
    return {
      labels,
      datasets: [
        {
          label: 'Commits',
          data: commitData,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Commit Activity (Last 4 Weeks)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Commits'
        }
      }
    }
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

  // Format stats for display
  const formatStats = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A';
    return value.toLocaleString();
  };

  return (
    <div className="p-4 bg-gray-900 rounded-lg text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Developer Activity</h2>
        <div className="flex space-x-2">
          <button 
            className={`px-3 py-1 rounded ${timeRange === '30d' ? 'bg-indigo-600' : 'bg-gray-700'}`}
            onClick={() => setTimeRange('30d')}
          >
            30D
          </button>
          <button 
            className={`px-3 py-1 rounded ${timeRange === '90d' ? 'bg-indigo-600' : 'bg-gray-700'}`}
            onClick={() => setTimeRange('90d')}
          >
            90D
          </button>
          <button 
            className={`px-3 py-1 rounded ${timeRange === '1y' ? 'bg-indigo-600' : 'bg-gray-700'}`}
            onClick={() => setTimeRange('1y')}
          >
            1Y
          </button>
        </div>
      </div>
      
      {devData ? (
        <div className="grid grid-cols-1 gap-4">
          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">Stars</div>
              <div className="text-lg font-semibold">{formatStats(devData.stars)}</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">Forks</div>
              <div className="text-lg font-semibold">{formatStats(devData.forks)}</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">Contributors</div>
              <div className="text-lg font-semibold">{formatStats(devData.pull_request_contributors)}</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">Commits (4w)</div>
              <div className="text-lg font-semibold">
                {formatStats(
                  Array.isArray(devData.commit_count_4_weeks) 
                    ? devData.commit_count_4_weeks.reduce((a: number, b: number) => a + b, 0)
                    : null
                )}
              </div>
            </div>
          </div>
          
          {/* Commit Activity Chart */}
          <div className="h-60 mb-4 bg-gray-800 p-3 rounded">
            {prepareChartData() ? (
              <Line data={prepareChartData()} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No commit data available
              </div>
            )}
          </div>
          
          {/* Repositories */}
          {repoData.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2">Repositories</h3>
              <div className="space-y-2">
                {repoData.slice(0, 3).map((repo, index) => (
                  <div key={index} className="bg-gray-800 p-3 rounded">
                    <div className="flex justify-between">
                      <a 
                        href={repo.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {repo.name}
                      </a>
                      <div className="text-xs text-gray-400">
                        ⭐ {repo.stars} 🍴 {repo.forks}
                      </div>
                    </div>
                    {repo.organization && (
                      <div className="text-xs text-gray-400">
                        {repo.organization}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Status Updates */}
          {statusUpdates.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Recent Updates</h3>
              <div className="space-y-2">
                {statusUpdates.map((update, index) => (
                  <div key={index} className="bg-gray-800 p-3 rounded">
                    <div className="flex justify-between mb-1">
                      <div className="font-medium">{update.category}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(update.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm">{update.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-40 text-gray-400">
          No developer data available for this token
        </div>
      )}
    </div>
  );
};

export default DeveloperActivity; 