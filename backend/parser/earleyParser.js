/**
 * earleyParser.js
 * 
 * Implementation of the Earley parsing algorithm for arbitrary CFGs.
 * 
 * The Earley parser works in three stages at each input position:
 *   1. PREDICTION — When the dot is before a non-terminal, add all productions
 *      for that non-terminal to the current chart set.
 *   2. SCANNING — When the dot is before a terminal that matches the current
 *      input token, advance the dot and add to the next chart set.
 *   3. COMPLETION — When the dot is at the end of a production (the rule is
 *      fully recognized), go back to where this rule started and advance
 *      the dot in all parent items.
 * 
 * After parsing, we extract all parse trees from the chart. If more than one
 * tree exists, the grammar is ambiguous for the given input.
 * 
 * Earley Items have the form: [head → α • β, origin]
 *   - head: the non-terminal being expanded
 *   - body: the full RHS of the production
 *   - dot: position in the body (how far we've parsed)
 *   - origin: the chart position where this item started
 *   - backPointers: tracks how each symbol before the dot was derived
 */

const MAX_PARSE_TREES = 10;       // Cap tree extraction to prevent explosion
const MAX_CHART_SIZE = 50000;     // Safety limit for chart entries

class ParseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ParseError';
  }
}

/**
 * An Earley item: represents a partially parsed production.
 */
class EarleyItem {
  constructor(head, body, dot, origin, prodIndex) {
    this.head = head;         // Non-terminal (LHS)
    this.body = body;         // Array of symbols (RHS)
    this.dot = dot;           // How far we've parsed in the body
    this.origin = origin;     // Chart set where this item started
    this.prodIndex = prodIndex; // Index of the production in the grammar
    this.completedBy = [];    // For completed non-terminals: list of completing items
    this.scannedToken = null; // For scanned terminals: the token
    // backPointers[i] = list of ways symbol body[i] was derived
    // Each entry is either { type: 'scan', token } or { type: 'complete', item }
    this.backPointers = new Array(body.length).fill(null).map(() => []);
  }

  /**
   * Check if the dot is at the end (item is complete).
   */
  isComplete() {
    return this.dot >= this.body.length;
  }

  /**
   * Get the symbol immediately after the dot.
   */
  nextSymbol() {
    if (this.isComplete()) return null;
    return this.body[this.dot];
  }

  /**
   * Create a string key for deduplication (without backpointers).
   */
  key() {
    return `${this.head}->${this.body.join(' ')}@${this.dot}:${this.origin}`;
  }
}

/**
 * Run the Earley parser on the given grammar and token list.
 * @param {object} grammar - Parsed grammar from grammarParser
 * @param {string[]} tokens - Tokenized input string
 * @returns {object} { success, parseTrees, message }
 */
