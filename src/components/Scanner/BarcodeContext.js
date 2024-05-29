import React, { createContext, useContext, useState } from 'react';

const BarcodeContext = createContext();

export const BarcodeProvider = ({ children }) => {
  const [scannedProducts, setScannedProducts] = useState([]);

  const addScannedProduct = (product) => {
    setScannedProducts((prevProducts) => {
      if (!prevProducts.includes(product)) {
        return [...prevProducts, product];
      }
      return prevProducts;
    });
  };

  return (
    <BarcodeContext.Provider value={{ scannedProducts, addScannedProduct }}>
      {children}
    </BarcodeContext.Provider>
  );
};

export const useBarcodeContext = () => {
  const context = useContext(BarcodeContext);
  if (!context) {
    throw new Error('useBarcodeContext must be used within a BarcodeProvider');
  }
  return context;
};