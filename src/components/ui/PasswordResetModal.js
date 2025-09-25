// src/components/ui/PasswordResetModal.js
'use client';
import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function PasswordResetModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Check your inbox.');
      setEmail('');
    } catch (error) {
      setMessage('Error sending reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-lg border border-pink-500/30 rounded-2xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-white mb-4">Reset Password</h3>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-sm text-pink-200 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-black/20 border border-pink-500/30 rounded-lg text-white focus:outline-none focus:border-pink-400"
              placeholder="your@email.com"
              required
            />
          </div>
          {message && (
            <p className={`text-sm ${message.includes('Error') ? 'text-red-300' : 'text-green-300'}`}>
              {message}
            </p>
          )}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-pink-500/30 text-pink-300 rounded-lg hover:bg-pink-500/10 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}