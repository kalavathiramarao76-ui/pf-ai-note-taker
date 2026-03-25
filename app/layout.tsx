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
  const links = useMemo(() => [
    { href: '/', text: 'Home' },
    { href: '/about', text: 'About' },
    { href: '/contact', text: 'Contact' },
  ], []);
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

  return (
    <nav
      className={`nav ${highContrastMode ? 'high-contrast-mode' : ''}`}
      aria-label="Main navigation"
      role="navigation"
    >
      <Head>
        <title>AutoNote: AI-Powered Note Taker</title>
      </Head>
      <div className="nav-header">
        <Link href="/">
          <a>AutoNote</a>
        </Link>
        <button
          className="nav-toggle"
          aria-label="Toggle navigation"
          onClick={toggleNav}
        >
          {navOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
        </button>
      </div>
      <ul className={`nav-menu ${navOpen ? 'open' : ''}`}>
        {filteredLinks.map((link, index) => (
          <li key={index}>
            <Link href={link.href}>
              <a>{link.text}</a>
            </Link>
          </li>
        ))}
      </ul>
      <div className="nav-search">
        <input
          type="search"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search"
          aria-label="Search"
        />
      </div>
      <button
        className="nav-contrast"
        aria-label="Toggle high contrast mode"
        onClick={handleHighContrastMode}
      >
        High Contrast Mode
      </button>
    </nav>
  );
});

export default Nav;