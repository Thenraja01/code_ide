import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { auth, githubProvider, googleProvider } from "@/services/firebase";
import { linkWithPopup, sendEmailVerification } from "firebase/auth";
import axios from "axios";
import { toast } from "sonner";
import SectionHeader from "@/components/dashboard/SectionHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  User, Shield, Bell, Cloud, Github, Globe, Monitor,
  Chrome, Loader2, CheckCircle2, AlertCircle, Mail
} from "lucide-react";

const API = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/").replace(/\/$/, "");

export default function Settings() {
  const { user } = useAuth();

  // Realtime profile from Convex
  const profile = useQuery(
    api.users.getUserByUid,
    user?.firebaseUid ? { firebaseUid: user.firebaseUid } : "skip"
  );

  // ── FIX 1: seed form state once profile loads from Convex ──────────────────
  // Using useState("") + useEffect instead of useState(profile?.xxx ?? "")
  // because profile is undefined on the first render (async query).
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setBio(profile.bio ?? "");
    }
  }, [profile]);

  const [savingProfile, setSavingProfile] = useState(false);
  const [linkingGithub, setLinkingGithub] = useState(false);
  const [linkingGoogle, setLinkingGoogle] = useState(false);

  // ── FIX 2: OTP / email verification state ──────────────────────────────────
  const [sendingVerification, setSendingVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0); // seconds remaining

  const token = () => localStorage.getItem("token");

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      await axios.put(`${API}/user/update`, { name, bio }, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save profile");
    } finally {
      setSavingProfile(false);
    }
  };

  // ── FIX 2: Send Firebase verification email ────────────────────────────────
  // No custom backend needed — Firebase handles OTP generation & delivery.
  const handleSendVerification = async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      toast.error("You must be logged in to verify your email.");
      return;
    }
    if (firebaseUser.emailVerified) {
      toast.info("Your email is already verified!");
      return;
    }

    setSendingVerification(true);
    try {
      await sendEmailVerification(firebaseUser, {
        url: window.location.origin + "/dashboard/settings",
      });
      setVerificationSent(true);
      toast.success("Verification email sent! Check your inbox.");

      // 60-second resend cooldown
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) { clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      const code = err?.code ?? "";
      if (code === "auth/too-many-requests") {
        toast.error("Too many requests. Please wait a few minutes and try again.");
        setResendCooldown(120);
        const interval = setInterval(() => {
          setResendCooldown(prev => {
            if (prev <= 1) { clearInterval(interval); return 0; }
            return prev - 1;
          });
        }, 1000);
      } else {
        toast.error(err.message || "Failed to send verification email.");
      }
    } finally {
      setSendingVerification(false);
    }
  };

  const handleLinkGithub = async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;
    setLinkingGithub(true);
    try {
      const result = await linkWithPopup(firebaseUser, githubProvider);
      const ghInfo = result.user.providerData.find(p => p.providerId === "github.com");
      await axios.post(`${API}/user/link-github`, {
        githubId: ghInfo?.uid ?? "",
        githubUsername: ghInfo?.displayName ?? "",
      }, { headers: { Authorization: `Bearer ${token()}` } });
      toast.success("GitHub linked!");
    } catch (err: any) {
      toast.error(err.code === "auth/credential-already-in-use" ? "Already linked to another account" : err.message);
    } finally {
      setLinkingGithub(false);
    }
  };

  const handleLinkGoogle = async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;
    setLinkingGoogle(true);
    try {
      await linkWithPopup(firebaseUser, googleProvider);
      toast.success("Google linked!");
    } catch (err: any) {
      toast.error(err.code === "auth/credential-already-in-use" ? "Already linked to another account" : err.message);
    } finally {
      setLinkingGoogle(false);
    }
  };

  const isGithubLinked = profile?.linkedProviders?.includes("github.com");
  const isGoogleLinked = profile?.linkedProviders?.includes("google.com");
  // Read directly from Firebase for up-to-date verification status
  const isEmailVerified = auth.currentUser?.emailVerified ?? profile?.emailVerified ?? false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 space-y-8 h-[100vh] overflow-y-scroll bg-gradient-to-b from-[#0a0b1e] to-[#04050c]  text-white"
    >
      <SectionHeader
        title="Personal Engine"
        subtitle="Manage your identity, security protocols, and ecosystem integrations."
        breadcrumbs={[{ label: "Settings" }]}
      />

      <Tabs defaultValue="profile" className="w-full">
        <div className="flex flex-col md:flex-row gap-10">
          <TabsList className="flex flex-col h-auto bg-white/[0.02] border border-white/5 p-2 items-start space-y-1 w-full md:w-64 rounded-2xl backdrop-blur-md">
            {[
              { value: "profile", icon: User, label: "Profile Identity" },
              { value: "security", icon: Shield, label: "Verification" },
              { value: "appearance", icon: Monitor, label: "Interface UI" },
              { value: "notifications", icon: Bell, label: "Alerts" },
              { value: "integrations", icon: Cloud, label: "Linked Accounts" },
            ].map(tab => (
              <TabsTrigger
                key={tab.value} value={tab.value}
                className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400 rounded-xl transition-all text-white/50"
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 space-y-6">

            {/* ── PROFILE ──────────────────────────────────────────── */}
            <TabsContent value="profile" className="mt-0 outline-none">
              <Card className="border-white/5 bg-white/[0.02] backdrop-blur-md rounded-[2rem] overflow-hidden">
                <CardHeader className="border-b border-white/5 p-8">
                  <CardTitle className="text-2xl font-black text-white">Public Profile</CardTitle>
                  <CardDescription className="text-white/40">
                    Realtime — changes sync instantly to Convex.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">

                  {/* Avatar */}
                  <div className="flex items-center gap-5">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-black text-white shadow-xl ring-4 ring-white/5">
                      {(profile?.name || user?.email || "U")[0].toUpperCase()}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white">{profile?.name || "No name set"}</p>
                      <p className="text-xs text-white/30">{user?.email}</p>
                      {profile?.createdAt && (
                        <p className="text-[10px] text-white/20">
                          Member since {new Date(profile.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest text-white/40">Display Name</Label>
                      <Input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder={profile?.name ?? "Your name"}
                        className="bg-white/5 border-white/10 rounded-xl text-white h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest text-white/40">Email</Label>
                      <Input
                        value={user?.email ?? ""}
                        disabled
                        className="bg-white/5 border-white/10 rounded-xl text-white/40 h-11"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-xs uppercase tracking-widest text-white/40">Bio</Label>
                      <textarea
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        placeholder="Your expertise and tech stack..."
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none placeholder:text-white/20"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      className="bg-indigo-600 hover:bg-indigo-700 font-black px-10 h-11 rounded-xl"
                    >
                      {savingProfile ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── EMAIL VERIFICATION ────────────────────────────────── */}
            <TabsContent value="security" className="mt-0 outline-none">
              <Card className="border-white/5 bg-white/[0.02] backdrop-blur-md rounded-[2rem] overflow-hidden">
                <CardHeader className="border-b border-white/5 p-8">
                  <CardTitle className="text-2xl font-black text-white">Email Verification</CardTitle>
                  <CardDescription className="text-white/40">
                    Verify your email to unlock all features.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  {/* Email status row */}
                  <div className="flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-white/[0.03]">
                    <div className="flex items-center gap-3">
                      {isEmailVerified
                        ? <CheckCircle2 size={20} className="text-emerald-400" />
                        : <AlertCircle size={20} className="text-amber-400" />
                      }
                      <div>
                        <p className="font-medium text-white">{user?.email}</p>
                        <p className={`text-xs font-bold ${isEmailVerified ? "text-emerald-400" : "text-amber-400"}`}>
                          {isEmailVerified ? "Verified ✓" : "Not verified"}
                        </p>
                      </div>
                    </div>
                    {!isEmailVerified && (
                      <Button
                        size="sm" variant="outline"
                        onClick={handleSendVerification}
                        disabled={sendingVerification || resendCooldown > 0}
                        className="border-white/10 hover:bg-white/5 text-white gap-2"
                      >
                        {sendingVerification
                          ? <Loader2 size={12} className="animate-spin" />
                          : <Mail size={12} />
                        }
                        {resendCooldown > 0
                          ? `Resend in ${resendCooldown}s`
                          : verificationSent ? "Resend Email" : "Send Code"
                        }
                      </Button>
                    )}
                  </div>

                  {/* Confirmation banner — shown after email is sent */}
                  {verificationSent && !isEmailVerified && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      className="space-y-3 p-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5"
                    >
                      <div className="flex items-start gap-3">
                        <Mail size={18} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-white">Check your inbox</p>
                          <p className="text-xs text-white/50 leading-relaxed">
                            A verification link has been sent to <span className="text-indigo-400 font-medium">{user?.email}</span>.
                            Click the link in the email to verify your account.
                            The link expires in 1 hour.
                          </p>
                        </div>
                      </div>
                      <p className="text-[11px] text-white/30 pl-7">
                        Didn't receive it? Check your spam folder, or{" "}
                        <button
                          onClick={handleSendVerification}
                          disabled={resendCooldown > 0}
                          className="text-indigo-400 hover:text-indigo-300 underline disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {resendCooldown > 0 ? `wait ${resendCooldown}s to resend` : "resend now"}
                        </button>.
                      </p>
                    </motion.div>
                  )}

                  {/* Already verified — positive confirmation */}
                  {isEmailVerified && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5"
                    >
                      <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
                      <p className="text-sm text-emerald-300 font-medium">
                        Your email is verified. All features are unlocked.
                      </p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── APPEARANCE ───────────────────────────────────────── */}
            <TabsContent value="appearance" className="mt-0 outline-none">
              <Card className="border-white/5 bg-white/[0.02] backdrop-blur-md rounded-[2rem] overflow-hidden">
                <CardHeader className="border-b border-white/5 p-8">
                  <CardTitle className="text-2xl font-black text-white">Interface Preferences</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  {[
                    { label: "Glassmorphism Effects", desc: "Semi-transparent backgrounds with blur." },
                    { label: "Motion Animations", desc: "Enable transitions across the interface." },
                    { label: "Compact Mode", desc: "Reduce padding and spacing in panels." },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base text-white">{item.label}</Label>
                        <p className="text-sm text-white/30">{item.desc}</p>
                      </div>
                      <Switch defaultChecked={i < 2} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── NOTIFICATIONS ────────────────────────────────────── */}
            <TabsContent value="notifications" className="mt-0 outline-none">
              <Card className="border-white/5 bg-white/[0.02] backdrop-blur-md rounded-[2rem] overflow-hidden">
                <CardHeader className="border-b border-white/5 p-8">
                  <CardTitle className="text-2xl font-black text-white">Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  {[
                    { label: "Build Alerts", desc: "Get notified when AI project generation completes." },
                    { label: "Collaboration Invites", desc: "Notifications for shared project invitations." },
                    { label: "Security Alerts", desc: "New login and account change notifications." },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base text-white">{item.label}</Label>
                        <p className="text-sm text-white/30">{item.desc}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── INTEGRATIONS ──────────────────────────────────────── */}
            <TabsContent value="integrations" className="mt-0 outline-none">
              <Card className="border-white/5 bg-white/[0.02] backdrop-blur-md rounded-[2rem] overflow-hidden">
                <CardHeader className="border-b border-white/5 p-8">
                  <CardTitle className="text-2xl font-black text-white">Linked Accounts</CardTitle>
                  <CardDescription className="text-white/40">
                    Connect external accounts. One user profile, multiple providers.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-4">
                  {[
                    {
                      name: "GitHub",
                      detail: isGithubLinked ? `@${profile?.githubUsername || "Connected"}` : "Not linked",
                      icon: Github,
                      color: "bg-white text-black",
                      linked: isGithubLinked,
                      loading: linkingGithub,
                      onConnect: handleLinkGithub,
                    },
                    {
                      name: "Google",
                      detail: isGoogleLinked ? "Connected" : "Not linked",
                      icon: Chrome,
                      color: "bg-blue-500/10 text-blue-400",
                      linked: isGoogleLinked,
                      loading: linkingGoogle,
                      onConnect: handleLinkGoogle,
                    },
                    {
                      name: "Cloudflare",
                      detail: "Coming Soon",
                      icon: Globe,
                      color: "bg-orange-600 text-white",
                      linked: false,
                      loading: false,
                      onConnect: () => toast.info("Coming soon!"),
                      disabled: true,
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] transition-all group">
                      <div className="flex items-center gap-4">
                        <div className={`h-11 w-11 rounded-xl ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{item.name}</p>
                          <p className="text-xs text-white/30">{item.detail}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={item.linked ? "ghost" : "outline"}
                        onClick={item.onConnect}
                        disabled={item.linked || item.loading || (item as any).disabled}
                        className={item.linked ? "text-indigo-400" : "border-white/10 hover:bg-white/5 text-white/70"}
                      >
                        {item.loading
                          ? <Loader2 size={12} className="animate-spin" />
                          : item.linked ? "Linked ✓"
                          : (item as any).disabled ? "Unavailable" : "Connect"
                        }
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

          </div>
        </div>
      </Tabs>
    </motion.div>
  );
}
