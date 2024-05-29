import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  const location = useLocation();
  const isBarcodeScannerPage = location.pathname === '/scanner';
  const isRecommendation2Page = location.pathname === '/recommendation-2';
  const isRecommendation1Page = location.pathname === '/recommendation-1';
  const isPaymentPage = location.pathname === '/payment';

  return (
    <div>
      {!isBarcodeScannerPage && !isRecommendation2Page && !isRecommendation1Page && !isPaymentPage && <Navbar />}
      <Outlet />
    </div>
  );
}
