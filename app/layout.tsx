import { useState, useEffect, memo, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import { motion } from 'framer-motion';

const Nav = memo(() => {
  const [navOpen, setNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highContrastMode, setHighContrastMode] = useState(false);
  const links = useMemo(() => [
    { href: '/', text: 'Home' },
    { href: '/about', text: 'About' },
    { href: '/contact', text: 'Contact' },
  ], []);
  const [filteredLinks, setFilteredLinks] = useState(links);
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
    const filtered = links.filter((link) =>
      link.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredLinks(filtered);
    console.log('Search query:', searchQuery);
  };

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredLinks(links);
    }
  }, [searchQuery, links]);

  const filteredLinksMemo = useMemo(() => {
    if (searchQuery === '') {
      return links;
    }
    return links.filter((link) =>
      link.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, links]);

  const handleHighContrastMode = () => {
    setHighContrastMode(!highContrastMode);
    document.body.classList.toggle('high-contrast-mode');
  };

  return (
    <nav className={`nav ${highContrastMode ? 'high-contrast-mode' : ''}`} aria-label="Main navigation" onKeyDown={handleKeyDown} role="navigation">
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
          <form onSubmit={handleSearch} aria-label="Search form" className="search-form">
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search notes and meetings"
              aria-label="Search notes and meetings"
              aria-describedby="search-description"
              className="search-input"
            />
            <button type="submit" aria-label="Submit search query" className="search-button">Search</button>
            <p id="search-description" className="sr-only">Search notes and meetings by keyword or phrase.</p>
          </form>
        </li>
        {filteredLinksMemo.map((link) => (
          <li key={link.href} role="menuitem" tabIndex={navOpen ? 0 : -1}>
            <Link href={link.href} aria-label={link.text}>{link.text}</Link>
          </li>
        ))}
      </ul>
      {navOpen && (
        <div
          className="nav-overlay"
          aria-hidden={true}
          onClick={toggleNav}
        />
      )}
      <button
        className="high-contrast-mode-toggle"
        onClick={handleHighContrastMode}
        aria-label="Toggle high contrast mode"
      >
        {highContrastMode ? 'Disable high contrast mode' : 'Enable high contrast mode'}
      </button>
      <button
        className="screen-reader-support-toggle"
        aria-label="Toggle screen reader support"
        onClick={() => {
          document.body.classList.toggle('screen-reader-support');
        }}
      >
        {document.body.classList.contains('screen-reader-support') ? 'Disable screen reader support' : 'Enable screen reader support'}
      </button>
    </nav>
  );
});

export default Nav;