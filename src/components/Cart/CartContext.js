import React, { createContext, useReducer, useContext } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      return {
        ...state,
        [action.payload.id]: {
          ...action.payload,
          quantity: (state[action.payload.id]?.quantity || 0) + 1,
        },
      };

      /*case 'REMOVE_FROM_CART':
      const updatedCart = { ...state };
      if (updatedCart[action.payload.id]) {
        updatedCart[action.payload.id].quantity = Math.max(updatedCart[action.payload.id].quantity - 1, 0);

        if (updatedCart[action.payload.id].quantity === 0) {
          delete updatedCart[action.payload.id];
        }
      }
      console.log('Updated cart:', updatedCart);
      return updatedCart;*/

      case 'REMOVE_FROM_CART':
      const updatedCart = { ...state };
      if (updatedCart[action.payload.id]) {
          delete updatedCart[action.payload.id];
      }
      return updatedCart;
    
      case 'UPDATE_QUANTITY':
      if (action.payload.newQuantity <= 0) {
        return state;
      }
      return {
        ...state,
        [action.payload.itemId]: {
          ...state[action.payload.itemId],
          quantity: action.payload.newQuantity,
        },
      };

      case 'CLEAR_CART':
      return {};

    default:
      return state;
  }
};

const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, {});

  const addToCart = (item) => {
    dispatch({ type: 'ADD_TO_CART', payload: item });
  };

  const removeFromCart = (itemId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { id: itemId } });
  };

  const updateQuantity = (itemId, newQuantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, newQuantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const cartItems = Object.values(cart);
  const subTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const value = { cart, addToCart, removeFromCart, updateQuantity, clearCart, subTotal };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export { CartProvider, useCart, CartContext };
