import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatCurrency } from '../utils/currency';
import { getImageUrl } from '../services/api';

const PLACEHOLDER = '/img/product-placeholder.jpg';

const ProductCard = ({ product, onAddToCart }) => {
  const [imgSrc, setImgSrc] = useState(getImageUrl(product.image) || PLACEHOLDER);
  const [imgError, setImgError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      setIsAdding(true);
      try {
        await onAddToCart(product);
      } finally {
        setIsAdding(false);
      }
    }
  };

  const handleImageError = () => {
    if (!imgError) {
      setImgError(true);
      setImgSrc(PLACEHOLDER);
    }
  };

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
    >
      <Link to={`/shop/${product._id}`} className="block h-full group">
        <div className="h-full bg-card rounded-xl overflow-hidden border border-border hover:border-primary transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-primary/10 flex flex-col">
          {/* Image Container */}
          <div className="relative overflow-hidden bg-muted aspect-square">
            <motion.img 
              src={imgSrc} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              alt={product.name}
              onError={handleImageError}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            
            {/* Category Badge */}
            {product.category?.name && (
              <div className="absolute top-3 left-3 bg-primary/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                {product.category.name}
              </div>
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Content */}
          <div className="flex-1 p-4 flex flex-col gap-3">
            {/* Title */}
            <div>
              <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-300">
                {product.name}
              </h3>
              {product.brand && (
                <p className="text-xs text-muted-foreground mt-1">
                  {product.brand}
                </p>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 flex-grow">
                {product.description}
              </p>
            )}

            {/* Price and Button */}
            <div className="flex items-center justify-between gap-2 pt-2 mt-auto border-t border-border">
              <p className="text-lg font-bold text-primary">
                {formatCurrency(product.price)}
              </p>
              <motion.button 
                onClick={handleAddToCart}
                disabled={isAdding}
                className="p-2.5 bg-primary text-white rounded-lg hover:bg-accent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isAdding ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-shopping-bag"></i>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
