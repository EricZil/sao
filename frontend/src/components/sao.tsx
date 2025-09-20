'use client';

import { useState, useEffect } from 'react';

interface SaoMessage {
  id: string;
  text: string;
  channel: string;
  user: string;
  time: string;
  status: boolean;
  output: {
    hate: boolean;
    sexual_content: boolean;
    sexual_minors: boolean;
    violence: boolean;
    self_harm: boolean;
    extremism: boolean;
    severity: string;
    rationale_short: string;
  };
}

interface SaoPanelProps {
  onUserClick?: (userId: string) => void;
}

export default function SaoPanel({ onUserClick }: SaoPanelProps) {
  const [messages, setMessages] = useState<SaoMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [error, setError] = useState('');

  const fetchMessages = async (type: 'all' | 'open' | 'closed') => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/sao/messages?type=${type}`);
      const data = await res.json();
      
      if (res.ok) {
        let messageList = data.messages || data || [];
        
        if (typeof messageList === 'string') {
          messageList = JSON.parse(messageList);
        }
        
        setMessages(Array.isArray(messageList) ? messageList : []);
        
        if (data.error) {
          setError(data.error);
        }
      } else {
        setError('api said no');
        setMessages([]);
      }
    } catch {
      setError('shit broke');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const closeMessage = async (messageId: string) => {
    try {
      const res = await fetch('/api/sao/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId }),
      });

      if (res.ok) {
        fetchMessages(filter);
      } else {
        setError('close failed');
      }
    } catch {
      setError('close fucked up');
    }
  };

  useEffect(() => {
    fetchMessages('all');
  }, []);

  return (
    <div className="bg-black/95 border border-gray-600 p-6 w-full">      
      <div className="flex gap-2 mb-6">
        {(['all', 'open', 'closed'] as const).map((type) => (
          <button
            key={type}
            onClick={() => {
              setFilter(type);
              fetchMessages(type);
            }}
            className={`px-3 py-1 font-mono text-sm border transition-colors ${
              filter === type 
                ? 'bg-gray-600 text-white border-gray-400' 
                : 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700'
            }`}
          >
            [{type}]
          </button>
        ))}
        <button
          onClick={() => fetchMessages(filter)}
          disabled={loading}
          className="px-3 py-1 font-mono text-sm bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'getting...' : 'refresh'}
        </button>
      </div>

      <div className="mb-4 p-3 bg-gray-900/50 border border-gray-700">
        <div className="text-gray-400 font-mono text-xs mb-2">content flags:</div>
        <div className="flex flex-wrap gap-4 text-xs font-mono text-gray-400">
          <span><span className="text-red-400">V</span> = Violence</span>
          <span><span className="text-red-400">SH</span> = Self-harm</span>
          <span><span className="text-red-400">H</span> = Hate</span>
          <span><span className="text-red-400">S</span> = Sexual content</span>
          <span><span className="text-red-400">M</span> = Sexual minors</span>
          <span><span className="text-red-400">E</span> = Extremism</span>
        </div>
      </div>

      {error && (
        <div className="text-red-400 font-mono text-sm mb-4 p-3 border border-red-600 bg-red-900/20">
          {error}
        </div>
      )}

      <div className="w-full">
        {!Array.isArray(messages) || messages.length === 0 ? (
          <div className="text-gray-400 font-mono text-sm p-4 border border-gray-700">
            {!Array.isArray(messages) ? 'data format fucked' : 'no messages found'}
          </div>
        ) : (
          <div className="w-full">
            <table className="w-full font-mono text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-3 text-blue-400 font-normal">Msg ID</th>
                  <th className="text-left p-3 text-blue-400 font-normal">Message</th>
                  <th className="text-left p-3 text-blue-400 font-normal">Verdict</th>
                  <th className="text-left p-3 text-blue-400 font-normal">Severity</th>
                  <th className="text-left p-3 text-blue-400 font-normal">User</th>
                  <th className="text-left p-3 text-blue-400 font-normal">Channel</th>
                  <th className="text-left p-3 text-blue-400 font-normal">Created At</th>
                  <th className="text-left p-3 text-blue-400 font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((message, index) => (
                  <tr key={message.id} className={`border-b border-gray-800 hover:bg-gray-900/50 ${index % 2 === 0 ? 'bg-gray-950/30' : 'bg-transparent'}`}>
                    <td className="p-3">
                      <div className="text-blue-400 text-xs">
                        {message.id}
                      </div>
                    </td>
                    <td className="p-3 max-w-md">
                      <div className="text-white text-sm break-words">
                        {message.text}
                      </div>
                      <div className="text-orange-400 text-xs mt-1">
                        {message.output.rationale_short}
                      </div>
                    </td>
                    <td className="p-3">
                      {message.status ? (
                        <span className="bg-green-900/20 text-green-400 px-2 py-1 text-xs border border-green-600 rounded">
                          RESOLVED
                        </span>
                      ) : (
                        <span className="bg-yellow-900/20 text-yellow-400 px-2 py-1 text-xs border border-yellow-600 rounded">
                          PENDING
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 text-xs border rounded ${
                        message.output.severity === 'high' 
                          ? 'text-red-400 border-red-600 bg-red-900/20' 
                          : message.output.severity === 'medium'
                          ? 'text-yellow-400 border-yellow-600 bg-yellow-900/20'
                          : 'text-gray-400 border-gray-600 bg-gray-900/20'
                      }`}>
                        {message.output.severity?.toUpperCase() || 'LOW'}
                      </span>
                      <div className="flex gap-1 mt-1">
                        {message.output.violence && <span className="text-red-400 text-xs">V</span>}
                        {message.output.hate && <span className="text-red-400 text-xs">H</span>}
                        {message.output.self_harm && <span className="text-red-400 text-xs">SH</span>}
                        {message.output.sexual_content && <span className="text-red-400 text-xs">S</span>}
                        {message.output.sexual_minors && <span className="text-red-400 text-xs">M</span>}
                        {message.output.extremism && <span className="text-red-400 text-xs">E</span>}
                      </div>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => onUserClick?.(message.user)}
                        className="text-blue-400 text-sm hover:text-blue-300 transition-colors underline cursor-pointer"
                      >
                        {message.user}
                      </button>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => window.open(`slack://channel?team=T0266FRGM&id=${message.channel}`, '_blank')}
                        className="text-blue-400 text-sm hover:text-blue-300 transition-colors underline cursor-pointer"
                      >
                        {message.channel}
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="text-gray-400 text-xs">
                        {new Date(message.time).toLocaleDateString()}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {new Date(message.time).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="p-3">
                      {!message.status && (
                        <button
                          onClick={() => closeMessage(message.id)}
                          className="text-xs px-3 py-1 bg-red-800 text-red-200 border border-red-600 hover:bg-red-700 transition-colors rounded"
                        >
                          close
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}