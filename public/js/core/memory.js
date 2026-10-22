/**
 * Moteur de Memory (pur, testable) : construction des manches, mélange,
 * retournement des cartes, correspondances et priorités de révision.
 */
export const DIFFICULTIES = {
  facile: { label: "Facile", pairs: 4, hint: "4 paires · 8 cartes" },
  moyen: { label: "Moyen", pairs: 6, hint: "6 paires · 12 cartes" },
  difficile: { label: "Difficile", pairs: 8, hint: "8 paires · 16 cartes" },
  expert: { label: "Expert", pairs: 10, hint: "10 paires · 20 cartes" },
};

export const MASTERY_TARGET = 3;

/** Générateur pseudo-aléatoire déterministe (tests reproductibles). */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(list, rng = Math.random) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Découpe un ensemble de mots en manches courtes (jamais plus de `size` paires). */
export function buildRounds(words, size = 6) {
  const unique = dedupeWords(words);
  const rounds = [];
  for (let i = 0; i < unique.length; i += size) rounds.push(unique.slice(i, i + size));
  return rounds;
}

export function dedupeWords(words) {
  const seen = new Set();
  const out = [];
  for (const w of words) {
    if (!w || seen.has(w.id)) continue;
    seen.add(w.id);
    out.push(w);
  }
  return out;
}

/** Sélection pondérée sans remise : les mots ratés reviennent plus souvent. */
export function pickWeighted(words, count, { rng = Math.random, weight = () => 1 } = {}) {
  const pool = dedupeWords(words).map((w) => ({ w, weight: Math.max(0.01, weight(w)) }));
  const out = [];
  while (out.length < count && pool.length) {
    const total = pool.reduce((s, x) => s + x.weight, 0);
    let r = rng() * total;
    let index = 0;
    for (let i = 0; i < pool.length; i++) {
      r -= pool[i].weight;
      if (r <= 0) {
        index = i;
        break;
      }
    }
    out.push(pool[index].w);
    pool.splice(index, 1);
  }
  return out;
}

/** Priorité de révision d'un mot : erreurs récentes d'abord, maîtrise incomplète ensuite. */
export function reviewWeight(word, wordProgress = {}) {
  const mistakes = wordProgress.mistakes || 0;
  const correct = wordProgress.correct || 0;
  const missing = Math.max(0, MASTERY_TARGET - correct);
  return 1 + mistakes * 3 + missing * 1.5;
}

export function selectReviewWords(words, progress, { pairs = 6, rng = Math.random } = {}) {
  const pool = dedupeWords(words).filter(Boolean);
  return pickWeighted(pool, Math.min(pairs, pool.length), {
    rng,
    weight: (w) => reviewWeight(w, progress?.words?.[w.id]),
  });
}

export function createDeck(words, { rng = Math.random } = {}) {
  const cards = [];
  for (const w of words) {
    cards.push({ pairId: w.id, side: "es", text: w.es, state: "hidden" });
    cards.push({ pairId: w.id, side: "fr", text: w.fr, state: "hidden" });
  }
  return shuffle(cards, rng).map((c, i) => ({ ...c, uid: `${c.pairId}-${c.side}-${i}` }));
}

/**
 * Partie de Memory. Toutes les transitions renvoient un événement décrit,
 * l'interface se contente de les afficher.
 */
export class MemoryGame {
  constructor(words, { rng = Math.random } = {}) {
    this.pairs = dedupeWords(words);
    this.cards = createDeck(this.pairs, { rng });
    this.flipped = [];
    this.matched = [];
    this.attempts = 0;
    this.mistakes = new Map();
    this.locked = false;
    this.done = false;
  }

  card(uid) {
    return this.cards.find((c) => c.uid === uid);
  }

  /** Retourne une carte. Types : flip, match, mismatch, complete, ignored. */
  flip(uid) {
    if (this.done || this.locked) return { type: "ignored" };
    const card = this.card(uid);
    if (!card || card.state !== "hidden") return { type: "ignored" };
    card.state = "up";
    this.flipped.push(card);
    if (this.flipped.length < 2) return { type: "flip", card };

    const [a, b] = this.flipped;
    this.attempts++;
    if (a.pairId === b.pairId && a.side !== b.side) {
      a.state = "matched";
      b.state = "matched";
      this.flipped = [];
      if (!this.matched.includes(a.pairId)) this.matched.push(a.pairId);
      const complete = this.matched.length === this.pairs.length;
      if (complete) this.done = true;
      return { type: complete ? "complete" : "match", cards: [a, b], pairId: a.pairId, complete };
    }

    this.locked = true;
    const failed = this.flipped.map((c) => c.pairId);
    for (const id of failed) this.mistakes.set(id, (this.mistakes.get(id) || 0) + 1);
    return { type: "mismatch", cards: [a, b], pairIds: [...new Set(failed)] };
  }

  /** À appeler après le délai d'affichage : referme les cartes non correspondantes. */
  resolveMismatch() {
    if (!this.locked) return { type: "ignored" };
    const closed = [];
    for (const card of this.flipped) {
      if (card.state === "up") {
        card.state = "hidden";
        closed.push(card);
      }
    }
    this.flipped = [];
    this.locked = false;
    return { type: "closed", cards: closed };
  }

  get matchedCount() {
    return this.matched.length;
  }

  get pairCount() {
    return this.pairs.length;
  }

  get progress() {
    return this.pairCount ? this.matchedCount / this.pairCount : 0;
  }

  /** Mots qui ont été mal appariés au moins une fois. */
  get weakWordIds() {
    return [...this.mistakes.entries()].filter(([, n]) => n > 0).map(([id]) => id);
  }
}
