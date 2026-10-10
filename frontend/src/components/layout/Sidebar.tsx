'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  Sparkles,
  GitCompare,
  History,
  ShieldCheck,
  Building2,
  Database,
  X,
  Users2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const pathname = usePathname();
  const { recommendations, selectedStore, setSelectedStore, isLiveMode, retryBackendConnection, supabaseStatus } = useApp();


  const pendingCount = recommendations.filter((r) => r.status === 'PENDING').length;

  const navItems = [
    {
      label: 'Overview Dashboard',
      href: '/',
      icon: LayoutDashboard,
      active: pathname === '/'
    },
    {
      label: 'Inventory & Risk Queue',
      href: '/inventory',
      icon: Layers,
      active: pathname.startsWith('/inventory')
    },
    {
      label: 'Recommendation Review',
      href: '/recommendations',
      icon: Sparkles,
      active: pathname.startsWith('/recommendations'),
      badge: pendingCount > 0 ? `${pendingCount} Pending` : undefined
    },
    {
      label: 'Scenario Comparison',
      href: '/scenarios',
      icon: GitCompare,
      active: pathname.startsWith('/scenarios')
    },
    {
      label: 'Decision Audit Log',
      href: '/audit',
      icon: History,
      active: pathname.startsWith('/audit')
    },
    {
      label: 'Crowd Management',
      href: '/crowd',
      icon: Users2,
      active: pathname.startsWith('/crowd')
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 w-64 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-950 group-hover:bg-emerald-500 transition-colors">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-white text-base tracking-tight block leading-tight">
              Fresh Orbit
            </span>
            <span className="text-[11px] text-emerald-400 font-medium">Perishable Risk Ops</span>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Store Location Switcher */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/40">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
          <Building2 className="w-3 h-3 text-emerald-400" />
          Store Location
        </label>
        <select
          value={selectedStore}
          onChange={(e) => setSelectedStore(e.target.value)}
          aria-label="Select Store Location"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
        >
          <option value="STORE-01">Downtown Supercenter (#01)</option>
          <option value="STORE-02">Westside Market (#02)</option>
          <option value="STORE-03">North Suburban Center (#03)</option>
        </select>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Decision Workstream
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                item.active
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${item.active ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    item.active
                      ? 'bg-emerald-800 text-white'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Connection & Data Mode Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-2">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-slate-300">
            {isLiveMode ? 'FastAPI + SQLite Active' : 'Offline / Demo Mode'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono ${
              isLiveMode
                ? 'bg-emerald-950 border border-emerald-800/80 text-emerald-300'
                : 'bg-amber-950 border border-amber-800/80 text-amber-300'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isLiveMode ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            ></span>
            {isLiveMode ? 'LIVE API: PORT 8000' : 'DEMO MODE FALLBACK'}
          </div>
          {!isLiveMode && (
            <button
              onClick={() => retryBackendConnection()}
              className="text-[10px] text-emerald-400 hover:text-emerald-300 underline font-mono cursor-pointer"
            >
              Retry
            </button>
          )}
        </div>

        {/* Supabase Cloud Status */}
        {supabaseStatus?.configured && (
          <div className="pt-2 border-t border-slate-800/80 text-[10px] space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-medium text-slate-300 flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${supabaseStatus.connected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                Supabase Cloud:
              </span>
              <span className="font-mono text-emerald-400 text-[9px] bg-slate-800 px-1 rounded">
                jchxqmrgngavtiakhdzq
              </span>
            </div>
            <p className="text-[9px] text-slate-500 leading-tight">
              {supabaseStatus.tablesFound
                ? 'PostgreSQL tables synced & active.'
                : 'Connected to Supabase endpoint! Schema migration available at docs/supabase_schema.sql'}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block shrink-0">{sidebarContent}</aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" onClick={onClose} />
          <div className="relative z-10">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
