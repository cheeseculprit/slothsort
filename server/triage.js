export const LANES = {
  do: 'A task I can take action on myself, such as buy groceries, pay a bill, fix a bug, book an appointment, or clean the house',
  delegate: 'A task to ask, assign, send, hand off, or delegate to another person',
  waiting: 'I am waiting for a reply, approval, delivery, decision, or someone else to finish something',
  someday: 'An idea, reference, note, useful information, inspiration, or something I might do someday',
};

export function splitNotes(input) {
  if (typeof input !== 'string' || input.length > 10000) throw new Error('Brain dump must be text under 10,000 characters.');
  return [...new Set(input.split(/\r?\n|;/).map(s => s.trim().replace(/^(?:[-*•]\s*|\d+[.)]\s*)/, '').trim()).filter(Boolean))].slice(0, 40);
}

function cosine(a, b) {
  let dot = 0, aa = 0, bb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; aa += a[i] ** 2; bb += b[i] ** 2; }
  return dot / (Math.sqrt(aa * bb) || 1);
}

export async function classifyNotes(input, embed, anchors = null) {
  const notes = splitNotes(input);
  if (!notes.length) throw new Error('Add at least one note to sort.');
  const keys = Object.keys(anchors ?? LANES);
  const anchorVectors = anchors ? keys.map(k => anchors[k]) : await embed(keys.map(k => LANES[k]));
  const vectors = await embed(notes);
  return notes.map((text, i) => {
    const scores = anchorVectors.map(vector => cosine(vectors[i], vector));
    const max = Math.max(...scores);
    return { text, lane: keys[scores.indexOf(max)], confidence: Math.round(max * 100) / 100 };
  });
}
