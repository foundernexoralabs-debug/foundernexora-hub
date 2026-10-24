// @polsia:user-owned — retrieval over the Guide's knowledge base (BM25 with a small synonym map).
//
// Pure and dependency-free so it runs identically in the route handler and in tests. It powers
// both modes: with no model configured it IS the answer (offline mode); with a model it picks
// the only context the model is allowed to answer from.

import { KNOWLEDGE, type KnowledgeEntry } from '@/lib/business/receptionist/knowledge';

const STOPWORDS = new Set(
  (
    'a an and are as at be but by can could did do does for from get got had has have how i if in ' +
    'into is it its me my of on or our so than that the their them then there these they this to ' +
    'us was we were what when where which who why will with would you your yours about any some ' +
    'tell please much many just also there here want need know like'
  ).split(' '),
);

/** Words people use for the same idea. Each key expands to its values at query time. */
const SYNONYMS: Record<string, readonly string[]> = {
  cost: ['price', 'pricing'],
  costs: ['price', 'pricing'],
  expensive: ['price'],
  cheap: ['price', 'free'],
  pay: ['price', 'payment'],
  pricing: ['price', 'plan'],
  prices: ['price', 'plan'],
  tier: ['plan'],
  tiers: ['plan'],
  subscription: ['plan'],
  subscribe: ['plan'],
  purchase: ['buy'],
  order: ['buy'],
  refund: ['refund', 'buy'],
  money: ['price', 'refund'],
  email: ['contact'],
  mail: ['contact'],
  support: ['contact', 'help'],
  reach: ['contact'],
  phone: ['contact'],
  call: ['contact'],
  data: ['privacy'],
  gdpr: ['privacy', 'data'],
  cookie: ['privacy', 'cookies'],
  tracking: ['privacy'],
  signup: ['start', 'account'],
  register: ['start', 'account'],
  login: ['sign', 'account'],
  install: ['start', 'download'],
  download: ['desktop'],
  website: ['builder', 'site'],
  site: ['website'],
  webpage: ['website', 'builder'],
  coding: ['code'],
  program: ['code'],
  programming: ['code'],
  python: ['code'],
  plugin: ['plugins', 'store'],
  extension: ['plugins', 'extensions'],
  marketplace: ['store', 'plugins'],
  kit: ['plugins', 'tradelaunch'],
  electrician: ['tradelaunch'],
  electricians: ['tradelaunch'],
  bug: ['report'],
  broken: ['report', 'bug'],
  feedback: ['report'],
  credit: ['credits'],
  limit: ['credits', 'limit'],
  limits: ['credits', 'limit'],
  unlimited: ['limit'],
  vat: ['vat', 'registered'],
  company: ['founderlab'],
  founder: ['founderlab'],
  freelance: ['hire'],
  youtube: ['zero', 'prove', 'follow'],
  tiktok: ['follow'],
  mobile: ['desktop', 'app'],
  windows: ['desktop'],
  mac: ['desktop'],
  key: ['own', 'model'],
  llm: ['model'],
};

/** Lower-case, strip punctuation, drop stopwords, light suffix stemming. */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[’']/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9£ ]+/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOPWORDS.has(word))
    .map(stem);
}

function stem(word: string): string {
  if (word.length > 5 && word.endsWith('ing')) return word.slice(0, -3);
  if (word.length > 4 && word.endsWith('ies')) return `${word.slice(0, -3)}y`;
  if (word.length > 4 && word.endsWith('es') && !word.endsWith('ses')) return word.slice(0, -1);
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}

function expand(tokens: string[]): string[] {
  const out = [...tokens];
  for (const token of tokens) {
    for (const extra of SYNONYMS[token] ?? []) out.push(...tokenize(extra));
  }
  return out;
}

interface IndexedDoc {
  entry: KnowledgeEntry;
  terms: Map<string, number>;
  length: number;
}

