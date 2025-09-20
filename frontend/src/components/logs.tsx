'use client';

import { useState } from 'react';

export default function AdminPanel() {
  const [slackId, setSlackId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const addAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!slackId.trim()) {
      setMessage('bro you need to enter a slack id');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/add-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slackId: slackId.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`admin added! password sent to ${slackId}`);
        setSlackId('');
      } else {
        setMessage(data.error || 'shit went wrong');
      }
    } catch {
      setMessage('this shit is broken asf');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="space-y-6">
      <div className="bg-black/95 border border-gray-600 p-6">
        <h2 className="text-white font-mono mb-4">add new admin</h2>
        
        <form onSubmit={addAdmin} className="space-y-4">
          <div>
            <label className="block text-gray-300 font-mono text-sm mb-2">
              slack id:
            </label>
            <input
              type="text"
              value={slackId}
              onChange={(e) => setSlackId(e.target.value)}
              placeholder="U1234567890"
              className="w-full max-w-sm bg-black/50 border border-gray-600 text-white font-mono px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !slackId.trim()}
            className="bg-green-900/30 border border-green-600 text-green-300 px-4 py-2 font-mono text-sm hover:bg-green-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'sending...' : 'add admin'}
          </button>
          
          {message && (
            <div className={`font-mono text-sm ${message.includes('added') ? 'text-green-400' : 'text-red-400'}`}>
              {message}
            </div>
          )}
        </form>
      </div>
      </div>
  );
}