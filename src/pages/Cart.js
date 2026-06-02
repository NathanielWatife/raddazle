import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/currency';
import { getImageUrl } from '../services/api';
import { motion } from 'framer-motion';

const Cart = () => {
  const { cart, updateCartItem, removeFromCart, getCartTotal } = useCart();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem(itemId, newQuantity);
    } catch (error) {
      console.error('Failed to update cart:', error);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeFromCart(itemId);
    } catch (error) {
      console.error('Failed to remove from cart:', error);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    // Coupon logic would go here
    setCouponCode('');
  };

  const subtotal = getCartTotal();
  const shipping = 3;
  const total = subtotal + shipping;

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <Layout>
        <motion.div 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center space-y-6">
            <motion.i
              className="fas fa-shopping-cart text-7xl text-muted-foreground"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            />
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-3">Your cart is empty</h2>
              <p className="text-muted-foreground text-lg mb-6">Start shopping to add items to your cart</p>
            </div>
            <motion.button 
              onClick={() => navigate('/shop')}
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-accent transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="fas fa-shopping-bag"></i>
              Continue Shopping
            </motion.button>
          </div>
        </motion.div>
      </Layout>
    );
  }

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
      transition: { duration: 0.4 },
    },
  };

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
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground">Shopping Cart</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <i className="fas fa-home text-primary"></i>
              Home / <span className="text-primary">Cart</span>
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Cart Content */}
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <motion.div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-6">Items in Cart ({cart.items.length})</h2>
            
            {cart.items.map((item) => (
              <motion.div
                key={item._id}
                variants={itemVariants}
                className="flex gap-4 bg-card rounded-lg border border-border p-4 sm:p-6 hover:shadow-lg transition-all duration-300"
              >
                {/* Product Image */}
                <div className="flex-shrink-0">
                  <img 
                    src={getImageUrl(item.product.image) || '/img/product-placeholder.jpg'} 
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover bg-muted"
                    alt={item.product.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/img/product-placeholder.jpg';
                    }}
                  />
                </div>

                {/* Product Details */}
                <div className="flex-grow min-w-0">
                  <h3 className="text-lg font-semibold text-foreground truncate">
                    {item.product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.product.brand}
                  </p>
                  <p className="text-lg font-bold text-primary mt-2">
                    {formatCurrency(item.product.price)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex flex-col items-end gap-4">
                  <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                    <motion.button 
                      onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-primary hover:text-white rounded transition-all duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Decrease quantity"
                    >
                      <i className="fas fa-minus text-sm"></i>
                    </motion.button>
                    <span className="w-8 text-center font-medium text-foreground">
                      {item.quantity}
                    </span>
                    <motion.button 
                      onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-primary hover:text-white rounded transition-all duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Increase quantity"
                    >
                      <i className="fas fa-plus text-sm"></i>
                    </motion.button>
                  </div>

                  {/* Item Total & Remove Button */}
                  <div className="text-right space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Total:
                      <span className="block text-lg font-bold text-foreground">
                        {formatCurrency(item.product.price * item.quantity)}
                      </span>
                    </p>
                    <motion.button 
                      onClick={() => handleRemove(item._id)}
                      className="px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded transition-all duration-200 flex items-center gap-1"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Remove item from cart"
                    >
                      <i className="fas fa-trash-alt"></i>
                      Remove
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Coupon Section */}
            <motion.form
              variants={itemVariants}
              onSubmit={handleApplyCoupon}
              className="mt-8 p-6 bg-muted rounded-lg"
            >
              <label className="text-sm font-medium text-foreground mb-2 block">
                Have a coupon code?
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                  placeholder="Enter coupon code"
                />
                <motion.button 
                  type="submit"
                  className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-accent transition-all duration-300 whitespace-nowrap"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Apply
                </motion.button>
              </div>
            </motion.form>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-1"
          >
            <div className="sticky top-24 bg-card border border-border rounded-lg p-6 space-y-4">
              <h3 className="text-xl font-bold text-foreground">Order Summary</h3>
              
              {/* Summary Items */}
              <div className="space-y-3 border-b border-border pb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium text-foreground">{formatCurrency(shipping)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium text-foreground">{formatCurrency(0)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-foreground">Total</span>
                <span className="text-3xl font-bold text-primary">
                  {formatCurrency(total)}
                </span>
              </div>

              {/* Shipping Info */}
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">
                  <i className="fas fa-info-circle text-primary me-2"></i>
                  Flat rate shipping to Nigeria
                </p>
              </div>

              {/* Checkout Button */}
              <motion.button 
                onClick={handleCheckout}
                className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-accent transition-all duration-300 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <i className="fas fa-lock"></i>
                Proceed to Checkout
              </motion.button>

              {/* Continue Shopping */}
              <motion.button 
                onClick={() => navigate('/shop')}
                className="w-full px-6 py-3 border-2 border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-white transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Continue Shopping
              </motion.button>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-border space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <i className="fas fa-lock text-primary"></i>
                  Secure checkout
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <i className="fas fa-check-circle text-primary"></i>
                  100% authentic products
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <i className="fas fa-undo text-primary"></i>
                  30-day returns accepted
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Cart;
