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
    setSearchQuery(event.target.value);
  };

  const filteredLinks = useMemo(() => {
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
      <Head>
        <title>AutoNote: AI-Powered Note Taker</title>
      </Head>
      <div className="nav-header">
        <Link href="/">
          <a>AutoNote</a>
        </Link>
        <button
          className="nav-toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={navOpen}
          aria-controls="nav-menu"
          onClick={toggleNav}
        >
          {navOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
        </button>
      </div>
      <ul
        className={`nav-menu ${navOpen ? 'open' : ''}`}
        id="nav-menu"
        role="menu"
        aria-hidden={!navOpen}
      >
        {filteredLinks.map((link, index) => (
          <li key={index} role="menuitem">
            <Link href={link.href}>
              <a>{link.text}</a>
            </Link>
          </li>
        ))}
      </ul>
      <button
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
        onKeyDown={handleKeyDown}
      />
    </nav>
  );
});

export default Nav;