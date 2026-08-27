import React, { useState } from 'react';
import { X, Copy, Check, Terminal } from 'lucide-react';
import { ALGO_SNIPPETS } from '../data/algorithmSnippets';

export default function CodeModal({ isOpen, onClose, currentTab }) {
  const [lang, setLang] = useState('javascript');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const tabData = ALGO_SNIPPETS[currentTab] || ALGO_SNIPPETS['sorting'];
  const firstKey = Object.keys(tabData).find((k) => k !== 'title') || 'bubble';
  const algo = tabData[firstKey];

  const handleCopy = () => {
    navigator.clipboard.writeText(algo[lang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const getLangLabel = (l) => {
    if (l === 'cpp') return 'C++';
    if (l === 'javascript') return 'JavaScript';
    if (l === 'python') return 'Python';
    if (l === 'java') return 'Java';
    return l.toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2 text-indigo-400 font-bold">
            <Terminal size={18} />
            <span>{algo.name} Implementation</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Complexity Summary */}
        <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
          <span><strong>Time:</strong> <span className="font-mono text-emerald-400">{algo.time}</span></span>
          <span><strong>Space:</strong> <span className="font-mono text-indigo-400">{algo.space}</span></span>
          <p className="w-full text-slate-400 text-[11px] mt-1">{algo.intuition}</p>
        </div>

        {/* Language Tabs & Copy */}
        <div className="flex items-center justify-between px-6 py-2 bg-slate-950 border-b border-slate-800">
          <div className="flex gap-2">
            {['javascript', 'python', 'cpp', 'java'].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1 rounded text-xs font-mono font-medium transition ${
                  lang === l
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {getLangLabel(l)}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 transition font-mono"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        {/* Code Body */}
        <div className="p-6 bg-slate-950 font-mono text-xs text-indigo-200 overflow-y-auto flex-1 leading-relaxed">
          <pre>{algo[lang]}</pre>
        </div>
      </div>
    </div>
  );
}