// src/app/dashboard/provider/wallet/page.js
'use client';
import { useState, useEffect } from 'react';
import { useNowPaymentsWallet } from '@/context/NowPaymentsWalletContext';
import { useAuth } from '@/context/AuthContext';

// Safe component that handles loading states
export default function WalletPage() {
  const { user } = useAuth();
  const { balance, deposits, createDeposit, checkDepositStatus, loading } = useNowPaymentsWallet();
  const [depositAmount, setDepositAmount] = useState('');
  const [activeDeposit, setActiveDeposit] = useState(null);
  const [message, setMessage] = useState('');
  const [checkingStatus, setCheckingStatus] = useState({});

  useEffect(() => {
    // Check for success status in URL
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    
    if (status === 'success') {
      setMessage('Payment completed! Please wait for confirmation...');
    } else if (status === 'cancelled') {
      setMessage('Payment was cancelled.');
    }
  }, []);

  const handleDeposit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setMessage('Please log in to make a deposit');
      return;
    }

    if (!depositAmount || depositAmount < 5 || depositAmount > 1000) {
      setMessage('Amount must be between $5 and $1000');
      return;
    }

    setMessage('Creating payment...');

    try {
      const result = await createDeposit(parseFloat(depositAmount));
      
      if (result.success) {
        setActiveDeposit(result);
        setMessage('');
        setDepositAmount('');
        
        // Redirect to NowPayments
        window.open(result.paymentUrl, '_blank');
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage('Error creating deposit: ' + error.message);
    }
  };

  const checkStatus = async (depositId) => {
    setCheckingStatus(prev => ({ ...prev, [depositId]: true }));
    
    try {
      const result = await checkDepositStatus(depositId);
      
      if (result.success) {
        if (result.status === 'confirmed') {
          setMessage('✅ Deposit confirmed! Your balance has been updated.');
        } else {
          setMessage(`Status: ${result.status}`);
        }
      } else {
        setMessage(`Status check failed: ${result.error}`);
      }
    } catch (error) {
      setMessage('Error checking status: ' + error.message);
    }
    
    setCheckingStatus(prev => ({ ...prev, [depositId]: false }));
  };

  const quickAmounts = [10, 25, 50, 100, 250];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'confirmed': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'confirming': 
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'failed':
      case 'expired': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-pink-200">Loading wallet...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if no user
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please Log In</h2>
          <p className="text-pink-200">You need to be logged in to access your wallet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-900 to-black">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-black/40 rounded-2xl p-6 border border-pink-500/30 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">💰 Wallet Balance</h1>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-200">Available Balance</p>
              <p className="text-4xl font-bold text-pink-400">${balance.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-pink-200">Total Deposits</p>
              <p className="text-2xl font-bold text-green-400">
                ${deposits.filter(d => d.status === 'confirmed').reduce((sum, dep) => sum + dep.amountUSD, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Deposit Section */}
        <div className="bg-black/40 rounded-2xl p-6 border border-pink-500/30 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">💵 Add Funds with Bitcoin</h2>
          
          {!activeDeposit ? (
            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-pink-200 mb-2">Amount to Deposit (USD)</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  min="5"
                  max="1000"
                  step="0.01"
                  className="w-full px-4 py-3 bg-black/50 border border-pink-500/50 rounded-lg text-white focus:outline-none focus:border-pink-400"
                  placeholder="Enter amount ($5-1000)"
                  required
                />
                <p className="text-pink-300 text-sm mt-1">Minimum $5, Maximum $1000</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {quickAmounts.map(amount => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setDepositAmount(amount.toString())}
                    className="px-4 py-2 bg-pink-500/20 border border-pink-500/30 rounded-lg text-pink-300 hover:bg-pink-500/30 transition duration-200"
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition duration-200"
                disabled={!depositAmount}
              >
                Pay with Bitcoin
              </button>
            </form>
          ) : (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-green-300 mb-4">🚀 Payment Created</h3>
              <p className="text-green-200 mb-4">Redirecting to NowPayments to complete your Bitcoin payment...</p>
              
              <div className="space-y-2 text-green-200 text-sm">
                <p><strong>Amount:</strong> ${depositAmount}</p>
                <p><strong>BTC Amount:</strong> {activeDeposit.btcAmount}</p>
                <p><strong>Address:</strong> <code className="bg-black/30 p-1 rounded">{activeDeposit.btcAddress}</code></p>
              </div>

              <div className="mt-4 flex gap-3 flex-wrap">
                <button
                  onClick={() => window.open(activeDeposit.paymentUrl, '_blank')}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition duration-200"
                >
                  Open Payment Page
                </button>
                <button
                  onClick={() => setActiveDeposit(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition duration-200"
                >
                  New Deposit
                </button>
              </div>
            </div>
          )}

          {message && (
            <div className={`mt-4 p-3 rounded-lg border ${
              message.includes('Error') ? 'bg-red-500/20 border-red-500/30 text-red-200' : 
              message.includes('Please log in') ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-200' :
              'bg-blue-500/20 border-blue-500/30 text-blue-200'
            }`}>
              <p>{message}</p>
            </div>
          )}
        </div>

        {/* Deposit History */}
        <div className="bg-black/40 rounded-2xl p-6 border border-pink-500/30">
          <h2 className="text-2xl font-bold text-white mb-4">📊 Deposit History</h2>
          
          {deposits.length === 0 ? (
            <p className="text-pink-200 text-center py-8">No deposits yet</p>
          ) : (
            <div className="space-y-3">
              {deposits.map(deposit => (
                <div key={deposit.id} className="p-4 bg-black/50 rounded-lg border border-pink-500/20 hover:border-pink-500/40 transition duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(deposit.status)}`}>
                        {deposit.status.toUpperCase()}
                      </span>
                      <span className="text-pink-200 font-semibold">
                        ${deposit.amountUSD}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-pink-300 text-sm">
                        {deposit.btcAmount} BTC
                      </div>
                      <div className="text-gray-400 text-xs">
                        {deposit.createdAt?.toDate().toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  {deposit.status === 'pending' && (
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-yellow-400">Waiting for payment confirmation...</span>
                      <button
                        onClick={() => checkStatus(deposit.id)}
                        disabled={checkingStatus[deposit.id]}
                        className="px-2 py-1 bg-pink-500/20 text-pink-300 rounded text-xs hover:bg-pink-500/30 disabled:opacity-50 transition duration-200"
                      >
                        {checkingStatus[deposit.id] ? 'Checking...' : 'Check Status'}
                      </button>
                    </div>
                  )}
                  
                  {deposit.confirmedAt && (
                    <div className="mt-2 text-xs text-green-400">
                      Confirmed: {deposit.confirmedAt.toDate().toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <h4 className="text-blue-300 font-semibold mb-2">💡 How It Works</h4>
          <div className="text-blue-200 text-sm space-y-1">
            <p>1. <strong>Enter amount</strong> you want to deposit (USD)</p>
            <p>2. <strong>Redirect to NowPayments</strong> to complete Bitcoin payment</p>
            <p>3. <strong>Automatic confirmation</strong> - system detects payment automatically</p>
            <p>4. <strong>Funds added to wallet</strong> - use for ads and premium features</p>
            <p className="text-red-200 mt-2">🚫 No withdrawals - funds can only be used on our platform</p>
          </div>
        </div>
      </div>
    </div>
  );
}