import { useState, useEffect, memo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import { motion } from 'framer-motion';

const Nav = memo(() => {
  const [navOpen, setNavOpen] = useState(false);
  const router = useRouter();

  const toggleNav = () => {
    setNavOpen(!navOpen);
  };

  return (
    <nav className="nav" aria-label="Main navigation">
      <button
        className="nav-toggle"
        onClick={toggleNav}
        aria-expanded={navOpen}
        aria-label="Toggle navigation menu"
      >
        {navOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
      </button>
      <ul
        className={`nav-menu ${navOpen ? 'open' : ''}`}
        aria-hidden={!navOpen}
        role="menu"
      >
        <li role="menuitem">
          <Link href="/">Home</Link>
        </li>
        <li role="menuitem">
          <Link href="/about">About</Link>
        </li>
        <li role="menuitem">
          <Link href="/contact">Contact</Link>
        </li>
      </ul>
    </nav>
  );
});

export default function RootLayout({ children }) {
  const [darkMode, setDarkMode] = useState(false);
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
      </Head>
      <body className="flex flex-col min-h-screen">
        <Nav />
        <main className="flex-1">{children}</main>
      </body>
      <style jsx global>
        {`
          .nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            background-color: #333;
            color: #fff;
          }

          .nav-toggle {
            background-color: transparent;
            border: none;
            padding: 0.5rem;
            font-size: 1.5rem;
            cursor: pointer;
          }

          .nav-menu {
            list-style: none;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 1rem;
            background-color: #333;
            color: #fff;
            position: absolute;
            top: 4rem;
            left: 0;
            width: 100%;
            transform: translateY(-100%);
            transition: transform 0.3s ease;
          }

          .nav-menu.open {
            transform: translateY(0);
          }

          .nav-menu li {
            margin-bottom: 1rem;
          }

          .nav-menu a {
            color: #fff;
            text-decoration: none;
          }

          @media (min-width: 768px) {
            .nav-menu {
              flex-direction: row;
              justify-content: space-between;
              position: static;
              transform: none;
              background-color: transparent;
              padding: 0;
            }

            .nav-menu li {
              margin-right: 2rem;
            }

            .nav-menu.open {
              transform: none;
            }
          }
        `}
      </style>
    </html>
  );
}