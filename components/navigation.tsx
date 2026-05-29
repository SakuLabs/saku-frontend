'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  CheckSquare, 
  Calendar, 
  MessageSquare, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { id: 'tasks', label: 'Tasks', icon: CheckSquare, href: '/tasks' },
  { id: 'scheduler', label: 'Scheduler', icon: Calendar, href: '/scheduler' },
  { id: 'chat', label: 'Study Groups', icon: MessageSquare, href: '/chat' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden md:flex flex-col gap-2 p-4 border-r border-white/5 bg-black/20 backdrop-blur-xl h-full"
      >
        <div className="mb-8 flex items-center gap-2 px-2">
          <Image src="/logo.png" alt="Saku" width={32} height={32} className="size-8 rounded-lg" />
          <h1 className="text-2xl font-black liquid-text tracking-tight">
            Saku
          </h1>
        </div>

        <div className="flex flex-col gap-2">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300',
                    isActive
                      ? 'glass-button bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-auto pt-4 border-t border-white/5">
          <div className="text-xs text-white/40 text-center py-2">
            Academic Dashboard
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Saku" width={28} height={28} className="size-7 rounded-md" />
          <h1 className="text-xl font-black liquid-text">
            Saku
          </h1>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-white hover:text-white/80 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden border-b border-white/10 glass-panel p-4 flex flex-col gap-2 fixed w-full z-40 top-[65px]"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                  isActive
                    ? 'glass-button bg-white/10 text-white'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </motion.nav>
      )}
    </>
  );
}
