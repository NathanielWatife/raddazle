import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();
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
    <footer className="bg-secondary text-white mt-16 lg:mt-24">
      {/* Newsletter Section */}
      <motion.div 
        className="border-b border-white/10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-center">
            {/* Brand Info */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <Link to="/" className="flex flex-col gap-1 group">
                <h2 className="text-3xl font-bold text-primary group-hover:text-accent transition-colors duration-300">
                  Ray Dazzle
                </h2>
                <p className="text-sm text-white/70 group-hover:text-white/90 transition-colors duration-300">
                  Products that elude luxury
                </p>
              </Link>
              <p className="mt-4 text-sm text-white/70 leading-relaxed">
                Discover our curated collection of premium products designed for those who appreciate the finer things in life.
              </p>
            </motion.div>

            {/* Newsletter Signup */}
            <motion.form 
              variants={itemVariants}
              onSubmit={(e) => e.preventDefault()}
              className="lg:col-span-2"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  required
                />
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-accent transition-all duration-300 whitespace-nowrap"
                >
                  Subscribe
                </button>
              </div>
              <p className="mt-2 text-xs text-white/60">
                Join our newsletter for exclusive offers and updates
              </p>
            </motion.form>
          </div>
        </div>
      </motion.div>

      {/* Main Footer Content */}
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Why Choose Us */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Why Choose Us?</h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Every product is carefully curated and tested to ensure the highest quality and performance standards.
            </p>
            <Link 
              to="/shop" 
              className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors duration-300 font-medium text-sm"
            >
              Shop Now
              <i className="fas fa-arrow-right"></i>
            </Link>
          </motion.div>

          {/* Shop Info */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Shop Info</h3>
            <nav className="space-y-3">
              {[
                { label: 'About Us', path: '/about' },
                { label: 'FAQs & Help', path: '/faq' },
                { label: 'Contact Us', path: '/contact' },
                { label: 'Terms & Conditions', path: '/terms' },
                { label: 'Privacy Policy', path: '/privacy' },
                { label: 'Returns & Refunds', path: '/return' },
              ].map((link) => (
                <Link 
                  key={link.path}
                  to={link.path}
                  className="text-sm text-white/70 hover:text-white transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>

          {/* Account */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Account</h3>
            <nav className="space-y-3">
              {[
                { label: 'My Account', path: '/profile' },
                { label: 'Shop Details', path: '/shop' },
                { label: 'Shopping Cart', path: '/cart' },
                { label: 'Checkout', path: '/checkout' },
                { label: 'Order History', path: '/orders' },
              ].map((link) => (
                <Link 
                  key={link.path}
                  to={link.path}
                  className="text-sm text-white/70 hover:text-white transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact</h3>
            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <i className="fas fa-map-marker-alt text-primary mt-1"></i>
                <p className="text-white/70">Lagos, Nigeria</p>
              </div>
              <div className="flex gap-2">
                <i className="fas fa-envelope text-primary mt-1"></i>
                <a href="mailto:support@raddazle.com" className="text-white/70 hover:text-white transition-colors duration-300">
                  support@raddazle.com
                </a>
              </div>
              <div className="flex gap-2">
                <i className="fas fa-phone text-primary mt-1"></i>
                <a href="tel:+2348000000000" className="text-white/70 hover:text-white transition-colors duration-300">
                  +234 800 000 0000
                </a>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="pt-4 space-y-3">
              <p className="text-sm font-medium text-white">Follow Us</p>
              <div className="flex gap-3">
                {[
                  { icon: 'fab fa-twitter', url: 'https://twitter.com', label: 'Twitter' },
                  { icon: 'fab fa-facebook-f', url: 'https://facebook.com', label: 'Facebook' },
                  { icon: 'fab fa-youtube', url: 'https://youtube.com', label: 'YouTube' },
                  { icon: 'fab fa-instagram', url: 'https://instagram.com', label: 'Instagram' },
                ].map((social) => (
                  <a 
                    key={social.url}
                    href={social.url}
                    target="_blank" 
                    rel="noreferrer" 
                    aria-label={social.label}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center text-white transition-all duration-300"
                  >
                    <i className={`${social.icon} text-sm`}></i>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Copyright & Bottom Section */}
      <motion.div 
        className="border-t border-white/10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/60">
            <p>
              &copy; {currentYear} Ray Dazzle. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link to="/privacy" className="hover:text-white transition-colors duration-300">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link to="/terms" className="hover:text-white transition-colors duration-300">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Scroll to Top Button */}
      <motion.button
        className="fixed bottom-6 right-6 p-3 bg-primary text-white rounded-full shadow-lg hover:bg-accent transition-all duration-300"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        viewport={{ once: true }}
      >
        <i className="fas fa-arrow-up"></i>
      </motion.button>
    </footer>
  );
};

export default Footer;
