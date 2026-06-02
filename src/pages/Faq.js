import React, { useState } from 'react';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';

const Faq = () => {
  const [expandedId, setExpandedId] = useState(null);

  const faqs = [
    {
      id: 1,
      icon: 'fas fa-truck',
      category: 'Shipping',
      question: 'How long does shipping take?',
      answer: 'Most orders are processed within 1-2 business days. Standard delivery takes 3-7 business days depending on your location. Express shipping options are available at checkout for faster delivery.'
    },
    {
      id: 2,
      icon: 'fas fa-check-circle',
      category: 'Products',
      question: 'Are your products authentic?',
      answer: 'Yes. We sell 100% genuine, brand-new products only. All items are sourced directly from authorized distributors and come with manufacturer warranties where applicable.'
    },
    {
      id: 3,
      icon: 'fas fa-credit-card',
      category: 'Payment',
      question: 'What payment methods are accepted?',
      answer: 'We accept major credit cards (Visa, Mastercard), bank transfers, USSD, and cash on delivery. All transactions are encrypted and secure using industry-standard protocols.'
    },
    {
      id: 4,
      icon: 'fas fa-undo',
      category: 'Returns',
      question: 'What is your return policy?',
      answer: 'We offer 30-day returns for most products in original condition with packaging intact. Contact our support team to initiate a return. Refunds are processed within 5-7 business days.'
    },
    {
      id: 5,
      icon: 'fas fa-lock',
      category: 'Account',
      question: 'Is my personal information secure?',
      answer: 'Absolutely. We use SSL encryption, secure payment gateways, and comply with international data protection standards. Your information is never shared with third parties without your consent.'
    },
    {
      id: 6,
      icon: 'fas fa-headset',
      category: 'Support',
      question: 'How can I contact customer support?',
      answer: 'You can reach us via email at support@raddazle.com, phone at +234 800 000 0000, or use our contact form. We respond to all inquiries within 24 business hours.'
    },
    {
      id: 7,
      icon: 'fas fa-exclamation-circle',
      category: 'Orders',
      question: 'Can I modify or cancel my order?',
      answer: 'If your order hasn\'t shipped yet, you can cancel or modify it immediately. Contact our support team right away. Orders that have already shipped cannot be modified but can be returned according to our return policy.'
    },
    {
      id: 8,
      icon: 'fas fa-package',
      category: 'Tracking',
      question: 'How do I track my order?',
      answer: 'Once your order ships, you\'ll receive a tracking number via email. You can use this number to monitor your delivery status in real-time. Track your package directly from your account dashboard.'
    },
  ];

  const categories = [...new Set(faqs.map(faq => faq.category))];

  const toggleFaq = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
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
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground">FAQs & Help</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <i className="fas fa-home text-primary"></i>
              Home / <span className="text-primary">FAQs</span>
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* FAQ Content */}
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
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Find answers to common questions about our products, shipping, returns, and more. Can't find what you're looking for? <a href="/contact" className="text-primary hover:text-accent transition-colors duration-300 font-semibold">Contact us</a> directly.
          </p>
        </motion.div>

        {/* Category Badges */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap gap-2 justify-center mb-12"
        >
          {categories.map((category) => (
            <div
              key={category}
              className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20"
            >
              {category}
            </div>
          ))}
        </motion.div>

        {/* FAQs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {faqs.map((faq) => (
            <motion.div
              key={faq.id}
              variants={itemVariants}
              className="h-full"
            >
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full h-full text-left"
              >
                <motion.div
                  className="bg-card border border-border rounded-xl p-6 h-full hover:shadow-lg transition-all duration-300 cursor-pointer"
                  whileHover={{ y: -4 }}
                >
                  {/* Header */}
                  <div className="flex gap-4 mb-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <i className={`${faq.icon} text-primary text-lg`}></i>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                        {faq.category}
                      </p>
                      <h3 className="text-lg font-semibold text-foreground pr-8 group-hover:text-primary transition-colors duration-300">
                        {faq.question}
                      </h3>
                    </div>
                    <div className="flex-shrink-0 mt-1">
                      <motion.i
                        className="fas fa-chevron-down text-primary text-sm"
                        animate={{ rotate: expandedId === faq.id ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  {/* Answer - Expanded */}
                  <AnimatePresence>
                    {expandedId === faq.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 border-t border-border">
                          <p className="text-muted-foreground leading-relaxed text-sm">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </button>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          variants={itemVariants}
          className="mt-16 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 rounded-2xl p-8 sm:p-12 text-center space-y-4"
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground">Still have questions?</h3>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Our customer support team is here to help. Reach out to us anytime, and we'll get back to you within 24 business hours.
          </p>
          <motion.a
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-accent transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fas fa-envelope"></i>
            Contact Us
          </motion.a>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Faq;
