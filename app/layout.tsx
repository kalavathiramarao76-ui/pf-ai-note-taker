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
      role="navigation"
      className="nav"
    >
      <button
        aria-label="Toggle navigation"
        aria-expanded={navOpen}
        aria-controls="nav-menu"
        onClick={toggleNav}
        className="nav-toggle"
      >
        {navOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
      </button>
      <ul
        id="nav-menu"
        role="menu"
        aria-label="Navigation menu"
        className={`nav-menu ${navOpen ? 'open' : ''}`}
      >
        {filteredLinks.map((link, index) => (
          <li
            key={index}
            role="menuitem"
            tabIndex={navOpen ? 0 : -1}
          >
            <Link
              href={link.href}
              aria-label={link.text}
              onClick={() => setNavOpen(false)}
            >
              {link.text}
            </Link>
          </li>
        ))}
      </ul>
      <SearchBar
        aria-label="Search"
        value={searchQuery}
        onChange={handleSearch}
      />
      <button
        aria-label="Toggle high contrast mode"
        onClick={handleHighContrastMode}
        className="high-contrast-toggle"
      >
        High Contrast Mode
      </button>
      <Suspense fallback={<div>Loading...</div>}>
        <Menu />
      </Suspense>
    </nav>
  );
});

export default Nav;