import React from 'react';
import { useSentinelStore, ActiveTab } from '../../engine/store';
import {
  Boxes,
  Zap,
  Code2,
  Link2,
  Menu,
} from 'lucide-react';

interface BottomTab {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PRIMARY_TABS: BottomTab[] = [
  { id: 'arena', label: '3D Arena', icon: Boxes },
  { id: 'breach-lab', label: 'Breach Lab', icon: Zap },
  { id: 'payload-builder', label: 'Sandbox', icon: Code2 },
  { id: 'audit-chain', label: 'Audit Chain', icon: Link2 },
];

export const MobileBottomNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    toggleMobileNav,
  } = useSentinelStore();

  const isMoreActive = !PRIMARY_TABS.some((t) => t.id === activeTab);

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-[#080B10]/95 border-t border-slate-800/90 backdrop-blur-xl px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom">
      {PRIMARY_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-xl transition-all ${
              isActive
                ? 'text-cyan-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isActive && (
              <span className="absolute -top-1.5 w-6 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]" />
            )}
            <Icon
              className={`h-5 w-5 transition-transform ${
                isActive ? 'text-cyan-400 scale-110' : 'text-slate-500'
              }`}
            />
            <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
          </button>
        );
      })}

      {/* More / All Centers Drawer Button */}
      <button
        onClick={toggleMobileNav}
        className={`relative flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-xl transition-all ${
          isMoreActive
            ? 'text-cyan-300 font-semibold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        {isMoreActive && (
          <span className="absolute -top-1.5 w-6 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]" />
        )}
        <Menu
          className={`h-5 w-5 transition-transform ${
            isMoreActive ? 'text-cyan-400 scale-110' : 'text-slate-500'
          }`}
        />
        <span className="text-[10px] mt-0.5 tracking-tight">More</span>
      </button>
    </div>
  );
};
