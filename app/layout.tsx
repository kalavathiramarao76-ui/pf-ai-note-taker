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
            <ul className={`lg:flex hidden justify-end items-center ${navOpen ? 'block' : 'hidden'} lg:block`}>
              <li className="lg:ml-6 ml-0 lg:my-0 my-4">
                <Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                  About
                </Link>
              </li>
              <li className="lg:ml-6 ml-0 lg:my-0 my-4">
                <Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                  Contact
                </Link>
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