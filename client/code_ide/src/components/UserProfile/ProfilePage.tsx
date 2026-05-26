import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { auth, githubProvider, googleProvider } from "@/services/firebase";
import {
  linkWithPopup,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  User, Mail, Github, LogOut, KeyRound,
  CheckCircle2, AlertCircle, Chrome, Clock, Link2,
  Loader2, ShieldCheck
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/").replace(/\/$/, "");

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // ── Convex realtime profile ──────────────────────────────────────────────
  const profile = useQuery(
    api.users.getUserByUid,
    user?.firebaseUid ? { firebaseUid: user.firebaseUid } : "skip"
  );
  const updateProfileMutation = useMutation(api.users.updateProfile);
  const verifyOtpMutation = useMutation(api.users.verifyOtp);
  const linkGoogleMutation = useMutation(api.users.linkGoogle);
  const linkGithubMutation = useMutation(api.users.linkGithub);

  // ── Local state ──────────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [linkingGithub, setLinkingGithub] = useState(false);
  const [linkingGoogle, setLinkingGoogle] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Sync name/bio from Convex profile
  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setBio(profile.bio ?? "");
    }
  }, [profile]);

  const token = () => localStorage.getItem("token");

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    try {
      await updateProfileMutation({
        firebaseUid: user.firebaseUid,
        name,
        bio
      });
      toast.success("Profile saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Send OTP ─────────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    setSendingOtp(true);
    try {
      await axios.post(`${API}/user/send-otp`, {}, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      setOtpSent(true);
      toast.success("Verification code sent to your email");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  // ── Verify OTP ───────────────────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput || otpInput.length !== 6 || !user) {
      toast.error("Enter the 6-digit code");
      return;
    }
    setVerifyingOtp(true);
    try {
      await verifyOtpMutation({
        firebaseUid: user.firebaseUid,
        otp: otpInput
      });
      // We also verify in firebase to stay in sync
      if (auth.currentUser) {
        await axios.post(`${API}/user/verify-otp`, { otp: otpInput }, {
          headers: { Authorization: `Bearer ${token()}` }
        }).catch(console.error); // fallback just for firebase sync
      }
      setOtpSent(false);
      setOtpInput("");
      toast.success("Email verified!");
    } catch (err: any) {
      toast.error(err.message || "Invalid code");
    } finally {
      setVerifyingOtp(false);
    }
  };

  // ── Change Password ───────────────────────────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const firebaseUser = auth.currentUser;
    if (!firebaseUser || !firebaseUser.email) return;

    try {
      // Re-authenticate first
      const cred = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
      await reauthenticateWithCredential(firebaseUser, cred);
      await updatePassword(firebaseUser, newPassword);

      // Also update via backend (Firebase Admin)
      await axios.post(`${API}/user/change-password`, { newPassword }, {
        headers: { Authorization: `Bearer ${token()}` }
      });

      setCurrentPassword("");
      setNewPassword("");
      toast.success("Password updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    }
  };

  // ── Link GitHub ──────────────────────────────────────────────────────────
  const handleLinkGithub = async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser || !user) return;
    setLinkingGithub(true);
    try {
      const result = await linkWithPopup(firebaseUser, githubProvider);
      const ghUser = result.user;
      const ghInfo = result.user.providerData.find(p => p.providerId === "github.com");

      await linkGithubMutation({
        firebaseUid: user.firebaseUid,
        githubId: ghInfo?.uid ?? "",
        githubUsername: ghInfo?.displayName ?? ghUser.displayName ?? "",
      });

      toast.success("GitHub account linked!");
    } catch (err: any) {
      if (err.code === "auth/credential-already-in-use") {
        toast.error("This GitHub account is already linked to another user");
      } else {
        toast.error(err.message || "Failed to link GitHub");
      }
    } finally {
      setLinkingGithub(false);
    }
  };

  // ── Link Google ───────────────────────────────────────────────────────────
  const handleLinkGoogle = async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;
    setLinkingGoogle(true);
    try {
      const result = await linkWithPopup(firebaseUser, googleProvider);
      const googleInfo = result.user.providerData.find(p => p.providerId === "google.com");

      await linkGoogleMutation({
        firebaseUid: user!.firebaseUid,
        googleId: googleInfo?.uid ?? result.user.uid,
      });

      toast.success("Google account linked!");
    } catch (err: any) {
      if (err.code === "auth/credential-already-in-use") {
        toast.error("This Google account is already linked to another user");
      } else {
        toast.error(err.message || "Failed to link Google");
      }
    } finally {
      setLinkingGoogle(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isGithubLinked = profile?.linkedProviders?.includes("github.com");
  const isGoogleLinked = profile?.linkedProviders?.includes("google.com");
  const isEmailVerified = profile?.emailVerified;

  const formatDate = (ts?: number) =>
    ts ? new Date(ts).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 ring-2 ring-blue-500/30">
              <AvatarImage src={profile?.avatar ?? ""} />
              <AvatarFallback className="bg-blue-500/10 text-blue-400 text-xl font-black">
                {(profile?.name || user?.email || "U")[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-black text-white">{profile?.name || user?.email}</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-zinc-500">{user?.email}</p>
                {isEmailVerified
                  ? <CheckCircle2 size={12} className="text-emerald-500" />
                  : <AlertCircle size={12} className="text-amber-400" />
                }
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-[10px] text-zinc-600">
                <Clock size={10} />
                <span>Joined {formatDate(profile?.createdAt)}</span>
                {profile?.updatedAt && (
                  <span className="text-zinc-700">· Updated {formatDate(profile.updatedAt)}</span>
                )}
              </div>
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={handleLogout}>
            <LogOut size={14} className="mr-2" /> Logout
          </Button>
        </motion.div>

        {/* Profile Form */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <User size={14} /> Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Display Name</label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  className="bg-zinc-800/50 border-zinc-700 text-zinc-100"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Bio</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="A short description about yourself..."
                  rows={3}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-1 focus:ring-blue-500/50 resize-none"
                />
              </div>
              <Button type="submit" disabled={savingProfile} className="w-full bg-blue-600 hover:bg-blue-500">
                {savingProfile ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
                Save Profile
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Email Verification */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <ShieldCheck size={14} /> Email Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/50">
              <div className="flex items-center gap-2.5">
                <Mail size={16} className="text-zinc-400" />
                <div>
                  <p className="text-sm text-zinc-200">{user?.email}</p>
                  <p className={`text-[10px] font-bold uppercase ${isEmailVerified ? "text-emerald-500" : "text-amber-400"}`}>
                    {isEmailVerified ? "Verified" : "Not Verified"}
                  </p>
                </div>
              </div>
              {!isEmailVerified && (
                <Button size="sm" variant="outline" onClick={handleSendOtp} disabled={sendingOtp || otpSent}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-700">
                  {sendingOtp ? <Loader2 size={12} className="animate-spin" /> : "Send Code"}
                </Button>
              )}
            </div>

            {otpSent && (
              <motion.form
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                onSubmit={handleVerifyOtp} className="space-y-3"
              >
                <p className="text-xs text-zinc-500">Enter the 6-digit code sent to your email:</p>
                <div className="flex gap-2">
                  <Input
                    value={otpInput}
                    onChange={e => setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="bg-zinc-800/50 border-zinc-700 text-center text-xl tracking-[0.5em] font-mono text-zinc-100"
                  />
                  <Button type="submit" disabled={verifyingOtp || otpInput.length !== 6}
                    className="bg-emerald-600 hover:bg-emerald-500 shrink-0">
                    {verifyingOtp ? <Loader2 size={14} className="animate-spin" /> : "Verify"}
                  </Button>
                </div>
                <button type="button" onClick={handleSendOtp} className="text-[10px] text-zinc-600 hover:text-zinc-400 underline">
                  Resend code
                </button>
              </motion.form>
            )}
          </CardContent>
        </Card>

        {/* Linked Accounts */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Link2 size={14} /> Linked Accounts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* GitHub */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center">
                  <Github size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">GitHub</p>
                  <p className="text-[10px] text-zinc-500">
                    {isGithubLinked ? `@${profile?.githubUsername || "Connected"}` : "Not linked"}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={handleLinkGithub}
                disabled={isGithubLinked || linkingGithub}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-700">
                {linkingGithub ? <Loader2 size={12} className="animate-spin" /> : isGithubLinked ? "Linked ✓" : "Link"}
              </Button>
            </div>

            {/* Google */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Chrome size={16} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">Google</p>
                  <p className="text-[10px] text-zinc-500">{isGoogleLinked ? "Connected" : "Not linked"}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={handleLinkGoogle}
                disabled={isGoogleLinked || linkingGoogle}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-700">
                {linkingGoogle ? <Loader2 size={12} className="animate-spin" /> : isGoogleLinked ? "Linked ✓" : "Link"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <KeyRound size={14} /> Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <Input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="bg-zinc-800/50 border-zinc-700 text-zinc-100"
                required
              />
              <Input
                type="password"
                placeholder="New password (min 6 chars)"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="bg-zinc-800/50 border-zinc-700 text-zinc-100"
                required
                minLength={6}
              />
              <Button type="submit" className="w-full bg-zinc-700 hover:bg-zinc-600">
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
