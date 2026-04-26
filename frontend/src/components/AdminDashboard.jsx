import React from 'react';
import AnalyticsDashboard from './AnalyticsDashboard';
import UserManagement from './UserManagement';
import SubscriptionManagement from './SubscriptionManagement';

const AdminDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-2">
          <AnalyticsDashboard />
        </div>
        
        <div>
          <UserManagement />
        </div>
        
        <div>
          <SubscriptionManagement />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
