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
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AutoNote: AI-Powered Note Taker" />
        <meta name="twitter:description" content="AutoNote uses AI to automatically generate notes from meetings, calls, and lectures." />
        <meta name="twitter:image" content="/twitter-image.png" />
      </Head>
      <body className="font-sans text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-900">
        <header className="fixed top-0 left-0 right-0 z-10 bg-gray-100 dark:bg-gray-900 shadow-md">
          <nav className="container mx-auto flex justify-between items-center py-4">
            <Link href="/" className="text-lg font-bold text-gray-900 dark:text-gray-100">
              AutoNote
            </Link>
            <button
              className="lg:hidden flex justify-center items-center w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-full"
              onClick={toggleNav}
            >
              {navOpen ? <AiOutlineClose size={24} /> : <AiOutlineMenu size={24} />}
            </button>
            <div className={`lg:w-1/2 w-full lg:static absolute top-16 left-0 right-0 lg:px-0 px-4 ${navOpen ? 'block' : 'hidden'} lg:block`}>
              <ul className="lg:flex lg:items-center lg:justify-end flex flex-col lg:space-x-6 space-y-4 lg:space-y-0">
                <li className="lg:ml-0 ml-4">
                  <Link href="/notes" className="text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300">
                    Notes
                  </Link>
                </li>
                <li className="lg:ml-0 ml-4">
                  <Link href="/meetings" className="text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300">
                    Meetings
                  </Link>
                </li>
                <li className="lg:ml-0 ml-4">
                  <Link href="/settings" className="text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300">
                    Settings
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </header>
        <main className="pt-16 lg:pl-64">
          {children}
        </main>
        <aside className={`lg:w-64 lg:fixed lg:top-16 lg:left-0 lg:bottom-0 lg:overflow-y-auto lg:py-4 lg:px-4 lg:bg-gray-100 dark:lg:bg-gray-900 lg:block ${navOpen ? 'block' : 'hidden'} lg:hidden`}>
          <ul className="flex flex-col space-y-4">
            <li>
              <Link href="/notes" className="text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300">
                Notes
              </Link>
            </li>
            <li>
              <Link href="/meetings" className="text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300">
                Meetings
              </Link>
            </li>
            <li>
              <Link href="/settings" className="text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300">
                Settings
              </Link>
            </li>
          </ul>
        </aside>
      </body>
    </html>
  );
}