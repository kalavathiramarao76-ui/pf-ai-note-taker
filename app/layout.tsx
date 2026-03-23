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
    <nav className="nav" aria-label="Main navigation" onKeyDown={handleKeyDown} role="navigation">
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
          <form onSubmit={handleSearch} aria-label="Search form">
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search notes and meetings"
              aria-label="Search notes and meetings"
              aria-describedby="search-description"
            />
            <button type="submit" aria-label="Submit search query">Search</button>
            <p id="search-description" className="sr-only">Search notes and meetings by keyword or phrase.</p>
          </form>
        </li>
        <li role="menuitem" tabIndex={navOpen ? 0 : -1}>
          <Link href="/" aria-label="Home page">Home</Link>
        </li>
        <li role="menuitem" tabIndex={navOpen ? 0 : -1}>
          <Link href="/about" aria-label="About page">About</Link>
        </li>
        <li role="menuitem" tabIndex={navOpen ? 0 : -1}>
          <Link href="/contact" aria-label="Contact page">Contact</Link>
        </li>
      </ul>
      {navOpen && (
        <div
          className="nav-overlay"
          aria-hidden={true}
          onClick={toggleNav}
          role="presentation"
        />
      )}
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
  };

  return (
    <html lang="en" className={darkMode ? 'dark' : ''}>
      <Head>
        <title>AutoNote: AI-Powered Note Taker</title>
        <meta name="description" content="AutoNote: AI-Powered Note Taker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <Nav />
        <main className="main">{children}</main>
        <button
          className="dark-mode-toggle"
          onClick={toggleDarkMode}
          aria-label="Toggle dark mode"
        >
          {darkMode ? 'Light mode' : 'Dark mode'}
        </button>
        <ul className="notifications">
          {notifications.map((notification, index) => (
            <li key={index}>{notification}</li>
          ))}
        </ul>
      </body>
    </html>
  );
}