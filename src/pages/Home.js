import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import { productService } from '../services';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productService.getAll({ limit: 8 });
      setProducts(response.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const features = [
    {
      icon: 'fas fa-shipping-fast',
      title: 'Shipping Availability',
      description: 'Ship to your preferred location worldwide',
    },
    {
      icon: 'fas fa-lock',
      title: 'Security Payment',
      description: '100% secure and encrypted payments',
    },
    {
      icon: 'fas fa-undo',
      title: '30 Day Return',
      description: '30 day money-back guarantee',
    },
    {
      icon: 'fas fa-headset',
      title: '24/7 Support',
      description: 'Around the clock customer support',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <Layout>
      {/* Hero Section */}
      <motion.section 
        className="relative overflow-hidden bg-gradient-to-br from-background via-card to-primary/5 py-12 sm:py-16 lg:py-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-6"
            >
              <div>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="inline-block text-sm font-semibold text-primary uppercase tracking-wide mb-2"
                >
                  100% Authentic & Verified
                </motion.span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Discover Premium
                  <span className="block text-primary">Luxury Essentials</span>
                </h1>
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                Explore our carefully curated collection of authentic luxury products. Each item is handpicked to ensure the highest quality and authenticity.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                <div className="flex-1 relative">
                  <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"></i>
                  <input 
                    type="search" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full bg-card border border-border rounded-lg pl-12 pr-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                  />
                </div>
                <motion.button 
                  type="submit"
                  className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-accent transition-all duration-300 whitespace-nowrap"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Search
                </motion.button>
              </form>

              {/* CTA Buttons */}
              <div className="flex gap-4 pt-4">
                <motion.a
                  href="#products"
                  className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-accent transition-all duration-300 flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Explore Now
                  <i className="fas fa-arrow-right"></i>
                </motion.a>
                <motion.a
                  href="/about"
                  className="px-8 py-3 border-2 border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-white transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Learn More
                </motion.a>
              </div>
            </motion.div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative h-80 sm:h-96 lg:h-full min-h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center"
            >
              <div className="text-center">
                <i className="fas fa-gem text-7xl text-primary/30 mb-4"></i>
                <p className="text-muted-foreground">Premium Luxury Products</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        className="py-12 sm:py-16 lg:py-20 bg-card border-y border-border"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group text-center"
              >
                <motion.div
                  className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <i className={`${feature.icon} text-2xl text-primary group-hover:text-white transition-colors duration-300`}></i>
                </motion.div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Products Section */}
      <motion.section 
        id="products"
        className="py-12 sm:py-16 lg:py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-12 sm:mb-16"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wide mb-2">
                  Premium Collection
                </span>
                <h2 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight">
                  Featured Products
                </h2>
                <p className="text-lg text-muted-foreground mt-4 max-w-lg">
                  Handpicked selections from our exclusive collection of luxury essentials.
                </p>
              </div>
              <motion.a
                href="/shop"
                className="inline-flex items-center gap-2 text-primary hover:text-accent font-semibold text-lg transition-colors duration-300 justify-self-end"
                whileHover={{ x: 10 }}
              >
                View All Products
                <i className="fas fa-arrow-right"></i>
              </motion.a>
            </div>
          </motion.div>

          {/* Products Grid */}
          {loading ? (
            <motion.div 
              className="flex justify-center items-center py-20"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-primary animate-bounce"></div>
                <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {products.length > 0 ? (
                products.map((product) => (
                  <ProductCard 
                    key={product._id} 
                    product={product} 
                    onAddToCart={handleAddToCart}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <i className="fas fa-box-open text-6xl text-muted mb-4"></i>
                  <p className="text-muted-foreground text-lg">No products available</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-y border-border"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-bold text-foreground"
          >
            Join Our Community
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Subscribe to our newsletter to receive exclusive offers, updates on new products, and insider tips on luxury essentials.
          </motion.p>
          <motion.form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <input 
              type="email" 
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
              required
            />
            <motion.button 
              type="submit"
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-accent transition-all duration-300 whitespace-nowrap"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Subscribe
            </motion.button>
          </motion.form>
        </div>
      </motion.section>
    </Layout>
  );
};

export default Home;