function earleyParse(grammar, tokens) {
  const { productions, startSymbol, nonTerminals } = grammar;
  const nonTerminalSet = new Set(nonTerminals);
  const n = tokens.length;

  // Chart: array of sets (one per input position + 1)
  // chart[i] contains items relevant to position i
  const chart = new Array(n + 1).fill(null).map(() => []);
  const chartKeys = new Array(n + 1).fill(null).map(() => new Set());

  // Helper to add item to a chart set (with dedup)
  function addToChart(item, setIndex) {
    const key = item.key();
    if (chartKeys[setIndex].has(key)) {
      // Item already exists — but merge backpointers for ambiguity tracking
      const existing = chart[setIndex].find(it => it.key() === key);
      if (existing && item.dot > 0) {
        // Merge backpointers for the symbol just before the dot
        const bpIndex = item.dot - 1;
        for (const bp of item.backPointers[bpIndex]) {
          const isDuplicate = existing.backPointers[bpIndex].some(ebp => {
            if (bp.type === 'scan' && ebp.type === 'scan') return bp.token === ebp.token;
            if (bp.type === 'complete' && ebp.type === 'complete') return ebp.item.key() === bp.item.key();
            return false;
          });
          if (!isDuplicate) {
            existing.backPointers[bpIndex].push(bp);
          }
        }
      }
      return false;
    }
    if (chart[setIndex].length >= MAX_CHART_SIZE) {
      throw new ParseError(
        'Grammar is too complex or may have issues causing excessive parse states. ' +
        'Try simplifying the grammar or shortening the input string.'
      );
    }
    chartKeys[setIndex].add(key);
    chart[setIndex].push(item);
    return true;
  }

  // === INITIALIZATION ===
  // Add all productions for the start symbol to chart[0]
  for (let p = 0; p < productions.length; p++) {
    if (productions[p].head === startSymbol) {
      addToChart(new EarleyItem(startSymbol, productions[p].body, 0, 0, p), 0);
    }
  }

  // === MAIN LOOP ===
  for (let i = 0; i <= n; i++) {
    let j = 0;
    // Process items in chart[i] — new items may be added during iteration
    while (j < chart[i].length) {
      const item = chart[i][j];

      if (item.isComplete()) {
        // === COMPLETION ===
        complete(item, i, chart, nonTerminalSet, addToChart);
      } else if (nonTerminalSet.has(item.nextSymbol())) {
        // === PREDICTION ===
        predict(item, i, productions, addToChart);
      } else if (i < n) {
        // === SCANNING ===
        scan(item, i, tokens, addToChart);
      }
      j++;
    }
  }

  // === CHECK FOR SUCCESS ===
  // Look for completed start symbol items spanning the full input in chart[n]
  const completedItems = chart[n].filter(
    item => item.head === startSymbol && item.isComplete() && item.origin === 0
  );

  if (completedItems.length === 0) {
    return {
      success: false,
      parseTrees: [],
      message: `The string "${tokens.join(' ')}" cannot be derived from the grammar.`,
    };
  }

  // === EXTRACT PARSE TREES ===
  const trees = [];
  for (const item of completedItems) {
    extractTrees(item, chart, tokens, trees, 0);
    if (trees.length >= MAX_PARSE_TREES) break;
  }

  // Deduplicate trees by their JSON representation
  const uniqueTrees = deduplicateTrees(trees);

  return {
    success: true,
    parseTrees: uniqueTrees.slice(0, MAX_PARSE_TREES),
    message: uniqueTrees.length > 1
      ? `Found ${Math.min(uniqueTrees.length, MAX_PARSE_TREES)} distinct parse trees.`
      : 'Found exactly 1 parse tree.',
  };
}

/**
 * PREDICTION: For an item [A → α • B β, j] where B is a non-terminal,
 * add [B → • γ, i] for all productions B → γ.
 */
function predict(item, chartIndex, productions, addToChart) {
  const nextSym = item.nextSymbol();
  for (let p = 0; p < productions.length; p++) {
    if (productions[p].head === nextSym) {
      addToChart(
        new EarleyItem(nextSym, productions[p].body, 0, chartIndex, p),
        chartIndex
      );
    }
  }
}

/**
 * SCANNING: For an item [A → α • a β, j] where a is a terminal matching
 * the current token, add [A → α a • β, j] to chart[i+1].
 */
function scan(item, chartIndex, tokens, addToChart) {
  const nextSym = item.nextSymbol();
  if (tokens[chartIndex] === nextSym) {
    const newItem = new EarleyItem(
      item.head, item.body, item.dot + 1, item.origin, item.prodIndex
    );
    // Copy previous backpointers
    for (let k = 0; k < item.dot; k++) {
      newItem.backPointers[k] = [...item.backPointers[k]];
    }
    // Record this scan
    newItem.backPointers[item.dot] = [{ type: 'scan', token: tokens[chartIndex] }];
    addToChart(newItem, chartIndex + 1);
  }
}

/**
 * COMPLETION: For a completed item [B → γ •, j] in chart[i],
 * find all items [A → α • B β, k] in chart[j] and add [A → α B • β, k]
 * to chart[i].
 */
