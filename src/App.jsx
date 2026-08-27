import React, { useState } from 'react';
import SortingVisualizer from './components/SortingVisualizer';
import StackQueueVisualizer from './components/StackQueueVisualizer';
import LinkedListVisualizer from './components/LinkedListVisualizer';
import TreeVisualizer from './components/TreeVisualizer';
import PathfindingVisualizer from './components/PathfindingVisualizer';
import CodeVisualizer from './components/CodeVisualizer';
import CodeModal from './components/CodeModal';
import { BarChart3, Layers, GitCommit, Network, Compass, PlaySquare, Code2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('sorting');
  const [isCodeOpen, setIsCodeOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Global Navigation Header */}
      <nav className="w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white font-mono shadow-md shadow-indigo-600/30">
            D
          </div>
          <span className="font-bold tracking-tight text-slate-100">AlgoSphere</span>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('sorting')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'sorting'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 size={14} /> Sorting
          </button>

          <button
            onClick={() => setActiveTab('stack-queue')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'stack-queue'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers size={14} /> Stack & Queue
          </button>

          <button
            onClick={() => setActiveTab('linked-list')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'linked-list'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitCommit size={14} /> Linked List
          </button>

          <button
            onClick={() => setActiveTab('tree')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'tree'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Network size={14} /> Binary Tree
          </button>

          <button
            onClick={() => setActiveTab('pathfinding')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'pathfinding'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass size={14} /> Pathfinding
          </button>

          <button
            onClick={() => setActiveTab('code-visualizer')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'code-visualizer'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlaySquare size={14} /> Code Stepper
          </button>
        </div>

        {/* View Code Snippets Button */}
        <button
          onClick={() => setIsCodeOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border border-slate-700 rounded-lg text-xs font-semibold transition"
        >
          <Code2 size={15} /> Reference
        </button>
      </nav>

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'sorting' && <SortingVisualizer />}
        {activeTab === 'stack-queue' && <StackQueueVisualizer />}
        {activeTab === 'linked-list' && <LinkedListVisualizer />}
        {activeTab === 'tree' && <TreeVisualizer />}
        {activeTab === 'pathfinding' && <PathfindingVisualizer />}
        {activeTab === 'code-visualizer' && <CodeVisualizer />}
      </main>

      {/* Language Reference Modal */}
      <CodeModal
        isOpen={isCodeOpen}
        onClose={() => setIsCodeOpen(false)}
        currentTab={activeTab}
      />
    </div>
  );
}