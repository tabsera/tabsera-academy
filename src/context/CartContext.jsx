/**
 * Cart Context
 * Manages shopping cart state for course/track enrollment
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

// Cart item types
export const ITEM_TYPES = {
  TRACK: 'track',
  COURSE: 'course',
  TUITION_PACK: 'tuition_pack',
};

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('tabsera_cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setItems(parsed.items || []);
        setPromoCode(parsed.promoCode || '');
        setPromoDiscount(parsed.promoDiscount || 0);
      } catch (e) {
        console.error('Error loading cart:', e);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('tabsera_cart', JSON.stringify({
      items,
      promoCode,
      promoDiscount,
    }));
  }, [items, promoCode, promoDiscount]);

  // Add item to cart
  const addItem = useCallback((item) => {
    setItems(prev => {
      // Check if item already exists
      const exists = prev.find(i => i.id === item.id && i.type === item.type);
      if (exists) {
        return prev;
      }
      return [...prev, {
        id: item.id,
        type: item.type,
        name: item.name,
        price: item.price,
        originalPrice: item.originalPrice || item.price,
        image: item.image,
        description: item.description,
        // Track/Course specific
        duration: item.duration,
        coursesCount: item.coursesCount,
        // Tuition Pack specific
        creditsIncluded: item.creditsIncluded,
        validityDays: item.validityDays,
      }];
    });
  }, []);

  // Remove item from cart
  const removeItem = useCallback((itemId, itemType) => {
    setItems(prev => prev.filter(i => !(i.id === itemId && i.type === itemType)));
  }, []);

  // Clear entire cart
  const clearCart = useCallback(() => {
    setItems([]);
    setPromoCode('');
    setPromoDiscount(0);
    localStorage.removeItem('tabsera_cart');
  }, []);

  // Check if item is in cart
  const isInCart = useCallback((itemId, itemType) => {
    return items.some(i => i.id === itemId && i.type === itemType);
  }, [items]);

  // Apply promo code
  const applyPromoCode = useCallback(async (code) => {
    setIsLoading(true);
    try {
      // API call would go here
      // Mock validation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const validCodes = {
        'WELCOME10': 10,
        'SAVE20': 20,
        'STUDENT15': 15,
      };

      const discount = validCodes[code.toUpperCase()];
      if (discount) {
        setPromoCode(code.toUpperCase());
        setPromoDiscount(discount);
        return { success: true, discount };
      } else {
        return { success: false, error: 'Invalid promo code' };
      }
    } catch (error) {
      return { success: false, error: 'Failed to apply promo code' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Remove promo code
  const removePromoCode = useCallback(() => {
    setPromoCode('');
    setPromoDiscount(0);
  }, []);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const discountAmount = (subtotal * promoDiscount) / 100;
  const total = subtotal - discountAmount;
  const itemCount = items.length;

  const value = {
    items,
    itemCount,
    subtotal,
    discountAmount,
    promoDiscount,
    promoCode,
    total,
    isLoading,
    addItem,
    removeItem,
    clearCart,
    isInCart,
    applyPromoCode,
    removePromoCode,
    ITEM_TYPES,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export { CartContext };
export default CartProvider;
