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
        <meta name="msapplication-TileColor" content="#000" />
        <meta name="msapplication-TileImage" content="/mstile-144x144.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </Head>
      <body className="font-sans text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-900">
        <header className="fixed top-0 left-0 right-0 z-10 bg-gray-100 dark:bg-gray-900 shadow-md">
          <nav className="container mx-auto flex justify-between items-center py-4">
            <Link href="/" className="text-lg font-bold text-gray-900 dark:text-gray-100">AutoNote</Link>
            <button className="lg:hidden" onClick={toggleNav}>
              {navOpen ? <AiOutlineClose size={24} className="text-gray-900 dark:text-gray-100" /> : <AiOutlineMenu size={24} className="text-gray-900 dark:text-gray-100" />}
            </button>
            <ul className={`lg:flex lg:items-center lg:justify-between ${navOpen ? 'block' : 'hidden'} lg:block`}>
              <li className="lg:mr-6">
                <Link href="/" className="text-lg font-bold text-gray-900 dark:text-gray-100">Home</Link>
              </li>
              <li className="lg:mr-6">
                <Link href="/features" className="text-lg font-bold text-gray-900 dark:text-gray-100">Features</Link>
              </li>
              <li className="lg:mr-6">
                <Link href="/pricing" className="text-lg font-bold text-gray-900 dark:text-gray-100">Pricing</Link>
              </li>
              <li>
                <button className="bg-gray-900 dark:bg-gray-100 text-gray-100 dark:text-gray-900 py-2 px-4 rounded" onClick={toggleDarkMode}>Toggle Dark Mode</button>
              </li>
            </ul>
          </nav>
        </header>
        <main className="container mx-auto p-4 pt-6 md:p-6 lg:p-12 xl:p-24">
          {children}
        </main>
      </body>
    </html>
  );
}