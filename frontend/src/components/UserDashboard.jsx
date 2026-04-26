import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bar } from 'react-chartjs-2';

const UserDashboard = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [activity, setActivity] = useState([]);
  const [usageStats, setUsageStats] = useState({});

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/subscriptions/user');
        const data = await response.json();
        setSubscription(data);
        
        // Simulated usage data
        setUsageStats({
          aiCreditsUsed: 345,
          storageUsed: '2.4GB',
          activeNodes: 189
        });
        
        // Simulated activity log
        setActivity([
          { action: 'Created knowledge graph', timestamp: '2023-09-15T08:32:17Z' },
          { action: 'Generated 12 new nodes', timestamp: '2023-09-14T16:45:33Z' },
          { action: 'Updated subscription plan', timestamp: '2023-09-13T14:22:09Z' }
        ]);
      } catch (error) {
        console.error('Dashboard data error:', error);
      }
    };

    fetchDashboardData();
  }, []);

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'AI Credits Used',
        data: [1200, 1500, 1800, 1300, 1700, 2100],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2
      }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Welcome, {user.username}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-500">Current Plan</h3>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {subscription ? subscription.planId : 'None'}
          </p>
          <button className="mt-4 text-sm text-indigo-600 hover:text-indigo-800">
            Upgrade Plan
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-500">AI Credits Used</h3>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {usageStats.aiCreditsUsed}
          </p>
          <div className="mt-4 h-24">
            <Bar data={chartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-500">Storage Used</h3>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {usageStats.storageUsed}
          </p>
          <div className="mt-4 h-2 w-full bg-gray-200 rounded-full">
            <div className="h-2 bg-indigo-600 rounded-full" style={{ width: '65%' }}></div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-lg font-medium text-gray-500 mb-4">Recent Activity</h3>
        <ul className="space-y-3">
          {activity.map((item, index) => (
            <li key={index} className="flex items-center">
              <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <span className="text-gray-700">{item.action}</span>
              <span className="ml-auto text-xs text-gray-500">
                {new Date(item.timestamp).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserDashboard;
