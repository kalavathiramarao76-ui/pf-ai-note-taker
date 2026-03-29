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
  const [darkMode, setDarkMode] = useState(() => {
    const storedDarkMode = localStorage.getItem('darkMode');
    return storedDarkMode === 'true';
  });
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
  }, [highContrastMode]);

  const handleDarkMode = useCallback(() => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', darkMode ? 'false' : 'true');
  }, [darkMode]);

  return (
    <nav
      aria-label="Main navigation"
      className="nav"
      role="navigation"
    >
      <button
        aria-controls="nav-menu"
        aria-expanded={navOpen}
        aria-label="Toggle navigation"
        className="nav-toggle"
        onClick={toggleNav}
      >
        {navOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
      </button>
      <ul
        aria-hidden={!navOpen}
        className="nav-menu"
        id="nav-menu"
        role="menu"
      >
        {filteredLinks.map((link) => (
          <li key={link.href}>
            <Link
              aria-current={router.asPath === link.href ? 'page' : undefined}
              href={link.href}
              role="menuitem"
            >
              {link.text}
            </Link>
          </li>
        ))}
      </ul>
      <button
        aria-label="Toggle high contrast mode"
        className="nav-button"
        onClick={handleHighContrastMode}
      >
        High Contrast Mode
      </button>
      <button
        aria-label="Toggle dark mode"
        className="nav-button"
        onClick={handleDarkMode}
      >
        Dark Mode
      </button>
      <input
        aria-label="Search"
        className="nav-search"
        onChange={handleSearch}
        placeholder="Search"
        type="search"
        value={searchQuery}
      />
    </nav>
  );
});

export default Nav;