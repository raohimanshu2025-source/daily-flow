import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/use-cloud-data";
import { motion } from "framer-motion";
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";
import MobileLayout from "@/components/MobileLayout";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function KycUpload() {
  const { user } = useAuth();
  const { data: profile, refetch } = useProfile();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be less than 5MB");
      return;
    }
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
      toast.error("Only JPG, PNG, or PDF allowed");
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
      toast.error("Upload failed: " + uploadError.message);
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
      toast.error("Failed to update profile");
      return;
    }

    toast.success("KYC document uploaded! 📄");
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
          <h1 className="text-xl font-black text-foreground">KYC Verification 🪪</h1>
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
              {kycStatus === 'verified' ? 'KYC Verified ✅' :
               kycStatus === 'submitted' ? 'Under Review ⏳' :
               kycStatus === 'rejected' ? 'Rejected ❌' :
               'KYC Pending'}
            </p>
            <p className="text-xs text-muted-foreground">
              {kycStatus === 'verified' ? 'Your identity has been verified' :
               kycStatus === 'submitted' ? 'We\'re reviewing your document' :
               kycStatus === 'rejected' ? 'Please upload a clearer document' :
               'Upload your ID to unlock all features'}
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
            <h3 className="text-sm font-bold text-foreground mb-3">Upload ID Document</h3>
            <p className="text-xs text-muted-foreground mb-4">Aadhaar Card, PAN Card, or Voter ID</p>

            <label className="block cursor-pointer">
              <input type="file" accept="image/jpeg,image/png,application/pdf" onChange={handleUpload} className="hidden" />
              <div className="border-2 border-dashed border-primary/30 rounded-2xl p-8 text-center hover:border-primary/60 hover:bg-primary/5 transition-all">
                {uploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <span className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="text-sm font-semibold text-primary">Uploading...</p>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-3 shadow-glow">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-bold text-foreground mb-1">Tap to upload</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG or PDF · Max 5MB</p>
                  </>
                )}
              </div>
            </label>

            {preview && (
              <div className="mt-4 relative">
                <img src={preview} alt="KYC Preview" className="w-full rounded-2xl border border-border/50" />
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
          <h3 className="text-sm font-bold text-foreground mb-3">Accepted Documents</h3>
          <div className="space-y-2">
            {[
              { name: "Aadhaar Card", emoji: "🪪" },
              { name: "PAN Card", emoji: "💳" },
              { name: "Voter ID", emoji: "🗳️" },
              { name: "Driving License", emoji: "🚗" },
            ].map(doc => (
              <div key={doc.name} className="flex items-center gap-2 text-sm">
                <span>{doc.emoji}</span>
                <span className="text-muted-foreground">{doc.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </MobileLayout>
  );
}
