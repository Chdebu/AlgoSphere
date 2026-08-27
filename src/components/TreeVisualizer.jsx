import React, { useState } from 'react';
import { Plus, Search, RotateCcw, Play } from 'lucide-react';

class TreeNode {
  constructor(val, id) {
    this.val = val;
    this.id = id;
    this.left = null;
    this.right = null;
    this.x = 0;
    this.y = 0;
  }
}

export default function TreeVisualizer() {
  const [root, setRoot] = useState(null);
  const [valInput, setValInput] = useState('');
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [traversalResult, setTraversalResult] = useState([]);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState('Insert numbers to construct the Binary Search Tree.');

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Compute (x, y) coordinates recursively for rendering
  const calculateCoordinates = (node, x = 380, y = 45, horizontalSpacing = 160) => {
    if (!node) return;
    node.x = x;
    node.y = y;
    if (node.left) calculateCoordinates(node.left, x - horizontalSpacing, y + 65, horizontalSpacing / 2);
    if (node.right) calculateCoordinates(node.right, x + horizontalSpacing, y + 65, horizontalSpacing / 2);
  };

  // Clone tree to trigger React state re-render
  const cloneTree = (node) => {
    if (!node) return null;
    const newNode = new TreeNode(node.val, node.id);
    newNode.x = node.x;
    newNode.y = node.y;
    newNode.left = cloneTree(node.left);
    newNode.right = cloneTree(node.right);
    return newNode;
  };

  // Insert Value with animated step-by-step path
  const handleInsert = async () => {
    if (valInput.trim() === '' || isBusy) return;
    const val = Number(valInput);
    setValInput('');
    setIsBusy(true);

    if (!root) {
      const newRoot = new TreeNode(val, 'node-root');
      calculateCoordinates(newRoot);
      setRoot(newRoot);
      setMessage(`Set ${val} as root node.`);
      setIsBusy(false);
      return;
    }

    const newRoot = cloneTree(root);
    let curr = newRoot;
    const newId = `node-${Date.now()}`;

    while (curr) {
      setActiveNodeId(curr.id);
      setMessage(`Comparing ${val} with node ${curr.val}...`);
      await sleep(500);

      if (val < curr.val) {
        if (!curr.left) {
          curr.left = new TreeNode(val, newId);
          setMessage(`Inserted ${val} to the left of ${curr.val}.`);
          break;
        }
        curr = curr.left;
      } else if (val > curr.val) {
        if (!curr.right) {
          curr.right = new TreeNode(val, newId);
          setMessage(`Inserted ${val} to the right of ${curr.val}.`);
          break;
        }
        curr = curr.right;
      } else {
        setMessage(`Value ${val} already exists in the BST.`);
        break;
      }
    }

    calculateCoordinates(newRoot);
    setRoot(newRoot);
    setActiveNodeId(null);
    setIsBusy(false);
  };

  // Search Node
  const handleSearch = async () => {
    if (valInput.trim() === '' || isBusy || !root) return;
    const val = Number(valInput);
    setIsBusy(true);
    let curr = root;
    let found = false;

    while (curr) {
      setActiveNodeId(curr.id);
      setMessage(`Checking node ${curr.val}...`);
      await sleep(500);

      if (val === curr.val) {
        setMessage(`Found node ${val} in the BST!`);
        found = true;
        break;
      } else if (val < curr.val) {
        curr = curr.left;
      } else {
        curr = curr.right;
      }
    }

    if (!found) {
      setMessage(`Value ${val} is not present in the tree.`);
      setActiveNodeId(null);
    }
    setIsBusy(false);
  };

  // Traversal Animations
  const runTraversal = async (type) => {
    if (!root || isBusy) return;
    setIsBusy(true);
    setTraversalResult([]);
    const sequence = [];

    // Helper functions
    const inorder = (node) => {
      if (!node) return;
      inorder(node.left);
      sequence.push(node);
      inorder(node.right);
    };

    const preorder = (node) => {
      if (!node) return;
      sequence.push(node);
      preorder(node.left);
      preorder(node.right);
    };

    const postorder = (node) => {
      if (!node) return;
      postorder(node.left);
      postorder(node.right);
      sequence.push(node);
    };

    const bfs = () => {
      const q = [root];
      while (q.length > 0) {
        const node = q.shift();
        sequence.push(node);
        if (node.left) q.push(node.left);
        if (node.right) q.push(node.right);
      }
    };

    if (type === 'inorder') inorder(root);
    else if (type === 'preorder') preorder(root);
    else if (type === 'postorder') postorder(root);
    else if (type === 'bfs') bfs();

    const outputValues = [];
    for (const node of sequence) {
      setActiveNodeId(node.id);
      outputValues.push(node.val);
      setTraversalResult([...outputValues]);
      await sleep(450);
    }

    setActiveNodeId(null);
    setIsBusy(false);
    setMessage(`Completed ${type.toUpperCase()} traversal.`);
  };

  // Tree SVG Flattening Helpers
  const collectEdgesAndNodes = (node, nodes = [], edges = []) => {
    if (!node) return { nodes, edges };
    nodes.push(node);
    if (node.left) {
      edges.push({ from: node, to: node.left });
      collectEdgesAndNodes(node.left, nodes, edges);
    }
    if (node.right) {
      edges.push({ from: node, to: node.right });
      collectEdgesAndNodes(node.right, nodes, edges);
    }
    return { nodes, edges };
  };

  const { nodes: treeNodes, edges: treeEdges } = collectEdgesAndNodes(root);

  const resetTree = () => {
    setRoot(null);
    setActiveNodeId(null);
    setTraversalResult([]);
    setMessage('Tree cleared. Start inserting nodes.');
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-[calc(100vh-80px)] p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="w-full flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-indigo-400">Binary Search Tree Visualizer</h2>
          <p className="text-xs text-slate-400">Left subtree &lt; Root &lt; Right subtree</p>
        </div>

        {/* Traversal Buttons */}
        <div className="flex flex-wrap gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-lg">
          <button
            onClick={() => runTraversal('inorder')}
            disabled={isBusy || !root}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-medium rounded text-slate-200 transition"
          >
            In-order (Sorted)
          </button>
          <button
            onClick={() => runTraversal('preorder')}
            disabled={isBusy || !root}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-medium rounded text-slate-200 transition"
          >
            Pre-order
          </button>
          <button
            onClick={() => runTraversal('postorder')}
            disabled={isBusy || !root}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-medium rounded text-slate-200 transition"
          >
            Post-order
          </button>
          <button
            onClick={() => runTraversal('bfs')}
            disabled={isBusy || !root}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-medium rounded text-slate-200 transition"
          >
            Level-order (BFS)
          </button>
        </div>
      </div>

      {/* Message / Traversal Output */}
      <div className="w-full mt-4 flex flex-col gap-2">
        <div className="bg-slate-900/60 border border-slate-800 py-2.5 px-4 rounded-lg text-center font-mono text-sm text-indigo-300">
          {message}
        </div>
        {traversalResult.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 py-2 px-4 rounded-lg text-center font-mono text-xs text-emerald-400">
            Output Sequence: [ {traversalResult.join(' → ')} ]
          </div>
        )}
      </div>

      {/* Visual Canvas (SVG Tree) */}
      <main className="w-full h-[380px] bg-slate-900 border border-slate-800 rounded-xl my-6 shadow-inner relative overflow-auto flex items-center justify-center">
        {!root ? (
          <span className="text-xs text-slate-600 font-mono">Tree is Empty</span>
        ) : (
          <svg className="w-[760px] h-[340px]">
            {/* Render connecting edges */}
            {treeEdges.map((edge, idx) => (
              <line
                key={idx}
                x1={edge.from.x}
                y1={edge.from.y}
                x2={edge.to.x}
                y2={edge.to.y}
                stroke="#475569"
                strokeWidth="2.5"
              />
            ))}

            {/* Render circle nodes */}
            {treeNodes.map((node) => {
              const isActive = activeNodeId === node.id;
              return (
                <g key={node.id} className="transition-all duration-300">
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="20"
                    className={`transition-all duration-200 ${
                      isActive
                        ? 'fill-rose-500 stroke-rose-300 stroke-2 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                        : 'fill-indigo-600 stroke-indigo-400/50 stroke-2'
                    }`}
                  />
                  <text
                    x={node.x}
                    y={node.y + 4.5}
                    textAnchor="middle"
                    fill="white"
                    fontSize="12"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {node.val}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </main>

      {/* Control Panel */}
      <footer className="w-full bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Value"
            value={valInput}
            disabled={isBusy}
            onChange={(e) => setValInput(e.target.value)}
            className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500 font-mono disabled:opacity-50"
          />

          <button
            onClick={handleInsert}
            disabled={isBusy}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-semibold rounded-lg transition shadow-md shadow-indigo-600/20"
          >
            <Plus size={15} /> Insert
          </button>

          <button
            onClick={handleSearch}
            disabled={isBusy || !root}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-medium rounded-lg transition text-slate-200"
          >
            <Search size={15} /> Search
          </button>
        </div>

        <button
          onClick={resetTree}
          disabled={isBusy || !root}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 text-xs font-medium rounded-lg transition disabled:opacity-40"
        >
          <RotateCcw size={15} /> Clear Tree
        </button>
      </footer>
    </div>
  );
}