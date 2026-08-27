import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Shield, Sparkles, MapPin, Flag } from 'lucide-react';

const ROWS = 15;
const COLS = 30;
const START_ROW = 7;
const START_COL = 4;
const FINISH_ROW = 7;
const FINISH_COL = 25;

export default function PathfindingVisualizer() {
  const [grid, setGrid] = useState([]);
  const [isMousePressed, setIsMousePressed] = useState(false);
  const [selectedAlgo, setSelectedAlgo] = useState('bfs');
  const [isRunning, setIsRunning] = useState(false);
  const [statusText, setStatusText] = useState('Draw walls by clicking/dragging, then run the algorithm.');

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Initialize a fresh grid
  const createInitialGrid = () => {
    const newGrid = [];
    for (let row = 0; row < ROWS; row++) {
      const currentRow = [];
      for (let col = 0; col < COLS; col++) {
        currentRow.push({
          row,
          col,
          isStart: row === START_ROW && col === START_COL,
          isFinish: row === FINISH_ROW && col === FINISH_COL,
          isWall: false,
          isVisited: false,
          isPath: false,
          distance: Infinity,
          previousNode: null,
        });
      }
      newGrid.push(currentRow);
    }
    return newGrid;
  };

  useEffect(() => {
    setGrid(createInitialGrid());
  }, []);

  // Toggle walls on mouse drag
  const handleMouseDown = (row, col) => {
    if (isRunning) return;
    if ((row === START_ROW && col === START_COL) || (row === FINISH_ROW && col === FINISH_COL)) return;
    
    setIsMousePressed(true);
    toggleWall(row, col);
  };

  const handleMouseEnter = (row, col) => {
    if (!isMousePressed || isRunning) return;
    if ((row === START_ROW && col === START_COL) || (row === FINISH_ROW && col === FINISH_COL)) return;
    
    toggleWall(row, col);
  };

  const handleMouseUp = () => {
    setIsMousePressed(false);
  };

  const toggleWall = (row, col) => {
    setGrid((prevGrid) => {
      const updated = prevGrid.map((r) => [...r]);
      const target = { ...updated[row][col] };
      target.isWall = !target.isWall;
      updated[row][col] = target;
      return updated;
    });
  };

  // Generate a random maze of walls
  const generateRandomMaze = () => {
    if (isRunning) return;
    const freshGrid = createInitialGrid();
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!freshGrid[r][c].isStart && !freshGrid[r][c].isFinish) {
          if (Math.random() < 0.28) {
            freshGrid[r][c].isWall = true;
          }
        }
      }
    }
    setGrid(freshGrid);
    setStatusText('Generated random maze walls.');
  };

  // Get neighboring cells (Up, Right, Down, Left)
  const getNeighbors = (node, currentGrid) => {
    const neighbors = [];
    const { row, col } = node;
    const directions = [
      [-1, 0], // Up
      [0, 1],  // Right
      [1, 0],  // Down
      [0, -1], // Left
    ];

    for (const [dr, dc] of directions) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
        neighbors.push(currentGrid[nr][nc]);
      }
    }
    return neighbors;
  };

  // Backtrack shortest path from target to start
  const getNodesInShortestPathOrder = (finishNode) => {
    const nodesInPath = [];
    let current = finishNode;
    while (current !== null) {
      nodesInPath.unshift(current);
      current = current.previousNode;
    }
    return nodesInPath;
  };

  // Pathfinding Engine
  const runPathfinding = async () => {
    setIsRunning(true);
    setStatusText(`Running ${selectedAlgo.toUpperCase()} algorithm...`);

    // Reset past visit/path states while preserving walls
    const workingGrid = grid.map((r) =>
      r.map((cell) => ({
        ...cell,
        isVisited: false,
        isPath: false,
        distance: Infinity,
        previousNode: null,
      }))
    );
    setGrid(workingGrid);

    const startNode = workingGrid[START_ROW][START_COL];
    const finishNode = workingGrid[FINISH_ROW][FINISH_COL];
    startNode.distance = 0;

    const visitedNodesInOrder = [];
    let foundFinish = false;

    if (selectedAlgo === 'bfs' || selectedAlgo === 'dijkstra') {
      // Queue-based BFS
      const queue = [startNode];
      const visitedSet = new Set([`${startNode.row},${startNode.col}`]);

      while (queue.length > 0) {
        const current = queue.shift();
        visitedNodesInOrder.push(current);

        if (current.row === finishNode.row && current.col === finishNode.col) {
          foundFinish = true;
          break;
        }

        const neighbors = getNeighbors(current, workingGrid);
        for (const neighbor of neighbors) {
          const key = `${neighbor.row},${neighbor.col}`;
          if (!visitedSet.has(key) && !neighbor.isWall) {
            visitedSet.add(key);
            neighbor.distance = current.distance + 1;
            neighbor.previousNode = current;
            queue.push(neighbor);
          }
        }
      }
    } else if (selectedAlgo === 'dfs') {
      // Stack-based DFS
      const stack = [startNode];
      const visitedSet = new Set();

      while (stack.length > 0) {
        const current = stack.pop();
        const key = `${current.row},${current.col}`;

        if (visitedSet.has(key)) continue;
        visitedSet.add(key);
        visitedNodesInOrder.push(current);

        if (current.row === finishNode.row && current.col === finishNode.col) {
          foundFinish = true;
          break;
        }

        const neighbors = getNeighbors(current, workingGrid);
        for (const neighbor of neighbors) {
          const nKey = `${neighbor.row},${neighbor.col}`;
          if (!visitedSet.has(nKey) && !neighbor.isWall) {
            neighbor.previousNode = current;
            stack.push(neighbor);
          }
        }
      }
    }

    // Animate Search Wave
    for (let i = 0; i < visitedNodesInOrder.length; i++) {
      const node = visitedNodesInOrder[i];
      if (!node.isStart && !node.isFinish) {
        node.isVisited = true;
      }
      if (i % 2 === 0) {
        setGrid(workingGrid.map((row) => [...row]));
        await sleep(15);
      }
    }

    // Animate Shortest Path Backtracking
    if (foundFinish) {
      const pathNodes = getNodesInShortestPathOrder(finishNode);
      setStatusText(`Target found! Shortest path length: ${pathNodes.length - 1} steps.`);
      for (const node of pathNodes) {
        if (!node.isStart && !node.isFinish) {
          node.isPath = true;
        }
        setGrid(workingGrid.map((row) => [...row]));
        await sleep(25);
      }
    } else {
      setStatusText('No valid path exists to the destination node.');
    }

    setIsRunning(false);
  };

  const clearBoard = () => {
    if (isRunning) return;
    setGrid(createInitialGrid());
    setStatusText('Board reset. Ready for operations.');
  };

  const clearPathOnly = () => {
    if (isRunning) return;
    setGrid((prev) =>
      prev.map((row) =>
        row.map((cell) => ({
          ...cell,
          isVisited: false,
          isPath: false,
          previousNode: null,
        }))
      )
    );
    setStatusText('Cleared search path. Walls preserved.');
  };

  return (
    <div
      className="flex flex-col items-center justify-between min-h-[calc(100vh-80px)] p-6 max-w-6xl mx-auto select-none"
      onMouseUp={handleMouseUp}
    >
      {/* Header */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold text-indigo-400">2D Grid Pathfinding Visualizer</h2>
          <p className="text-xs text-slate-400">
            {selectedAlgo === 'dfs' ? 'DFS explores deeply (no shortest path guarantee)' : 'Guarantees the shortest path on unweighted grids'}
          </p>
        </div>

        {/* Algorithm Select */}
        <select
          value={selectedAlgo}
          disabled={isRunning}
          onChange={(e) => setSelectedAlgo(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-50"
        >
          <option value="bfs">Breadth-First Search (BFS)</option>
          <option value="dijkstra">Dijkstra's Algorithm</option>
          <option value="dfs">Depth-First Search (DFS)</option>
        </select>
      </div>

      {/* Status Bar */}
      <div className="w-full mt-4 bg-slate-900/60 border border-slate-800 py-2.5 px-4 rounded-lg text-center font-mono text-xs text-indigo-300">
        {statusText}
      </div>

      {/* 2D Grid Canvas */}
      <main className="w-full flex items-center justify-center p-4 my-4 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto shadow-inner">
        <div
          className="grid gap-[1.5px] bg-slate-950 p-2 rounded-lg border border-slate-800 shadow-2xl"
          style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        >
          {grid.map((row, rIdx) =>
            row.map((cell, cIdx) => {
              let cellBg = 'bg-slate-900/80 hover:bg-slate-800/80';

              if (cell.isWall) cellBg = 'bg-slate-600 shadow-sm';
              else if (cell.isPath) cellBg = 'bg-amber-400 shadow-amber-400/50 scale-95 shadow-md';
              else if (cell.isVisited) cellBg = 'bg-indigo-600/70 shadow-indigo-600/30';
              else if (cell.isStart) cellBg = 'bg-emerald-600 shadow-emerald-500/40';
              else if (cell.isFinish) cellBg = 'bg-rose-600 shadow-rose-500/40';

              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  onMouseDown={() => handleMouseDown(rIdx, cIdx)}
                  onMouseEnter={() => handleMouseEnter(rIdx, cIdx)}
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-[3px] flex items-center justify-center cursor-pointer transition-all duration-150 ${cellBg}`}
                >
                  {cell.isStart && <MapPin size={14} className="text-white" />}
                  {cell.isFinish && <Flag size={14} className="text-white" />}
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 mb-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-emerald-600 inline-block"></span> Start Node</span>
        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-rose-600 inline-block"></span> Target Node</span>
        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-slate-600 inline-block"></span> Wall / Obstacle</span>
        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-indigo-600 inline-block"></span> Visited Node</span>
        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-amber-400 inline-block"></span> Shortest Path</span>
      </div>

      {/* Control Panel */}
      <footer className="w-full bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={runPathfinding}
            disabled={isRunning}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-semibold rounded-lg transition shadow-md shadow-indigo-600/20"
          >
            <Play size={14} fill="currentColor" /> Visualize {selectedAlgo.toUpperCase()}
          </button>

          <button
            onClick={generateRandomMaze}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-medium rounded-lg transition text-slate-200"
          >
            <Sparkles size={14} /> Random Walls
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearPathOnly}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-medium rounded-lg transition text-slate-200"
          >
            Clear Path
          </button>

          <button
            onClick={clearBoard}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 text-xs font-medium rounded-lg transition disabled:opacity-50"
          >
            <RotateCcw size={14} /> Reset Grid
          </button>
        </div>
      </footer>
    </div>
  );
}