'use client';

import React, { useState } from 'react';
import {
  Users2,
  Building2,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Zap,
  ShoppingCart,
  BarChart3,
  RefreshCw
} from 'lucide-react';

const stores = [
  {
    id: 'STORE-01',
    name: 'Downtown Metro Flagship',
    current: 142,
    capacity: 180,
    queueWait: 17,
    strategy: 'Standard In-Store Flow',
    status: 'HIGH_CROWD',
  },
  {
    id: 'STORE-02',
    name: 'Greenfield Suburban Mart',
    current: 68,
    capacity: 240,
    queueWait: 6,
    strategy: 'Standard In-Store Flow',
    status: 'NORMAL',
  },
  {
    id: 'STORE-03',
    name: 'University Campus Express',
    current: 92,
    capacity: 100,
    queueWait: 20,
    strategy: '15m Eco-Save Reservation Slots',
    status: 'SURGE_WARNING',
  },
];

const statusConfig = {
  NORMAL: {
    label: 'NORMAL',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    badge: 'bg-emerald-100 border-emerald-300 text-emerald-700',
    bar: 'bg-emerald-500',
  },
  HIGH_CROWD: {
    label: 'HIGH_CROWD',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    badge: 'bg-amber-100 border-amber-300 text-amber-700',
    bar: 'bg-amber-500',
  },
  SURGE_WARNING: {
    label: 'SURGE_WARNING',
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    badge: 'bg-red-100 border-red-300 text-red-700',
    bar: 'bg-red-500',
  },
};

const reservationSlots = [
  { time: '10:00 - 10:15', store: 'University Campus Express', booked: 8, capacity: 15, eco: true },
  { time: '10:15 - 10:30', store: 'University Campus Express', booked: 12, capacity: 15, eco: true },
  { time: '10:30 - 10:45', store: 'Downtown Metro Flagship', booked: 5, capacity: 20, eco: false },
  { time: '11:00 - 11:15', store: 'University Campus Express', booked: 3, capacity: 15, eco: true },
];

export default function CrowdManagementPage() {
  const [simulating, setSimulating] = useState(false);
  const [simDone, setSimDone] = useState(false);

  const totalFootfall = stores.reduce((s, st) => s + st.current, 0);
  const surgingCount = stores.filter((s) => s.status === 'SURGE_WARNING').length;
  const highCount = stores.filter((s) => s.status === 'HIGH_CROWD').length;
  const avgWait = Math.round(stores.reduce((s, st) => s + st.queueWait, 0) / stores.length);

  const handleSimulate = () => {
    setSimulating(true);
    setSimDone(false);
    setTimeout(() => {
      setSimulating(false);
      setSimDone(true);
    }, 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white text-gray-800 p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center">
            <Users2 className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Crowd Management</h1>
            <p className="text-xs text-gray-500">Real-time store occupancy, queue pacing and eco-save slot reservations</p>
          </div>
        </div>
        <button
          onClick={handleSimulate}
          disabled={simulating}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-xs font-semibold transition-colors shadow-sm"
        >
          {simulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
          {simulating ? 'Simulating...' : 'Simulate Crowd Surge'}
        </button>
      </div>

      {simDone && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4" />
          Surge simulation complete - pacing strategies auto-adjusted for all stores.
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Network Footfall</p>
          <p className="text-2xl font-bold text-gray-900">{totalFootfall}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">across {stores.length} stores</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Surge Alerts</p>
          <p className="text-2xl font-bold text-red-500">{surgingCount}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{highCount} high crowd</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Avg Queue Wait</p>
          <p className="text-2xl font-bold text-amber-500">{avgWait} min</p>
          <p className="text-[11px] text-gray-400 mt-0.5">network average</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Live Reservations</p>
          <p className="text-2xl font-bold text-violet-600">{reservationSlots.length}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">eco-save slots active</p>
        </div>
      </div>

      {/* Store Occupancy Cards */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-4 h-4 text-violet-600" />
          <h2 className="text-sm font-semibold text-gray-900">Crowd Density Telemetry and Anti-Stampede Slot Pacing</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">Fresh Orbit paces customer footfall into 15-30 min staggered reservations while redistributing excess stock across stores.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stores.map((store) => {
            const cfg = statusConfig[store.status as keyof typeof statusConfig];
            const pct = Math.round((store.current / store.capacity) * 100);
            return (
              <div key={store.id} className={`bg-white border rounded-xl p-5 space-y-4 shadow-sm ${cfg.bg}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-sm font-semibold text-gray-900">{store.name}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${cfg.badge}`}>{cfg.label}</span>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                    <span>Current Occupancy</span>
                    <span className="text-gray-800 font-semibold">{store.current} / {store.capacity} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${cfg.bar}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-500"><Clock className="w-3.5 h-3.5" />Checkout Queue Wait:</span>
                    <span className="text-gray-900 font-semibold">~{store.queueWait} minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-500"><TrendingUp className="w-3.5 h-3.5" />Pacing Strategy:</span>
                    <span className="text-violet-600 font-semibold text-right">{store.strategy}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Eco-Save Reservation Slots */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-violet-600" />
            <h2 className="text-sm font-semibold text-gray-900">Customer Eco-Save Portal: Staggered Pickup Reservations</h2>
          </div>
          <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded font-semibold">
            Live Reservations: {reservationSlots.length}
          </span>
        </div>
        <p className="text-xs text-gray-500 mb-4">Customers book discounted perishable bags in advance. This flattens footfall spikes, prevents clearance stampedes, and guarantees 100% sell-through.</p>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-2.5 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Time Slot</th>
                <th className="text-left px-4 py-2.5 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Store</th>
                <th className="text-left px-4 py-2.5 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Bookings</th>
                <th className="text-left px-4 py-2.5 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reservationSlots.map((slot, i) => {
                const fill = Math.round((slot.booked / slot.capacity) * 100);
                return (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-900 font-mono">{slot.time}</td>
                    <td className="px-4 py-3 text-gray-700">{slot.store}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                          <div className="h-full rounded-full bg-violet-500" style={{ width: `${fill}%` }} />
                        </div>
                        <span className="text-gray-700">{slot.booked}/{slot.capacity}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {slot.eco ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">ECO-SAVE</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-500 text-[10px] font-bold">STANDARD</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          Approve a <strong className="mx-1">CROWD PACED FLASH</strong> proposal or trigger a crowd surge to generate additional slots.
        </div>
      </div>
    </div>
  );
}
