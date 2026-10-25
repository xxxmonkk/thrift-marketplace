import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Pages
import { HomePage } from './pages/HomePage';
import { BrowsePage } from './pages/BrowsePage';
import { ListingDetailPage } from './pages/ListingDetailPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { CreateListingPage } from './pages/CreateListingPage';
import { AdminQueuePage } from './pages/AdminQueuePage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <div className="min-h-screen flex flex-col bg-charcoal text-parchment font-sans selection:bg-gold/30 selection:text-ivory">
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/listings/:id" element={<ListingDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Buyer / Cart Routes */}
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute allowedRoles={['buyer']}>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={['buyer']}>
                <OrdersPage />
              </ProtectedRoute>
            }
          />

          {/* Seller Routes */}
          <Route
            path="/seller"
            element={
              <ProtectedRoute allowedRoles={['seller']}>
                <SellerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/create"
            element={
              <ProtectedRoute allowedRoles={['seller']}>
                <CreateListingPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminQueuePage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
