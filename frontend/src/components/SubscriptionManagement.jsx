import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const SubscriptionManagement = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await fetch('/api/subscriptions');
        const data = await response.json();
        setSubscriptions(data);
      } catch (error) {
        console.error('Subscription error:', error);
      }
    };

    fetchSubscriptions();
  }, []);

  const handleUpdate = async (id, updates) => {
    try {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      const updated = await response.json();
      setSubscriptions(subscriptions.map(s => s._id === id ? updated : s));
      setEditing(null);
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-700 mb-4">Subscription Management</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subscriptions.map((sub) => (
              <tr key={sub._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{sub.userId}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{sub.planId}</div>
                  <div className="text-sm text-gray-500">{sub.planType}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    sub.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : sub.status === 'canceled' 
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {sub.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => setEditing(sub)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-md font-medium mb-2">Edit Subscription: {editing.userId}</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">New Status</label>
              <select
                value={editing.status}
                onChange={(e) => setEditing({...editing, status: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="active">Active</option>
                <option value="canceled">Canceled</option>
                <option value="paused">Paused</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Plan Type</label>
              <select
                value={editing.planType}
                onChange={(e) => setEditing({...editing, planType: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end space-x-3">
            <button 
              onClick={() => setEditing(null)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={() => handleUpdate(editing._id, { status: editing.status, planType: editing.planType })}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;
