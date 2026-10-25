import mongoose from 'mongoose';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createApp } from './app.js';
import { sortWithLocalModel } from './model.js';

const port = Number(process.env.PORT ?? 3001);
let embeddedMongo;
async function main() {
  let uri = process.env.MONGODB_URI;
  if (!uri) {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const dbPath = resolve('.local-mongo');
    await mkdir(dbPath, { recursive: true });
    embeddedMongo = await MongoMemoryServer.create({ instance: { dbPath }, binary: { version: '8.0.17' } });
    uri = embeddedMongo.getUri();
    console.log('Using local MongoDB at .local-mongo (set MONGODB_URI for your own server).');
  }
  await mongoose.connect(uri);
  createApp(sortWithLocalModel).listen(port, '127.0.0.1', () => console.log(`SlothSort API on http://127.0.0.1:${port}`));
}
main().catch(error => { console.error('Startup failed:', error); process.exitCode = 1; });
