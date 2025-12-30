// CartContext.js
import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.id === product._id);
      if (existing) {
        return prevItems.map((item) =>
          item.id === product._id
       ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prevItems,
        {
          id: product._id,
          name: product.ProductName,
          vendor: product.ProductLocation || 'Unknown',
          price: Number(product.ProductPrice),
          quantity: 1,
          delivery: 'Estimated within 3–5 days',
        },
      ];
    });
  };

  const updateQuantity = (id, delta) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeItem }}>
      {children}
    </CartContext.Provider>
  );
};
