import React, { useState } from 'react';
import { ArrowDown, ArrowUp, ArrowRight, ArrowLeft, Trash2, Eye } from 'lucide-react';

export default function StackQueueVisualizer() {
  const [mode, setMode] = useState('stack'); // 'stack' | 'queue'
  const [items, setItems] = useState([12, 45, 78]);
  const [inputValue, setInputValue] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(null);
  const [message, setMessage] = useState('Ready for operations.');
  const MAX_SIZE = 8;

  const showMessage = (msg) => {
    setMessage(msg);
  };

  // Stack Operations (LIFO)
  const handlePush = () => {
    if (inputValue.trim() === '') return;
    if (items.length >= MAX_SIZE) {
      showMessage('Stack Overflow! Maximum capacity reached.');
      return;
    }
    const val = Number(inputValue);
    const updated = [...items, val];
    setItems(updated);
    setHighlightIndex(updated.length - 1);
    showMessage(`Pushed ${val} onto top of Stack.`);
    setInputValue('');
    setTimeout(() => setHighlightIndex(null), 800);
  };

  const handlePop = () => {
    if (items.length === 0) {
      showMessage('Stack Underflow! Stack is empty.');
      return;
    }
    setHighlightIndex(items.length - 1);
    setTimeout(() => {
      const popped = items[items.length - 1];
      setItems(items.slice(0, -1));
      setHighlightIndex(null);
      showMessage(`Popped ${popped} from the Stack.`);
    }, 400);
  };

  // Queue Operations (FIFO)
  const handleEnqueue = () => {
    if (inputValue.trim() === '') return;
    if (items.length >= MAX_SIZE) {
      showMessage('Queue Overflow! Maximum capacity reached.');
      return;
    }
    const val = Number(inputValue);
    const updated = [...items, val];
    setItems(updated);
    setHighlightIndex(updated.length - 1);
    showMessage(`Enqueued ${val} at the rear.`);
    setInputValue('');
    setTimeout(() => setHighlightIndex(null), 800);
  };

  const handleDequeue = () => {
    if (items.length === 0) {
      showMessage('Queue Underflow! Queue is empty.');
      return;
    }
    setHighlightIndex(0);
    setTimeout(() => {
      const dequeued = items[0];
      setItems(items.slice(1));
      setHighlightIndex(null);
      showMessage(`Dequeued ${dequeued} from the front.`);
    }, 400);
  };

  const handlePeek = () => {
    if (items.length === 0) {
      showMessage('Data structure is empty.');
      return;
    }
    const targetIdx = mode === 'stack' ? items.length - 1 : 0;
    setHighlightIndex(targetIdx);
    const targetVal = items[targetIdx];
    showMessage(`Peeked value: ${targetVal} (${mode === 'stack' ? 'Top' : 'Front'})`);
    setTimeout(() => setHighlightIndex(null), 1200);
  };

  const handleClear = () => {
    setItems([]);
    setHighlightIndex(null);
    showMessage(`Cleared all elements.`);
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-[calc(100vh-80px)] p-6 max-w-4xl mx-auto">
      {/* Mode Switcher */}
      <div className="w-full flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-indigo-400 capitalize">{mode} Visualizer</h2>
          <p className="text-xs text-slate-400">
            {mode === 'stack' ? 'LIFO (Last In, First Out)' : 'FIFO (First In, First Out)'}
          </p>
        </div>

        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-lg">
          <button
            onClick={() => { setMode('stack'); setItems([12, 45, 78]); setMessage('Switched to Stack'); }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${
              mode === 'stack' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Stack
          </button>
          <button
            onClick={() => { setMode('queue'); setItems([12, 45, 78]); setMessage('Switched to Queue'); }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${
              mode === 'queue' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Queue
          </button>
        </div>
      </div>

      {/* Status / Message Display */}
      <div className="w-full mt-4 bg-slate-900/60 border border-slate-800 py-2.5 px-4 rounded-lg text-center font-mono text-sm text-indigo-300">
        {message}
      </div>

      {/* Visualizer Canvas */}
      <main className="w-full h-80 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center p-6 my-6 shadow-inner relative overflow-hidden">
        {mode === 'stack' ? (
          /* Stack Canvas: Vertical container */
          <div className="w-48 h-64 border-b-4 border-l-4 border-r-4 border-indigo-500/50 rounded-b-xl flex flex-col-reverse justify-start items-center p-2 gap-2 bg-slate-950/50">
            {items.length === 0 && (
              <span className="text-xs text-slate-600 font-mono my-auto">Stack is Empty</span>
            )}
            {items.map((val, idx) => {
              const isTop = idx === items.length - 1;
              const isHighlighted = highlightIndex === idx;
              return (
                <div
                  key={idx}
                  className={`w-full py-2.5 text-center font-bold font-mono rounded-lg border transition-all duration-300 relative ${
                    isHighlighted
                      ? 'bg-rose-500 border-rose-400 text-white scale-105 shadow-lg shadow-rose-500/30'
                      : 'bg-indigo-600/90 border-indigo-400/30 text-indigo-100 shadow-sm'
                  }`}
                >
                  {val}
                  {isTop && (
                    <span className="absolute -right-14 top-1.5 text-[10px] bg-slate-800 border border-slate-700 text-indigo-300 px-1.5 py-0.5 rounded font-sans">
                      TOP
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Queue Canvas: Horizontal conveyor */
          <div className="w-full max-w-lg h-28 border-t-2 border-b-2 border-indigo-500/50 flex items-center justify-start gap-2 p-2 bg-slate-950/50 overflow-x-auto">
            {items.length === 0 && (
              <span className="text-xs text-slate-600 font-mono mx-auto">Queue is Empty</span>
            )}
            {items.map((val, idx) => {
              const isFront = idx === 0;
              const isRear = idx === items.length - 1;
              const isHighlighted = highlightIndex === idx;
              return (
                <div
                  key={idx}
                  className={`min-w-[64px] h-16 flex flex-col items-center justify-center font-bold font-mono rounded-lg border transition-all duration-300 relative ${
                    isHighlighted
                      ? 'bg-rose-500 border-rose-400 text-white scale-105 shadow-lg shadow-rose-500/30'
                      : 'bg-indigo-600/90 border-indigo-400/30 text-indigo-100 shadow-sm'
                  }`}
                >
                  <span>{val}</span>
                  {isFront && (
                    <span className="absolute -bottom-5 text-[9px] bg-emerald-950 border border-emerald-700 text-emerald-300 px-1 rounded font-sans">
                      FRONT
                    </span>
                  )}
                  {isRear && !isFront && (
                    <span className="absolute -top-5 text-[9px] bg-amber-950 border border-amber-700 text-amber-300 px-1 rounded font-sans">
                      REAR
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Operations Panel */}
      <footer className="w-full bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Value"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500 font-mono"
          />

          {mode === 'stack' ? (
            <>
              <button
                onClick={handlePush}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold rounded-lg transition"
              >
                <ArrowDown size={16} /> Push
              </button>
              <button
                onClick={handlePop}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-medium rounded-lg transition"
              >
                <ArrowUp size={16} /> Pop
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEnqueue}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold rounded-lg transition"
              >
                <ArrowRight size={16} /> Enqueue
              </button>
              <button
                onClick={handleDequeue}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-medium rounded-lg transition"
              >
                <ArrowLeft size={16} /> Dequeue
              </button>
            </>
          )}

          <button
            onClick={handlePeek}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-medium rounded-lg transition text-slate-300"
            title="Peek Top/Front element"
          >
            <Eye size={16} /> Peek
          </button>
        </div>

        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 px-3 py-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 text-sm font-medium rounded-lg transition"
        >
          <Trash2 size={16} /> Clear
        </button>
      </footer>
    </div>
  );
}