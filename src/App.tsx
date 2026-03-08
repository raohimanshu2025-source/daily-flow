import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
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
import Services from "./pages/Services";
import UpiQr from "./pages/UpiQr";
import Bnpl from "./pages/Bnpl";
import DigitalGold from "./pages/DigitalGold";
import InsurancePage from "./pages/Insurance";
import Rewards from "./pages/Rewards";
import BillPayments from "./pages/BillPayments";
import ChatBotPage from "./pages/ChatBot";
import GroupSavingsPage from "./pages/GroupSavings";
import CreditExport from "./pages/CreditExport";
import SmartNudges from "./pages/SmartNudges";
import Expenses from "./pages/Expenses";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-pulse-soft text-primary text-lg font-semibold">Loading...</div></div>;
  return user ? <>{children}</> : <Navigate to="/" replace />;
}

function HomeRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-pulse-soft text-primary text-lg font-semibold">Loading...</div></div>;
  return user ? <Navigate to="/dashboard" replace /> : <Welcome />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/onboarding/phone" element={<PhoneLogin />} />
      <Route path="/onboarding/otp" element={<OtpVerify />} />
      <Route path="/onboarding/profile" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/income" element={<ProtectedRoute><Income /></ProtectedRoute>} />
      <Route path="/savings" element={<ProtectedRoute><Savings /></ProtectedRoute>} />
      <Route path="/loans" element={<ProtectedRoute><Loans /></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
      <Route path="/upi-qr" element={<ProtectedRoute><UpiQr /></ProtectedRoute>} />
      <Route path="/bnpl" element={<ProtectedRoute><Bnpl /></ProtectedRoute>} />
      <Route path="/gold" element={<ProtectedRoute><DigitalGold /></ProtectedRoute>} />
      <Route path="/insurance" element={<ProtectedRoute><InsurancePage /></ProtectedRoute>} />
      <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
      <Route path="/bills" element={<ProtectedRoute><BillPayments /></ProtectedRoute>} />
      <Route path="/chatbot" element={<ProtectedRoute><ChatBotPage /></ProtectedRoute>} />
      <Route path="/group-savings" element={<ProtectedRoute><GroupSavingsPage /></ProtectedRoute>} />
      <Route path="/credit-export" element={<ProtectedRoute><CreditExport /></ProtectedRoute>} />
      <Route path="/smart-nudges" element={<ProtectedRoute><SmartNudges /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
