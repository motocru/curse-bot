// Loaded from db/flat-file/etc
const ALL_CURSES = [
    "fuck",
    "fuck hole",
    "mother fucker",
    "go pack go",
];

type CurseNode<T> = Map<string, T | string>;
interface CurseTree extends CurseNode<CurseTree> {}

// Creates the root of the curse search tree (on startup)
const CURSE_TREE: CurseTree = new Map();
for (const curse of ALL_CURSES) {
  buildTree(CURSE_TREE, curse, curse.split(' '));
}

// Creates (or edits) a single node in the tree
function buildTree(tree: CurseTree, curse: string, tokens: string[]) {
  if (tokens.length === 0) {
    // When we reach the end of a curse phrase,
    // we insert the whole phrase at `''` and
    // end the recursion.
    tree.set('', curse);
    return;
  }

  // When there are more words to a curse phrase
  // we get (or create) another node in the curse
  // tree. We then recurse into build tree with
  // said tree and the remaining curse phrase tokens.
  const subTree = <CurseTree> tree.get(tokens[0]) ?? new Map();
  tree.set(tokens[0], subTree);
  buildTree(subTree, curse, tokens.slice(1));
}

export default function checkForCurses(text: string): Map<string, number> {
  // Remove non-word, non-space characters
  // What should we do about plurals and tenses? 
  const tokens = text.replace(/[^\w\s]/, "").split(' ');

  const acc = new Map(); // Accumulates all used curses (and their counts)
  for (let i = 0; i < tokens.length; i++) {
    // Check for a new curse phrase 
    checkTree(CURSE_TREE, acc, tokens.slice(i));
  }
  return acc;
}

// Traverse the tree and count curse phrase usage.
function checkTree(tree: CurseTree, acc: Map<string, number>, tokens: string[]) {
  const curse = <string | undefined> tree.get('');
  if (curse != null) {
    // This means the current phrase is a curse.
    // It does *not* mean we are done; the phrase
    // could be part of another, larger curse phrase.
    // E.g. "stupid fuck hole" counts for both "fuck"
    // and "fuck hole".
    const currentCount = acc.get(curse) ?? 0;
    acc.set(curse, currentCount + 1);
  }

  if (tokens.length === 0) {
    return;
  }

  const subTree = <CurseTree | undefined> tree.get(tokens[0]);
  if (subTree != null) {
    checkTree(subTree, acc, tokens.slice(1));
  }
}

console.log("starting test");

let results = checkForCurses("fuck");
console.assert(results.size === 1);
console.assert(results.get("fuck") === 1);


results = checkForCurses("stupid fuck hole");
console.assert(results.size === 2);
console.assert(results.get("fuck") === 1);
console.assert(results.get("fuck hole") === 1);

results = checkForCurses("fuck fuck fuck");
console.assert(results.size === 1);
console.assert(results.get("fuck") === 3);

results = checkForCurses("go pack go!");
console.assert(results.size === 1);
console.assert(results.get("go pack go") === 1);

results = checkForCurses("*go fuck yourself*");
console.assert(results.size === 1);
console.assert(results.get("fuck") === 1);

