export const ALGO_SNIPPETS = {
  sorting: {
    title: 'Sorting Algorithms',
    bubble: {
      name: 'Bubble Sort',
      time: 'O(n²)',
      space: 'O(1)',
      intuition: 'Repeatedly step through the list, compare adjacent pairs, and swap them if out of order.',
      javascript: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
      python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`,
      cpp: `void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
            }
        }
    }
}`,
      java: `public class BubbleSort {
    public static void bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
    }
}`
    },
    merge: {
      name: 'Merge Sort',
      time: 'O(n log n)',
      space: 'O(n)',
      intuition: 'Divide the array in half recursively, sort each half, and merge them back together.',
      javascript: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left, right) {
  const res = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) res.push(left[i++]);
    else res.push(right[j++]);
  }
  return [...res, ...left.slice(i), ...right.slice(j)];
}`,
      python: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    res, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            res.append(left[i])
            i += 1
        else:
            res.append(right[j])
            j += 1
    res.extend(left[i:])
    res.extend(right[j:])
    return res`,
      cpp: `void merge(vector<int>& arr, int l, int m, int r) {
    vector<int> left(arr.begin() + l, arr.begin() + m + 1);
    vector<int> right(arr.begin() + m + 1, arr.begin() + r + 1);
    int i = 0, j = 0, k = l;
    while (i < left.size() && j < right.size()) {
        if (left[i] <= right[j]) arr[k++] = left[i++];
        else arr[k++] = right[j++];
    }
    while (i < left.size()) arr[k++] = left[i++];
    while (j < right.size()) arr[k++] = right[j++];
}`,
      java: `import java.util.Arrays;

public class MergeSort {
    public static void mergeSort(int[] arr, int l, int r) {
        if (l < r) {
            int m = l + (r - l) / 2;
            mergeSort(arr, l, m);
            mergeSort(arr, m + 1, r);
            merge(arr, l, m, r);
        }
    }

    private static void merge(int[] arr, int l, int m, int r) {
        int[] left = Arrays.copyOfRange(arr, l, m + 1);
        int[] right = Arrays.copyOfRange(arr, m + 1, r + 1);
        int i = 0, j = 0, k = l;

        while (i < left.length && j < right.length) {
            if (left[i] <= right[j]) arr[k++] = left[i++];
            else arr[k++] = right[j++];
        }
        while (i < left.length) arr[k++] = left[i++];
        while (j < right.length) arr[k++] = right[j++];
    }
}`
    }
  },
  'stack-queue': {
    title: 'Stack Operations',
    stack: {
      name: 'Stack (LIFO)',
      time: 'Push: O(1), Pop: O(1), Peek: O(1)',
      space: 'O(n)',
      intuition: 'Last-In, First-Out collection. Elements enter and leave from the top only.',
      javascript: `class Stack {
  constructor() { this.items = []; }
  push(elem) { this.items.push(elem); }
  pop() { return this.items.pop(); }
  peek() { return this.items[this.items.length - 1]; }
  isEmpty() { return this.items.length === 0; }
}`,
      python: `class Stack:
    def __init__(self):
        self.items = []
    def push(self, item):
        self.items.append(item)
    def pop(self):
        return self.items.pop() if not self.is_empty() else None
    def peek(self):
        return self.items[-1] if not self.is_empty() else None
    def is_empty(self):
        return len(self.items) == 0`,
      cpp: `template <typename T>
class Stack {
private:
    vector<T> data;
public:
    void push(T val) { data.push_back(val); }
    void pop() { if (!empty()) data.pop_back(); }
    T top() { return data.back(); }
    bool empty() { return data.empty(); }
};`,
      java: `import java.util.ArrayList;

public class CustomStack<T> {
    private ArrayList<T> list = new ArrayList<>();

