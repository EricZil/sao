'use client';

import { useState, useEffect } from 'react';
import UserData from './user-data';

interface UsersDBProps {
  autoSearchUserId?: string;
}

export default function UsersDB({ autoSearchUserId }: UsersDBProps) {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<{ user?: unknown; profile?: unknown; conversations?: unknown } | null>(null);
  const [saoUserData, setSaoUserData] = useState<{ ok?: boolean; user?: unknown } | null>(null);
  const [error, setError] = useState('');

  const lookupUser = async () => {
    if (!userId.trim()) return;
    
    setLoading(true);
    setError('');
    setUserData(null);
    setSaoUserData(null);

    try {
      const slackRes = await fetch('/api/slack/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId.trim() }),
      });

      let slackData = null;
      if (slackRes.ok) {
        slackData = await slackRes.json();
        setUserData(slackData);
      }

      const saoRes = await fetch(`/api/sao/user?userId=${userId.trim()}`);
      let saoData = null;
      if (saoRes.ok) {
        saoData = await saoRes.json();
        setSaoUserData(saoData);
      }

      if (!slackRes.ok && !saoRes.ok) {
        setError('both apis fucked');
      }
    } catch {
      setError('shit broke');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoSearchUserId) {
      setUserId(autoSearchUserId);
      setLoading(true);
      setError('');
      setUserData(null);
      setSaoUserData(null);

      const searchUser = async () => {
        try {
          const slackRes = await fetch('/api/slack/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: autoSearchUserId.trim() }),
          });

          let slackData = null;
          if (slackRes.ok) {
            slackData = await slackRes.json();
            setUserData(slackData);
          }

          const saoRes = await fetch(`/api/sao/user?userId=${autoSearchUserId.trim()}`);
          let saoData = null;
          if (saoRes.ok) {
            saoData = await saoRes.json();
            setSaoUserData(saoData);
          }

          if (!slackRes.ok && !saoRes.ok) {
            setError('both apis fucked');
          }
        } catch {
          setError('shit broke');
        } finally {
          setLoading(false);
        }
      };

      searchUser();
    }
  }, [autoSearchUserId]);

  return (
    <div className="bg-black/95 border border-gray-600 p-6">
      <h2 className="text-white font-mono mb-6">user db search</h2>
      
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="U1234567890"
          className="flex-1 bg-black border border-gray-600 px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-gray-400"
          onKeyPress={(e) => e.key === 'Enter' && lookupUser()}
        />
        <button
          onClick={lookupUser}
          disabled={loading || !userId.trim()}
          className="bg-gray-800 text-white px-4 py-2 font-mono text-sm hover:bg-gray-700 transition-colors border border-gray-600 disabled:opacity-50"
        >
          {loading ? 'searching...' : 'lookup'}
        </button>
      </div>

      {error && (
        <div className="text-red-400 font-mono text-sm mb-4 p-3 border border-red-600 bg-red-900/20">
          {error}
        </div>
      )}

      {(userData || saoUserData) && (
        <UserData 
          user={userData?.user as never} 
          profile={userData?.profile as never} 
          conversations={userData?.conversations as never}
          saoData={saoUserData as never}
        />
      )}
    </div>
  );
}