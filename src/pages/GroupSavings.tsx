import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import { Users, Plus, Crown } from "lucide-react";
import { featureStore } from "@/lib/store-features";

export default function GroupSavingsPage() {
  const groups = featureStore.getGroupSavings();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [members, setMembers] = useState("10");
  const [contribution, setContribution] = useState("1000");

  const handleCreate = () => {
    if (!name.trim() || !members || !contribution) return;
    const m = Number(members);
    const c = Number(contribution);
    featureStore.addGroupSavings({
      id: `grp-${Date.now()}`,
      name: name.trim(),
      members: m,
      monthlyContribution: c,
      totalPool: m * c,
      currentRound: 1,
      totalRounds: m,
      status: 'active',
      createdAt: new Date().toISOString(),
    });
    setShowForm(false);
    setName("");
  };

  return (
    <MobileLayout>
      <div className="px-5 pt-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-foreground">Group Savings</h1>
            <p className="text-sm text-muted-foreground">Digital Chit Fund</p>
          </div>
          <button onClick={() => setShowForm(true)} className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
            <Plus className="h-5 w-5 text-primary-foreground" />
          </button>
        </div>

        {/* How it works */}
        <div className="bg-card rounded-xl p-4 shadow-card mb-6">
          <p className="font-semibold text-foreground mb-2">How Digital Chit Works</p>
          <ol className="space-y-1 text-xs text-muted-foreground list-decimal list-inside">
            <li>Create or join a group (5-20 members)</li>
            <li>Everyone contributes monthly</li>
            <li>Each month, one member gets the full pool</li>
            <li>Continues until everyone has received once</li>
          </ol>
        </div>

        {showForm && (
          <div className="bg-card rounded-2xl p-5 shadow-elevated mb-6">
            <p className="font-semibold text-foreground mb-3">Create New Group</p>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Group name"
              className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground mb-3 focus:outline-none focus:ring-2 focus:ring-primary" />
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Members</label>
                <input type="number" value={members} onChange={(e) => setMembers(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Monthly ₹</label>
                <input type="number" value={contribution} onChange={(e) => setContribution(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
            {name && members && contribution && (
              <div className="bg-muted rounded-xl p-3 mb-3 text-sm text-muted-foreground">
                Pool size: <span className="font-semibold text-foreground">₹{(Number(members) * Number(contribution)).toLocaleString("en-IN")}</span>/month
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl bg-muted text-muted-foreground font-medium">Cancel</button>
              <button onClick={handleCreate} className="flex-1 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold">Create</button>
            </div>
          </div>
        )}

        {/* Groups list */}
        <div className="space-y-3">
          {groups.map((g) => (
            <div key={g.id} className="bg-card rounded-xl p-4 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-warning" />
                  <p className="font-semibold text-foreground">{g.name}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">{g.status}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-foreground">{g.members}</p>
                  <p className="text-[10px] text-muted-foreground">Members</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">₹{g.monthlyContribution.toLocaleString("en-IN")}</p>
                  <p className="text-[10px] text-muted-foreground">Monthly</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{g.currentRound}/{g.totalRounds}</p>
                  <p className="text-[10px] text-muted-foreground">Round</p>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-muted mt-3">
                <div className="h-full rounded-full bg-warning transition-all" style={{ width: `${(g.currentRound / g.totalRounds) * 100}%` }} />
              </div>
            </div>
          ))}
          {groups.length === 0 && !showForm && (
            <p className="text-center text-muted-foreground py-12 text-sm">No groups yet. Create one to start!</p>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
