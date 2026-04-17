import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { WishlistProvider } from "@/contexts/WishlistContext";

import Index from "./pages/Index";
import Shop from "./pages/Shop";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import PaymentCallback from "./pages/PaymentCallback";
import TrackOrder from "./pages/TrackOrder";
import ReturnPolicy from "./pages/ReturnPolicy";
import ShippingInfo from "./pages/ShippingInfo";
import FAQ from "./pages/FAQ";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Account from "./pages/Account";
import ProductDetail from "./pages/ProductDetail";
import Wishlist from "./pages/Wishlist";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import MyReviews from "./pages/MyReviews";
import NotFound from "./pages/NotFound";

import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminOrders from "./pages/admin/Orders";
import AdminProducts from "./pages/admin/Products";
import AdminCustomers from "./pages/admin/Customers";
import AdminPayments from "./pages/admin/Payments";
import AdminReports from "./pages/admin/Reports";
import AdminSettings from "./pages/admin/Settings";
import AdminCoupons from "./pages/admin/Coupons";
import AdminShipping from "./pages/admin/Shipping";
import AdminPages from "./pages/admin/Pages";
import AdminCategories from "./pages/admin/Categories";
import AdminIncompleteOrders from "./pages/admin/IncompleteOrders";
import AdminRecoveryAnalytics from "./pages/admin/RecoveryAnalytics";
import AdminLiveChat from "./pages/admin/LiveChat";
import AdminVisitorAnalytics from "./pages/admin/VisitorAnalytics";
import PageTracker from "./components/PageTracker";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter basename={import.meta.env.BASE_URL}>
              <PageTracker />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/payment-callback" element={<PaymentCallback />} />
                <Route path="/track-order" element={<TrackOrder />} />
                <Route path="/return-policy" element={<ReturnPolicy />} />
                <Route path="/shipping-info" element={<ShippingInfo />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/account" element={<Account />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/my-reviews" element={<MyReviews />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-conditions" element={<TermsConditions />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="payments" element={<AdminPayments />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="coupons" element={<AdminCoupons />} />
                  <Route path="shipping" element={<AdminShipping />} />
                  <Route path="pages" element={<AdminPages />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="incomplete-orders" element={<AdminIncompleteOrders />} />
                  <Route path="recovery-analytics" element={<AdminRecoveryAnalytics />} />
                  <Route path="live-chat" element={<AdminLiveChat />} />
                  <Route path="visitor-analytics" element={<AdminVisitorAnalytics />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
