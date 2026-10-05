import React, { useState } from 'react';
import { BENCHMARK_DATASETS } from '../../engine/benchmarkData';
import { useSentinelStore } from '../../engine/store';
import {
  Database,
  ExternalLink,
  Search,
  Layers,
  Sparkles,
  ShieldCheck,
  Tag,
  BookOpen,
} from 'lucide-react';

export const DatasetsCatalogView: React.FC = () => {
  const { runSingleTestRound, setActiveTab } = useSentinelStore();
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredDatasets = BENCHMARK_DATASETS.filter((ds) => {
    const q = searchQuery.toLowerCase();
    return (
      ds.name.toLowerCase().includes(q) ||
      ds.organization.toLowerCase().includes(q) ||
      ds.description.toLowerCase().includes(q) ||
      ds.focusArea.toLowerCase().includes(q) ||
      ds.keyCategories.some((c) => c.toLowerCase().includes(q))
    );
  });

  return (
    <div className="h-full w-full overflow-y-auto p-6 space-y-6 bg-[#06090e]">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-bold text-slate-100">
              Adversarial Datasets & Threat Intelligence Catalog
            </h1>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">
              8 Standardized Safety Resources
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Standardized benchmarks, red-teaming corpora, vulnerability registries, and system provenance resources integrated into the Bayora Sentinel control plane.
          </p>
        </div>

        {/* Search filter */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search datasets, taxonomy, CVE..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
          />
        </div>
      </div>

      {/* Dataset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDatasets.map((dataset) => (
          <div
            key={dataset.id}
            className="p-6 bg-slate-900/60 border border-slate-800/90 rounded-2xl space-y-4 backdrop-blur-md flex flex-col justify-between hover:border-cyan-500/40 transition-all group"
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-mono text-cyan-400 uppercase">
                    {dataset.organization}
                  </div>
                  <h2 className="font-display text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {dataset.name}
                  </h2>
                </div>

                <a
                  href={dataset.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-cyan-300 px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors"
                >
                  <span>Open Resource</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed">
                {dataset.description}
              </p>

              {/* Focus Area & Samples */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl">
                  <div className="text-slate-500 text-[9px] uppercase">Focus Area</div>
                  <div className="text-slate-200 truncate font-medium">{dataset.focusArea}</div>
                </div>
                <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl">
                  <div className="text-slate-500 text-[9px] uppercase">Corpus Scale</div>
                  <div className="text-amber-300 truncate font-medium">{dataset.totalSamples}</div>
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-1.5">
                <div className="text-slate-500 text-[10px] font-mono uppercase">
                  Taxonomy & Evaluated Harm Vectors
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {dataset.keyCategories.map((cat, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Integration In Bayora Sentinel */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <div className="text-[11px] text-slate-400 font-mono">
                <span className="text-emerald-400 font-semibold">Bayora Sentinel Role: </span>
                {dataset.integrationInBayora}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
