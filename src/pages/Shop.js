import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import { formatCurrency } from '../utils/currency';
import { productService, categoryService } from '../services';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'name'
  });
  const { addToCart } = useCart();
  const toast = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.sort) params.sort = filters.sort;

      const response = await productService.getAll(params);
      setProducts(response.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (filters.search) next.set('search', filters.search);
    if (filters.category) next.set('category', filters.category);
    if (filters.sort && filters.sort !== 'name') next.set('sort', filters.sort);
    if (filters.minPrice) next.set('minPrice', String(filters.minPrice));
    if (filters.maxPrice) next.set('maxPrice', String(filters.maxPrice));
    setSearchParams(next);
  }, [filters.search, filters.category, filters.sort, filters.minPrice, filters.maxPrice, setSearchParams]);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAll({ includeCounts: true });
      setCategories(response.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product._id, 1);
      toast.success('Product added to cart!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add product to cart');
    }
  };

  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'price', label: 'Price (Low to High)' },
    { value: '-price', label: 'Price (High to Low)' },
    { value: '-createdAt', label: 'Newest First' },
  ];

  return (
    <Layout>
      {/* Page Header */}
      <motion.div 
        className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-b border-border py-8 sm:py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground">Shop</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <i className="fas fa-home text-primary"></i>
              Home / <span className="text-primary">Shop</span>
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Shop Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header with Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Signature Collection
              </h2>
              <p className="text-muted-foreground mt-2">
                Discover our premium selection of grooming and hygiene products
              </p>
            </div>
            
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-accent transition-all duration-300 whitespace-nowrap"
            >
              <i className={`fas fa-filter ${mobileFiltersOpen ? 'rotate-180' : ''} transition-transform duration-300`}></i>
              Filters
            </button>
          </div>

          {/* Top Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"></i>
              <input 
                type="search" 
                className="w-full bg-card border border-border rounded-lg pl-12 pr-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                placeholder="Search products..." 
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            {/* Sort Dropdown */}
            <select 
              className="px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 cursor-pointer font-medium"
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar Filters */}
          <motion.aside
            className={`lg:col-span-1 ${
              mobileFiltersOpen 
                ? 'block fixed inset-0 top-20 z-40 bg-card border-r border-border overflow-y-auto' 
                : 'hidden lg:block'
            }`}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="space-y-6 p-6 lg:p-0 max-h-screen lg:max-h-none overflow-y-auto lg:overflow-visible">
              {/* Close button for mobile */}
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="lg:hidden absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors duration-200"
              >
                <i className="fas fa-times text-lg"></i>
              </button>

              {/* Categories Filter */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <i className="fas fa-list text-primary"></i>
                  Categories
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleFilterChange('category', '')}
                    className={`block w-full text-left px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                      filters.category === '' 
                        ? 'bg-primary text-white' 
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <i className="fas fa-th me-2"></i>All Products
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat._id}
                      onClick={() => handleFilterChange('category', cat._id)}
                      className={`block w-full text-left px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-between ${
                        filters.category === cat._id 
                          ? 'bg-primary text-white' 
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      <span><i className="fas fa-spray-can me-2"></i>{cat.name}</span>
                      <span className="text-xs bg-primary/20 px-2 py-1 rounded-full">
                        {cat.productCount || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Price Filter */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <i className="fas fa-tag text-primary"></i>
                  Price Range
                </h3>
                <div className="space-y-4">
                  <input 
                    type="range" 
                    className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((filters.maxPrice || 500) / 500) * 100}%, hsl(var(--border)) ${((filters.maxPrice || 500) / 500) * 100}%, hsl(var(--border)) 100%)`
                    }}
                    min="0" 
                    max="500" 
                    value={filters.maxPrice || 500}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{formatCurrency(0)}</span>
                    <span className="font-semibold text-foreground">{formatCurrency(filters.maxPrice || 500)}</span>
                  </div>
                </div>
              </motion.div>

              {/* Clear Filters */}
              {(filters.search || filters.category || filters.maxPrice) && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setFilters({
                    search: '',
                    category: '',
                    minPrice: '',
                    maxPrice: '',
                    sort: 'name'
                  })}
                  className="w-full px-4 py-2.5 border border-border text-foreground rounded-lg hover:bg-muted transition-all duration-200 font-medium flex items-center justify-center gap-2"
                >
                  <i className="fas fa-redo"></i>
                  Clear All Filters
                </motion.button>
              )}
            </div>
          </motion.aside>

          {/* Products Grid */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary animate-bounce"></div>
                  <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <i className="fas fa-box-open text-6xl text-muted mb-4"></i>
                <h3 className="text-xl font-semibold text-foreground mb-2">No products found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard 
                    key={product._id} 
                    product={product} 
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Mobile Filters Backdrop */}
      {mobileFiltersOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-30"
          onClick={() => setMobileFiltersOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </Layout>
  );
};

export default Shop;
