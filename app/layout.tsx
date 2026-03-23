use client;

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import { motion } from 'framer-motion';

export default function RootLayout({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const storedDarkMode = localStorage.getItem('darkMode');
    if (storedDarkMode !== null) {
      setDarkMode(storedDarkMode === 'true');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', String(!darkMode));
  };

  const toggleNav = () => {
    setNavOpen(!navOpen);
  };

  const addNotification = (message) => {
    setNotifications((prevNotifications) => [...prevNotifications, message]);
    setTimeout(() => {
      setNotifications((prevNotifications) => prevNotifications.filter((n) => n !== message));
    }, 5000);
  };

  return (
    <html lang="en" className={darkMode ? 'dark' : ''}>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>AutoNote: AI-Powered Note Taker</title>
        <meta name="description" content="AutoNote uses AI to automatically generate notes from meetings, calls, and lectures." />
        <meta name="keywords" content="note taking app, ai note taker, meeting notes, productivity tools, study notes" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#000" />
        <meta property="og:title" content="AutoNote: AI-Powered Note Taker" />
        <meta property="og:description" content="AutoNote uses AI to automatically generate notes from meetings, calls, and lectures." />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:url" content="https://autonote.app" />
        <meta property="og:site_name" content="AutoNote" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AutoNote: AI-Powered Note Taker" />
        <meta name="twitter:description" content="AutoNote uses AI to automatically generate notes from meetings, calls, and lectures." />
        <meta name="twitter:image" content="/twitter-image.png" />
        <meta name="twitter:site" content="@autonoteapp" />
        <meta name="twitter:creator" content="@autonoteapp" />
        <meta property="fb:app_id" content="YOUR_APP_ID" />
        <meta property="fb:admins" content="YOUR_ADMIN_ID" />
        <meta name="pinterest" content="nopin" />
        <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />
        <meta name="twitter:label1" content="Productivity" />
        <meta name="twitter:label2" content="Note Taking" />
        <meta name="twitter:label3" content="AI" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:locale:alternate" content="fr_FR" />
        <meta property="fb:pages" content="YOUR_PAGE_ID" />
      </Head>
      <body>
        <header className="flex justify-between items-center py-4">
          <Link href="/">
            <a>
              <img src="/logo.png" alt="AutoNote" className="h-8" />
            </a>
          </Link>
          <nav className={`flex flex-col ${navOpen ? 'block' : 'hidden'} md:flex md:flex-row md:items-center`}>
            <Link href="/notes">
              <a className="block md:inline-block py-2 md:py-0 md:mx-4">Notes</a>
            </Link>
            <Link href="/meetings">
              <a className="block md:inline-block py-2 md:py-0 md:mx-4">Meetings</a>
            </Link>
            <Link href="/settings">
              <a className="block md:inline-block py-2 md:py-0 md:mx-4">Settings</a>
            </Link>
          </nav>
          <div className="flex items-center">
            <button onClick={toggleDarkMode} className="md:mx-4">
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m6 9h2.1M18 7.8H6l-1.6 2m0 5.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3m0 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM12 15v3m6-9v-3" />
                </svg>
              )}
            </button>
            <button onClick={toggleNav} className="md:hidden">
              {navOpen ? (
                <AiOutlineClose size={24} />
              ) : (
                <AiOutlineMenu size={24} />
              )}
            </button>
          </div>
        </header>
        <main className="container mx-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
        <div className="fixed bottom-0 right-0 p-4">
          {notifications.map((notification, index) => (
            <div key={index} className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {notification}
            </div>
          ))}
        </div>
      </body>
    </html>
  );
}