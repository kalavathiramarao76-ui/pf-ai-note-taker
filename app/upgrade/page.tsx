use client;

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { localStorage } from '../utils/localStorage';

const UpgradePage = () => {
  const router = useRouter();
  const [plan, setPlan] = useState('monthly');
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const userData = localStorage.getUserData();
      if (userData) {
        userData.plan = plan;
        localStorage.setUserData(userData);
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-4">Upgrade to Premium</h1>
      <div className="flex flex-col items-center justify-center mb-8">
        <button
          className={`${
            plan === 'monthly' ? 'bg-blue-500' : 'bg-gray-300'
          } px-4 py-2 rounded-md text-white mb-2`}
          onClick={() => setPlan('monthly')}
        >
          Monthly
        </button>
        <button
          className={`${
            plan === 'yearly' ? 'bg-blue-500' : 'bg-gray-300'
          } px-4 py-2 rounded-md text-white mb-2`}
          onClick={() => setPlan('yearly')}
        >
          Yearly
        </button>
      </div>
      <button
        className="bg-blue-500 px-4 py-2 rounded-md text-white"
        onClick={handleUpgrade}
        disabled={isUpgrading}
      >
        {isUpgrading ? 'Upgrading...' : 'Upgrade Now'}
      </button>
    </div>
  );
};

export default UpgradePage;