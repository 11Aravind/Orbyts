import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from 'react-use-cart';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import NetworkStatusBanner from './components/NetworkStatusBanner';
import CartStorageSync from './components/CartStorageSync';

// Eager load Home for 0ms initial page load
import Home from './pages/Home';

// Lazy load secondary routes & admin/waiter portals for code splitting
const Cart = lazy(() => import('./pages/Cart'));
const FoodDetails = lazy(() => import('./pages/FoodDetails'));
const CategoryDetails = lazy(() => import('./pages/CategoryDetails'));
const QRHandler = lazy(() => import('./pages/QRHandler'));

const KitchenView = lazy(() => import('./pages/kitchen/KitchenView'));
const WaiterLogin = lazy(() => import('./pages/waiter/WaiterLogin'));

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminDishes = lazy(() => import('./pages/admin/AdminDishes'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminBanners = lazy(() => import('./pages/admin/AdminBanners'));
const AdminTables = lazy(() => import('./pages/admin/AdminTables'));
const AdminWaiters = lazy(() => import('./pages/admin/AdminWaiters'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminPOS = lazy(() => import('./pages/admin/AdminPOS'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const NotFound = lazy(() => import('./pages/NotFound'));

import { APP_CONFIG } from './config';
import CustomerTableGuard from './components/CustomerTableGuard';

const PageLoadingFallback = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div className="text-center space-y-3">
      <div className="w-10 h-10 border-3 border-[#114536] border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-xs font-bold text-slate-500">Loading {APP_CONFIG.APP_NAME}...</p>
    </div>
  </div>
);

function App() {
  React.useEffect(() => {
    // Prefetch secondary lazy routes in background for instant page transitions
    const timer = setTimeout(() => {
      import('./pages/FoodDetails');
      import('./pages/CategoryDetails');
      import('./pages/Cart');
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <LanguageProvider>
          <CartProvider>
            <CartStorageSync />
            <Toaster
              position="bottom-center"
              reverseOrder={false}
              containerStyle={{
                bottom: 75,
              }}
              toastOptions={{ duration: 3000 }}
            />
            <NetworkStatusBanner />
            <Suspense fallback={<PageLoadingFallback />}>
              <Routes>
                {/* Customer QR Scan & Menu Routes */}
                <Route path="/" element={<CustomerTableGuard><Home /></CustomerTableGuard>} />
                <Route path="/table/:tableId" element={<QRHandler />} />
                <Route path="/qr/common" element={<QRHandler />} />
                <Route path="/qr/:qrCode" element={<QRHandler />} />
                <Route path="/FoodDetails/:foodId" element={<CustomerTableGuard><FoodDetails /></CustomerTableGuard>} />
                <Route path="/CategoryDetails/:categoryId" element={<CustomerTableGuard><CategoryDetails /></CustomerTableGuard>} />
                <Route path="/category/:categoryId" element={<CustomerTableGuard><CategoryDetails /></CustomerTableGuard>} />
                <Route path="/cart" element={<CustomerTableGuard><Cart /></CustomerTableGuard>} />

                {/* Waiter Application Routes (Authenticated) */}
                <Route path="/bite-waiter/login" element={<WaiterLogin />} />
                <Route
                  path="/bite-waiter"
                  element={
                    <ProtectedRoute requiredRole="WAITER">
                      <KitchenView />
                    </ProtectedRoute>
                  }
                />
                {/* Restaurant Admin Portal Authentication */}
                <Route
                  path="/bite-waiter/pos"
                  element={
                    <ProtectedRoute requiredRole="WAITER">
                      <AdminPOS isWaiter={true} />
                    </ProtectedRoute>
                  }
                />
                <Route path="/bite-admin/login" element={<AdminLogin />} />

                {/* Restaurant Admin Portal (Protected for Restaurant Client) */}
                <Route
                  path="/bite-admin"
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="pos" element={<AdminPOS />} />
                  <Route path="dishes" element={<AdminDishes />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="banners" element={<AdminBanners />} />
                  <Route path="tables" element={<AdminTables />} />
                  <Route path="waiters" element={<AdminWaiters />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* Catch-all 404 route for unknown, guessed, or legacy paths */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </CartProvider>
          </LanguageProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
