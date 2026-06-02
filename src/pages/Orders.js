import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { orderService, paymentService } from '../services';
import { formatCurrency } from '../utils/currency';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await orderService.getMyOrders();
      setOrders(response.orders || []);
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to load your orders.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const fmt = (value) => formatCurrency(value);
  const paystackPublicKey = process.env.REACT_APP_PAYSTACK_PUBLIC_KEY;
  const flwPublicKey = process.env.REACT_APP_FLW_PUBLIC_KEY;

  const payWithPaystack = async (order) => {
    try {
      const init = await paymentService.initPaystack(order._id);
      const ref = init.reference;
      if (window.PaystackPop && paystackPublicKey) {
        const handler = window.PaystackPop.setup({
          key: paystackPublicKey,
          email: init.email,
          amount: Math.round((init.amount || 0) * 100),
          ref,
          currency: 'NGN',
          callback: async function() {
            try { await paymentService.verifyPaystack(ref, order._id); await fetchOrders(); toast.success('Payment successful!'); } catch (err) { toast.error(err.response?.data?.message || err.message || 'Verification failed'); }
          },
          onClose: function() { },
        });
        handler.openIframe();
      } else if (init.authorizationUrl) {
        window.location.href = init.authorizationUrl;
      } else {
        toast.error('Unable to start Paystack payment.');
      }
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || 'Could not start payment');
    }
  };

  const payWithFlutterwave = async (order) => {
    try {
      const init = await paymentService.initFlutterwave(order._id);
      const txRef = init.txRef;
      if (window.FlutterwaveCheckout && flwPublicKey) {
        window.FlutterwaveCheckout({
          public_key: flwPublicKey,
          tx_ref: txRef,
          amount: init.amount,
          currency: init.currency || 'NGN',
          payment_options: 'card,banktransfer,ussd',
          customer: { email: init.customer?.email, name: init.customer?.name },
          callback: async function() {
            try { await paymentService.verifyFlutterwave(txRef); await fetchOrders(); toast.success('Payment successful!'); } catch (err) { toast.error(err.response?.data?.message || err.message || 'Verification failed'); }
          },
          onclose: function() { },
        });
      } else {
        toast.error('Unable to start Flutterwave payment.');
      }
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || 'Could not start payment');
    }
  };

  const getStatusColor = (status, isPaid) => {
    if (status === 'delivered') return 'bg-green-100 text-green-800 border-green-200';
    if (status === 'cancelled') return 'bg-red-100 text-red-800 border-red-200';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getStatusIcon = (status) => {
    if (status === 'delivered') return 'fas fa-check-circle';
    if (status === 'cancelled') return 'fas fa-times-circle';
    if (status === 'pending') return 'fas fa-clock';
    return 'fas fa-truck';
  };

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
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground">My Orders</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <i className="fas fa-home text-primary"></i>
              Home / <span className="text-primary">Orders</span>
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Orders Section */}
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8"
        >
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Order History</h2>
            <p className="text-muted-foreground">Track your recent purchases and their fulfillment status.</p>
          </div>
          <motion.button 
            onClick={fetchOrders}
            disabled={loading}
            className="mt-4 sm:mt-0 px-6 py-3 border-2 border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className={`fas fa-sync${loading ? ' fa-spin' : ''}`}></i>
            {loading ? 'Refreshing...' : 'Refresh'}
          </motion.button>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 rounded-full border-4 border-muted border-t-primary animate-spin mb-4"></div>
            <p className="text-muted-foreground">Loading your orders...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && orders.length === 0 && (
          <motion.div
            variants={itemVariants}
            className="text-center py-16 space-y-4"
          >
            <div className="text-6xl text-muted-foreground mb-4">
              <i className="fas fa-inbox"></i>
            </div>
            <h3 className="text-2xl font-bold text-foreground">No orders yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/shop" className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-accent transition-all duration-300">
                <i className="fas fa-shopping-bag"></i>
                Start Shopping
              </Link>
            </motion.div>
          </motion.div>
        )}

        {/* Orders Grid */}
        {!loading && orders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.map((order, idx) => (
              <motion.div
                key={order._id}
                variants={itemVariants}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300"
              >
                {/* Order Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">Order ID</p>
                    <p className="text-lg font-bold text-foreground">#{order._id.slice(-6).toUpperCase()}</p>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusColor(order.status, order.isPaid)}`}>
                    <i className={`${getStatusIcon(order.status)} text-sm`}></i>
                    <span className="text-xs font-semibold uppercase">{order.status || (order.isDelivered ? 'Delivered' : 'Processing')}</span>
                  </div>
                </div>

                {/* Order Details */}
                <div className="space-y-3 mb-6 pb-6 border-b border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Order Date</span>
                    <span className="font-medium text-foreground">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Total Amount</span>
                    <span className="text-lg font-bold text-primary">{fmt(order.totalPrice || order.itemsPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Payment Status</span>
                    <span className={`text-xs font-semibold uppercase px-2.5 py-1 rounded-full ${order.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {order.isPaid ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Link to={`/orders/${order._id}`} className="w-full block px-4 py-2.5 bg-primary text-white rounded-lg text-center font-medium hover:bg-accent transition-all duration-300">
                    View Details
                  </Link>
                  
                  {!order.isPaid && (
                    <div className="space-y-2">
                      {paystackPublicKey && (
                        <motion.button 
                          onClick={() => payWithPaystack(order)}
                          className="w-full px-4 py-2 border-2 border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary hover:text-white transition-all duration-300"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <i className="fas fa-credit-card me-2"></i>
                          Pay with Paystack
                        </motion.button>
                      )}
                      {flwPublicKey && (
                        <motion.button 
                          onClick={() => payWithFlutterwave(order)}
                          className="w-full px-4 py-2 border-2 border-accent text-accent rounded-lg text-sm font-medium hover:bg-accent hover:text-white transition-all duration-300"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <i className="fas fa-money-check me-2"></i>
                          Pay with Flutterwave
                        </motion.button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </Layout>
  );
};

export default Orders;
