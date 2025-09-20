'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface StatsData {
  total: number;
  open: number;
  closed: number;
}

export default function NerdStats() {
  const [stats, setStats] = useState<StatsData>({ total: 0, open: 0, closed: 0 });
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setError('');

    try {
      const totalRes = await fetch('/api/sao/stats?type=total');
      const openRes = await fetch('/api/sao/stats?type=open');
      const closedRes = await fetch('/api/sao/stats?type=closed');

      if (totalRes.ok && openRes.ok && closedRes.ok) {
        const totalData = await totalRes.json();
        const openData = await openRes.json();
        const closedData = await closedRes.json();

        setStats({
          total: totalData.amount || 0,
          open: openData.amount || 0,
          closed: closedData.amount || 0
        });
      } else {
        setError('api is fucked');
      }
    } catch {
      setError('shit broke');
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const barData = [
    { name: 'Total', value: stats.total, color: '#3b82f6' },
    { name: 'Open', value: stats.open, color: '#eab308' },
    { name: 'Closed', value: stats.closed, color: '#22c55e' }
  ];

  const pieData = [
    { name: 'Open', value: stats.open, color: '#eab308' },
    { name: 'Closed', value: stats.closed, color: '#22c55e' }
  ];

  return (
    <div className="space-y-6">

      {error && (
        <div className="text-red-400 font-mono text-sm p-4 border border-red-600 bg-red-900/20">
          error: {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-black/95 border border-blue-600 p-6">
          <div className="text-blue-400 font-mono text-lg mb-2">total flagged</div>
          <div className="text-white font-mono text-4xl font-bold mb-4">{stats.total}</div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[{ name: 'Start', value: 0 }, { name: 'Now', value: stats.total }]}>
                <XAxis dataKey="name" />
                <YAxis />
                <Line dataKey="value" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-black/95 border border-yellow-600 p-6">
          <div className="text-yellow-400 font-mono text-lg mb-2">pending review</div>
          <div className="text-white font-mono text-4xl font-bold mb-4">{stats.open}</div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[{ name: 'Start', value: 0 }, { name: 'Now', value: stats.open }]}>
                <XAxis dataKey="name" />
                <YAxis />
                <Line dataKey="value" stroke="#eab308" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-black/95 border border-green-600 p-6">
          <div className="text-green-400 font-mono text-lg mb-2">resolved</div>
          <div className="text-white font-mono text-4xl font-bold mb-4">{stats.closed}</div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[{ name: 'Start', value: 0 }, { name: 'Now', value: stats.closed }]}>
                <XAxis dataKey="name" />
                <YAxis />
                <Line dataKey="value" stroke="#22c55e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-black/95 border border-gray-600 p-6">
          <div className="text-white font-mono text-lg mb-4">overview comparison</div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Bar dataKey="value">
                  {barData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-black/95 border border-gray-600 p-6">
          <div className="text-white font-mono text-lg mb-4">status distribution</div>
          <div className="h-60">
            {stats.open + stats.closed > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 font-mono">
                no data to show
              </div>
            )}
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 mr-2"></div>
              <span className="text-yellow-400 font-mono text-sm">open</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 mr-2"></div>
              <span className="text-green-400 font-mono text-sm">closed</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-black/95 border border-gray-600 p-6">
        <div className="text-white font-mono text-lg mb-4">quick stats</div>
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-blue-400 font-mono text-2xl font-bold">
              {stats.total > 0 ? ((stats.total / stats.total) * 100).toFixed(0) : 0}%
            </div>
            <div className="text-gray-400 font-mono text-sm">total coverage</div>
          </div>
          <div>
            <div className="text-yellow-400 font-mono text-2xl font-bold">
              {stats.total > 0 ? ((stats.open / stats.total) * 100).toFixed(0) : 0}%
            </div>
            <div className="text-gray-400 font-mono text-sm">pending work</div>
          </div>
          <div>
            <div className="text-green-400 font-mono text-2xl font-bold">
              {stats.total > 0 ? ((stats.closed / stats.total) * 100).toFixed(0) : 0}%
            </div>
            <div className="text-gray-400 font-mono text-sm">completion rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}