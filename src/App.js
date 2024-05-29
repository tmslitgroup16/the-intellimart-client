import React from "react";
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import CategoriesPage from './components/Categories/CategoriesPage';
import PhonePage from './components/PhonePage';
import PrivacyPolicy from './components/Policies/PrivacyPolicy';
import ReturnPolicy from './components/Policies/ReturnPolicy';
import TermsAndConditions from './components/Policies/TermsAndConditions';
import ShippingPolicy from "./components/Policies/ShippingPolicy";
import ProfilePage from "./components/ProfilePage";
import SuperCategoriesPage from "./components/Categories/SuperCategoriesPage";
import ProductsPage from "./components/ProductsPage";
import CartPage from "./components/Cart/CartPage";
import { CartProvider } from "./components/Cart/CartContext";
import BarcodeScannerPage from "./components/Scanner/BarcodeScanner";
import Layout from "./components/Layout";
import Recommendation2Page from "./components/Recommendation2Page";
import ExtraIngredientsPage from "./components/Categories/ExtraIngredientsPage";
import Recommendation1Page from "./components/Recommendation1Page";
import PaymentPage from "./components/PaymentPage";
import SearchResultPage from "./components/SearchResultPage";
import PrivateRoute from './components/Auth/PrivateRoute';
import { AuthContext, useAuth } from './components/Auth/AuthContext';
import PageNotFound from "./components/PageNotFound";
import PurchaseHistoryPage from "./components/PurchaseHistoryPage";
import { CreditsProvider } from "./components/Cart/CreditsContext";

function App() {
  const { user, loading, logout } = useAuth();

  return(
    <>
    <AuthContext.Provider value={{ user, loading, logout}}>
      <BrowserRouter>
        <CartProvider>
          <CreditsProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/phone" element={<PhonePage />} />

              <Route element={<PrivateRoute> <Layout /> </PrivateRoute>}>
                <Route path="/" element={<SuperCategoriesPage/>} />
                <Route path="/:superCategoryName" element={<CategoriesPage />} />
                <Route path="/:superCategoryName/:CategoryId" element={<ProductsPage />} />
                <Route path="/:superCategoryName/:CategoryId/:ProductId" element={<SearchResultPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/scanner" element={<BarcodeScannerPage />} />
                <Route path="/recommendation-1" element={<Recommendation1Page />} />
                <Route path="/recommendation-2" element={<Recommendation2Page />} />
                <Route path="/extra-ingredients/:dishName" element={<ExtraIngredientsPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/return-policy" element={<ReturnPolicy />} />
                <Route path="/shipping-policy" element={<ShippingPolicy />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/purchase-history" element={<PurchaseHistoryPage />} />
              </Route>

              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </CreditsProvider>
        </CartProvider>
      </BrowserRouter>
    </AuthContext.Provider>
    </>
  )
}

export default App;
