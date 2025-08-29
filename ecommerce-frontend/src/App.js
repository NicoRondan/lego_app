import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LoginCallback from './pages/LoginCallback';
import OrdersPage from './pages/OrdersPage';
import AdminPage from './pages/AdminPage';
import WishlistPage from './pages/WishlistPage';
import Styleguide from './pages/Styleguide';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import NewProductPage from './pages/admin/NewProductPage';
import OrdersListPage from './pages/admin/OrdersListPage.jsx';
import OrderDetailPage from './pages/admin/OrderDetailPage.jsx';
import CouponsPage from './pages/admin/CouponsPage.jsx';
import ReportsPage from './pages/admin/ReportsPage.jsx';
import InventoryPage from './pages/admin/InventoryPage.jsx';
import UsersPage from './pages/admin/UsersPage.jsx';
import UserDetailPage from './pages/admin/UserDetailPage.jsx';
import SegmentsPage from './pages/admin/SegmentsPage.jsx';
import CampaignsPage from './pages/admin/CampaignsPage.jsx';
import Impersonate from './pages/Impersonate.jsx';
import PageView from './pages/PageView.jsx';
import HomeBuilderPage from './pages/admin/HomeBuilderPage.jsx';
import BannersPage from './pages/admin/BannersPage.jsx';

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const wrapperClass = isAdminRoute ? 'container-fluid px-3' : 'container my-4';
  return (
    <>
      <Navbar />
      <div className={wrapperClass}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute role="customer">
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute role="customer">
                <WishlistPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute role="customer">
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login/callback" element={<LoginCallback />} />
          <Route path="/p/:slug" element={<PageView />} />
          <Route
            path="/orders"
            element={
              <ProtectedRoute role="customer">
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/new"
            element={
              <ProtectedRoute role="admin">
                <NewProductPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/home"
            element={
              <ProtectedRoute role="admin">
                <HomeBuilderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute role="admin">
                <OrdersListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/banners"
            element={
              <ProtectedRoute role="admin">
                <BannersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/coupons"
            element={
              <ProtectedRoute role="admin">
                <CouponsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/segments"
            element={
              <ProtectedRoute role="admin">
                <SegmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/campaigns"
            element={
              <ProtectedRoute role="admin">
                <CampaignsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/inventory"
            element={
              <ProtectedRoute role="admin">
                <InventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute role="admin">
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/:id"
            element={
              <ProtectedRoute role="admin">
                <UserDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute role="admin">
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders/:id"
            element={
              <ProtectedRoute role="admin">
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />
          <Route path="/styleguide" element={<Styleguide />} />
          <Route path="/impersonate" element={<Impersonate />} />
        </Routes>
      </div>
      <Footer />
      <ToastContainer position="bottom-right" />
    </>
  );
}

export default App;
