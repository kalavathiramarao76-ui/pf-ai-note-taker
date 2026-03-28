import { useState, useEffect, memo, useMemo, useCallback, lazy, Suspense } from 'react';
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
  const linksMap = useMemo(() => {
    const map = new Map();
    links.forEach((link) => {
      map.set(link.text.toLowerCase(), link);
    });
    return map;
  }, [links]);
  const router = useRouter();

  const toggleNav = useCallback(() => {
    setNavOpen(!navOpen);
  }, [navOpen]);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Escape') {
      setNavOpen(false);
    }
    if (navOpen) {
      if (event.key === 'ArrowDown') {
        const menuItems = document.querySelectorAll('.nav-menu li');
        const currentActive = document.activeElement;
        const currentIndex = Array.prototype.indexOf.call(menuItems, currentActive);
        const nextIndex = (currentIndex + 1) % menuItems.length;
        menuItems[nextIndex].focus();
      } else if (event.key === 'ArrowUp') {
        const menuItems = document.querySelectorAll('.nav-menu li');
        const currentActive = document.activeElement;
        const currentIndex = Array.prototype.indexOf.call(menuItems, currentActive);
        const nextIndex = (currentIndex - 1 + menuItems.length) % menuItems.length;
        menuItems[nextIndex].focus();
      } else if (event.key === 'Enter') {
        const currentActive = document.activeElement;
        if (currentActive.tagName === 'A') {
          currentActive.click();
        }
      } else if (event.key === 'Tab') {
        event.preventDefault();
        const menuItems = document.querySelectorAll('.nav-menu li');
        const currentActive = document.activeElement;
        const currentIndex = Array.prototype.indexOf.call(menuItems, currentActive);
        const nextIndex = (currentIndex + 1) % menuItems.length;
        menuItems[nextIndex].focus();
      }
    }
  }, [navOpen]);

  const handleSearch = useCallback((event) => {
    event.preventDefault();
    setSearchQuery(event.target.value);
  }, []);

  const filteredLinks = useMemo(() => {
    if (searchQuery === '') {
      return links;
    }
    return links.filter((link) =>
      link.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, links]);

  const handleHighContrastMode = useCallback(() => {
    setHighContrastMode(!highContrastMode);
    document.body.classList.toggle('high-contrast-mode');
  }, [highContrastMode]);

  const Menu = lazy(() => import('./Menu'));
  const SearchBar = lazy(() => import('./SearchBar'));

  return (
    <nav
      aria-label="Main navigation"
      className={`nav ${navOpen ? 'nav-open' : ''} ${highContrastMode ? 'high-contrast-mode' : ''}`}
    >
      <button
        type="button"
        className="nav-toggle"
        aria-label="Toggle navigation"
        aria-expanded={navOpen}
        onClick={toggleNav}
      >
        {navOpen ? <AiOutlineClose size={24} /> : <AiOutlineMenu size={24} />}
      </button>
      <ul
        className="nav-menu"
        role="menu"
        aria-label="Main menu"
        aria-hidden={!navOpen}
      >
        {filteredLinks.map((link, index) => (
          <li key={index} role="menuitem">
            <Link href={link.href} onClick={() => setNavOpen(false)}>
              {link.text}
            </Link>
          </li>
        ))}
      </ul>
      <Suspense fallback={<div>Loading...</div>}>
        <SearchBar
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search..."
          aria-label="Search"
        />
      </Suspense>
      <button
        type="button"
        className="nav-high-contrast-mode"
        aria-label="Toggle high contrast mode"
        onClick={handleHighContrastMode}
      >
        High Contrast Mode
      </button>
    </nav>
  );
});

export default Nav;