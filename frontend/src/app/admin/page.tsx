'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Tabs from '@/components/tabs';
import Stats from '@/components/stats';
import Users from '@/components/users';
import SaoPanel from '@/components/sao';
import Logs from '@/components/logs';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('nerd-stats');
  const [searchUserId, setSearchUserId] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin')
      .then(res => {
        if (res.status === 302 || !res.ok) {
          router.push('/');
          return;
        }
        setLoading(false);
      })
      .catch(() => {
        router.push('/');
      });
  }, [router]);

  const changeTab = (category: string) => {
    setActiveCategory(category);
    if (category !== 'users-db') {
      setSearchUserId('');
    }
  };

  const clickUser = (userId: string) => {
    setSearchUserId(userId);
    setActiveCategory('users-db');
  };

  const renderContent = () => {
    switch (activeCategory) {
      case 'nerd-stats':
        return <Stats />;
      case 'users-db':
        return <Users autoSearchUserId={searchUserId} />;
      case 'sao':
        return <SaoPanel onUserClick={clickUser} />;
      case 'admin':
        return <Logs />;
      default:
        return <Stats />;
    }
  };

  if (loading) {
    return (
      <div className="bg-grid min-h-screen w-full flex items-center justify-center">
        <div className="text-white font-mono">hacking...</div>
      </div>
    );
  }

  return (
    <div className="bg-grid min-h-screen w-full p-8">
      <div className="max-w-6xl mx-auto mb-8">
        <Tabs onCategoryChange={changeTab} activeCategory={activeCategory} />
      </div>
      <div className={activeCategory === 'sao' ? 'w-full' : 'max-w-6xl mx-auto'}>
        {renderContent()}
      </div>
    </div>
  );
}