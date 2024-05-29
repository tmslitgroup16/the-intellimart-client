// ShippingPolicy.js
import React from 'react';
import PolicyPage from './PolicyPage';

const ShippingPolicy = () => {
  const shippingContent = `
At Intellimart, we don't provide Shipping and Delivery facilities at the moment.
  `;

  return <PolicyPage title="Shipping and Delivery" content={shippingContent} />;
};

export default ShippingPolicy;