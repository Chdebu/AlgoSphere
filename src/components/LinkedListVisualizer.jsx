import React, { useState } from 'react';
import { ArrowRight, ArrowLeftRight, Plus, Trash2, Search, CornerDownRight } from 'lucide-react';

export default function LinkedListVisualizer() {
  const [mode, setMode] = useState('singly'); // 'singly' | 'doubly'
  const [nodes, setNodes] = useState([
    { id: 1, val: 15 },
    { id: 2, val: 32 },
    { id: 3, val: 64 },
    { id: 4, val: 88 }
  ]);
  const [valInput, setValInput] = useState('');
  const [indexInput, setIndexInput] = useState('');
  const [highlightIdx, setHighlightIdx] = useState(null);
  const [isTraversing, setIsTraversing] = useState(false);
  const [message, setMessage] = useState('Select an operation to manipulate the Linked List.');

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Insert at Head (O(1))
  const insertHead = () => {
    if (valInput.trim() === '' || isTraversing) return;
    const newNode = { id: Date.now(), val: Number(valInput) };
    setNodes([newNode, ...nodes]);
    setHighlightIdx(0);
    setMessage(`Inserted ${newNode.val} at Head (Index 0).`);
    setValInput('');
    setTimeout(() => setHighlightIdx(null), 800);
  };

  // Insert at Tail (O(n) or O(1) with tail pointer)
  const insertTail = () => {
    if (valInput.trim() === '' || isTraversing) return;
    const newNode = { id: Date.now(), val: Number(valInput) };
    const updated = [...nodes, newNode];
    setNodes(updated);
    setHighlightIdx(updated.length - 1);
    setMessage(`Inserted ${newNode.val} at Tail (Index ${updated.length - 1}).`);
    setValInput('');
    setTimeout(() => setHighlightIdx(null), 800);
  };

  // Insert at Custom Index
  const insertAtIndex = async () => {
    if (valInput.trim() === '' || indexInput.trim() === '' || isTraversing) return;
    const idx = Number(indexInput);
    if (isNaN(idx) || idx < 0 || idx > nodes.length) {
      setMessage(`Invalid index. Must be between 0 and ${nodes.length}.`);
      return;
    }

    setIsTraversing(true);
    for (let i = 0; i < idx; i++) {
      setHighlightIdx(i);
      setMessage(`Traversing pointer to index ${i}...`);
      await sleep(400);
    }

    const newNode = { id: Date.now(), val: Number(valInput) };
    const updated = [...nodes];
    updated.splice(idx, 0, newNode);
    setNodes(updated);
    setHighlightIdx(idx);
    setMessage(`Linked new node ${newNode.val} at index ${idx}.`);
    setValInput('');
    setIndexInput('');
    setIsTraversing(false);
    setTimeout(() => setHighlightIdx(null), 800);
  };

  // Delete Node by Index
  const deleteAtIndex = async () => {
    if (indexInput.trim() === '' || isTraversing || nodes.length === 0) return;
    const idx = Number(indexInput);
    if (isNaN(idx) || idx < 0 || idx >= nodes.length) {
      setMessage(`Invalid index. Must be between 0 and ${nodes.length - 1}.`);
      return;
    }

    setIsTraversing(true);
    for (let i = 0; i <= idx; i++) {
      setHighlightIdx(i);
      setMessage(`Traversing to target node at index ${i}...`);
      await sleep(400);
    }

    const removedVal = nodes[idx].val;
    const updated = nodes.filter((_, i) => i !== idx);
    setNodes(updated);
    setHighlightIdx(null);
    setMessage(`Unlinked and deleted node ${removedVal} from index ${idx}.`);
    setIndexInput('');
    setIsTraversing(false);
  };

  // Search Node (Linear Search O(n))
  const searchNode = async () => {
    if (valInput.trim() === '' || isTraversing || nodes.length === 0) return;
    const target = Number(valInput);
    setIsTraversing(true);
    let found = false;

    for (let i = 0; i < nodes.length; i++) {
      setHighlightIdx(i);
      setMessage(`Checking index ${i}: Is ${nodes[i].val} === ${target}?`);
      await sleep(500);

      if (nodes[i].val === target) {
        setMessage(`Found element ${target} at index ${i}!`);
        found = true;
        break;
      }
    }

    if (!found) {
      setMessage(`Value ${target} was not found in the list.`);
      setHighlightIdx(null);
    }
    setIsTraversing(false);
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-[calc(100vh-80px)] p-6 max-w-5xl mx-auto">
      {/* Mode Switcher */}
      <div className="w-full flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-indigo-400 capitalize">{mode} Linked List</h2>
          <p className="text-xs text-slate-400">
            {mode === 'singly' ? 'Nodes store: [ Data | Next Pointer ]' : 'Nodes store: [ Prev Pointer | Data | Next Pointer ]'}
          </p>
        </div>

        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-lg">
          <button
            onClick={() => { setMode('singly'); setMessage('Switched to Singly Linked List'); }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${
              mode === 'singly' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Singly
          </button>
          <button
            onClick={() => { setMode('doubly'); setMessage('Switched to Doubly Linked List'); }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${
              mode === 'doubly' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Doubly
          </button>
        </div>
      </div>

      {/* Message Output */}
      <div className="w-full mt-4 bg-slate-900/60 border border-slate-800 py-2.5 px-4 rounded-lg text-center font-mono text-sm text-indigo-300">
        {message}
      </div>

      {/* Visual Canvas */}
      <main className="w-full h-80 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-start gap-2 p-6 my-6 shadow-inner overflow-x-auto">
        {nodes.length === 0 ? (
          <span className="text-xs text-slate-600 font-mono mx-auto">List is Empty</span>
        ) : (
          <div className="flex items-center gap-2">
            {/* HEAD Label */}
            <div className="flex flex-col items-center mr-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 font-mono">HEAD</span>
              <CornerDownRight size={16} className="text-emerald-400" />
            </div>

            {/* Nodes Render */}
            {nodes.map((node, idx) => {
              const isCurrent = highlightIdx === idx;
              return (
                <React.Fragment key={node.id}>
                  {/* Doubly Prev Arrow */}
                  {mode === 'doubly' && idx > 0 && (
                    <div className="flex items-center text-slate-500">
                      <ArrowLeftRight size={20} className="text-slate-500" />
                    </div>
                  )}

                  {/* Singly Next Arrow */}
                  {mode === 'singly' && idx > 0 && (
                    <div className="flex items-center text-slate-500">
                      <ArrowRight size={20} className="text-slate-500" />
                    </div>
                  )}

                  {/* Node Box */}
                  <div
                    className={`flex items-center border rounded-lg transition-all duration-300 shadow-md ${
                      isCurrent
                        ? 'border-rose-400 bg-rose-950/80 shadow-rose-500/30 scale-105'
                        : 'border-indigo-500/40 bg-slate-950'
                    }`}
                  >
                    {/* Doubly Prev Pointer partition */}
                    {mode === 'doubly' && (
                      <div className="px-2 py-3 border-r border-slate-800 text-[10px] text-slate-400 font-mono bg-slate-900/50">
                        prev
                      </div>
                    )}

                    {/* Data payload */}
                    <div className="px-4 py-3 text-center min-w-[50px]">
                      <span className="text-xs text-slate-500 block font-mono">[{idx}]</span>
                      <span className="text-base font-bold font-mono text-slate-100">{node.val}</span>
                    </div>

                    {/* Next Pointer partition */}
                    <div className="px-2 py-3 border-l border-slate-800 text-[10px] text-slate-400 font-mono bg-slate-900/50">
                      next
                    </div>
                  </div>
                </React.Fragment>
              );
            })}

            {/* NULL Pointer */}
            <div className="flex items-center gap-2 ml-2">
              <ArrowRight size={20} className="text-slate-600" />
              <div className="px-2.5 py-1 bg-slate-800/80 border border-slate-700 text-slate-400 font-mono text-xs rounded">
                NULL
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Control Panel */}
      <footer className="w-full bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
        {/* Value Operations */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Value"
            value={valInput}
            disabled={isTraversing}
            onChange={(e) => setValInput(e.target.value)}
            className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500 font-mono disabled:opacity-50"
          />

          <button
            onClick={insertHead}
            disabled={isTraversing}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-semibold rounded-lg transition"
          >
            <Plus size={14} /> Head
          </button>

          <button
            onClick={insertTail}
            disabled={isTraversing}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-semibold rounded-lg transition"
          >
            <Plus size={14} /> Tail
          </button>

          <button
            onClick={searchNode}
            disabled={isTraversing}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-medium rounded-lg transition text-slate-200"
          >
            <Search size={14} /> Search
          </button>
        </div>

        {/* Index-based Operations */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Index"
            value={indexInput}
            disabled={isTraversing}
            onChange={(e) => setIndexInput(e.target.value)}
            className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500 font-mono disabled:opacity-50"
          />

          <button
            onClick={insertAtIndex}
            disabled={isTraversing}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-medium rounded-lg transition text-slate-200"
          >
            Insert @ Idx
          </button>

          <button
            onClick={deleteAtIndex}
            disabled={isTraversing}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 text-xs font-medium rounded-lg transition disabled:opacity-50"
          >
            <Trash2 size={14} /> Delete @ Idx
          </button>
        </div>
      </footer>
    </div>
  );
}