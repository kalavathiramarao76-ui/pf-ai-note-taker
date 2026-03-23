import { useState, useEffect, memo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import { motion } from 'framer-motion';

const Nav = memo(() => {
  const [navOpen, setNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const toggleNav = () => {
    setNavOpen(!navOpen);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setNavOpen(false);
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    // Add logic to handle search query
    console.log('Search query:', searchQuery);
    // For now, just log the search query
    // You can replace this with your actual search logic
  };

  return (
    <nav className="nav" aria-label="Main navigation" onKeyDown={handleKeyDown}>
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
        <li role="menuitem" tabIndex={navOpen ? 0 : -1}>
          <form onSubmit={handleSearch}>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search notes and meetings"
              aria-label="Search notes and meetings"
            />
            <button type="submit">Search</button>
          </form>
        </li>
        <li role="menuitem" tabIndex={navOpen ? 0 : -1}>
          <Link href="/">Home</Link>
        </li>
        <li role="menuitem" tabIndex={navOpen ? 0 : -1}>
          <Link href="/about">About</Link>
        </li>
        <li role="menuitem" tabIndex={navOpen ? 0 : -1}>
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
      </Head>
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
}