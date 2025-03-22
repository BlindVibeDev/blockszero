import React, { useState } from 'react';
import { FaBook, FaQuestionCircle, FaUsers, FaTicketAlt, FaLightbulb } from 'react-icons/fa';

interface HelpCommunityProps {
  className?: string;
}

const HelpCommunity: React.FC<HelpCommunityProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<string>('documentation');

  const tabs = [
    { id: 'documentation', label: 'Documentation', icon: <FaBook /> },
    { id: 'tutorials', label: 'Tutorials', icon: <FaQuestionCircle /> },
    { id: 'community', label: 'Community Forum', icon: <FaUsers /> },
    { id: 'support', label: 'Support', icon: <FaTicketAlt /> },
    { id: 'knowledge', label: 'Knowledge Base', icon: <FaLightbulb /> },
  ];

  // Placeholder content for each tab
  const renderContent = () => {
    switch (activeTab) {
      case 'documentation':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-blue-800">Platform Documentation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DocCard 
                title="Getting Started" 
                description="Learn the basics of navigating and using the platform" 
                icon={<FaBook className="text-blue-500" />} 
              />
              <DocCard 
                title="Dashboard Guide" 
                description="Customize your dashboard and understand all available widgets" 
                icon={<FaBook className="text-blue-500" />} 
              />
              <DocCard 
                title="Portfolio Management" 
                description="Track and manage your cryptocurrency investments" 
                icon={<FaBook className="text-blue-500" />} 
              />
              <DocCard 
                title="Market Analysis Tools" 
                description="Use our advanced tools to analyze market trends" 
                icon={<FaBook className="text-blue-500" />} 
              />
            </div>
            <div className="mt-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search documentation..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button className="absolute right-3 top-3 text-gray-500 hover:text-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        );
      case 'tutorials':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-blue-800">Interactive Tutorials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TutorialCard 
                title="Dashboard Setup" 
                duration="5 min" 
                level="Beginner"
                description="Learn how to set up your perfect dashboard" 
              />
              <TutorialCard 
                title="Portfolio Tracking" 
                duration="8 min" 
                level="Intermediate"
                description="Master portfolio management and performance tracking" 
              />
              <TutorialCard 
                title="Technical Analysis" 
                duration="12 min" 
                level="Advanced"
                description="Learn to use technical indicators and chart patterns" 
              />
              <TutorialCard 
                title="AI Insights" 
                duration="7 min" 
                level="Intermediate"
                description="Leverage AI for market analysis and predictions" 
              />
            </div>
            <p className="text-sm text-gray-600 mt-4">
              All tutorials feature interactive components to help you learn at your own pace.
            </p>
          </div>
        );
      case 'community':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-blue-800">Community Forum</h3>
            <div className="flex flex-col space-y-4">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-medium text-blue-700">Market Discussion</h4>
                    <p className="text-sm text-gray-600">Discuss market trends, events, and predictions with other users</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">243</span> topics • <span className="font-medium">1.2k</span> posts
                  </div>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-medium text-blue-700">Trading Strategies</h4>
                    <p className="text-sm text-gray-600">Share and discuss cryptocurrency trading strategies</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">189</span> topics • <span className="font-medium">876</span> posts
                  </div>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-medium text-blue-700">Platform Help</h4>
                    <p className="text-sm text-gray-600">Get help with using platform features from the community</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">112</span> topics • <span className="font-medium">543</span> posts
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                New Discussion
              </button>
            </div>
          </div>
        );
      case 'support':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-blue-800">Support Ticketing</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-lg font-medium text-blue-700 mb-2">Submit a Support Request</h4>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Category</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                    <option>Account Access</option>
                    <option>Data Questions</option>
                    <option>Feature Request</option>
                    <option>Bug Report</option>
                    <option>Billing & Subscription</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Brief description of your issue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    rows={4} 
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Please provide details about your issue"
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    Submit Ticket
                  </button>
                </div>
              </form>
            </div>
            <div className="mt-6">
              <h4 className="text-lg font-medium text-blue-700 mb-2">Your Recent Tickets</h4>
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#1234</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800 cursor-pointer">Dashboard widget not loading</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">In Progress</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2 hours ago</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#1189</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800 cursor-pointer">API integration question</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Resolved</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3 days ago</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'knowledge':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-blue-800">Knowledge Base</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search the knowledge base..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button className="absolute right-3 top-3 text-gray-500 hover:text-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <KnowledgeCard 
                title="Account & Security"
                articles={12}
                lastUpdated="2 days ago"
              />
              <KnowledgeCard 
                title="Dashboard Setup"
                articles={8}
                lastUpdated="1 week ago"
              />
              <KnowledgeCard 
                title="Portfolio Management"
                articles={15}
                lastUpdated="3 days ago"
              />
              <KnowledgeCard 
                title="Technical Analysis"
                articles={21}
                lastUpdated="4 days ago"
              />
              <KnowledgeCard 
                title="API Integration"
                articles={6}
                lastUpdated="1 month ago"
              />
              <KnowledgeCard 
                title="Trading Tools"
                articles={9}
                lastUpdated="2 weeks ago"
              />
            </div>
            <div className="mt-6">
              <h4 className="text-lg font-medium text-blue-700 mb-2">Popular Articles</h4>
              <ul className="space-y-2">
                <li className="text-blue-600 hover:text-blue-800 cursor-pointer">How to create custom dashboard layouts</li>
                <li className="text-blue-600 hover:text-blue-800 cursor-pointer">Setting up price alerts for your watchlist</li>
                <li className="text-blue-600 hover:text-blue-800 cursor-pointer">Understanding the portfolio performance metrics</li>
                <li className="text-blue-600 hover:text-blue-800 cursor-pointer">Using technical indicators for trading decisions</li>
                <li className="text-blue-600 hover:text-blue-800 cursor-pointer">API integration for external data sources</li>
              </ul>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg ${className}`}>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-blue-800 mb-6">Help & Community</h2>
        
        <div className="flex flex-wrap border-b border-gray-200 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`flex items-center mr-6 py-2 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="min-h-[400px]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

