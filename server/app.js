import express from 'express';
import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true, maxlength: 500 },
  lane: { type: String, required: true, enum: ['do', 'delegate', 'waiting', 'someday'] },
  done: { type: Boolean, default: false },
}, { timestamps: true });
const Item = mongoose.models.Item || mongoose.model('Item', itemSchema);
const validLanes = ['do', 'delegate', 'waiting', 'someday'];
const validItem = item => typeof item?.text === 'string' && item.text.trim().length > 0 && item.text.length <= 500 && validLanes.includes(item.lane);

export function createApp(sort) {
  const app = express();
  app.use(express.json({ limit: '32kb' }));
  app.get('/api/health', (_req, res) => res.json({ ok: true, database: mongoose.connection.readyState === 1 }));
  app.post('/api/triage', async (req, res, next) => {
    try { res.json({ items: await sort(req.body?.text) }); } catch (error) { next(error); }
  });
  app.get('/api/items', async (_req, res, next) => {
    try { res.json({ items: await Item.find().sort({ createdAt: -1 }).lean() }); } catch (error) { next(error); }
  });
  app.post('/api/items', async (req, res, next) => {
    if (!Array.isArray(req.body?.items) || !req.body.items.length || req.body.items.length > 40 || !req.body.items.every(validItem)) return res.status(400).json({ error: 'Provide 1–40 items with text and a valid lane.' });
    try {
      const items = await Item.insertMany(req.body.items.map(({ text, lane }) => ({ text: text.trim(), lane })));
      res.status(201).json({ items });
    } catch (error) { next(error); }
  });
  app.patch('/api/items/:id', async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid item ID.' });
    const { lane, done } = req.body ?? {};
    if ((lane === undefined && done === undefined) || (lane !== undefined && !validLanes.includes(lane)) || (done !== undefined && typeof done !== 'boolean')) return res.status(400).json({ error: 'Invalid update.' });
    try {
      const item = await Item.findByIdAndUpdate(req.params.id, { ...(lane !== undefined ? { lane } : {}), ...(done !== undefined ? { done } : {}) }, { returnDocument: 'after' });
      if (!item) return res.status(404).json({ error: 'Item not found.' });
      res.json({ item });
    } catch (error) { next(error); }
  });
  app.delete('/api/items/:id', async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid item ID.' });
    try {
      const item = await Item.findByIdAndDelete(req.params.id);
      if (!item) return res.status(404).json({ error: 'Item not found.' });
      res.status(204).end();
    } catch (error) { next(error); }
  });
  app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(error.status ?? 500).json({ error: error.message ?? 'Something went wrong.' });
  });
  return app;
}
