import React, { useState } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { BenchmarkId, BenchmarkOption } from '../types';
import { BENCHMARK_OPTIONS } from '../data/canonicalData';

interface BenchmarkSelectorProps {
  currentBenchmark: BenchmarkId;
  onSelectBenchmark: (id: BenchmarkId) => void;
}

export const BenchmarkSelector: React.FC<BenchmarkSelectorProps> = ({
  currentBenchmark,
  onSelectBenchmark,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption =
    BENCHMARK_OPTIONS.find((b) => b.id === currentBenchmark) || BENCHMARK_OPTIONS[0];

  const handleSelect = (id: BenchmarkId) => {
    onSelectBenchmark(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Persistent Benchmark Pill/Bar */}
      <div className="px-5 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-1.5 text-gray-700 font-medium">
          <span className="text-gray-500">Benchmark:</span>
          <span className="font-semibold text-gray-900">{selectedOption.name}</span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="text-[#0969da] hover:text-blue-800 font-semibold text-sm flex items-center gap-0.5 cursor-pointer hover:underline"
          aria-label="Change benchmark"
        >
          <span>Change</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* iOS Bottom Sheet Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-[1px] transition-opacity"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="benchmark-modal-title"
        >
          <div
            className="w-full max-w-[430px] bg-white rounded-t-3xl p-5 pb-8 shadow-2xl animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle */}
            <div className="w-10 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 id="benchmark-modal-title" className="text-lg font-bold text-gray-900">
                Change benchmark
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5 stroke-[2.2]" />
              </button>
            </div>

            {/* List of options */}
            <div className="divide-y divide-gray-100 mt-1">
              {BENCHMARK_OPTIONS.map((opt) => {
                const isSelected = opt.id === currentBenchmark;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect(opt.id)}
                    className="w-full py-4 flex items-start space-x-3.5 text-left group cursor-pointer hover:bg-gray-50/70 -mx-2 px-2 rounded-xl transition"
                  >
                    {/* Custom Radio Icon */}
                    <div className="pt-0.5 shrink-0">
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full border-2 border-[#1b873f] flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-[#1b873f]" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-400 group-hover:border-gray-600" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="text-[15px] font-bold text-gray-900 leading-snug">
                        {opt.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{opt.subtitle}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
