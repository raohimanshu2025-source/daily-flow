import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import { Shield, Heart, Wrench, UserCheck, Check } from "lucide-react";
import { featureStore } from "@/lib/store-features";

const plans = [
  { type: 'accident' as const, icon: Shield, label: 'Accident Cover', daily: 3, coverage: 100000, desc: 'Covers accidents & injuries' },
  { type: 'health' as const, icon: Heart, label: 'Health Cover', daily: 5, coverage: 50000, desc: 'Hospital & medicine expenses' },
  { type: 'tool' as const, icon: Wrench, label: 'Tool/Vehicle', daily: 2, coverage: 25000, desc: 'Auto, tools & equipment' },
  { type: 'life' as const, icon: UserCheck, label: 'Life Cover', daily: 4, coverage: 200000, desc: 'Family financial security' },
];

export default function InsurancePage() {
  const policies = featureStore.getInsurancePolicies();
  const [enrolled, setEnrolled] = useState<string[]>(policies.map(p => p.type));

  const handleEnroll = (plan: typeof plans[number]) => {
    if (enrolled.includes(plan.type)) return;
    featureStore.addInsurancePolicy({
      id: `ins-${Date.now()}`,
      type: plan.type,
      dailyPremium: plan.daily,
      coverageAmount: plan.coverage,
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 365 * 86400000).toISOString(),
    });
    setEnrolled([...enrolled, plan.type]);
  };

  return (
    <MobileLayout>
      <div className="px-5 pt-6">
        <h1 className="text-xl font-bold text-foreground mb-1">Micro Insurance</h1>
        <p className="text-sm text-muted-foreground mb-5">Protection from just ₹1/day</p>

        {/* Active policies summary */}
        {policies.length > 0 && (
          <div className="gradient-accent rounded-2xl p-5 mb-6 shadow-elevated text-primary-foreground">
            <p className="text-sm opacity-80 mb-1">Active Coverage</p>
            <h2 className="text-2xl font-bold">
              ₹{policies.reduce((s, p) => s + p.coverageAmount, 0).toLocaleString("en-IN")}
            </h2>
            <p className="text-sm opacity-80 mt-1">
              {policies.length} active {policies.length === 1 ? 'policy' : 'policies'} · ₹{policies.reduce((s, p) => s + p.dailyPremium, 0)}/day
            </p>
          </div>
        )}

        <div className="space-y-3 mb-6">
          {plans.map((plan) => {
            const isEnrolled = enrolled.includes(plan.type);
            return (
              <div key={plan.type} className="bg-card rounded-xl p-4 shadow-card">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                    <plan.icon className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">{plan.label}</p>
                      <span className="text-xs font-bold text-primary">₹{plan.daily}/day</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{plan.desc}</p>
                    <p className="text-xs text-muted-foreground">Coverage: ₹{plan.coverage.toLocaleString("en-IN")}</p>
                    <button
                      onClick={() => handleEnroll(plan)}
                      disabled={isEnrolled}
                      className={`mt-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isEnrolled
                          ? 'bg-success/10 text-success'
                          : 'gradient-primary text-primary-foreground'
                      }`}
                    >
                      {isEnrolled ? (
                        <span className="flex items-center gap-1"><Check className="h-3 w-3" /> Enrolled</span>
                      ) : 'Enroll Now'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MobileLayout>
  );
}
