import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Github, LogOut, KeyRound, User, CheckCircle2, AlertCircle } from "lucide-react";
import { useMeQuery } from "@/hooks/useAuth.hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useHandleNavigate } from "@/layers_UI/utils/CustomFunction/HandleNavigate";
import { updateProfile, verifyOTP, changePassword } from "@/api/user.api";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const { data: user } = useMeQuery();
  const queryClient = useQueryClient();
  const navigate = useHandleNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    queryClient.clear();
    navigate("login");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await updateProfile({ name, email });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      if (res.otpRequired) {
        setIsOtpSent(true);
        toast.info(res.message);
      } else {
        toast.success(res.message);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verifyOTP(otp);
      setIsOtpSent(false);
      setOtp("");
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success("Email verified successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Password updated successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

    return(<>

    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl"
      >
        <Card className="rounded-2xl shadow-xl">
          <CardContent className="p-6 space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>TR</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <User size={18} /> {user?.name || user?.email}
                  </h2>
                </div>
              </div>

              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="mr-2" size={16} /> Logout
              </Button>
            </div>

            {/* Profile Update */}
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User size={16} /> Name
                </label>
                <Input
                  placeholder="Your display name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Mail size={16} /> Email 
                    {(user as any)?.isEmailVerified ? 
                      <CheckCircle2 size={14} className="text-green-500" /> : 
                      <AlertCircle size={14} className="text-amber-500" />
                    }
                  </span>
                  {!((user as any)?.isEmailVerified) && <span className="text-[10px] text-amber-500 font-bold uppercase">Unverified</span>}
                </label>
                <Input
                  placeholder="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {isOtpSent && (
                <div className="p-4 bg-muted/30 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Verification OTP</label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Enter 6-digit OTP" 
                      value={otp} 
                      onChange={(e) => setOtp(e.target.value)} 
                    />
                    <Button type="button" onClick={handleVerifyOTP}>Verify</Button>
                  </div>
                </div>
              )}

              <Button type="submit" variant="outline" className="w-full">Save Profile Changes</Button>
            </form>

            {/* GitHub Integration */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-sidebar/50">
              <div className="flex items-center gap-3">
                <Github />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">GitHub Account</span>
                  <span className="text-[10px] text-muted-foreground">
                    {user?.provider === 'google' ? 'Connected via Google' : 'Local Authentication'}
                  </span>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>Linked</Button>
            </div>

            {/* Change Password */}
            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4 pt-4 border-t border-border/40">
              <label className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide">
                <KeyRound size={16} /> Security Settings
              </label>
              
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground uppercase">Current Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground uppercase">New Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Update Security Credentials
              </Button>
            </form>

          </CardContent>
        </Card>
      </motion.div>
    </div>


    </>)

}