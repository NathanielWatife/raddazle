import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { categoryService } from '../services';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [navOpen, setNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState([]);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    setNavOpen(false);
    setShopDropdownOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryService.getAll({ includeCounts: true });
        setCategories(res.categories || []);
      } catch {
        // Silently fail
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (navOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [navOpen]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setShopDropdownOpen(false);
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (searchOpen) setSearchOpen(false);
        if (navOpen) setNavOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [searchOpen, navOpen]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setNavOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout, navigate]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
    setSearchOpen(false);
    setNavOpen(false);
    setSearchQuery('');
  }, [searchQuery, navigate]);

  const closeNav = useCallback(() => {
    setNavOpen(false);
    setShopDropdownOpen(false);
    setUserDropdownOpen(false);
  }, []);

  const toggleShopDropdown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setShopDropdownOpen(prev => !prev);
    setUserDropdownOpen(false);
  }, []);

  const toggleUserDropdown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setUserDropdownOpen(prev => !prev);
    setShopDropdownOpen(false);
  }, []);

  const cartCount = getCartCount();

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-lg shadow-sm border-b border-border' 
          : 'bg-transparent'
      }`} 
      ref={navRef}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16 md:h-20" role="navigation" aria-label="Main navigation">
          {/* Brand */}
          <Link 
            to="/" 
            className="flex flex-col justify-center group"
            onClick={closeNav}
          >
            <h1 className="text-2xl md:text-3xl font-bold text-primary group-hover:text-accent transition-colors duration-300">
              Ray Dazzle
            </h1>
            <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-300">
              Products that elude luxury
            </p>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <NavLink 
              to="/" 
              end 
              className={({ isActive }) => `relative text-sm font-medium transition-colors duration-300 ${
                isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`} 
            >
              {({ isActive }) => (
                <>
                  Home
                  {isActive && (
                    <motion.div
                      layoutId="underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </>
              )}
            </NavLink>

            {/* Shop Dropdown */}
            <div className="relative group">
              <button
                onClick={toggleShopDropdown}
                className={`relative text-sm font-medium transition-colors duration-300 flex items-center gap-1.5 ${
                  location.pathname === '/shop' || location.pathname.startsWith('/shop/') 
                    ? 'text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Shop
                <svg className={`w-4 h-4 transition-transform duration-300 ${shopDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
              
              {shopDropdownOpen && (
                <motion.div 
                  className="absolute top-full left-0 mt-2 w-48 bg-card rounded-lg shadow-lg border border-border overflow-hidden"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="py-2">
                    <Link 
                      to="/shop" 
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors duration-200"
                      onClick={closeNav}
                    >
                      <i className="fas fa-th-large text-primary"></i>
                      All Products
                    </Link>
                    {categories.length > 0 && <hr className="my-1 border-border" />}
                    {categories.slice(0, 8).map(cat => (
                      <Link 
                        key={cat._id}
                        to={`/shop?category=${cat._id}`} 
                        className="flex items-center justify-between px-4 py-2 text-sm hover:bg-muted transition-colors duration-200"
                        onClick={closeNav}
                      >
                        <span>{cat.name}</span>
                        {typeof cat.productCount === 'number' && (
                          <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                            {cat.productCount}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            <NavLink 
              to="/about" 
              className={({ isActive }) => `relative text-sm font-medium transition-colors duration-300 ${
                isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`} 
            >
              {({ isActive }) => (
                <>
                  About
                  {isActive && (
                    <motion.div
                      layoutId="underline2"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </>
              )}
            </NavLink>

            <NavLink 
              to="/contact" 
              className={({ isActive }) => `relative text-sm font-medium transition-colors duration-300 ${
                isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`} 
            >
              {({ isActive }) => (
                <>
                  Contact
                  {isActive && (
                    <motion.div
                      layoutId="underline3"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </>
              )}
            </NavLink>

            <NavLink 
              to="/faq" 
              className={({ isActive }) => `relative text-sm font-medium transition-colors duration-300 ${
                isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`} 
            >
              {({ isActive }) => (
                <>
                  FAQs
                  {isActive && (
                    <motion.div
                      layoutId="underline4"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </>
              )}
            </NavLink>

            {isAuthenticated && isAdmin && (
              <NavLink 
                to="/admin/dashboard" 
                className={({ isActive }) => `relative text-sm font-medium transition-colors duration-300 ${
                  isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`} 
              >
                Admin
              </NavLink>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <button 
              className="p-2.5 hover:bg-muted rounded-lg transition-colors duration-200" 
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search products"
            >
              <i className="fas fa-search text-primary text-lg"></i>
            </button>

            <Link 
              to="/cart" 
              className="relative p-2.5 hover:bg-muted rounded-lg transition-colors duration-200"
              aria-label="Shopping cart"
            >
              <i className="fas fa-shopping-bag text-primary text-lg"></i>
              {cartCount > 0 && (
                <motion.span 
                  className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </motion.span>
              )}
            </Link>

            {isAuthenticated ? (
              <>
                {!isAdmin && (
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors duration-200"
                    type="button"
                    title="Logout"
                  >
                    <i className="fas fa-sign-out-alt me-2"></i>Logout
                  </button>
                )}
                <div className="relative group">
                  <button 
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors duration-200"
                    type="button" 
                    onClick={toggleUserDropdown}
                    aria-expanded={userDropdownOpen}
                    aria-haspopup="true"
                  >
                    <i className="fas fa-user text-primary"></i>
                    <span>{user?.name?.split(' ')[0] || 'Account'}</span>
                  </button>
                  {userDropdownOpen && (
                    <motion.div 
                      className="absolute right-0 top-full mt-2 w-48 bg-card rounded-lg shadow-lg border border-border overflow-hidden"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="py-2">
                        <Link className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors duration-200" to="/profile" onClick={closeNav}>
                          <i className="fas fa-user-circle text-primary"></i>Profile
                        </Link>
                        <Link className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors duration-200" to="/orders" onClick={closeNav}>
                          <i className="fas fa-box text-primary"></i>My Orders
                        </Link>
                        <hr className="my-1 border-border" />
                        <button className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors duration-200" onClick={handleLogout}>
                          <i className="fas fa-sign-out-alt"></i>Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200">
                  Login
                </Link>
                <Link to="/register" className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-accent transition-all duration-200">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center gap-3">
            <button 
              className="p-2 hover:bg-muted rounded-lg transition-colors duration-200"
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <i className="fas fa-search text-primary"></i>
            </button>
            
            <Link to="/cart" className="relative p-2 hover:bg-muted rounded-lg transition-colors duration-200" aria-label="Shopping cart">
              <i className="fas fa-shopping-bag text-primary"></i>
              {cartCount > 0 && (
                <motion.span 
                  className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </motion.span>
              )}
            </Link>

            <button 
              className={`relative p-2 hover:bg-muted rounded-lg transition-colors duration-200 ${navOpen ? 'text-accent' : ''}`}
              type="button"
              aria-controls="navbarCollapse"
              aria-expanded={navOpen}
              aria-label={navOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setNavOpen(prev => !prev)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Backdrop */}
      {navOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden" 
          onClick={closeNav}
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Mobile Menu */}
      {navOpen && (
        <motion.div 
          className="fixed top-16 left-0 right-0 bottom-0 bg-card border-t border-border overflow-y-auto lg:hidden"
          initial={{ y: '-100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.3 }}
        >
          <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Mobile Navigation Links */}
            <nav className="space-y-2 mb-6">
              <NavLink 
                to="/" 
                end 
                className={({ isActive }) => `block px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  isActive ? 'bg-primary text-white' : 'text-foreground hover:bg-muted'
                }`} 
                onClick={closeNav}
              >
                Home
              </NavLink>

              <div className="relative">
                <button
                  onClick={toggleShopDropdown}
                  className={`w-full text-left flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                    location.pathname === '/shop' || location.pathname.startsWith('/shop/')
                      ? 'bg-primary text-white'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  Shop
                  <svg className={`w-4 h-4 transition-transform duration-300 ${shopDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
                
                {shopDropdownOpen && (
                  <motion.div 
                    className="mt-2 space-y-1 bg-muted rounded-lg p-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link 
                      to="/shop" 
                      className="block px-4 py-2 text-sm rounded hover:bg-border transition-colors duration-200"
                      onClick={closeNav}
                    >
                      All Products
                    </Link>
                    {categories.slice(0, 8).map(cat => (
                      <Link 
                        key={cat._id}
                        to={`/shop?category=${cat._id}`} 
                        className="block px-4 py-2 text-sm rounded hover:bg-border transition-colors duration-200"
                        onClick={closeNav}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </div>

              <NavLink 
                to="/about" 
                className={({ isActive }) => `block px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  isActive ? 'bg-primary text-white' : 'text-foreground hover:bg-muted'
                }`} 
                onClick={closeNav}
              >
                About
              </NavLink>

              <NavLink 
                to="/contact" 
                className={({ isActive }) => `block px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  isActive ? 'bg-primary text-white' : 'text-foreground hover:bg-muted'
                }`} 
                onClick={closeNav}
              >
                Contact
              </NavLink>

              <NavLink 
                to="/faq" 
                className={({ isActive }) => `block px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  isActive ? 'bg-primary text-white' : 'text-foreground hover:bg-muted'
                }`} 
                onClick={closeNav}
              >
                FAQs
              </NavLink>

              {isAuthenticated && isAdmin && (
                <NavLink 
                  to="/admin/dashboard" 
                  className={({ isActive }) => `block px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                    isActive ? 'bg-primary text-white' : 'text-foreground hover:bg-muted'
                  }`} 
                  onClick={closeNav}
                >
                  Admin
                </NavLink>
              )}
            </nav>

            <hr className="my-6 border-border" />

            {/* Mobile Auth Section */}
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-4 py-3 bg-muted rounded-lg mb-4">
                  <i className="fas fa-user-circle text-primary text-xl"></i>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{user?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
                  </div>
                </div>
                
                <Link to="/profile" className="block px-4 py-3 text-sm rounded-lg text-foreground hover:bg-muted transition-colors duration-200" onClick={closeNav}>
                  <i className="fas fa-user-circle me-2 text-primary"></i>Profile
                </Link>
                <Link to="/orders" className="block px-4 py-3 text-sm rounded-lg text-foreground hover:bg-muted transition-colors duration-200" onClick={closeNav}>
                  <i className="fas fa-box me-2 text-primary"></i>My Orders
                </Link>
                <button className="w-full text-left px-4 py-3 text-sm rounded-lg text-destructive hover:bg-muted transition-colors duration-200" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt me-2"></i>Logout
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link to="/login" className="block w-full px-4 py-3 text-center text-sm font-medium rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200">
                  Login
                </Link>
                <Link to="/register" className="block w-full px-4 py-3 text-center text-sm font-medium rounded-lg bg-primary text-white hover:bg-accent transition-all duration-200">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Search Overlay */}
      {searchOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 flex items-start justify-center pt-20 lg:pt-32"
          role="dialog" 
          aria-modal="true" 
          aria-label="Search products"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => setSearchOpen(false)}
        >
          <motion.div 
            className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl mx-4"
            role="document"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Search Products</h3>
                <button 
                  className="p-2 hover:bg-muted rounded-lg transition-colors duration-200"
                  onClick={() => setSearchOpen(false)} 
                  aria-label="Close search"
                >
                  <i className="fas fa-times text-muted-foreground"></i>
                </button>
              </div>

              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="flex-1 relative">
                  <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"></i>
                  <input 
                    ref={searchInputRef}
                    type="search" 
                    className="w-full bg-muted rounded-lg pl-12 pr-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                    placeholder="Search by name, brand, category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search query"
                  />
                </div>
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-accent transition-all duration-200"
                >
                  Search
                </button>
              </form>

              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <i className="fas fa-lightbulb text-primary"></i>
                <span>Try: "sweet", "floral", "Tom Ford", "gift"</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </header>
  );
};

export default Navbar;
