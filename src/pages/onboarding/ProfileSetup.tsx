import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateProfile } from "@/hooks/use-cloud-data";
import { toast } from "sonner";

const occupations = ["Construction Worker", "Delivery Partner", "Auto Driver", "Street Vendor", "Shop Worker", "Other"];
const cities = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad", "Kolkata", "Pune", "Jaipur", "Other"];

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [occupation, setOccupation] = useState("");
  const [city, setCity] = useState("");
  const [incomeType, setIncomeType] = useState<"daily" | "weekly">("daily");

  const handleComplete = async () => {
    if (!name || !age || !occupation || !city) return;
    try {
      await updateProfile.mutateAsync({
        name, age: parseInt(age), occupation, city, income_type: incomeType,
      });
      toast.success("Profile saved!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    }
  };

  const isValid = name && age && occupation && city;

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-6 pb-8">
      <button onClick={() => navigate(-1)} className="text-muted-foreground mb-6">
        <ArrowLeft className="h-6 w-6" />
      </button>

      <div className="animate-fade-in flex-1">
        <div className="w-14 h-14 rounded-2xl gradient-warm flex items-center justify-center mb-6">
          <User className="h-7 w-7 text-warning-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Your Profile</h1>
        <p className="text-muted-foreground mb-6">Tell us about yourself</p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name"
              className="w-full px-4 py-3.5 rounded-xl bg-muted text-foreground font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Age</label>
            <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Your age"
              className="w-full px-4 py-3.5 rounded-xl bg-muted text-foreground font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Occupation</label>
            <div className="flex flex-wrap gap-2">
              {occupations.map((o) => (
                <button key={o} onClick={() => setOccupation(o)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${occupation === o ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {o}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">City</label>
            <div className="flex flex-wrap gap-2">
              {cities.map((c) => (
                <button key={c} onClick={() => setCity(c)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${city === c ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">How do you get paid?</label>
            <div className="flex gap-3">
              {(["daily", "weekly"] as const).map((t) => (
                <button key={t} onClick={() => setIncomeType(t)}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${incomeType === t ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {t === "daily" ? "Daily" : "Weekly"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={handleComplete} disabled={!isValid || updateProfile.isPending}
          className="w-full py-4 rounded-xl gradient-primary text-primary-foreground font-bold text-lg disabled:opacity-40 active:scale-[0.98] transition-all mt-8">
          {updateProfile.isPending ? 'Saving...' : 'Start Using RozanaPay'}
        </button>
      </div>
    </div>
  );
}
