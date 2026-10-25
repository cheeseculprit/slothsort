# SlothSort 🦥

A gentle, local-first brain-dump sorter. Paste one thought per line; a small open-weight embedding model sorts them into **Do it**, **Hand it off**, **Wait for it**, and **Someday**. Adjust its guesses, save to a board, mark things done, or let them go.

## Stack

- **MongoDB** — your saved notes. The default development mode starts a real, embedded MongoDB binary with files under `.local-mongo/`; set `MONGODB_URI` to use an existing MongoDB server instead.
- **Express / Node.js** — local API and model inference.
- **React / Vite** — responsive UI.
- **Open AI** — [Xenova/all-MiniLM-L6-v2](https://huggingface.co/Xenova/all-MiniLM-L6-v2), an Apache-2.0 open-weight ONNX model run locally through [Transformers.js](https://huggingface.co/docs/transformers.js). No hosted AI API. Classification compares text embeddings to descriptions of the four buckets, then lets you correct the result before saving.

## Run

Requirements: Node.js 20+, npm, Windows/macOS/Linux. The first run needs internet to download the model and (in embedded MongoDB mode) the MongoDB binary (a large download, roughly 750 MB on Windows). After these assets are cached, inference and storage are local. Set `SLOTHSORT_OFFLINE=1` to prohibit remote model downloads and prove that the cached model works without them. This is a single-user local app; do not expose its unauthenticated API publicly.

```bash
npm install
npm run dev
```

Open http://127.0.0.1:5173. API: http://127.0.0.1:3001. Optional external database: set `MONGODB_URI` before running. To run components separately: `npm run server` and `npx vite --host 127.0.0.1`.

```bash
npm test
npm run build
```

Notes are stored locally in `.local-mongo/` by default. Do not delete that folder if you want to keep them. Model files are cached by Transformers.js in the standard local cache. The first AI request may take a while as weights download; after that the model is kept warm in the Node process. The classification is a best guess, not a generative assistant; review each bucket before saving. Input is limited to 40 unique lines and 10,000 characters.

## Post for the Sloth Day prompt

Meet SlothSort: the to-do list for people who are tired of making to-do lists. Dump your brain onto the page, one thought per line. A local open-weight model quietly sorts each note into things to do, things to delegate, things you're waiting on, and things that can wait for another day. Correct anything it gets wrong, save it, and go take a break.

The open part is the whole point. I used an Apache-2.0 sentence-embedding model with Transformers.js, so the actual sorting happens in a local Node process—not through a paid or closed AI endpoint. MongoDB keeps the resulting notes on my machine. That means the messy, personal stuff in my head doesn't have to become someone else's prompt data, and after the first download the model can run without internet. A closed hosted model might write prettier prose, but for a simple private sorting task it adds a network dependency, recurring cost, and an unnecessary trust boundary. The sloth would never approve of extra work.

Built with MongoDB, Express, React, and Node.js. Slow down; the app can do this part.
