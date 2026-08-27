import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { playTone, valueToFrequency } from '../utils/audio';

const ALGORITHMS = {
  bubble: { name: 'Bubble Sort', best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  selection: { name: 'Selection Sort', best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  insertion: { name: 'Insertion Sort', best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  merge: { name: 'Merge Sort', best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)' },
  quick: { name: 'Quick Sort', best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)' }
};

export default function SortingVisualizer() {
  const [array, setArray] = useState([]);
  const [selectedAlgo, setSelectedAlgo] = useState('bubble');
  const [comparing, setComparing] = useState([]);
  const [swapping, setSwapping] = useState([]);
  const [pivot, setPivot] = useState(null);
  const [sorted, setSorted] = useState([]);
  const [isSorting, setIsSorting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [arraySize, setArraySize] = useState(25);
  const [speed, setSpeed] = useState(35);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Trigger audio note for a value
  const emitSound = (value) => {
    if (!isMuted && value) {
      playTone(valueToFrequency(value));
    }
  };

  const resetArray = () => {
    if (isSorting) return;
    const newArr = [];
    for (let i = 0; i < arraySize; i++) {
      newArr.push(Math.floor(Math.random() * 85) + 15);
    }
    setArray(newArr);
    setComparing([]);
    setSwapping([]);
    setPivot(null);
    setSorted([]);
  };

  useEffect(() => {
    resetArray();
  }, [arraySize]);

  // 1. Bubble Sort with Audio
  const runBubbleSort = async () => {
    const arr = [...array];
    const n = arr.length;
    const sortedIdxs = [];

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        setComparing([j, j + 1]);
        emitSound(arr[j]);
        await sleep(speed);

        if (arr[j] > arr[j + 1]) {
          setSwapping([j, j + 1]);
          emitSound(arr[j + 1]);
          await sleep(speed);
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          setArray([...arr]);
        }
        setComparing([]);
        setSwapping([]);
      }
      sortedIdxs.push(n - i - 1);
      setSorted([...sortedIdxs]);
    }
    setSorted(Array.from({ length: n }, (_, i) => i));
  };

  // 2. Selection Sort with Audio
  const runSelectionSort = async () => {
    const arr = [...array];
    const n = arr.length;
    const sortedIdxs = [];

    for (let i = 0; i < n; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        setComparing([minIdx, j]);
        emitSound(arr[j]);
        await sleep(speed);
        if (arr[j] < arr[minIdx]) minIdx = j;
      }

      if (minIdx !== i) {
        setSwapping([i, minIdx]);
        emitSound(arr[minIdx]);
        await sleep(speed);
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        setArray([...arr]);
      }

      sortedIdxs.push(i);
      setSorted([...sortedIdxs]);
      setComparing([]);
      setSwapping([]);
    }
    setSorted(Array.from({ length: n }, (_, i) => i));
  };

  // 3. Insertion Sort with Audio
  const runInsertionSort = async () => {
    const arr = [...array];
    const n = arr.length;

    for (let i = 1; i < n; i++) {
      let key = arr[i];
      let j = i - 1;

      setComparing([j, j + 1]);
      emitSound(key);
      await sleep(speed);

      while (j >= 0 && arr[j] > key) {
        setSwapping([j, j + 1]);
        emitSound(arr[j]);
        arr[j + 1] = arr[j];
        setArray([...arr]);
        await sleep(speed);
        j = j - 1;
        if (j >= 0) setComparing([j, i]);
      }
      arr[j + 1] = key;
      setArray([...arr]);
      setComparing([]);
      setSwapping([]);
    }
    setSorted(Array.from({ length: n }, (_, i) => i));
  };

  // 4. Merge Sort with Audio
  const runMergeSort = async () => {
    const arr = [...array];

    const merge = async (start, mid, end) => {
      let left = arr.slice(start, mid + 1);
      let right = arr.slice(mid + 1, end + 1);
      let i = 0, j = 0, k = start;

      while (i < left.length && j < right.length) {
        setComparing([start + i, mid + 1 + j]);
        emitSound(left[i]);
        await sleep(speed);

        if (left[i] <= right[j]) {
          arr[k] = left[i++];
        } else {
          arr[k] = right[j++];
        }
        setSwapping([k]);
        emitSound(arr[k]);
        setArray([...arr]);
        await sleep(speed);
        k++;
      }

      while (i < left.length) {
        arr[k] = left[i++];
        emitSound(arr[k]);
        setArray([...arr]);
        await sleep(speed);
        k++;
      }

      while (j < right.length) {
        arr[k] = right[j++];
        emitSound(arr[k]);
        setArray([...arr]);
        await sleep(speed);
        k++;
      }
      setComparing([]);
      setSwapping([]);
    };

    const mergeSortHelper = async (start, end) => {
      if (start >= end) return;
      const mid = Math.floor((start + end) / 2);
      await mergeSortHelper(start, mid);
      await mergeSortHelper(mid + 1, end);
      await merge(start, mid, end);
    };

    await mergeSortHelper(0, arr.length - 1);
    setSorted(Array.from({ length: arr.length }, (_, i) => i));
  };

  // 5. Quick Sort with Audio
  const runQuickSort = async () => {
    const arr = [...array];

    const partition = async (low, high) => {
      let pivotVal = arr[high];
      setPivot(high);
      let i = low - 1;

      for (let j = low; j < high; j++) {
        setComparing([j, high]);
        emitSound(arr[j]);
        await sleep(speed);

        if (arr[j] < pivotVal) {
          i++;
          setSwapping([i, j]);
          emitSound(arr[i]);
          [arr[i], arr[j]] = [arr[j], arr[i]];
          setArray([...arr]);
          await sleep(speed);
        }
      }

      setSwapping([i + 1, high]);
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      setArray([...arr]);
      await sleep(speed);

      setComparing([]);
      setSwapping([]);
      return i + 1;
    };

    const quickSortHelper = async (low, high) => {
      if (low < high) {
        let pi = await partition(low, high);
        await quickSortHelper(low, pi - 1);
        await quickSortHelper(pi + 1, high);
      }
    };

    await quickSortHelper(0, arr.length - 1);
    setPivot(null);
    setSorted(Array.from({ length: arr.length }, (_, i) => i));
  };

  const handleSort = async () => {
    setIsSorting(true);
    setSorted([]);

    if (selectedAlgo === 'bubble') await runBubbleSort();
    else if (selectedAlgo === 'selection') await runSelectionSort();
    else if (selectedAlgo === 'insertion') await runInsertionSort();
    else if (selectedAlgo === 'merge') await runMergeSort();
    else if (selectedAlgo === 'quick') await runQuickSort();

    // Victory sweep sound
    if (!isMuted) {
      for (let idx = 0; idx < array.length; idx++) {
        playTone(valueToFrequency(array[idx]), 0.02);
        await sleep(15);
      }
    }

    setIsSorting(false);
  };

  const getBarColor = (index) => {
    if (sorted.includes(index)) return 'bg-emerald-500 shadow-emerald-500/20';
    if (pivot === index) return 'bg-purple-500 shadow-purple-500/40';
    if (swapping.includes(index)) return 'bg-rose-500 shadow-rose-500/20';
    if (comparing.includes(index)) return 'bg-amber-400 shadow-amber-400/20';
    return 'bg-indigo-500';
  };

  const currentAlgo = ALGORITHMS[selectedAlgo];

  return (
    <div className="flex flex-col items-center justify-between min-h-screen p-6 max-w-5xl mx-auto">
      {/* Header */}
      <header className="w-full text-center py-4 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-indigo-400 text-left">
            DSA Visualizer
          </h1>
          <p className="text-xs text-slate-400 text-left">Synthesizer Auditory Sorting</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-lg border transition ${
              isMuted
                ? 'bg-rose-950/40 border-rose-800/50 text-rose-400'
                : 'bg-slate-900 border-slate-700 text-emerald-400'
            }`}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <select
            value={selectedAlgo}
            disabled={isSorting}
            onChange={(e) => {
              setSelectedAlgo(e.target.value);
              resetArray();
            }}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-50"
          >
            <option value="bubble">Bubble Sort</option>
            <option value="selection">Selection Sort</option>
            <option value="insertion">Insertion Sort</option>
            <option value="merge">Merge Sort (O(n log n))</option>
            <option value="quick">Quick Sort (O(n log n))</option>
          </select>
        </div>
      </header>

      {/* Complexity Cards */}
      <div className="w-full mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg text-center">
          <span className="text-xs text-slate-400 uppercase tracking-wider block">Best Time</span>
          <span className="text-emerald-400 font-mono font-semibold">{currentAlgo.best}</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg text-center">
          <span className="text-xs text-slate-400 uppercase tracking-wider block">Average Time</span>
          <span className="text-amber-400 font-mono font-semibold">{currentAlgo.average}</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg text-center">
          <span className="text-xs text-slate-400 uppercase tracking-wider block">Worst Time</span>
          <span className="text-rose-400 font-mono font-semibold">{currentAlgo.worst}</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg text-center">
          <span className="text-xs text-slate-400 uppercase tracking-wider block">Worst Space</span>
          <span className="text-indigo-400 font-mono font-semibold">{currentAlgo.space}</span>
        </div>
      </div>

      {/* Canvas */}
      <main className="w-full h-80 bg-slate-900 border border-slate-800 rounded-xl flex items-end justify-center gap-1.5 p-4 my-6 shadow-inner">
        {array.map((value, idx) => (
          <div
            key={idx}
            className={`w-full rounded-t transition-all duration-75 shadow-sm ${getBarColor(idx)}`}
            style={{ height: `${value}%` }}
            title={`Value: ${value}`}
          />
        ))}
      </main>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 mb-6 text-xs text-slate-400">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-indigo-500 inline-block"></span> Default</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-400 inline-block"></span> Comparing (Pitch 1)</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-rose-500 inline-block"></span> Swapping (Pitch 2)</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-purple-500 inline-block"></span> Pivot</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span> Sorted</span>
      </div>

      {/* Controls */}
      <footer className="w-full bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSort}
            disabled={isSorting}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-sm font-semibold rounded-lg transition shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <Play size={16} fill="currentColor" /> Start {currentAlgo.name}
          </button>

          <button
            onClick={resetArray}
            disabled={isSorting}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-sm font-medium rounded-lg transition cursor-pointer"
          >
            <RotateCcw size={16} /> New Array
          </button>
        </div>

        <div className="flex items-center gap-6 text-sm text-slate-300">
          <label className="flex items-center gap-2">
            <span>Size: {arraySize}</span>
            <input
              type="range"
              min="10"
              max="60"
              value={arraySize}
              disabled={isSorting}
              onChange={(e) => setArraySize(Number(e.target.value))}
              className="accent-indigo-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center gap-2">
            <span>Speed: {speed}ms</span>
            <input
              type="range"
              min="5"
              max="150"
              value={speed}
              disabled={isSorting}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="accent-indigo-500 cursor-pointer"
            />
          </label>
        </div>
      </footer>
    </div>
  );
}