    public void push(T item) { list.add(item); }
    public T pop() {
        if (isEmpty()) return null;
        return list.remove(list.size() - 1);
    }
    public T peek() {
        if (isEmpty()) return null;
        return list.get(list.size() - 1);
    }
    public boolean isEmpty() { return list.isEmpty(); }
}`
    }
  },
  'tree': {
    title: 'Binary Search Tree',
    bst: {
      name: 'BST Insert & Traversal',
      time: 'Search/Insert: O(h) or O(log n)',
      space: 'O(h)',
      intuition: 'Values smaller than root go left; values greater than root go right.',
      javascript: `class Node {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

function insert(root, val) {
  if (!root) return new Node(val);
  if (val < root.val) root.left = insert(root.left, val);
  else if (val > root.val) root.right = insert(root.right, val);
  return root;
}`,
      python: `class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def insert(root, val):
    if not root:
        return Node(val)
    if val < root.val:
        root.left = insert(root.left, val)
    elif val > root.val:
        root.right = insert(root.right, val)
    return root`,
      cpp: `struct Node {
    int val;
    Node* left = nullptr;
    Node* right = nullptr;
    Node(int v) : val(v) {}
};

Node* insert(Node* root, int val) {
    if (!root) return new Node(val);
    if (val < root->val) root->left = insert(root->left, val);
    else if (val > root->val) root->right = insert(root->right, val);
    return root;
}`,
      java: `class Node {
    int val;
    Node left, right;
    Node(int val) { this.val = val; }
}

public class BST {
    public static Node insert(Node root, int val) {
        if (root == null) return new Node(val);
        if (val < root.val) root.left = insert(root.left, val);
        else if (val > root.val) root.right = insert(root.right, val);
        return root;
    }

    public static void inOrder(Node root) {
        if (root == null) return;
        inOrder(root.left);
        System.out.println(root.val);
        inOrder(root.right);
    }
}`
    }
  },
  pathfinding: {
    title: '2D Grid Pathfinding (BFS)',
    bfs: {
      name: 'Breadth-First Search',
      time: 'O(V + E) or O(R × C)',
      space: 'O(V)',
      intuition: 'Explores radially outward layer by layer to guarantee the shortest path on unweighted grids.',
      javascript: `function bfs(grid, start, target) {
  const queue = [start];
  const visited = new Set([\`\${start.r},\${start.c}\`]);
  const parent = {};

  while (queue.length > 0) {
    const { r, c } = queue.shift();
    if (r === target.r && c === target.c) return reconstructPath(parent, target);

    for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      const nr = r + dr, nc = c + dc;
      const key = \`\${nr},\${nc}\`;
      if (isValid(grid, nr, nc) && !visited.has(key)) {
        visited.add(key);
        parent[key] = { r, c };
        queue.push({ r: nr, c: nc });
      }
    }
  }
  return [];
}`,
      python: `from collections import deque

def bfs(grid, start, target):
    queue = deque([start])
    visited = {start}
    parent = {}

    while queue:
        r, c = queue.popleft()
        if (r, c) == target:
            return reconstruct_path(parent, target)
        
        for dr, dc in [(-1,0), (1,0), (0,-1), (0,1)]:
            nr, nc = r + dr, c + dc
            if is_valid(grid, nr, nc) and (nr, nc) not in visited:
                visited.add((nr, nc))
                parent[(nr, nc)] = (r, c)
                queue.append((nr, nc))
    return []`,
      cpp: `vector<pair<int,int>> bfs(vector<vector<int>>& grid, pair<int,int> start, pair<int,int> target) {
    queue<pair<int,int>> q;
    q.push(start);
    set<pair<int,int>> visited = {start};
    
    while (!q.empty()) {
        auto [r, c] = q.front(); q.pop();
        if (r == target.first && c == target.second) break;
        // Explore 4 cardinal directions...
    }
    return {};
}`,
      java: `import java.util.*;

public class GridBFS {
    static class Point {
        int r, c;
        Point(int r, int c) { this.r = r; this.c = c; }
    }

    public static List<Point> bfs(int[][] grid, Point start, Point target) {
        Queue<Point> queue = new LinkedList<>();
        boolean[][] visited = new booleangrid.length.length];
        queue.add(start);
        visited[start.r][start.c] = true;

        int[][] dirs = {{-1,0}, {1,0}, {0,-1}, {0,1}};
        while (!queue.isEmpty()) {
            Point curr = queue.poll();
            if (curr.r == target.r && curr.c == target.c) break;

            for (int[] d : dirs) {
                int nr = curr.r + d[0], nc = curr.c + d[1];
                if (nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[0].length
                    && grid[nr][nc] != 1 && !visited[nr][nc]) {
                    visited[nr][nc] = true;
                    queue.add(new Point(nr, nc));
                }
            }
        }
        return new ArrayList<>();
    }
}`
    }
  }
};