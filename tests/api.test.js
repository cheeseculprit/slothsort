import test from 'node:test';
import assert from 'node:assert/strict';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { createApp } from '../server/app.js';

let mongo, server, base;
test.before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  server = createApp(async () => [{ text: 'buy oat milk', lane: 'do', confidence: .84 }]).listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(async () => { await new Promise(resolve => server.close(resolve)); await mongoose.disconnect(); await mongo.stop(); });

test('triage, save, move, complete, and delete an item through the API', async () => {
  const triage = await fetch(`${base}/api/triage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: 'buy oat milk' }) });
  assert.equal(triage.status, 200);
  assert.equal((await triage.json()).items[0].lane, 'do');
  const save = await fetch(`${base}/api/items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: [{ text: 'buy oat milk', lane: 'do' }] }) });
  assert.equal(save.status, 201);
  const id = (await save.json()).items[0]._id;
  const patch = await fetch(`${base}/api/items/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lane: 'waiting', done: true }) });
  assert.equal((await patch.json()).item.done, true);
  assert.equal((await (await fetch(`${base}/api/items`)).json()).items[0].lane, 'waiting');
  assert.equal((await fetch(`${base}/api/items/${id}`, { method: 'DELETE' })).status, 204);
  assert.deepEqual((await (await fetch(`${base}/api/items`)).json()).items, []);
});

test('rejects invalid lanes and empty item writes', async () => {
  const response = await fetch(`${base}/api/items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: [{ text: '', lane: 'nope' }] }) });
  assert.equal(response.status, 400);
});