function complete(completedItem, chartIndex, chart, nonTerminalSet, addToChart) {
  const originSet = chart[completedItem.origin];
  for (const parentItem of originSet) {
    if (
      !parentItem.isComplete() &&
      parentItem.nextSymbol() === completedItem.head
    ) {
      const newItem = new EarleyItem(
        parentItem.head,
        parentItem.body,
        parentItem.dot + 1,
        parentItem.origin,
        parentItem.prodIndex
      );
      // Copy previous backpointers
      for (let k = 0; k < parentItem.dot; k++) {
        newItem.backPointers[k] = [...parentItem.backPointers[k]];
      }
      // Record this completion
      newItem.backPointers[parentItem.dot] = [
        ...(parentItem.backPointers[parentItem.dot] || []),
        { type: 'complete', item: completedItem }
      ];
      addToChart(newItem, chartIndex);
    }
  }
}

/**
 * Extract parse trees from a completed Earley item.
 * This recursively follows backpointers to build tree structures.
 * 
 * A tree node has the shape:
 * {
 *   label: "E",
 *   children: [ { label: "E", children: [...] }, { label: "+", children: [] }, ... ]
 * }
 */
function extractTrees(item, chart, tokens, trees, depth) {
  if (depth > 200 || trees.length >= MAX_PARSE_TREES) return;

  // Build all possible children arrays
  const childrenOptions = buildChildrenOptions(item, chart, tokens, depth);

  for (const children of childrenOptions) {
    if (trees.length >= MAX_PARSE_TREES) break;
    trees.push({
      label: item.head,
      production: `${item.head} → ${item.body.join(' ')}`,
      children,
    });
  }
}

/**
 * Build all possible children arrays for a completed item by following backpointers.
 */
function buildChildrenOptions(item, chart, tokens, depth) {
  if (depth > 200) return [[]];

  // For each symbol position in the production body, collect all possible subtrees
  const posOptions = []; // posOptions[i] = array of possible subtrees for body[i]

  for (let i = 0; i < item.body.length; i++) {
    const bps = item.backPointers[i];
    const options = [];

    if (!bps || bps.length === 0) {
      // No backpointers — this is a terminal
      options.push({ label: item.body[i], children: [] });
    } else {
      for (const bp of bps) {
        if (bp.type === 'scan') {
          options.push({ label: bp.token, children: [] });
        } else if (bp.type === 'complete') {
          // Recursively extract trees for the completed non-terminal
          const subTrees = [];
          extractTrees(bp.item, chart, tokens, subTrees, depth + 1);
          for (const st of subTrees) {
            options.push(st);
          }
        }
      }
    }

    if (options.length === 0) {
      options.push({ label: item.body[i], children: [] });
    }

    posOptions.push(options);
  }

  // Compute cartesian product of all position options
  return cartesianProduct(posOptions);
}

/**
 * Compute the cartesian product of arrays, capped to prevent explosion.
 */
function cartesianProduct(arrays) {
  if (arrays.length === 0) return [[]];

  const result = [];
  const maxResults = MAX_PARSE_TREES * 2;

  function helper(index, current) {
    if (result.length >= maxResults) return;
    if (index === arrays.length) {
      result.push([...current]);
      return;
    }
    for (const option of arrays[index]) {
      if (result.length >= maxResults) return;
      current.push(option);
      helper(index + 1, current);
      current.pop();
    }
  }

  helper(0, []);
  return result;
}

/**
 * Deduplicate parse trees by comparing their JSON string representations.
 */
function deduplicateTrees(trees) {
  const seen = new Set();
  const unique = [];

  for (const tree of trees) {
    const key = treeToString(tree);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(tree);
    }
  }
  return unique;
}

/**
 * Convert a tree to a canonical string for comparison.
 */
function treeToString(node) {
  if (!node.children || node.children.length === 0) {
    return node.label;
  }
  return `(${node.label} ${node.children.map(c => treeToString(c)).join(' ')})`;
}

module.exports = { earleyParse, ParseError };
