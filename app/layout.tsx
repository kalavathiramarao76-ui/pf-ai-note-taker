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
          <div className="nav-header">
            <Link href="/">
              <a>AutoNote</a>
            </Link>
            <button className="nav-toggle" onClick={toggleNav}>
              {navOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
            </button>
          </div>
          <motion.div
            initial={{ x: '-100%' }}
            animate={navOpen ? { x: 0 } : { x: '-100%' }}
            transition={{ duration: 0.5 }}
            className="nav-menu"
          >
            <ul>
              <li>
                <Link href="/">
                  <a>Home</a>
                </Link>
              </li>
              <li>
                <Link href="/notes">
                  <a>Notes</a>
                </Link>
              </li>
              <li>
                <Link href="/settings">
                  <a>Settings</a>
                </Link>
              </li>
            </ul>
          </motion.div>
          <div className="nav-notifications">
            {notifications.map((notification, index) => (
              <div key={index} className="notification">
                {notification}
              </div>
            ))}
          </div>
        </nav>
        <main>
          {children}
        </main>
        <button className="dark-mode-toggle" onClick={toggleDarkMode}>
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        <style jsx>
          {`
            .nav {
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              padding: 1rem;
              background-color: #f9f9f9;
              border-bottom: 1px solid #ddd;
            }

            .nav-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              width: 100%;
            }

            .nav-toggle {
              background-color: transparent;
              border: none;
              cursor: pointer;
            }

            .nav-menu {
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              padding: 1rem;
              background-color: #f9f9f9;
              width: 100%;
            }

            .nav-menu ul {
              list-style: none;
              padding: 0;
              margin: 0;
            }

            .nav-menu li {
              margin-bottom: 1rem;
            }

            .nav-menu a {
              text-decoration: none;
              color: #333;
            }

            .nav-notifications {
              position: fixed;
              top: 1rem;
              right: 1rem;
              display: flex;
              flex-direction: column;
              align-items: flex-end;
            }

            .notification {
              background-color: #f9f9f9;
              border: 1px solid #ddd;
              padding: 1rem;
              margin-bottom: 1rem;
              width: 200px;
              text-align: center;
            }

            .dark-mode-toggle {
              position: fixed;
              bottom: 1rem;
              right: 1rem;
              background-color: #333;
              color: #fff;
              border: none;
              padding: 1rem;
              cursor: pointer;
            }

            .dark-mode-toggle:hover {
              background-color: #444;
            }
          `}
        </style>
      </body>
    </html>
  );
}