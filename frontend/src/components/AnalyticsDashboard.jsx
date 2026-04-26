import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Line } from 'react-chartjs-2';

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [usageTrend, setUsageTrend] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await fetch('/api/analytics/usage');
        const data = await response.json();
        setStats(data);
        
        // Simulated usage trend data
        setUsageTrend({
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'User Actions',
              data: [1200, 1500, 1800, 1300, 1700, 2100],
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.5)',
              tension: 0.4
            }
          ]
        });
      } catch (error) {
        console.error('Analytics error:', error);
      }
    };

    fetchAnalyticsData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">System Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-500">Total Users</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.userCount || 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-500">Active Subscriptions</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.activeSubscriptions || 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-500">Total Actions</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.usageStats?.totalActions || 0}</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-lg font-medium text-gray-500 mb-4">Usage Trend</h3>
        <div className="h-64">
          <Line data={usageTrend} options={{
            responsive: true,
            plugins: {
              legend: { position: 'bottom' },
              tooltip: { mode: 'index' }
            },
            interaction: { mode: 'nearest', axis: 'x', intersect: false }
          }} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
