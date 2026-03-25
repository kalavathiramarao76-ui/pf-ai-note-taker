import { useState, useEffect, memo, useMemo, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import { motion } from 'framer-motion';

const Nav = memo(() => {
  const [navOpen, setNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highContrastMode, setHighContrastMode] = useState(false);
  const linksMap = useMemo(() => {
    const links = [
      { href: '/', text: 'Home' },
      { href: '/about', text: 'About' },
      { href: '/contact', text: 'Contact' },
    ];
    return new Map(links.map((link) => [link.text.toLowerCase(), link]));
  }, []);
  const router = useRouter();

  const toggleNav = useCallback(() => {
    setNavOpen(!navOpen);
  }, [navOpen]);

  const handleKeyDown = useCallback((event) => {
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
  }, [navOpen]);

  const handleSearch = useCallback((event) => {
    event.preventDefault();
    setSearchQuery(event.target.value);
  }, []);

  const filteredLinks = useMemo(() => {
    if (searchQuery === '') {
      return Array.from(linksMap.values());
    }
    return Array.from(linksMap.values()).filter((link) =>
      link.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, linksMap]);

  const handleHighContrastMode = useCallback(() => {
    setHighContrastMode(!highContrastMode);
    document.body.classList.toggle('high-contrast-mode');
  }, [highContrastMode]);

  return (
    <nav
      className={`nav ${highContrastMode ? 'high-contrast-mode' : ''}`}
      aria-label="Main navigation"
      role="navigation"
    >
      <button
        type="button"
        className="nav-toggle"
        aria-label="Toggle navigation"
        aria-expanded={navOpen}
        aria-controls="nav-menu"
        onClick={toggleNav}
      >
        {navOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
      </button>
      <ul
        id="nav-menu"
        className={`nav-menu ${navOpen ? 'open' : ''}`}
        role="menu"
        aria-hidden={!navOpen}
      >
        {filteredLinks.map((link) => (
          <li key={link.text} role="menuitem">
            <Link href={link.href} onClick={() => setNavOpen(false)}>
              {link.text}
            </Link>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="high-contrast-mode-toggle"
        aria-label="Toggle high contrast mode"
        onClick={handleHighContrastMode}
      >
        High Contrast Mode
      </button>
      <input
        type="search"
        className="search-input"
        aria-label="Search"
        value={searchQuery}
        onChange={handleSearch}
        placeholder="Search"
      />
      {navOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="nav-overlay"
          onClick={toggleNav}
          aria-hidden="true"
        />
      )}
    </nav>
  );
});

export default Nav;