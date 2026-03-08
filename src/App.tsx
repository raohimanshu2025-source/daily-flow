import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { store } from "@/lib/store";
import Welcome from "./pages/Welcome";
import PhoneLogin from "./pages/onboarding/PhoneLogin";
import OtpVerify from "./pages/onboarding/OtpVerify";
import ProfileSetup from "./pages/onboarding/ProfileSetup";
import Dashboard from "./pages/Dashboard";
import Income from "./pages/Income";
import Savings from "./pages/Savings";
import Loans from "./pages/Loans";
import Transactions from "./pages/Transactions";
import Analytics from "./pages/Analytics";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return store.isOnboarded() ? <>{children}</> : <Navigate to="/" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={store.isOnboarded() ? <Navigate to="/dashboard" replace /> : <Welcome />} />
          <Route path="/onboarding/phone" element={<PhoneLogin />} />
          <Route path="/onboarding/otp" element={<OtpVerify />} />
          <Route path="/onboarding/profile" element={<ProfileSetup />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/income" element={<ProtectedRoute><Income /></ProtectedRoute>} />
          <Route path="/savings" element={<ProtectedRoute><Savings /></ProtectedRoute>} />
          <Route path="/loans" element={<ProtectedRoute><Loans /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
