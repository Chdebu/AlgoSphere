import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, RotateCcw, 
  Terminal, Layers, Box, AlertCircle, Sparkles, CheckCircle, 
  Hash, CornerDownLeft, Activity, ListChecks, Keyboard
} from 'lucide-react';

const METHOD_PRESETS = {
  lexGreater: {
    name: 'Lexicographical Greater Permutation (Java)',
    args: '"abc", "bba"',
    code: `class Solution {
    public String lexGreaterPermutation(String s, String target) {
        int n = s.length();
        int[] totalCount = new int[26];
        for (char ch : s.toCharArray()) {
            totalCount[ch - 'a']++;
        }

        int prefixLen = 0;
        int[] rem = totalCount.clone();
        while (prefixLen < n) {
            int c = target.charAt(prefixLen) - 'a';
            if (rem[c] > 0) {
                rem[c]--;
                prefixLen++;
            } else {
                break;
            }
        }

        for (int i = prefixLen; i >= 0; i--) {
            int[] remCount = totalCount.clone();
            for (int j = 0; j < i; j++) {
                remCount[target.charAt(j) - 'a']--;
            }

            if (i < n) {
                int targetVal = target.charAt(i) - 'a';
                for (int c = targetVal + 1; c < 26; c++) {
                    if (remCount[c] > 0) {
                        StringBuilder sb = new StringBuilder();
                        sb.append(target, 0, i);
                        sb.append((char) ('a' + c));
                        remCount[c]--;

                        for (int charIdx = 0; charIdx < 26; charIdx++) {
                            while (remCount[charIdx] > 0) {
                                sb.append((char) ('a' + charIdx));
                                remCount[charIdx]--;
                            }
                        }
                        return sb.toString();
                    }
                }
            }
        }
        return "";
    }
}`
  },
  twoSumJava: {
    name: 'Two Sum - Hash Map (Java)',
    args: '[2, 7, 11, 15], 9',
    code: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}`
  },
  binarySearch: {
    name: 'Binary Search (Java)',
    args: '[1, 3, 5, 7, 9, 11, 13, 15], 7',
    code: `class Solution {
    public int search(int[] nums, int target) {
        int left = 0;
        int right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) {
                return mid;
            } else if (nums[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        return -1;
    }
}`
  }
};

export default function CodeVisualizer() {
  const [selectedPreset, setSelectedPreset] = useState('lexGreater');
  const [methodCode, setMethodCode] = useState(METHOD_PRESETS.lexGreater.code);
  const [argsInput, setArgsInput] = useState(METHOD_PRESETS.lexGreater.args);
  const [activeRightTab, setActiveRightTab] = useState('diagram'); // 'diagram' | 'scope' | 'logs'

  const [frames, setFrames] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(550);
  const [errorMsg, setErrorMsg] = useState(null);
  const [returnValue, setReturnValue] = useState(null);

  const timerRef = useRef(null);

  // Transpilation for Java Syntax
  const transpileJavaToJS = (source) => {
    let code = source;
    code = code.replace(/class\s+\w+\s*\{([\s\S]*)\}\s*$/, '$1');
    code = code.replace(
      /(?:public|private|protected|static|\s)*[\w<>\[\]]+\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)\s*\{/,
      (_, funcName, params) => {
        const cleanParams = params
          .split(',')
          .map((p) => p.trim().split(/\s+/).pop())
          .filter(Boolean)
          .join(', ');
        return `function ${funcName}(${cleanParams}) {`;
      }
    );
    code = code.replace(
      /for\s*\(\s*(?:[\w<>\[\]]+)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*([^\)]+)\)/g,
      'for (let $1 of ($2))'
    );
    return code
      .replace(/int\[\]|String\[\]|boolean\[\]|char\[\]|double\[\]/g, 'let ')
      .replace(/\b(?:int|String|boolean|char|double|long|float)\b/g, 'let ')
      .replace(/new\s+let\s*\[(\d+)\]/g, 'new Array($1).fill(0)')
      .replace(/new\s+Array\((\d+)\)/g, 'new Array($1).fill(0)')
      .replace(/new\s+let\s*\[\]\s*\{([^}]*)\}/g, '[$1]')
      .replace(/\.clone\(\)/g, '.slice()')
      .replace(/\.toCharArray\(\)/g, '.split("")')
      .replace(/\.length\(\)/g, '.length')
      .replace(/\(char\)\s*\(/g, 'String.fromCharCode(')
      .replace(/\(char\)\s*([a-zA-Z0-9_+\-'"]+)/g, 'String.fromCharCode($1)')
      .replace(/new\s+HashMap<[^>]*>\(\)/g, 'new Map()')
      .replace(/\.containsKey\(/g, '.has(')
      .replace(/\.put\(/g, '.set(');
  };

  const instrumentAndRunMethod = (rawFunctionCode, rawArgsStr) => {
    try {
      setErrorMsg(null);
      setReturnValue(null);

      let parsedArgs;
      try {
        parsedArgs = new Function(`return [${rawArgsStr}];`)();
      } catch {
        throw new Error('Invalid arguments. Format: "abc", "bba" or [2, 7, 11], 9');
      }

      const cleanJS = transpileJavaToJS(rawFunctionCode);
      const funcMatch = cleanJS.match(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)/);
      if (!funcMatch) throw new Error('Could not parse function header.');

      const funcName = funcMatch[1];
      const params = funcMatch[2].split(',').map((p) => p.trim()).filter(Boolean);

      const varNames = new Set(params);
      const varDeclRegex = /(?:let|const|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
      let match;
      while ((match = varDeclRegex.exec(cleanJS)) !== null) {
        varNames.add(match[1]);
      }

      const lines = cleanJS.split('\n');
      let instrumentedFunc = '';

      lines.forEach((line, idx) => {
        const lineNum = idx + 1;
        const trimmed = line.trim();

        if (
          !trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') ||
          trimmed.startsWith('function') || trimmed === '}' || trimmed.startsWith('else')
        ) {
          instrumentedFunc += line + '\n';
          return;
        }

        const escapedCode = trimmed.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        const scopeCollector = Array.from(varNames)
          .map((v) => `try { __scope__['${v}'] = __clone__(${v}); } catch(e){}`)
          .join(' ');

        instrumentedFunc += `__record__(${lineNum}, "${escapedCode}", () => { const __scope__ = {}; ${scopeCollector} return __scope__; });\n`;
        instrumentedFunc += line + '\n';
      });

      const sandboxCode = `
        const __frames__ = [];
        let __stepCount__ = 0;
        const __MAX_STEPS__ = 2000;

        String.prototype.charAt = function(i) {
          const code = this.charCodeAt(i);
          return { valueOf: () => code, toString: () => String.fromCharCode(code) };
        };

        class StringBuilder {
          constructor() { this.str = ""; }
          append(val, start, end) {
            this.str += (typeof start === 'number' && typeof end === 'number')
              ? String(val).substring(start, end)
              : String(val);
            return this;
          }
          toString() { return this.str; }
        }

        function __clone__(v) {
          if (v === null || v === undefined) return v;
          if (v instanceof Map) return { __isMap: true, entries: Array.from(v.entries()) };
          if (v instanceof StringBuilder) return v.toString();
          if (typeof v === 'object') {
            try { return JSON.parse(JSON.stringify(v)); } catch(e) { return String(v); }
          }
          return v;
        }

        function __record__(lineNum, codeStr, scopeGetter) {
          if (__stepCount__++ > __MAX_STEPS__) {
            throw new Error("Execution limit reached (2,000 steps).");
          }
          __frames__.push({ line: lineNum, code: codeStr, scope: scopeGetter() });
        }

        ${instrumentedFunc}
        const __result__ = ${funcName}(...args);
        return { frames: __frames__, result: __result__ };
      `;

      const runner = new Function('args', sandboxCode);
      const execution = runner(parsedArgs);

      setReturnValue(execution.result);
      if (!execution.frames || execution.frames.length === 0) {
        throw new Error('Method produced 0 steps.');
      }

      return execution.frames.map((f) => ({
        ...f,
        explanation: f.code.startsWith('return')
          ? `Returned: ${JSON.stringify(execution.result)}`
          : `Executing: ${f.code}`
      }));
    } catch (err) {
      setErrorMsg(err.message || 'Execution trace error.');
      return [];
    }
  };

  const handleRun = () => {
    setIsPlaying(false);
    const trace = instrumentAndRunMethod(methodCode, argsInput);
    setFrames(trace);
    setCurrentStep(0);
  };

  useEffect(() => {
    handleRun();
  }, []);

  // Keyboard Shortcuts Hook (Space: Play/Pause, Right: Next, Left: Prev, R: Reset)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setIsPlaying(false);
        setCurrentStep((p) => Math.min(frames.length - 1, p + 1));
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setIsPlaying(false);
        setCurrentStep((p) => Math.max(0, p - 1));
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        setIsPlaying(false);
        setCurrentStep(0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [frames.length]);

  // Automated Playback Timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < frames.length - 1) return prev + 1;
          setIsPlaying(false);
          return prev;
        });
      }, speed);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, frames.length, speed]);

  const frame = frames[currentStep] || { line: 1, code: '', explanation: 'Ready to execute.', scope: {} };
  const codeLines = methodCode.split('\n');
  const arraysInScope = Object.entries(frame.scope || {}).filter(([_, v]) => Array.isArray(v));
  const mapsInScope = Object.entries(frame.scope || {}).filter(([_, v]) => v && v.__isMap);
  const pointerCandidates = Object.entries(frame.scope || {}).filter(
    ([k, v]) => typeof v === 'number' && !k.toLowerCase().includes('sum')
  );

  return (
    <div className="flex flex-col min-h-[calc(100vh-70px)] p-4 sm:p-6 max-w-7xl mx-auto gap-5 select-none pb-28">
      {/* Top Header Card */}
      <div className="w-full bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Terminal size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Algorithm Stepper Studio
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Live Trace
              </span>
            </h1>
            <p className="text-xs text-slate-400">Step-by-step memory inspector, pointer radar, and execution runtime</p>
          </div>
        </div>

        {/* Preset Selector & Run Button */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedPreset}
            onChange={(e) => {
              const key = e.target.value;
              setSelectedPreset(key);
              setMethodCode(METHOD_PRESETS[key].code);
              setArgsInput(METHOD_PRESETS[key].args);
            }}
            className="flex-1 md:w-64 bg-slate-950 border border-slate-700/80 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 cursor-pointer shadow-inner font-medium"
          >
            {Object.entries(METHOD_PRESETS).map(([k, v]) => (
              <option key={k} value={k}>{v.name}</option>
            ))}
          </select>

          <button
            onClick={handleRun}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-lg shadow-indigo-600/25 active:scale-95 shrink-0"
          >
            <Sparkles size={14} /> Run Code
          </button>
        </div>
      </div>

      {/* Input Parameters Bar */}
      <div className="w-full bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 p-3 rounded-xl flex items-center gap-3">
        <span className="text-xs font-mono text-indigo-400 font-semibold px-2 py-1 bg-indigo-950/60 rounded-lg border border-indigo-800/40 shrink-0">
          Arguments:
        </span>
        <input
          type="text"
          value={argsInput}
          onChange={(e) => setArgsInput(e.target.value)}
          placeholder='e.g. "abc", "bba" or [2, 7, 11, 15], 9'
          className="flex-1 bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:border-indigo-500/80 outline-none"
        />
        {returnValue !== null && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-mono">
            <CornerDownLeft size={13} />
            <span>Output: <strong>{JSON.stringify(returnValue)}</strong></span>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="bg-rose-950/40 border border-rose-800/80 text-rose-300 px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-mono shadow-lg animate-fade-in">
          <AlertCircle size={16} className="text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Split IDE Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
        {/* Left: Code Editor (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col bg-slate-900/60 backdrop-blur-md border border-slate-800/90 rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800/80 text-xs font-mono text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
              <span className="ml-2 text-slate-300 font-semibold">Solution.java</span>
            </div>
            <span className="text-[11px] text-indigo-400 font-mono bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-800/30">
              Line {frame.line}
            </span>
          </div>

          <div className="relative flex-1 flex bg-slate-950/90 font-mono text-xs overflow-hidden min-h-[360px]">
            {/* Gutter */}
            <div className="w-10 bg-slate-950 border-r border-slate-800/50 py-3 flex flex-col text-right pr-2.5 select-none text-slate-600 font-mono">
              {codeLines.map((_, i) => (
                <div key={i} className={`leading-6 h-6 ${frame.line === i + 1 ? 'text-indigo-400 font-bold' : ''}`}>
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Editable Area */}
            <textarea
              value={methodCode}
              onChange={(e) => setMethodCode(e.target.value)}
              spellCheck="false"
              className="flex-1 bg-transparent text-indigo-100 p-3 leading-6 h-full resize-none outline-none font-mono text-xs whitespace-pre selection:bg-indigo-600/40"
            />
          </div>

          {/* Active Line Callout Banner */}
          <div className="p-3.5 bg-slate-950 border-t border-slate-800/80 flex items-center gap-3 text-xs">
            <Activity size={16} className="text-indigo-400 shrink-0 animate-pulse" />
            <div className="flex-1 truncate">
              <span className="text-slate-400 font-mono text-[10px] uppercase block font-semibold">Current Statement:</span>
              <span className="text-slate-200 font-mono font-medium truncate">{frame.code || 'Method entry'}</span>
            </div>
          </div>
        </div>

        {/* Right: Visualization & Memory Hub (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col bg-slate-900/60 backdrop-blur-md border border-slate-800/90 rounded-2xl overflow-hidden shadow-2xl">
          {/* Hub Navigation Tabs */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-950/70 border-b border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveRightTab('diagram')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeRightTab === 'diagram' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Box size={14} /> Diagram Canvas
              </button>
              <button
                onClick={() => setActiveRightTab('scope')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeRightTab === 'scope' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers size={14} /> Scope Table
              </button>
              <button
                onClick={() => setActiveRightTab('logs')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeRightTab === 'logs' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ListChecks size={14} /> Execution Log
              </button>
            </div>

            <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
              Step <strong className="text-white">{currentStep + 1}</strong> of {frames.length}
            </span>
          </div>

          <div className="p-5 flex-1 flex flex-col overflow-y-auto">
            {/* Tab 1: Diagram Canvas */}
            {activeRightTab === 'diagram' && (
              <div className="flex flex-col gap-5 flex-1">
                {/* Array Block */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold font-mono text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Box size={15} /> Active Memory Arrays
                  </span>

                  <div className="min-h-[140px] bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 flex flex-col items-center justify-center gap-5 overflow-x-auto shadow-inner">
                    {arraysInScope.length === 0 ? (
                      <span className="text-xs text-slate-600 font-mono">No arrays in active scope.</span>
                    ) : (
                      arraysInScope.map(([arrName, arrValues]) => (
                        <div key={arrName} className="w-full flex flex-col items-center gap-2">
                          <span className="text-xs font-mono font-bold text-indigo-400 self-start">
                            {arrName}:
                          </span>

                          <div className="flex flex-wrap items-end justify-center gap-1.5">
                            {arrValues.slice(0, 26).map((val, idx) => {
                              const activePointers = pointerCandidates.filter(([_, pVal]) => pVal === idx);
                              const hasPointer = activePointers.length > 0;
                              return (
                                <div key={idx} className="flex flex-col items-center gap-1">
                                  <div className="h-4 flex items-center gap-1">
                                    {activePointers.map(([pName]) => (
                                      <span key={pName} className="text-[9px] font-mono bg-amber-500/20 border border-amber-500/40 text-amber-300 px-1 rounded font-bold">
                                        {pName}
                                      </span>
                                    ))}
                                  </div>
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs border transition-all duration-200 ${
                                    hasPointer
                                      ? 'bg-indigo-600 border-indigo-400 text-white scale-105 shadow-md shadow-indigo-600/30'
                                      : 'bg-slate-900 border-slate-800 text-slate-200'
                                  }`}>
                                    {val !== undefined ? String(val) : '0'}
                                  </div>
                                  <span className="text-[8px] font-mono text-slate-500">[{idx}]</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* HashMap Block */}
                {mapsInScope.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Hash size={15} /> Hash Table Memory
                    </span>
                    <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 min-h-[90px] flex items-center justify-start gap-2.5 overflow-x-auto shadow-inner">
                      {mapsInScope[0][1].entries.length === 0 ? (
                        <span className="text-xs text-slate-600 font-mono mx-auto">Map is empty.</span>
                      ) : (
                        mapsInScope[0][1].entries.map(([key, val]) => (
                          <div key={key} className="flex flex-col items-center border border-slate-800 bg-slate-900 rounded-lg p-2 min-w-[64px]">
                            <span className="text-[9px] font-mono text-slate-400">Key: <strong className="text-emerald-300">{String(key)}</strong></span>
                            <span className="text-[9px] font-mono text-slate-400">Val: <strong className="text-indigo-300">{String(val)}</strong></span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Scope Matrix */}
            {activeRightTab === 'scope' && (
              <div className="overflow-x-auto bg-slate-950/80 rounded-xl border border-slate-800 shadow-inner flex-1">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60">
                      <th className="py-2.5 px-4">Identifier</th>
                      <th className="py-2.5 px-4">Live Value</th>
                      <th className="py-2.5 px-4">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(frame.scope || {}).map(([k, v]) => (
                      <tr key={k} className="border-b border-slate-900/80 hover:bg-slate-900/30 transition">
                        <td className="py-2.5 px-4 text-indigo-400 font-semibold">{k}</td>
                        <td className="py-2.5 px-4 text-emerald-300">
                          {v && v.__isMap ? `Map(${v.entries.length})` : typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v)}
                        </td>
                        <td className="py-2.5 px-4 text-slate-500">
                          {v && v.__isMap ? 'Map' : Array.isArray(v) ? 'Array' : typeof v}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 3: Execution Log */}
            {activeRightTab === 'logs' && (
              <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-3 font-mono text-xs flex-1 overflow-y-auto max-h-[300px] flex flex-col gap-1.5 shadow-inner">
                {frames.slice(0, currentStep + 1).map((f, i) => (
                  <div key={i} className={`p-1.5 rounded flex items-center justify-between ${
                    i === currentStep ? 'bg-indigo-950/60 border border-indigo-800/40 text-indigo-200' : 'text-slate-500'
                  }`}>
                    <span>Step {i + 1}: Line {f.line}</span>
                    <span className="truncate max-w-[200px] text-[11px]">{f.code}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Glassmorphic Playback Bar */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[92%] max-w-4xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 shadow-2xl shadow-black/80 rounded-2xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-4 z-40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={frames.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-indigo-600/30 cursor-pointer active:scale-95"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
            {isPlaying ? 'Pause' : 'Auto Play'}
          </button>

          <button
            onClick={() => { setIsPlaying(false); setCurrentStep((p) => Math.max(0, p - 1)); }}
            disabled={currentStep <= 0}
            className="p-2 bg-slate-800/90 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-medium rounded-xl transition cursor-pointer active:scale-95"
            title="Previous Step (Left Arrow)"
          >
            <SkipBack size={15} />
          </button>

          <button
            onClick={() => { setIsPlaying(false); setCurrentStep((p) => Math.min(frames.length - 1, p + 1)); }}
            disabled={currentStep >= frames.length - 1}
            className="p-2 bg-slate-800/90 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-medium rounded-xl transition cursor-pointer active:scale-95"
            title="Next Step (Right Arrow)"
          >
            <SkipForward size={15} />
          </button>

          <button
            onClick={() => { setIsPlaying(false); setCurrentStep(0); }}
            className="p-2 bg-slate-800/90 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition cursor-pointer active:scale-95"
            title="Reset (R)"
          >
            <RotateCcw size={15} />
          </button>
        </div>

        {/* Scrubber & Delay Controls */}
        <div className="flex items-center gap-6 text-xs text-slate-300">
          <label className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-slate-400">Step:</span>
            <input
              type="range"
              min="0"
              max={Math.max(0, frames.length - 1)}
              value={currentStep}
              onChange={(e) => { setIsPlaying(false); setCurrentStep(Number(e.target.value)); }}
              className="accent-indigo-500 cursor-pointer w-28 sm:w-44"
            />
          </label>

          <label className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-slate-400">{speed}ms</span>
            <input
              type="range"
              min="150"
              max="1200"
              step="50"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="accent-indigo-500 cursor-pointer w-16 sm:w-20"
            />
          </label>

          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
            <Keyboard size={13} />
            <span>Space / Arrows</span>
          </div>
        </div>
      </div>
    </div>
  );
}