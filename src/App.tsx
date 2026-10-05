/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSentinelStore } from './engine/store';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { MobileNavDrawer } from './components/layout/MobileNavDrawer';
import { CommandPalette } from './components/layout/CommandPalette';
import { ArenaView } from './components/arena/ArenaView';
import { BreachLabView } from './components/breach/BreachLabView';
import { AuditChainView } from './components/audit/AuditChainView';
import { CommitRevealView } from './components/commitreveal/CommitRevealView';
import { LeakageMonitorView } from './components/leakage/LeakageMonitorView';
import { AccessNetworkView } from './components/access/AccessNetworkView';
import { ThreatModelView } from './components/threat/ThreatModelView';
import { DockerPocView } from './components/docker/DockerPocView';
import { DatasetsCatalogView } from './components/datasets/DatasetsCatalogView';
import { EvaluationReportView } from './components/report/EvaluationReportView';
import { PayloadBuilderView } from './components/payload-builder/PayloadBuilderView';
import { HowItWorksModal } from './components/modals/HowItWorksModal';
import { ShieldAlert, X } from 'lucide-react';

export default function App() {
  const {
    activeTab,
    initEngine,
    activeBreachAlert,
    dismissBreachAlert,
  } = useSentinelStore();

  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState<boolean>(false);

  useEffect(() => {
    initEngine();
  }, [initEngine]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#06090e] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Global Command Palette (Cmd+K) & Keyboard Hotkey Handler */}
      <CommandPalette />

      {/* Slide-over Mobile Navigation Drawer */}
      <MobileNavDrawer />

      {/* Top Status Bar & Navigation */}
      <Navbar onOpenHowItWorks={() => setIsHowItWorksOpen(true)} />

      {/* Global Breach Alert Floating Toast */}
      {activeBreachAlert && (
        <div className="absolute top-20 right-4 left-4 sm:left-auto sm:right-6 z-50 max-w-md p-4 bg-rose-950/95 border-2 border-rose-500 rounded-2xl shadow-2xl shadow-rose-950/80 backdrop-blur-xl flex items-start gap-3 animate-in slide-in-from-top-4 duration-200">
          <div className="p-2 rounded-xl bg-rose-900/60 text-rose-300 shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="flex-1 space-y-1 min-w-0">
            <div className="text-xs font-bold font-display uppercase tracking-wider text-rose-200">
              Security Anomaly Triggered
            </div>
            <div className="text-xs text-rose-100 leading-relaxed font-mono break-words">
              {activeBreachAlert}
            </div>
          </div>
          <button
            onClick={dismissBreachAlert}
            className="text-rose-400 hover:text-rose-200 text-xs font-mono p-1 rounded hover:bg-rose-900/50 shrink-0"
            aria-label="Dismiss Alert"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden pb-14 md:pb-0">
        {/* Left Navigation Center (Desktop) */}
        <Sidebar />

        {/* Primary Screen Viewport */}
        <main className="flex-1 h-full overflow-hidden relative">
          {activeTab === 'arena' && <ArenaView />}
          {activeTab === 'breach-lab' && <BreachLabView />}
          {activeTab === 'payload-builder' && <PayloadBuilderView />}
          {activeTab === 'audit-chain' && <AuditChainView />}
          {activeTab === 'commit-reveal' && <CommitRevealView />}
          {activeTab === 'leakage' && <LeakageMonitorView />}
          {activeTab === 'access' && <AccessNetworkView />}
          {activeTab === 'threat-model' && <ThreatModelView />}
          {activeTab === 'docker-poc' && <DockerPocView />}
          {activeTab === 'datasets' && <DatasetsCatalogView />}
          {activeTab === 'report' && <EvaluationReportView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Architecture Onboarding Modal */}
      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />
    </div>
  );
}
