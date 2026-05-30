'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  User,
  Settings,
  Bell,
  Shield,
  Palette,
  LogOut,
  Laptop,
  Moon,
  Sun,
  Camera,
  Check,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type SettingsTab = 'profile' | 'account' | 'appearance' | 'notifications';

const sidebarItems = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'account', label: 'Account', icon: Settings },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
] as const;

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const { user, logout } = useAuth();
  const reduceMotion = useReducedMotion();

  const handleLogout = () => {
    logout();
    toast.success('Signed out', {
      description: 'You have been successfully signed out.',
    });
  };

  const handleDeleteAccount = () => {
    toast.error('Account deletion is not available in this demo.');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ambient Glows — cores held inside the clip box so the falloff reads as ambient, not cropped */}
      <div className="absolute top-0 left-[6%] w-[560px] h-[560px] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[12%] right-[2%] w-[440px] h-[440px] rounded-full blur-[150px] pointer-events-none" />

      <div className="container max-w-6xl py-6 lg:py-10 space-y-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-md">Settings</h1>
          <p className="text-white/60 text-lg">
            Manage your account preferences and customize your experience.
          </p>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent w-full" />

        <div className="flex flex-col lg:flex-row lg:space-x-12 lg:space-y-0 space-y-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-1/5">
            <nav
              role="tablist"
              aria-label="Settings sections"
              aria-orientation="vertical"
              className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-2 overflow-x-auto pb-2 lg:pb-0"
            >
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    role="tab"
                    id={`tab-${item.id}`}
                    aria-selected={isActive}
                    aria-controls={`panel-${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl transition-colors duration-300 relative overflow-hidden group whitespace-nowrap',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                      isActive
                        ? 'text-white bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10'
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5 transition-colors',
                        isActive ? 'text-blue-300' : 'text-white/40 group-hover:text-white/70'
                      )}
                    />
                    <span className="relative z-10">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl -z-0"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Content Area */}
          <div className="flex-1 lg:max-w-4xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                role="tabpanel"
                id={`panel-${activeTab}`}
                aria-labelledby={`tab-${activeTab}`}
                initial={reduceMotion ? false : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
                {activeTab === 'profile' && (
                  <div className="bg-transparent backdrop-blur-none border-transparent shadow-none rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden">
                    <div className="space-y-2 relative z-10">
                      <h2 className="text-2xl font-bold text-white">Public Profile</h2>
                      <p className="text-white/50">This is how others will see you on the site.</p>
                    </div>

                    <div className="flex items-center gap-8 relative z-10">
                      <button
                        type="button"
                        aria-label="Change avatar"
                        className="relative rounded-full group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                      >
                        <Avatar className="h-28 w-28 border-4 border-white/10 shadow-2xl ring-4 ring-black/20">
                          <AvatarImage src="/avatars/01.png" alt="" />
                          <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity backdrop-blur-sm">
                          <Camera className="h-8 w-8 text-white" />
                        </span>
                      </button>
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-white">{user?.name || 'User'}</h3>
                        <div className="flex gap-2">
                          <Button variant="outline" className="glass-button h-9 text-xs border-white/20 bg-white/5 hover:bg-white/10">
                            Change avatar
                          </Button>
                          <Button variant="ghost" className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 h-9">
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 max-w-xl relative z-10">
                      <div className="grid gap-2">
                        <Label htmlFor="username" className="text-white/80">Username</Label>
                        <Input
                          id="username"
                          defaultValue={user?.name || 'user_demo'}
                          className="bg-black/20 border-white/10 text-white focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50"
                        />
                        <p className="text-[0.8rem] text-white/40">
                          This is your public display name. It can be your real name or a pseudonym.
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="bio" className="text-white/80">Bio</Label>
                        <Input
                          id="bio"
                          placeholder="Tell us a little bit about yourself"
                          className="bg-black/20 border-white/10 text-white focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="email" className="text-white/80">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          defaultValue={user?.email || 'user@example.com'}
                          disabled
                          className="bg-white/5 border-white/5 text-white/50 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-white/5">
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-blue-500/25">
                        Save changes
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === 'account' && (
                  <div className="bg-transparent backdrop-blur-none border-transparent shadow-none rounded-[2.5rem] p-8 space-y-8">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-white">Account Settings</h2>
                      <p className="text-white/50">
                        Update your account settings. Set your preferred language and timezone.
                      </p>
                    </div>

                    <div className="grid gap-2 max-w-md">
                      <Label htmlFor="language" className="text-white/80">Language</Label>
                      <Select defaultValue="en">
                        <SelectTrigger
                          id="language"
                          className="bg-black/20 border-white/10 text-white focus:ring-blue-500/50"
                        >
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                        <SelectContent className="bg-black/90 border-white/10 backdrop-blur-xl text-white">
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="pt">Portuguese</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="h-px bg-white/10 w-full" />

                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-white flex items-center gap-2">
                        <Shield className="h-5 w-5 text-red-400" />
                        Danger Zone
                      </h3>
                      <div className="border border-red-500/20 rounded-2xl p-6 bg-red-500/5 backdrop-blur-sm">
                        <div className="flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <p className="font-medium text-red-400">Delete account</p>
                            <p className="text-sm text-red-200/60">
                              Permanently delete your account and all of your content.
                            </p>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="shrink-0 bg-red-500/20 hover:bg-red-500/40 text-red-200 border border-red-500/30"
                              >
                                Delete account
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="glass-panel border-white/10 text-white rounded-3xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-white">
                                  Delete your account?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-white/60">
                                  This action cannot be undone. Your profile, tasks, and all
                                  associated content will be permanently removed.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="glass-button border-white/20 hover:bg-white/10">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleDeleteAccount}
                                  className="bg-red-500/90 hover:bg-red-500 text-white border-0"
                                >
                                  Delete account
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>

                      <div className="border border-white/10 rounded-2xl p-6 bg-white/5">
                        <div className="flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <p className="font-medium text-white">Sign out</p>
                            <p className="text-sm text-white/50">
                              Sign out of your account on this device.
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLogout}
                            className="glass-button shrink-0 border-white/20"
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign out
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'appearance' && (
                  <div className="bg-transparent backdrop-blur-none border-transparent shadow-none rounded-[2.5rem] p-8 space-y-8">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-white">Appearance</h2>
                      <p className="text-white/50">
                        Saku is tuned for a dark, focused workspace. More themes are on the way.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-white/80">Theme</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Dark - the current, only available theme */}
                        <div className="relative rounded-2xl border-2 border-blue-400 bg-white/10 p-4 shadow-[0_0_20px_rgba(96,165,250,0.2)] flex flex-col items-center gap-3">
                          <Badge className="absolute top-3 right-3 gap-1 bg-blue-500/20 text-blue-200 border-blue-400/30 hover:bg-blue-500/20">
                            <Check className="h-3 w-3" />
                            Current
                          </Badge>
                          <div className="p-4 rounded-full bg-slate-950 text-white mb-2 shadow-lg border border-white/10">
                            <Moon className="h-6 w-6" />
                          </div>
                          <span className="font-medium text-white">Dark</span>
                        </div>

                        {/* Light - coming soon */}
                        <button
                          type="button"
                          disabled
                          aria-disabled="true"
                          className="relative rounded-2xl border-2 border-white/5 bg-white/5 p-4 flex flex-col items-center gap-3 opacity-50 cursor-not-allowed"
                        >
                          <Badge variant="secondary" className="absolute top-3 right-3 bg-white/10 text-white/60 border-0">
                            Soon
                          </Badge>
                          <div className="p-4 rounded-full bg-white text-black mb-2 shadow-lg">
                            <Sun className="h-6 w-6" />
                          </div>
                          <span className="font-medium text-white/70">Light</span>
                        </button>

                        {/* System - coming soon */}
                        <button
                          type="button"
                          disabled
                          aria-disabled="true"
                          className="relative rounded-2xl border-2 border-white/5 bg-white/5 p-4 flex flex-col items-center gap-3 opacity-50 cursor-not-allowed"
                        >
                          <Badge variant="secondary" className="absolute top-3 right-3 bg-white/10 text-white/60 border-0">
                            Soon
                          </Badge>
                          <div className="p-4 rounded-full bg-gradient-to-br from-white to-slate-900 text-slate-800 mb-2 shadow-lg">
                            <Laptop className="h-6 w-6" />
                          </div>
                          <span className="font-medium text-white/70">System</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="bg-transparent backdrop-blur-none border-transparent shadow-none rounded-[2.5rem] p-8 space-y-8">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-white">Notifications</h2>
                      <p className="text-white/50">Configure how you receive alerts and updates.</p>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-sm font-medium text-blue-300 uppercase tracking-wider">
                        Email preferences
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                          <Label htmlFor="marketing" className="flex flex-col space-y-1 cursor-pointer">
                            <span className="text-white font-medium">Marketing emails</span>
                            <span className="font-normal text-white/50 text-sm">
                              Receive emails about new products, features, and more.
                            </span>
                          </Label>
                          <Switch id="marketing" className="data-[state=checked]:bg-blue-500" />
                        </div>
                        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                          <Label htmlFor="social" className="flex flex-col space-y-1 cursor-pointer">
                            <span className="text-white font-medium">Social emails</span>
                            <span className="font-normal text-white/50 text-sm">
                              Receive emails for friend requests, follows, and more.
                            </span>
                          </Label>
                          <Switch id="social" defaultChecked className="data-[state=checked]:bg-blue-500" />
                        </div>
                        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                          <Label htmlFor="security" className="flex flex-col space-y-1">
                            <span className="flex items-center gap-2 text-white font-medium">
                              Security emails
                              <Badge variant="secondary" className="bg-white/10 text-white/60 border-0 text-[0.65rem] uppercase tracking-wide">
                                Required
                              </Badge>
                            </span>
                            <span className="font-normal text-white/50 text-sm">
                              Receive emails about your account activity and security.
                            </span>
                          </Label>
                          <Switch id="security" defaultChecked disabled className="data-[state=checked]:bg-blue-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
