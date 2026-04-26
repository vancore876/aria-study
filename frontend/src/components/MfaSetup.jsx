import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const MfaSetup = () => {
  const { user } = useAuth();
  const [qrCode, setQrCode] = useState('');
  const [token, setToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const generateQr = async () => {
      try {
        const response = await fetch('/api/mfa/enable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user._id })
        });
        
        const data = await response.json();
        setQrCode(data.qrcode);
      } catch (error) {
        console.error('QR error:', error);
      }
    };

    if (user && !user.isMfaEnabled) {
      generateQr();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, userId: user._id })
      });
      
      const data = await response.json();
      setMessage(data.success ? 'MFA enabled successfully!' : 'Invalid token');
    } catch (error) {
      console.error('MFA error:', error);
      setMessage('Error enabling MFA');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {!user?.isMfaEnabled ? (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Enable MFA</h3>
          
          <div className="mb-4">
            <img src={qrCode} alt="MFA QR Code" className="w-full max-w-xs mx-auto" />
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Verification Code</label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter code from authenticator"
              />
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isSubmitting ? 'Verifying...' : 'Enable MFA'}
            </button>
            
            {message && (
              <div className={`mt-4 p-3 rounded-md ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message}
              </div>
            )}
          </form>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">MFA Enabled</h3>
          <p className="text-gray-600">Multi-factor authentication is currently active for your account.</p>
          <button
            onClick={async () => {
              if (window.confirm('Are you sure you want to disable MFA?')) {
                try {
                  await fetch('/api/mfa/disable', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user._id })
                  });
                  window.location.reload();
                } catch (error) {
                  console.error('Disable error:', error);
                }
              }
            }}
            className="mt-4 text-sm text-red-600 hover:text-red-800"
          >
            Disable MFA
          </button>
        </div>
      )}
    </div>
  );
};

export default MfaSetup;
