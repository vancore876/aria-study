import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/user-management');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('User management error:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleUpdate = async (userId, updates) => {
    try {
      const response = await fetch(`/api/user-management/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      const updatedUser = await response.json();
      setUsers(users.map(u => u._id === updatedUser._id ? updatedUser : u));
      setEditingUser(null);
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await fetch(`/api/user-management/${userId}`, { method: 'DELETE' });
      setUsers(users.filter(u => u._id !== userId));
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">User Management</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.username}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.subscription ? (
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.subscription.planId}</div>
                      <div className="text-sm text-gray-500 capitalize">{user.subscription.status}</div>
                    </div>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      No Subscription
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => setEditingUser(user)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(user._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Edit User: {editingUser.username}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button 
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleUpdate(editingUser._id, { email: editingUser.email, username: editingUser.username })}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
