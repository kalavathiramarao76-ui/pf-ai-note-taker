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
    if (event.key === 'ArrowDown' && navOpen) {
      const menuItems = document.querySelectorAll('.nav-menu li');
      const currentActive = document.activeElement;
      const currentIndex = Array.prototype.indexOf.call(menuItems, currentActive);
      const nextIndex = (currentIndex + 1) % menuItems.length;
      menuItems[nextIndex].focus();
    }
    if (event.key === 'ArrowUp' && navOpen) {
      const menuItems = document.querySelectorAll('.nav-menu li');
      const currentActive = document.activeElement;
      const currentIndex = Array.prototype.indexOf.call(menuItems, currentActive);
      const nextIndex = (currentIndex - 1 + menuItems.length) % menuItems.length;
      menuItems[nextIndex].focus();
    }
    if (event.key === 'Enter' && navOpen) {
      const currentActive = document.activeElement;
      if (currentActive.tagName === 'A') {
        currentActive.click();
      }
    }
    if (event.key === 'Tab' && navOpen) {
      event.preventDefault();
      const menuItems = document.querySelectorAll('.nav-menu li');
      const currentActive = document.activeElement;
      const currentIndex = Array.prototype.indexOf.call(menuItems, currentActive);
      const nextIndex = (currentIndex + 1) % menuItems.length;
      menuItems[nextIndex].focus();
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
    <nav
      className={`nav ${highContrastMode ? 'high-contrast-mode' : ''}`}
      aria-label="Main navigation"
      role="navigation"
    >
      <button
        className="nav-toggle"
        aria-label="Toggle navigation"
        aria-expanded={navOpen}
        aria-controls="nav-menu"
        onClick={toggleNav}
        onKeyDown={handleKeyDown}
      >
        {navOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
      </button>
      <ul
        className={`nav-menu ${navOpen ? 'open' : ''}`}
        id="nav-menu"
        role="menu"
        aria-label="Navigation menu"
      >
        {filteredLinksMemo.map((link, index) => (
          <li key={index} role="menuitem">
            <Link href={link.href} aria-label={link.text}>
              {link.text}
            </Link>
          </li>
        ))}
      </ul>
      <form
        className="search-form"
        onSubmit={handleSearch}
        aria-label="Search form"
      >
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search"
          aria-label="Search input"
        />
        <button type="submit" aria-label="Search submit">
          Search
        </button>
      </form>
      <button
        className="high-contrast-mode-toggle"
        aria-label="Toggle high contrast mode"
        onClick={handleHighContrastMode}
      >
        {highContrastMode ? 'Disable high contrast mode' : 'Enable high contrast mode'}
      </button>
    </nav>
  );
});

export default Nav;