/** Title and keywords count three times: they say what an entry is ABOUT. */
function index(entries: readonly KnowledgeEntry[]): IndexedDoc[] {
  return entries.map((entry) => {
    const weighted = [
      ...Array(3)
        .fill(tokenize(`${entry.title} ${entry.keywords.join(' ')}`))
        .flat(),
      ...tokenize(entry.answer),
    ] as string[];
    const terms = new Map<string, number>();
    for (const term of weighted) terms.set(term, (terms.get(term) ?? 0) + 1);
    return { entry, terms, length: weighted.length };
  });
}

export interface RetrievalHit {
  entry: KnowledgeEntry;
  score: number;
}

export interface Retriever {
  search(query: string, limit?: number): RetrievalHit[];
}

/** Phrases that carry meaning only together, rewritten before tokenising. */
function normaliseQuery(query: string): string {
  return query
    .replace(/\bhow much\b/gi, ' price ')
    .replace(/\bsign(ed|ing)? (up|in)\b/gi, ' signup ')
    .replace(/\blog ?in\b/gi, ' signup ');
}

const jaccard = (a: ReadonlySet<string>, b: ReadonlySet<string>) => {
  let shared = 0;
  for (const term of a) if (b.has(term)) shared += 1;
  return shared === 0 ? 0 : shared / (a.size + b.size - shared);
};

/**
 * BM25 (k1 1.2, b 0.75) over the knowledge base, plus two guards that keep answers grounded:
 *  - coverage: at least half of the visitor's own words (or their synonyms) must appear in the
 *    entry, and exactly half halves the score, so one shared word ("buy" in "how to buy a
 *    car") never counts as an answer;
 *  - a title bonus: a question that closely matches an entry's own question ranks it first.
 */
export function createRetriever(entries: readonly KnowledgeEntry[] = KNOWLEDGE): Retriever {
  const docs = index(entries);
  const titles = entries.map((entry) => new Set(tokenize(entry.title)));
  const avgLength = docs.reduce((sum, doc) => sum + doc.length, 0) / Math.max(docs.length, 1);
  const df = new Map<string, number>();
  for (const doc of docs)
    for (const term of doc.terms.keys()) df.set(term, (df.get(term) ?? 0) + 1);
  const idf = (term: string) => {
    const n = df.get(term) ?? 0;
    return Math.log(1 + (docs.length - n + 0.5) / (n + 0.5));
  };

  return {
    search(query, limit = 4) {
      const own = [...new Set(tokenize(normaliseQuery(query)))];
      if (own.length === 0) return [];
      const terms = [...new Set(expand(own))];
      const ownSet = new Set(own);
      const hits = docs.map((doc, i) => {
        const covered = own.filter(
          (term) =>
            doc.terms.has(term) || (SYNONYMS[term] ?? []).some((s) => doc.terms.has(stem(s))),
        ).length;
        const coverage = covered / own.length;
        if (coverage < 0.5) return { entry: doc.entry, score: 0 };
        let score = 0;
        for (const term of terms) {
          const tf = doc.terms.get(term);
          if (!tf) continue;
          score +=
            (idf(term) * (tf * 2.2)) / (tf + 1.2 * (1 - 0.75 + (0.75 * doc.length) / avgLength));
        }
        score += 8 * jaccard(ownSet, titles[i] ?? new Set());
        // Half the words unexplained: the match must be strong on its own to count.
        if (coverage === 0.5 && own.length > 1) score /= 2;
        return { entry: doc.entry, score };
      });
      return hits
        .filter((hit) => hit.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    },
  };
}

/**
 * Minimum BM25 score for an entry to count as an answer. Calibrated in
 * tests/unit/receptionist-retrieval.test.ts: every curated question clears it, and
 * off-topic questions ("capital of France", "write me a poem") do not.
 */
export const ANSWER_THRESHOLD = 4.5;

let defaultRetriever: Retriever | null = null;

export function retrieve(query: string, limit = 4): RetrievalHit[] {
  defaultRetriever ??= createRetriever();
  return defaultRetriever.search(query, limit);
}
