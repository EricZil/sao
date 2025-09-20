'use client';

import Image from "next/image";
import CommitInfo from "@/components/commits";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/admin');
      } else {
        const data = await res.json();
        setError(data.error || 'login failed');
      }
    } catch {
      setError('connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-grid min-h-screen w-full">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="border border-gray-600 bg-black/95 p-8 w-full max-w-md">
          
          <div className="text-center mb-8">
            <h1 className="text-white text-xl font-mono mb-6">sao</h1>
            
            <div className="flex justify-center mb-8">
              <div className="w-48 h-48 flex items-center justify-center">
                <Image 
                  src="/sao.webp" 
                  alt="sao" 
                  width={128} 
                  height={128} 
                  className="object-contain"
                />
              </div>
            </div>
          </div>
          
          <form onSubmit={login} className="space-y-4 mb-6">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-gray-600 px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-gray-400"
                placeholder="pass"
                disabled={loading}
              />
            </div>
            
            {error && (
              <div className="text-red-400 font-mono text-sm">
                {error}
              </div>
            )}
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gray-800 text-white py-2 font-mono text-sm hover:bg-gray-700 transition-colors border border-gray-600 disabled:opacity-50"
            >
              {loading ? 'checking...' : 'enter'}
            </button>
          </form>
          
          <div className="text-center">
            <CommitInfo />
          </div>
          
        </div>
      </div>
    </div>
  );
}
