use client;

import { useState } from 'react';
import Link from 'next/link';
import { AiOutlineArrowRight } from 'react-icons/ai';
import Hero from '../components/Hero';
import FeatureGrid from '../components/FeatureGrid';
import PricingTable from '../components/PricingTable';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';

export default function Page() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', darkMode ? 'false' : 'true');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <Hero />
      <FeatureGrid />
      <PricingTable />
      <FAQ />
      <Footer />
      <button
        className="fixed bottom-4 right-4 p-2 bg-gray-200 dark:bg-gray-800 rounded-full hover:scale-110 transition-transform"
        onClick={toggleDarkMode}
      >
        {darkMode ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-800 dark:text-gray-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-800 dark:text-gray-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v1m6 16.368V4m6.354 6.354a9 9 0 017.092 12h3m-3.96-7.356a3 3 0 000 6m0 6a3 3 0 11-6 0m-8 4a2.5 2.5 0 11-5 0m8 0a2.5 2.5 0 10-5 0z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}