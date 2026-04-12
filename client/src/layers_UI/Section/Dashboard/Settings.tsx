import { motion } from "framer-motion";
import SectionHeader from "./components/SectionHeader";
import { 
  User, 
  Shield, 
  Bell, 
  Cloud,
  Github,
  Globe,
  Monitor,
  Camera
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/layers_UI/utils/Context/AuthContext";

export default function Settings() {
  const { user } = useAuth();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 space-y-8 bg-linear-to-b from-[#0a0b1e] to-[#04050c] min-h-screen text-white"
    >
      <SectionHeader 
        title="Personal Engine"
        subtitle="Manage your identity, security protocols, and ecosystem integrations."
        breadcrumbs={[{ label: "Settings" }]}
      />

      <Tabs defaultValue="profile" className="w-full">
        <div className="flex flex-col md:flex-row gap-10">
          <TabsList className="flex flex-col h-auto bg-white/[0.02] border border-white/5 p-2 items-start space-y-1 w-full md:w-64 rounded-2xl backdrop-blur-md">
            <TabsTrigger 
              value="profile" 
              className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400 rounded-xl transition-all text-white/50"
            >
              <User className="h-4 w-4" />
              Profile Identity
            </TabsTrigger>
            <TabsTrigger 
              value="appearance" 
              className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400 rounded-xl transition-all text-white/50"
            >
              <Monitor className="h-4 w-4" />
              Interface UI
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400 rounded-xl transition-all text-white/50"
            >
              <Shield className="h-4 w-4" />
              Encryption
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400 rounded-xl transition-all text-white/50"
            >
              <Bell className="h-4 w-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger 
              value="integrations" 
              className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400 rounded-xl transition-all text-white/50"
            >
              <Cloud className="h-4 w-4" />
              Cloud Sync
            </TabsTrigger>
          </TabsList>

          <div className="flex-1">
            <TabsContent value="profile" className="mt-0 space-y-6 outline-none">
              <Card className="border-white/5 bg-white/[0.02] backdrop-blur-md rounded-[2rem] overflow-hidden">
                <CardHeader className="border-b border-white/5 p-8">
                  <CardTitle className="text-2xl font-black text-white">Public Profile</CardTitle>
                  <CardDescription className="text-white/40">This information will be associated with your git commits and PRs.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="relative group">
                      <div className="h-24 w-24 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-black text-white shadow-2xl ring-4 ring-white/5 group-hover:ring-indigo-500/30 transition-all duration-500">
                        {user?.name?.[0] ?? "D"}
                      </div>
                      <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white text-indigo-900 flex items-center justify-center shadow-lg transform translate-x-1/4 translate-y-1/4 hover:scale-110 transition-transform">
                         <Camera className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-center md:text-left space-y-2">
                       <h4 className="font-bold text-white text-lg">Your ID Banner</h4>
                       <p className="text-sm text-white/30 max-w-sm">Upload a professional avatar to represent you in the developer community.</p>
                       <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5 text-white/70">Change Avatar</Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xs uppercase tracking-widest text-white/40">Display Name</Label>
                      <Input id="name" defaultValue={user?.name ?? ""} className="bg-white/5 border-white/10 rounded-xl text-white h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs uppercase tracking-widest text-white/40">Email Protocol</Label>
                      <Input id="email" defaultValue={user?.email ?? ""} className="bg-white/5 border-white/10 rounded-xl text-white/50 h-12" disabled />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bio" className="text-xs uppercase tracking-widest text-white/40">Developer Bio</Label>
                      <textarea 
                        id="bio" 
                        className="w-full min-h-[120px] bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-white/20"
                        placeholder="Share your tech stack and expertise..."
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-10 h-12 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
                      Update Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="mt-0 space-y-6 outline-none">
               <Card className="border-white/5 bg-white/[0.02] backdrop-blur-md rounded-[2rem] overflow-hidden">
                <CardHeader className="border-b border-white/5 p-8">
                  <CardTitle className="text-2xl font-black text-white">Interface Preferences</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="flex items-center justify-between">
                     <div className="space-y-0.5">
                       <Label className="text-base">Glassmorphism Effects</Label>
                       <p className="text-sm text-white/30 text-balance">Enable semi-transparent backgrounds with blur effects.</p>
                     </div>
                     <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                     <div className="space-y-0.5">
                       <Label className="text-base">Animations</Label>
                       <p className="text-sm text-white/30 text-balance">Enable motion transitions across the interface.</p>
                     </div>
                     <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations" className="mt-0 space-y-6 outline-none">
              <Card className="border-white/5 bg-white/[0.02] backdrop-blur-md rounded-[2rem] overflow-hidden">
                <CardHeader className="border-b border-white/5 p-8">
                  <CardTitle className="text-2xl font-black text-white">Ecosystem Sync</CardTitle>
                  <CardDescription className="text-white/40">Authorize external platforms to enable cloud features.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-4">
                  {[
                    { name: "GitHub", handle: "@user", icon: Github, color: "bg-white text-black", status: "Connected" },
                    { name: "Cloudflare", handle: "None", icon: Globe, color: "bg-orange-600 text-white", status: "Disconnected" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] transition-all group">
                      <div className="flex items-center gap-5">
                        <div className={`h-12 w-12 rounded-xl ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                          <item.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-bold text-white mb-0.5">{item.name}</p>
                          <p className="text-xs text-white/30">{item.handle}</p>
                        </div>
                      </div>
                      <Button 
                        variant={item.status === 'Connected' ? "ghost" : "outline"} 
                        size="sm" 
                        className={item.status === 'Connected' ? "text-indigo-400 hover:text-indigo-300" : "border-white/10 hover:bg-white/5"}
                      >
                        {item.status === 'Connected' ? "Manage" : "Connect"}
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
