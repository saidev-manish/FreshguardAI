'use client';

import React, { useState } from 'react';
import {
  Menu,
  Calendar,
  Sparkles,
  CheckCircle2,
  Bell,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface TopbarProps {
  onMenuToggle: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuToggle }) => {
  const { selectedDate, setSelectedDate, isLiveMode, backendError, runAnalysis, retryBackendConnection } = useApp();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisNotification, setAnalysisNotification] = useState<string | null>(null);

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    if (isLiveMode) {
      const res = await runAnalysis();
      setAnalyzing(false);
      if (res) {
        setAnalysisNotification(
          `Live Coordinator (${res.run_id}): Evaluated ${res.agent_findings.length} specialist agents across 7 SKUs. Constraints validated in SQLite.`
        );
      } else {
        setAnalysisNotification('Coordinator run failed or timed out.');
      }
    } else {
      setTimeout(() => {
        setAnalyzing(false);
        setAnalysisNotification('Demo Mode Coordinator: Evaluated 7 SKU cohorts. 3 candidate interventions simulated.');
      }, 1000);
    }
    setTimeout(() => setAnalysisNotification(null), 6000);
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Mobile menu trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Planning Date:
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none text-xs focus:outline-hidden cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right side controls & Run Coordinator button */}
        <div className="flex items-center gap-3">
          {isLiveMode ? (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              FastAPI Live: Connected
            </div>
          ) : (
            <button
              onClick={() => retryBackendConnection()}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
              title="Click to reconnect to FastAPI service"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Backend Offline (Click to Retry)
            </button>
          )}

          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-75"
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Evaluating Risks...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                Run Fresh Orbit Analysis
              </>
            )}
          </button>
        </div>
      </div>

      {/* Floating feedback alert */}
      {analysisNotification && (
        <div className="bg-emerald-600 text-white text-xs px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{analysisNotification}</span>
          </div>
          <button
            onClick={() => setAnalysisNotification(null)}
            className="text-emerald-200 hover:text-white text-xs"
          >
            Dismiss
          </button>
        </div>
      )}
    </header>
  );
};
