import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/currency';
import { getImageUrl } from '../services/api';
import { orderService, paymentService, userService } from '../services';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    country: '',
    mobile: '',
    email: '',
    paymentMethod: 'cod',
    bankRef: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [bankInfo, setBankInfo] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const paystackPublicKey = process.env.REACT_APP_PAYSTACK_PUBLIC_KEY;
  const flwPublicKey = process.env.REACT_APP_FLW_PUBLIC_KEY;

  const loadUserProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);
      const profile = await userService.getProfile();
      const userData = profile.user || profile;
      const shippingAddresses = userData.shippingAddress || [];
      setSavedAddresses(shippingAddresses);
      const defaultAddress = shippingAddresses.find(addr => addr.isDefault) || shippingAddresses[0];
      
      setFormData(prev => ({
        ...prev,
        firstName: userData.firstName || userData.name?.split(' ')[0] || '',
        lastName: userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '',
        email: userData.email || '',
        mobile: userData.phoneNumber || '',
        ...(defaultAddress ? {
          address: defaultAddress.street || '',
          city: defaultAddress.city || '',
          state: defaultAddress.state || '',
          country: defaultAddress.country || ''
        } : {})
      }));
      
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id);
      } else {
        setUseNewAddress(true);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      setUseNewAddress(true);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  useEffect(() => {
    const loadBank = async () => {
      try {
        const res = await paymentService.getBankInfo();
        setBankInfo(res.bank);
      } catch { }
    };
    loadBank();
  }, []);

  const handleAddressSelect = (addressId) => {
    const address = savedAddresses.find(a => a._id === addressId);
    if (address) {
      setSelectedAddressId(addressId);
      setUseNewAddress(false);
      setFormData(prev => ({
        ...prev,
        address: address.street || '',
        city: address.city || '',
        state: address.state || '',
        country: address.country || ''
      }));
    }
  };

  const handleUseNewAddress = () => {
    setUseNewAddress(true);
    setSelectedAddressId(null);
    setFormData(prev => ({
      ...prev,
      address: '',
      city: '',
      state: '',
      country: ''
    }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderPaymentMethod = formData.paymentMethod === 'paystack' ? 'card' : formData.paymentMethod;
      const orderData = {
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          street: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          mobile: formData.mobile
        },
        paymentMethod: orderPaymentMethod
      };

      const orderRes = await orderService.create(orderData);
      const order = orderRes?.order || orderRes?.data?.order || orderRes;

      if (formData.paymentMethod === 'cod') {
        await clearCart();
        toast.success('Order placed successfully!');
        navigate('/orders');
        return;
      }

      if (formData.paymentMethod === 'paystack') {
        const init = await paymentService.initPaystack(order._id);
        const ref = init.reference;
        if (window.PaystackPop && paystackPublicKey) {
          const handler = window.PaystackPop.setup({
            key: paystackPublicKey,
            email: init.email,
            amount: Math.round((init.amount || 0) * 100),
            ref,
            currency: 'NGN',
            callback: async function () {
              try {
                await paymentService.verifyPaystack(ref, order._id);
                await clearCart();
                toast.success('Payment successful!');
                navigate('/orders');
              } catch (err) {
                toast.error(err.response?.data?.message || err.message || 'Verification failed');
              }
            },
            onClose: function () {
              toast.info('Payment window closed. You can try again from Orders.');
              navigate('/orders');
            }
          });
          handler.openIframe();
        } else if (init.authorizationUrl) {
          window.location.href = init.authorizationUrl;
        } else {
          toast.error('Unable to start Paystack payment.');
        }
        return;
      }

      if (formData.paymentMethod === 'bank-transfer') {
        await paymentService.submitBankTransfer({ orderId: order._id, reference: formData.bankRef || `BANK_${order._id}` });
        await clearCart();
        toast.info('Order placed. Awaiting bank transfer verification.');
        navigate('/orders');
        return;
      }

      if (formData.paymentMethod === 'flutterwave') {
        const init = await paymentService.initFlutterwave(order._id);
        const txRef = init.txRef;
        if (window.FlutterwaveCheckout && flwPublicKey) {
          window.FlutterwaveCheckout({
            public_key: flwPublicKey,
            tx_ref: txRef,
            amount: init.amount,
            currency: init.currency || 'NGN',
            payment_options: 'card,banktransfer,ussd',
            customer: {
              email: init.customer?.email,
              name: init.customer?.name,
            },
            callback: async function (data) {
              try {
                await paymentService.verifyFlutterwave(txRef);
                await clearCart();
                toast.success('Payment successful!');
                navigate('/orders');
              } catch (err) {
                toast.error(err.response?.data?.message || err.message || 'Verification failed');
              }
            },
            onclose: function () {
              toast.info('Payment window closed. You can try again from Orders.');
              navigate('/orders');
            },
          });
        } else {
          toast.error('Unable to start Flutterwave payment.');
        }
        return;
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  const subtotal = getCartTotal();
  const shipping = 3;
  const total = subtotal + shipping;

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
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground">Checkout</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <i className="fas fa-home text-primary"></i>
              Home / <span className="text-primary">Cart</span> / <span className="text-primary">Checkout</span>
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Checkout Content */}
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {loadingProfile ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 rounded-full border-4 border-muted border-t-primary animate-spin mb-4"></div>
            <p className="text-muted-foreground">Loading your saved information...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left - Billing & Shipping Info */}
              <motion.div 
                className="lg:col-span-2 space-y-8"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Shipping Address Section */}
                {savedAddresses.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <i className="fas fa-map-marker-alt text-primary"></i>
                      Shipping Address
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {savedAddresses.map((addr) => (
                        <div key={addr._id}>
                          <button
                            type="button"
                            onClick={() => handleAddressSelect(addr._id)}
                            className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                              selectedAddressId === addr._id && !useNewAddress
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div className="flex gap-3">
                              <input 
                                type="radio" 
                                checked={selectedAddressId === addr._id && !useNewAddress}
                                onChange={() => handleAddressSelect(addr._id)}
                                className="mt-1"
                              />
                              <div>
                                <p className="font-semibold text-foreground">{addr.street}</p>
                                <p className="text-sm text-muted-foreground">
                                  {addr.city}, {addr.state} {addr.postalCode}
                                </p>
                                <p className="text-sm text-muted-foreground">{addr.country}</p>
                                {addr.isDefault && (
                                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-primary text-white rounded">Default</span>
                                )}
                              </div>
                            </div>
                          </button>
                        </div>
                      ))}
                      
                      {/* Add New Address Option */}
                      <div>
                        <button
                          type="button"
                          onClick={handleUseNewAddress}
                          className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                            useNewAddress
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex gap-3">
                            <input 
                              type="radio" 
                              checked={useNewAddress}
                              onChange={handleUseNewAddress}
                              className="mt-1"
                            />
                            <div>
                              <p className="font-semibold text-foreground flex items-center gap-2">
                                <i className="fas fa-plus"></i>
                                Use a different address
                              </p>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Address Form */}
                {(savedAddresses.length === 0 || useNewAddress) && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-foreground">
                      {savedAddresses.length > 0 ? 'Enter a Different Address' : 'Shipping Address'}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Street Address *</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                          placeholder="House Number Street Name"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">City/Town *</label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">State/Province *</label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Country *</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-foreground">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">First Name *</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Last Name *</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email Address *</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-foreground">Payment Method</h3>
                  <div className="space-y-3">
                    {[
                      { value: 'cod', label: 'Cash on Delivery', icon: 'fas fa-money-bill' },
                      { value: 'paystack', label: 'Paystack (Card, Bank, USSD)', icon: 'fas fa-credit-card' },
                      { value: 'bank-transfer', label: 'Bank Transfer', icon: 'fas fa-university' },
                    ].map((method) => (
                      <label key={method.value} className="flex items-center p-4 rounded-lg border-2 border-border cursor-pointer hover:border-primary/50 transition-all duration-200"
                        style={{
                          borderColor: formData.paymentMethod === method.value ? 'var(--primary)' : undefined,
                          backgroundColor: formData.paymentMethod === method.value ? 'var(--primary-opacity)' : undefined
                        }}
                      >
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          value={method.value} 
                          checked={formData.paymentMethod === method.value} 
                          onChange={handleChange}
                          className="mr-3"
                        />
                        <i className={`${method.icon} text-primary mr-3`}></i>
                        <span className="font-medium text-foreground">{method.label}</span>
                      </label>
                    ))}
                  </div>

                  {formData.paymentMethod === 'bank-transfer' && bankInfo && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-accent/10 border border-accent/20 rounded-lg space-y-3"
                    >
                      <h4 className="font-semibold text-foreground">Bank Transfer Details</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Bank:</span> {bankInfo.bankName}</p>
                        <p><span className="font-medium">Account Name:</span> {bankInfo.accountName}</p>
                        <p><span className="font-medium">Account Number:</span> {bankInfo.accountNumber}</p>
                        {bankInfo.instructions && (
                          <p className="text-muted-foreground italic">{bankInfo.instructions}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Transfer Reference</label>
                        <input 
                          type="text"
                          className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          name="bankRef" 
                          value={formData.bankRef} 
                          onChange={handleChange} 
                          placeholder="e.g., Mobile app reference"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Right - Order Summary */}
              <motion.div
                className="lg:col-span-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="sticky top-24 bg-card border border-border rounded-lg p-6 space-y-6">
                  <h3 className="text-xl font-bold text-foreground">Order Summary</h3>

                  {/* Items */}
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {cart.items.map((item) => (
                      <div key={item.product._id} className="flex gap-3 pb-4 border-b border-border last:border-0">
                        <img
                          src={getImageUrl(item.product.image) || '/img/product-placeholder.jpg'}
                          className="w-16 h-16 rounded-lg object-cover bg-muted"
                          alt={item.product.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/img/product-placeholder.jpg';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          <p className="text-sm font-semibold text-primary mt-1">
                            {formatCurrency(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="space-y-3 pt-4 border-t border-border">
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

                  {/* Grand Total */}
                  <div className="pt-4 border-t border-border flex justify-between items-center">
                    <span className="text-lg font-semibold text-foreground">Total</span>
                    <span className="text-3xl font-bold text-primary">{formatCurrency(total)}</span>
                  </div>

                  {/* Place Order Button */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check-circle"></i>
                        Place Order
                      </>
                    )}
                  </motion.button>

                  {/* Security Info */}
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <i className="fas fa-shield-alt text-primary"></i>
                      Your payment information is secure and encrypted
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </form>
        )}
      </motion.div>
    </Layout>
  );
};

export default Checkout;
