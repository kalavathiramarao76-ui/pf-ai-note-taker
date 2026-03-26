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

  const Menu = lazy(() => import('./Menu'));
  const SearchBar = lazy(() => import('./SearchBar'));
  const HighContrastToggle = lazy(() => import('./HighContrastToggle'));

  useEffect(() => {
    const handleKeyDownEvent = (event) => {
      handleKeyDown(event);
    };
    document.addEventListener('keydown', handleKeyDownEvent);
    return () => {
      document.removeEventListener('keydown', handleKeyDownEvent);
    };
  }, [handleKeyDown]);

  return (
    <nav>
      <Head>
        <title>AutoNote: AI-Powered Note Taker</title>
      </Head>
      <button onClick={toggleNav}>
        {navOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
      </button>
      {navOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <Menu links={filteredLinks} />
          <SearchBar
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search"
          />
          <HighContrastToggle
            checked={highContrastMode}
            onChange={handleHighContrastMode}
          />
        </Suspense>
      )}
    </nav>
  );
});

export default Nav;