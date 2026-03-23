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
      </Head>
      <body>
        <nav className="nav">
          <div className="nav-brand">
            <Link href="/">
              <a>AutoNote</a>
            </Link>
          </div>
          <div className="nav-links">
            <Link href="/notes">
              <a>Notes</a>
            </Link>
            <Link href="/meetings">
              <a>Meetings</a>
            </Link>
            <Link href="/settings">
              <a>Settings</a>
            </Link>
          </div>
          <div className="nav-actions">
            <button className="nav-toggle" onClick={toggleNav}>
              {navOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
            </button>
            <button className="nav-dark-mode" onClick={toggleDarkMode}>
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </nav>
        <div className="nav-overlay" onClick={toggleNav} style={{ display: navOpen ? 'block' : 'none' }} />
        <div className="notifications">
          {notifications.map((notification, index) => (
            <div key={index} className="notification">
              {notification}
            </div>
          ))}
        </div>
        <main className="main">
          {children}
        </main>
      </body>
      <style jsx>
        {`
          .nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            background-color: #fff;
            border-bottom: 1px solid #ddd;
          }

          .nav-brand {
            font-size: 1.5rem;
            font-weight: bold;
          }

          .nav-links {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .nav-links a {
            margin-right: 1rem;
          }

          .nav-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .nav-toggle {
            background-color: transparent;
            border: none;
            cursor: pointer;
          }

          .nav-dark-mode {
            background-color: transparent;
            border: none;
            cursor: pointer;
          }

          .nav-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: none;
          }

          .notifications {
            position: fixed;
            top: 1rem;
            right: 1rem;
            z-index: 1;
          }

          .notification {
            background-color: #fff;
            border: 1px solid #ddd;
            padding: 1rem;
            margin-bottom: 1rem;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }

          .main {
            padding: 1rem;
          }
        `}
      </style>
    </html>
  );
}