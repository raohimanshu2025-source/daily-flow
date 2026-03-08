import { useState } from "react";
import { notificationStore } from "@/lib/notifications";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";
import MobileLayout from "@/components/MobileLayout";
import { ArrowLeft, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const typeColors = {
  milestone: 'bg-accent/10 border-accent/20',
  reminder: 'bg-warning/10 border-warning/20',
  reward: 'bg-primary/10 border-primary/20',
  tip: 'bg-info/10 border-info/20',
};

export default function Notifications() {
  useLanguage();
  const navigate = useNavigate();
  const [, setRefresh] = useState(0);
  const notifications = notificationStore.getAll();

  const handleMarkRead = () => {
    notificationStore.markAllRead();
    setRefresh(r => r + 1);
  };

  return (
    <MobileLayout>
      <div className="px-5 pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <ArrowLeft className="h-4 w-4 text-foreground" />
            </button>
            <h1 className="text-xl font-bold text-foreground">{t('notif.title')}</h1>
          </div>
          {notifications.some(n => !n.read) && (
            <button onClick={handleMarkRead} className="flex items-center gap-1 text-sm text-primary font-medium">
              <CheckCheck className="h-4 w-4" /> Mark all read
            </button>
          )}
        </div>

        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className={`rounded-xl p-4 border transition-all ${typeColors[n.type]} ${!n.read ? 'shadow-card' : 'opacity-70'}`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{n.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(n.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />}
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">🔔</p>
              <p className="text-muted-foreground text-sm">{t('notif.empty')}</p>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
