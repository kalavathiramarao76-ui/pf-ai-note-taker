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
    >
      <div className="nav-container">
        <button
          className="nav-toggle"
          aria-label="Toggle navigation"
          onClick={toggleNav}
        >
          {navOpen ? <AiOutlineClose size={24} /> : <AiOutlineMenu size={24} />}
        </button>
        <div
          className={`nav-menu ${navOpen ? 'open' : ''}`}
          aria-hidden={!navOpen}
        >
          <ul>
            {filteredLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={toggleNav}>
                  {link.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
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
      </div>
      <style jsx>
        {`
          .nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            background-color: #333;
            color: #fff;
          }
          .nav-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
          }
          .nav-toggle {
            background-color: transparent;
            border: none;
            padding: 0;
            cursor: pointer;
          }
          .nav-menu {
            display: none;
            flex-direction: column;
            align-items: flex-start;
            padding: 1rem;
            background-color: #333;
            border: 1px solid #444;
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
          }
          .nav-menu.open {
            display: flex;
          }
          .nav-menu ul {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          .nav-menu li {
            padding: 0.5rem;
            border-bottom: 1px solid #444;
          }
          .nav-menu li:last-child {
            border-bottom: none;
          }
          .nav-menu a {
            color: #fff;
            text-decoration: none;
          }
          .nav-search {
            display: flex;
            align-items: center;
            padding: 0.5rem;
          }
          .nav-search input {
            padding: 0.5rem;
            border: none;
            border-radius: 0.25rem;
            width: 100%;
          }
          .nav-contrast {
            background-color: transparent;
            border: none;
            padding: 0;
            cursor: pointer;
          }
          .high-contrast-mode {
            background-color: #fff;
            color: #000;
          }
          .high-contrast-mode .nav-menu {
            background-color: #fff;
            border-color: #000;
          }
          .high-contrast-mode .nav-menu a {
            color: #000;
          }
          @media (min-width: 768px) {
            .nav-menu {
              display: flex;
              flex-direction: row;
              align-items: center;
              padding: 0;
              background-color: transparent;
              border: none;
              position: static;
              width: auto;
            }
            .nav-menu ul {
              display: flex;
              flex-direction: row;
              align-items: center;
              padding: 0;
              margin: 0;
            }
            .nav-menu li {
              padding: 0.5rem;
              border-bottom: none;
            }
            .nav-menu li:not(:last-child) {
              margin-right: 1rem;
            }
          }
        `}
      </style>
    </nav>
  );
});

export default Nav;