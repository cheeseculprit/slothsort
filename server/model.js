import { pipeline, env } from '@huggingface/transformers';
import { classifyNotes } from './triage.js';

env.allowRemoteModels = process.env.SLOTHSORT_OFFLINE !== '1';
let extractorPromise;
export async function sortWithLocalModel(text) {
  if (!extractorPromise) extractorPromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { dtype: 'q8' }).catch(error => { extractorPromise = null; throw error; });
  const extractor = await extractorPromise;
  const embed = async texts => {
    const result = await extractor(texts, { pooling: 'mean', normalize: true });
    const dim = result.dims.at(-1);
    return texts.map((_, i) => Array.from(result.data.slice(i * dim, (i + 1) * dim)));
  };
  return classifyNotes(text, embed);
}
