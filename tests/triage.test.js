import test from 'node:test';
import assert from 'node:assert/strict';
import { splitNotes, classifyNotes } from '../server/triage.js';

const vectors = {
  'buy milk': [1, 0, 0, 0],
  'send the draft to Maya': [0, 1, 0, 0],
  'Maya owes me a reply': [0, 0, 1, 0],
  'the office wifi code is 1234': [0, 0, 0, 1],
};
const anchors = {
  do: [1, 0, 0, 0], delegate: [0, 1, 0, 0], waiting: [0, 0, 1, 0], someday: [0, 0, 0, 1],
};

test('splits a messy brain dump into distinct, safe-sized lines', () => {
  assert.deepEqual(splitNotes(' - buy milk\n• send the draft to Maya\n\n1. buy milk\n'), ['buy milk', 'send the draft to Maya']);
  assert.throws(() => splitNotes('x'.repeat(10001)), /10,000/);
});

test('uses model embeddings to sort notes and keeps their original order', async () => {
  const embed = async texts => texts.map(text => vectors[text] ?? anchors[text]);
  const result = await classifyNotes('buy milk\nMaya owes me a reply\nsend the draft to Maya', embed, anchors);
  assert.deepEqual(result.map(item => item.lane), ['do', 'waiting', 'delegate']);
  assert.equal(result[0].text, 'buy milk');
  assert.equal(result[0].confidence, 1);
});

test('rejects an empty brain dump', async () => {
  await assert.rejects(classifyNotes('  ', async () => [], anchors), /Add at least one/);
});
