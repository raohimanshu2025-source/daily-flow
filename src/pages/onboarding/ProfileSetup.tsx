import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, User, Check } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateProfile } from "@/hooks/use-cloud-data";
import { toast } from "sonner";

const occupations = ["Construction Worker", "Delivery Partner", "Auto Driver", "Street Vendor", "Shop Worker", "Other"];
const cities = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad", "Kolkata", "Pune", "Jaipur", "Other"];

export default function ProfileSetup() {
  const navigate = useNavigate();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [occupation, setOccupation] = useState("");
  const [city, setCity] = useState("");
  const [incomeType, setIncomeType] = useState<"daily" | "weekly">("daily");
  const [step, setStep] = useState(0);

  const steps = [
    { title: "What's your name?", subtitle: "So we know what to call you" },
    { title: "Tell us about your work", subtitle: "This helps us customize your experience" },
    { title: "Where are you from?", subtitle: "Almost done!" },
  ];

  const handleComplete = async () => {
    if (!name || !age || !occupation || !city) return;
    try {
      await updateProfile.mutateAsync({ name, age: parseInt(age), occupation, city, income_type: incomeType });
      toast.success("Welcome to RozanaPay! 🎉");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    }
  };

  const canProceed = step === 0 ? name && age : step === 1 ? occupation : city;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)}
            className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          {/* Progress */}
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <motion.div key={i} className={`h-1.5 rounded-full transition-all ${i <= step ? 'w-8 gradient-primary' : 'w-4 bg-muted'}`}
                layout transition={{ type: "spring", stiffness: 300 }} />
            ))}
          </div>
          <div className="w-10" />
        </div>

        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring" }}>
          <div className="w-14 h-14 rounded-2xl gradient-warm flex items-center justify-center mb-5 shadow-glow">
            <User className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground mb-1">{steps[step].title}</h1>
          <p className="text-muted-foreground text-sm mb-8">{steps[step].subtitle}</p>
        </motion.div>
      </div>

      {/* Step Content */}
      <div className="flex-1 px-5">
        <motion.div key={step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {step === 0 && (
            <>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1.5 block">Full Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" autoFocus
                  className="w-full px-4 py-4 rounded-2xl bg-muted text-foreground font-medium text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1.5 block">Age</label>
                <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Your age"
                  className="w-full px-4 py-4 rounded-2xl bg-muted text-foreground font-medium text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Occupation</label>
              <div className="grid grid-cols-2 gap-2">
                {occupations.map((o) => (
                  <motion.button key={o} whileTap={{ scale: 0.95 }} onClick={() => setOccupation(o)}
                    className={`px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all flex items-center gap-2 ${occupation === o ? "gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"}`}>
                    {occupation === o && <Check className="h-4 w-4" />}
                    {o}
                  </motion.button>
                ))}
              </div>
              <div className="mt-4">
                <label className="text-sm font-semibold text-foreground mb-1.5 block">How do you get paid?</label>
                <div className="flex gap-3">
                  {(["daily", "weekly"] as const).map((tp) => (
                    <motion.button key={tp} whileTap={{ scale: 0.95 }} onClick={() => setIncomeType(tp)}
                      className={`flex-1 py-3.5 rounded-2xl font-bold transition-all ${incomeType === tp ? "gradient-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                      {tp === "daily" ? "📅 Daily" : "📆 Weekly"}
                    </motion.button>
                  ))}
                </div>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">City</label>
              <div className="grid grid-cols-3 gap-2">
                {cities.map((c) => (
                  <motion.button key={c} whileTap={{ scale: 0.95 }} onClick={() => setCity(c)}
                    className={`px-3 py-3 rounded-2xl text-sm font-semibold transition-all ${city === c ? "gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"}`}>
                    {c}
                  </motion.button>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-8 pt-4">
        <motion.button whileTap={{ scale: 0.97 }}
          onClick={() => step < 2 ? setStep(step + 1) : handleComplete()}
          disabled={!canProceed || updateProfile.isPending}
          className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground font-bold text-lg disabled:opacity-40 transition-all shadow-glow">
          {updateProfile.isPending ? (
            <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</span>
          ) : step < 2 ? 'Continue' : 'Start Using RozanaPay 🚀'}
        </motion.button>
      </div>
    </div>
  );
}
