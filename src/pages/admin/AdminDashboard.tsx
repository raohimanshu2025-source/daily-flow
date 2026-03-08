import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, CreditCard, BarChart3, Shield, ArrowLeft, TrendingUp, AlertTriangle } from "lucide-react";

// Mock admin data
const mockUsers = [
  { id: "1", name: "Ramesh Kumar", phone: "9876543210", occupation: "Auto Driver", city: "Delhi", creditScore: 450, status: "active" },
  { id: "2", name: "Priya Devi", phone: "9876543211", occupation: "Street Vendor", city: "Mumbai", creditScore: 380, status: "active" },
  { id: "3", name: "Suresh Singh", phone: "9876543212", occupation: "Delivery Partner", city: "Bangalore", creditScore: 520, status: "active" },
  { id: "4", name: "Anita Kumari", phone: "9876543213", occupation: "Shop Worker", city: "Chennai", creditScore: 290, status: "flagged" },
  { id: "5", name: "Mohan Lal", phone: "9876543214", occupation: "Construction Worker", city: "Jaipur", creditScore: 410, status: "active" },
];

const mockPendingLoans = [
  { id: "L1", userName: "Ramesh Kumar", amount: 5000, duration: 14, creditScore: 450, appliedAt: "2026-03-07" },
  { id: "L2", userName: "Priya Devi", amount: 2000, duration: 7, creditScore: 380, appliedAt: "2026-03-08" },
  { id: "L3", userName: "Suresh Singh", amount: 10000, duration: 30, creditScore: 520, appliedAt: "2026-03-08" },
];

type Tab = "overview" | "users" | "loans" | "risk";

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const navigate = useNavigate();

  const tabs = [
    { id: "overview" as Tab, icon: BarChart3, label: "Overview" },
    { id: "users" as Tab, icon: Users, label: "Users" },
    { id: "loans" as Tab, icon: CreditCard, label: "Loans" },
    { id: "risk" as Tab, icon: Shield, label: "Risk" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-hero px-6 pt-6 pb-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate("/dashboard")} className="text-primary-foreground/80">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold text-primary-foreground">Admin Dashboard</h1>
          </div>
          <div className="flex gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === t.id
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "text-primary-foreground/60 hover:text-primary-foreground/80"
                }`}
              >
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {tab === "overview" && <OverviewTab />}
        {tab === "users" && <UsersTab />}
        {tab === "loans" && <LoansTab />}
        {tab === "risk" && <RiskTab />}
      </div>
    </div>
  );
}

function OverviewTab() {
  const stats = [
    { label: "Total Users", value: "12,847", change: "+342 this week", icon: Users, color: "text-primary" },
    { label: "Active Loans", value: "₹84.5L", change: "2,341 loans", icon: CreditCard, color: "text-warning" },
    { label: "Total Savings", value: "₹1.2Cr", change: "+₹8.5L this month", icon: TrendingUp, color: "text-success" },
    { label: "Default Rate", value: "2.1%", change: "↓ 0.3% from last month", icon: Shield, color: "text-destructive" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-card rounded-xl p-5 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <s.icon className={`h-5 w-5 ${s.color}`} />
            <span className="text-sm text-muted-foreground">{s.label}</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{s.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{s.change}</p>
        </div>
      ))}
    </div>
  );
}

function UsersTab() {
  return (
    <div className="bg-card rounded-xl shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Name</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Phone</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Occupation</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">City</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Credit Score</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-sm font-medium text-foreground">{u.name}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{u.phone}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{u.occupation}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{u.city}</td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">{u.creditScore}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-md font-semibold ${
                    u.status === "active" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                  }`}>{u.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LoansTab() {
  return (
    <div>
      <h3 className="font-semibold text-foreground mb-4">Pending Loan Approvals</h3>
      <div className="space-y-3">
        {mockPendingLoans.map((loan) => (
          <div key={loan.id} className="bg-card rounded-xl p-4 shadow-card flex items-center gap-4">
            <div className="flex-1">
              <p className="font-medium text-foreground">{loan.userName}</p>
              <p className="text-sm text-muted-foreground">₹{loan.amount.toLocaleString("en-IN")} · {loan.duration} days · Score: {loan.creditScore}</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg gradient-accent text-accent-foreground text-sm font-semibold">Approve</button>
              <button className="px-4 py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-semibold">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RiskTab() {
  const flags = [
    { user: "Anita Kumari", reason: "Multiple loan applications in 24hrs", severity: "high" },
    { user: "Unknown User", reason: "Suspicious OTP attempts", severity: "medium" },
    { user: "Mohan Lal", reason: "Income inconsistency detected", severity: "low" },
  ];

  return (
    <div>
      <h3 className="font-semibold text-foreground mb-4">Risk & Fraud Alerts</h3>
      <div className="space-y-3">
        {flags.map((flag, i) => (
          <div key={i} className="bg-card rounded-xl p-4 shadow-card flex items-center gap-3">
            <AlertTriangle className={`h-5 w-5 ${
              flag.severity === "high" ? "text-destructive" :
              flag.severity === "medium" ? "text-warning" : "text-muted-foreground"
            }`} />
            <div className="flex-1">
              <p className="font-medium text-foreground">{flag.user}</p>
              <p className="text-sm text-muted-foreground">{flag.reason}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-md font-semibold ${
              flag.severity === "high" ? "bg-destructive/10 text-destructive" :
              flag.severity === "medium" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
            }`}>{flag.severity}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
