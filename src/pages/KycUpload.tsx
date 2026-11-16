import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/use-cloud-data";
import { motion } from "framer-motion";
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";
import MobileLayout from "@/components/MobileLayout";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";

export default function KycUpload() {
  const { user } = useAuth();
  const { data: profile, refetch } = useProfile();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  useLanguage();

  // Phase 1: fetch a signed URL for previously uploaded KYC doc (private bucket)
  useEffect(() => {
    const path = (profile as any)?.kyc_doc_url;
    if (!path) { setSignedUrl(null); return; }
    let cancelled = false;
    supabase.storage.from('kyc-documents').createSignedUrl(path, 3600).then(({ data }) => {
      if (!cancelled) setSignedUrl(data?.signedUrl ?? null);
    });
    return () => { cancelled = true; };
  }, [(profile as any)?.kyc_doc_url]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("kyc.err.tooBig"));
      return;
    }
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
      toast.error(t("kyc.err.badType"));
      return;
    }

    setUploading(true);
    const ext = file.name.split('.').pop();
    const filePath = `${user.id}/kyc-doc.${ext}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('kyc-documents')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error(t("kyc.err.uploadFailed").replace("{error}", uploadError.message));
      setUploading(false);
      return;
    }

    // Update profile — store only the storage path; we use signed URLs to read it
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ kyc_doc_url: filePath, kyc_status: 'submitted' })
      .eq('user_id', user.id);

    setUploading(false);
    if (updateError) {
      toast.error(t("kyc.err.profile"));
      return;
    }

    toast.success(t("kyc.uploaded"));
    // Phase 1: audit log
    await supabase.rpc('log_audit_event', {
      _action: 'kyc.submitted',
      _entity_type: 'profile',
      _entity_id: user.id,
      _metadata: { path: filePath, size: file.size, mime: file.type },
    });
    refetch();

    // Show preview for images
    if (file.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const kycStatus = (profile as any)?.kyc_status || 'pending';

  return (
    <MobileLayout>
      <div className="px-5 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </button>
          <h1 className="text-xl font-black text-foreground">{t("kyc.title")}</h1>
        </div>

        {/* Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-4 mb-5 flex items-center gap-3 ${
            kycStatus === 'verified' ? 'bg-success/10 border border-success/20' :
            kycStatus === 'submitted' ? 'bg-warning/10 border border-warning/20' :
            kycStatus === 'rejected' ? 'bg-destructive/10 border border-destructive/20' :
            'bg-muted border border-border/50'
          }`}
        >
          {kycStatus === 'verified' ? <CheckCircle className="h-6 w-6 text-success shrink-0" /> :
           kycStatus === 'submitted' ? <FileText className="h-6 w-6 text-warning shrink-0" /> :
           kycStatus === 'rejected' ? <AlertCircle className="h-6 w-6 text-destructive shrink-0" /> :
           <Upload className="h-6 w-6 text-muted-foreground shrink-0" />}
          <div>
            <p className="text-sm font-bold text-foreground">
              {kycStatus === 'verified' ? t("kyc.status.verified") :
               kycStatus === 'submitted' ? t("kyc.status.submitted") :
               kycStatus === 'rejected' ? t("kyc.status.rejected") :
               t("kyc.status.pending")}
            </p>
            <p className="text-xs text-muted-foreground">
              {kycStatus === 'verified' ? t("kyc.statusDesc.verified") :
               kycStatus === 'submitted' ? t("kyc.statusDesc.submitted") :
               kycStatus === 'rejected' ? t("kyc.statusDesc.rejected") :
               t("kyc.statusDesc.pending")}
            </p>
          </div>
        </motion.div>

        {/* Upload Area */}
        {kycStatus !== 'verified' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-sm font-bold text-foreground mb-3">{t("kyc.uploadTitle")}</h3>
            <p className="text-xs text-muted-foreground mb-4">{t("kyc.uploadHint")}</p>

            <label className="block cursor-pointer">
              <input type="file" accept="image/jpeg,image/png,application/pdf" onChange={handleUpload} className="hidden" />
              <div className="border-2 border-dashed border-primary/30 rounded-2xl p-8 text-center hover:border-primary/60 hover:bg-primary/5 transition-all">
                {uploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <span className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="text-sm font-semibold text-primary">{t("kyc.uploading")}</p>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-3 shadow-glow">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-bold text-foreground mb-1">{t("kyc.tapToUpload")}</p>
                    <p className="text-xs text-muted-foreground">{t("kyc.fileRules")}</p>
                  </>
                )}
              </div>
            </label>

            {preview && (
              <div className="mt-4 relative">
                <img src={preview} alt={t("kyc.previewAlt")} className="w-full rounded-2xl border border-border/50" />
                <button onClick={() => setPreview(null)} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-foreground/80 flex items-center justify-center">
                  <X className="h-4 w-4 text-background" />
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Accepted Documents */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-card rounded-2xl p-4 shadow-card border border-border/50"
        >
          {signedUrl && (
            <div className="mb-4">
              <h3 className="text-sm font-bold text-foreground mb-2">{t("kyc.yourDoc")}</h3>
              <a href={signedUrl} target="_blank" rel="noopener noreferrer"
                 className="block text-xs text-primary font-semibold underline break-all">
                {t("kyc.viewSecure")}
              </a>
            </div>
          )}
          <h3 className="text-sm font-bold text-foreground mb-3">{t("kyc.accepted")}</h3>
          <div className="space-y-2">
            {[
              { id: "aadhaar", emoji: "🪪" },
              { id: "pan", emoji: "💳" },
              { id: "voter", emoji: "🗳️" },
              { id: "dl", emoji: "🚗" },
            ].map(doc => (
              <div key={doc.id} className="flex items-center gap-2 text-sm">
                <span>{doc.emoji}</span>
                <span className="text-muted-foreground">{t(`kyc.doc.${doc.id}`)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </MobileLayout>
  );
}
