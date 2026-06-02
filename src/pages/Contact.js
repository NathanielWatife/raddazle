import React, { useState } from 'react';
import Layout from '../components/Layout';
import { contactService } from '../services';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const body = { name: form.name, email: form.email, subject: form.subject, phone: form.phone, message: form.message };
      const res = await contactService.submit(body);
      if (res?.success) {
        toast.success('Message sent! We will get back to you soon.');
        setForm({ name: '', email: '', subject: '', phone: '', message: '' });
      } else {
        throw new Error(res?.message || 'Failed to send message');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
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

  const contactMethods = [
    {
      icon: 'fas fa-map-marker-alt',
      title: 'Address',
      content: 'Lagos, Nigeria',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: 'fas fa-envelope',
      title: 'Email',
      content: 'support@raddazle.com',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: 'fas fa-phone-alt',
      title: 'Phone',
      content: '+234 800 000 0000',
      color: 'from-orange-500 to-red-500'
    }
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
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground">Contact Us</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <i className="fas fa-home text-primary"></i>
              Home / <span className="text-primary">Contact</span>
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Contact Section */}
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Intro Section */}
        <motion.div
          variants={itemVariants}
          className="text-center mx-auto max-w-2xl mb-12 space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Get in Touch</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Have questions about our collections? Whether you're choosing grooming essentials or elevating your home-care routine, our experts are here to offer refined guidance. We're committed to providing exceptional customer service.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2"
          >
            <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
              <h3 className="text-2xl font-bold text-foreground">Send us a Message</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Full Name *</label>
                    <div className="relative">
                      <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"></i>
                      <input
                        type="text"
                        className="w-full bg-muted border border-border rounded-lg pl-12 pr-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                        placeholder="Your Name"
                        value={form.name}
                        onChange={(e)=>setForm({ ...form, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email Address *</label>
                    <div className="relative">
                      <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"></i>
                      <input
                        type="email"
                        className="w-full bg-muted border border-border rounded-lg pl-12 pr-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                        placeholder="your@email.com"
                        value={form.email}
                        onChange={(e)=>setForm({ ...form, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
                    <div className="relative">
                      <i className="fas fa-heading absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"></i>
                      <input
                        type="text"
                        className="w-full bg-muted border border-border rounded-lg pl-12 pr-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                        placeholder="What is this about?"
                        value={form.subject}
                        onChange={(e)=>setForm({ ...form, subject: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                    <div className="relative">
                      <i className="fas fa-phone absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"></i>
                      <input
                        type="tel"
                        className="w-full bg-muted border border-border rounded-lg pl-12 pr-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                        placeholder="+234..."
                        value={form.phone}
                        onChange={(e)=>setForm({ ...form, phone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Message *</label>
                  <textarea
                    className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 resize-none"
                    rows="6"
                    placeholder="Tell us more about your inquiry..."
                    value={form.message}
                    onChange={(e)=>setForm({ ...form, message: e.target.value })}
                    required
                  ></textarea>
                </div>

                {/* Submit Button */}
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
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      Send Message
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Contact Information Cards */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-1 space-y-4"
          >
            {contactMethods.map((method, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
                whileHover={{ translateY: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
                className="bg-card border border-border rounded-xl p-6 cursor-pointer transition-all duration-300"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                      <i className={`${method.icon} text-primary text-lg`}></i>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground mb-1">{method.title}</h4>
                    <p className="text-muted-foreground text-sm break-all">{method.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Response Time Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="bg-primary/10 border border-primary/20 rounded-xl p-6"
            >
              <div className="flex gap-3">
                <i className="fas fa-clock text-primary text-xl flex-shrink-0"></i>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Response Time</h4>
                  <p className="text-sm text-muted-foreground">
                    We typically respond within 24 hours during business days.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Contact;
