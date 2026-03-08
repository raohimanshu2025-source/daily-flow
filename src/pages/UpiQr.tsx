import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import { QrCode, Copy, Share2, Check } from "lucide-react";
import { store } from "@/lib/store";

export default function UpiQr() {
  const user = store.getUser();
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);
  const upiId = `${user?.phone || "9999999999"}@rozanapay`;

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <MobileLayout>
      <div className="px-5 pt-6">
        <h1 className="text-xl font-bold text-foreground mb-1">UPI QR Pay</h1>
        <p className="text-sm text-muted-foreground mb-6">Share your QR to receive payments instantly</p>

        <div className="bg-card rounded-2xl p-6 shadow-elevated text-center mb-6">
          {/* QR Code Placeholder */}
          <div className="w-48 h-48 mx-auto bg-muted rounded-2xl flex items-center justify-center mb-4 border-2 border-dashed border-border">
            <div className="text-center">
              <QrCode className="h-16 w-16 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                {amount ? `₹${amount}` : "Any Amount"}
              </p>
            </div>
          </div>

          <p className="text-sm font-semibold text-foreground mb-1">{user?.name || "User"}</p>
          <div className="flex items-center justify-center gap-2">
            <p className="text-xs text-muted-foreground">{upiId}</p>
            <button onClick={handleCopy} className="text-primary">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-foreground mb-2 block">Set Amount (optional)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-4 gap-2 mb-6">
          {[50, 100, 200, 500].map((v) => (
            <button
              key={v}
              onClick={() => setAmount(String(v))}
              className="py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium"
            >
              ₹{v}
            </button>
          ))}
        </div>

        <button className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow-elevated">
          <Share2 className="h-5 w-5" />
          Share QR Code
        </button>

        {/* Recent received */}
        <div className="mt-6">
          <h3 className="font-semibold text-foreground mb-3">Recent Received</h3>
          <div className="space-y-2">
            {[
              { from: "Ramesh Kumar", amount: 450, time: "2 hours ago" },
              { from: "Construction Site", amount: 800, time: "Yesterday" },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between bg-card rounded-xl p-3 shadow-card">
                <div>
                  <p className="text-sm font-medium text-foreground">{r.from}</p>
                  <p className="text-xs text-muted-foreground">{r.time}</p>
                </div>
                <p className="text-sm font-semibold text-success">+₹{r.amount}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