// Helper component for Documentation cards
const DocCard: React.FC<{ title: string; description: string; icon: React.ReactNode }> = ({ 
  title, 
  description, 
  icon 
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition">
      <div className="flex items-start">
        <div className="mt-1 mr-3">
          {icon}
        </div>
        <div>
          <h4 className="text-lg font-medium text-blue-700">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
          <button className="mt-2 text-sm text-blue-600 hover:text-blue-800">Read more →</button>
        </div>
      </div>
    </div>
  );
};

// Helper component for Tutorial cards
const TutorialCard: React.FC<{ 
  title: string; 
  duration: string;
  level: string;
  description: string; 
}> = ({ 
  title, 
  duration,
  level,
  description 
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition">
      <h4 className="text-lg font-medium text-blue-700">{title}</h4>
      <div className="flex space-x-3 mt-1 mb-2">
        <span className="inline-flex items-center text-xs font-medium text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {duration}
        </span>
        <span className="inline-flex items-center text-xs font-medium text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {level}
        </span>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
      <div className="mt-3 flex justify-between items-center">
        <button className="text-sm text-blue-600 hover:text-blue-800">Start Tutorial</button>
        <div className="bg-gray-100 rounded-full h-2 w-24">
          <div className="bg-blue-500 h-2 rounded-full w-0"></div>
        </div>
      </div>
    </div>
  );
};

// Helper component for Knowledge Base category cards
const KnowledgeCard: React.FC<{ 
  title: string; 
  articles: number;
  lastUpdated: string;
}> = ({ 
  title, 
  articles,
  lastUpdated
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition">
      <h4 className="text-lg font-medium text-blue-700">{title}</h4>
      <div className="flex justify-between text-sm text-gray-600 mt-1">
        <span>{articles} articles</span>
        <span>Updated {lastUpdated}</span>
      </div>
      <button className="mt-3 text-sm text-blue-600 hover:text-blue-800">Browse articles →</button>
    </div>
  );
};

export default HelpCommunity;