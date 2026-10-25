import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, CheckCircle2, ChevronDown, Circle, Coffee, Leaf, LoaderCircle, MoveRight, RotateCcw, Sparkles, Trash2 } from 'lucide-react';

const lanes = [
  { key: 'do', title: 'Do it', hint: 'Small steps, one at a time', icon: Circle, color: 'olive' },
  { key: 'delegate', title: 'Hand it off', hint: 'Not everything is yours to carry', icon: MoveRight, color: 'peach' },
  { key: 'waiting', title: 'Wait for it', hint: 'The ball is in their court', icon: Coffee, color: 'blue' },
  { key: 'someday', title: 'Someday', hint: 'Save the thought, release the pressure', icon: Leaf, color: 'purple' },
];
const example = 'Pick up oat milk and bananas\nAsk Jordan to send the presentation slides\nWaiting for the landlord to reply\nIdea: take a pottery class someday';
async function request(url, options) {
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (response.status === 204) return null;
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}

function SlothMark({ size = 42 }) {
  return <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#DCE6CD"/><path d="M18 26c0-10 6-15 14-15s14 5 14 15v12c0 9-6 15-14 15s-14-6-14-15V26Z" fill="#8B9C73"/><path d="M21 28c0-8 5-11 11-11s11 3 11 11v11c0 7-5 11-11 11s-11-4-11-11V28Z" fill="#F8E9D3"/><ellipse cx="25" cy="31" rx="5" ry="6" fill="#B7A084"/><ellipse cx="39" cy="31" rx="5" ry="6" fill="#B7A084"/><circle cx="25" cy="31" r="1.5" fill="#324031"/><circle cx="39" cy="31" r="1.5" fill="#324031"/><path d="m29 38 3 2 3-2" stroke="#4B5946" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M26 44c4 3 8 3 12 0" stroke="#4B5946" strokeWidth="1.6" strokeLinecap="round"/></svg>;
}

export default function App() {
  const [text, setText] = useState('');
  const [preview, setPreview] = useState(null);
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [notice, setNotice] = useState('');

  useEffect(() => { request('/api/items').then(data => setItems(data.items)).catch(e => setError(e.message)); }, []);
  const active = items.filter(i => !i.done).length;
  const done = items.length - active;
  const flash = message => { setNotice(message); setTimeout(() => setNotice(''), 3500); };

  async function sortNotes() {
    if (!text.trim()) { setError('Add a thought or two first.'); return; }
    setBusy(true); setError('');
    try { const data = await request('/api/triage', { method: 'POST', body: JSON.stringify({ text }) }); setPreview(data.items); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  async function saveNotes() {
    if (!preview?.length) return;
    setBusy(true); setError('');
    try { const data = await request('/api/items', { method: 'POST', body: JSON.stringify({ items: preview.map(({ text, lane }) => ({ text, lane })) }) }); setItems(old => [...data.items, ...old]); setPreview(null); setText(''); flash('Thoughts sorted. You can relax now.'); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  async function updateItem(id, changes) {
    try { const data = await request(`/api/items/${id}`, { method: 'PATCH', body: JSON.stringify(changes) }); setItems(old => old.map(i => i._id === id ? data.item : i)); }
    catch (e) { setError(e.message); }
  }
  async function deleteItem(id) {
    try { await request(`/api/items/${id}`, { method: 'DELETE' }); setItems(old => old.filter(i => i._id !== id)); flash('Thought released.'); }
    catch (e) { setError(e.message); }
  }

  return <div className="shell">
    <header className="topbar"><a className="brand" href="#top" aria-label="SlothSort home"><SlothMark size={39}/><span>sloth<span className="brand-light">sort</span><span className="brand-dot">.</span></span></a><div className="top-right"><span className="privacy"><span className="live-dot"/> YOUR SPACE, YOUR PACE</span><a href="#your-board" className="top-link">Your board <ArrowUpRight size={15}/></a></div></header>
    <main id="top">
      <section className="hero"><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-star">✳</span> THE GENTLE WAY TO GET THINGS DONE</div><h1>Your brain has<br/><em>better things</em><br/>to do.</h1><p>Drop your messy thoughts here. A small, open-source AI sorts them into a calmer plan—right on your own machine.</p><a href="#sorter" className="hero-cta">Lighten your load <ArrowRight size={17}/></a><div className="hero-note"><span className="tiny-line"/> No accounts. No cloud AI. No rush.</div></div><div className="hero-art" aria-hidden="true"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-sun"/><div className="art-hill hill-back"/><div className="art-hill hill-front"/><div className="art-branch"/><div className="art-leaf leaf-one"/><div className="art-leaf leaf-two"/><div className="sloth-body"/><div className="sloth-head"><div className="face-patch left"/><div className="face-patch right"/><div className="eye eye-left"/><div className="eye eye-right"/><div className="nose"/><div className="smile"/></div><div className="sloth-arm"/><div className="art-caption">slow is a superpower ✳</div></div></section>
      <section className="sort-section" id="sorter"><div className="section-intro"><div><span className="section-kicker">01 / UNLOAD YOUR MIND</span><h2>Put it all down.</h2><p>The half-remembered errands. The things you're waiting on. The idea that can wait. Just write them out, one per line.</p></div><span className="step-symbol">✳</span></div><div className="sort-card"><div className="card-top"><div className="input-label"><Sparkles size={17}/> BRAIN DUMP</div><span className="character-count">{text.length} / 10,000</span></div><textarea value={text} onChange={e => { setText(e.target.value); if (preview) setPreview(null); }} maxLength={10000} placeholder={'What’s on your mind?\n\nBuy groceries\nAsk Alex about the report\nWaiting for that package...'} aria-label="Brain dump"/><div className="card-bottom"><button className="example-button" onClick={() => { setText(example); setPreview(null); setError(''); }}>Try an example <ArrowUpRight size={14}/></button><button className="primary-button" onClick={sortNotes} disabled={busy || !text.trim()}>{busy ? <><LoaderCircle size={17} className="spin"/> Sorting gently...</> : <>Sort it for me <ArrowRight size={17}/></>}</button></div></div><p className="under-card"><Leaf size={15}/> Your notes stay on this machine. First run downloads an open model; later runs can work offline.</p>{error && <div className="error" role="alert">{error}</div>}</section>
      {preview && <section className="preview-section" aria-live="polite"><div className="section-intro compact"><div><span className="section-kicker">02 / A LITTLE CLARITY</span><h2>Here’s your lighter load.</h2><p>Not quite right? Move anything before you save it.</p></div></div><div className="preview-list">{preview.map((item, index) => <div className="preview-item" key={index}><span className="preview-index">{String(index + 1).padStart(2, '0')}</span><span className="preview-text">{item.text}</span><div className="select-wrap"><select aria-label={`Category for ${item.text}`} value={item.lane} onChange={e => setPreview(old => old.map((o, i) => i === index ? { ...o, lane: e.target.value } : o))}>{lanes.map(lane => <option key={lane.key} value={lane.key}>{lane.title}</option>)}</select><ChevronDown size={14}/></div></div>)}</div><div className="preview-actions"><button className="text-button" onClick={() => setPreview(null)}>Back to editing</button><button className="primary-button" onClick={saveNotes} disabled={busy}>{busy ? 'Saving...' : <>Save to my board <ArrowRight size={17}/></>}</button></div></section>}
      <section className="board-section" id="your-board"><div className="board-heading"><div><span className="section-kicker">03 / TAKE IT EASY</span><h2>Your little corner<br/>of calm<span className="title-period">.</span></h2></div><div className="board-stat"><strong>{active}</strong><span>things on your mind<br/><small>{done} already done</small></span></div></div><div className="filters"><button className={filter === 'all' ? 'selected' : ''} onClick={() => setFilter('all')}>All thoughts <span>{items.length}</span></button>{lanes.map(lane => <button className={filter === lane.key ? 'selected' : ''} key={lane.key} onClick={() => setFilter(lane.key)}>{lane.title} <span>{items.filter(i => i.lane === lane.key).length}</span></button>)}</div><div className="board-grid">{lanes.filter(lane => filter === 'all' || filter === lane.key).map(lane => { const laneItems = items.filter(i => i.lane === lane.key); const Icon = lane.icon; return <div className={`lane lane-${lane.color}`} key={lane.key}><div className="lane-top"><div className="lane-icon"><Icon size={20}/></div><span className="lane-count">{laneItems.length.toString().padStart(2, '0')}</span></div><h3>{lane.title}</h3><p>{lane.hint}</p><div className="lane-items">{laneItems.length ? laneItems.map(item => <div className={`task ${item.done ? 'task-done' : ''}`} key={item._id}><button className="task-check" aria-label={item.done ? `Mark ${item.text} not done` : `Complete ${item.text}`} onClick={() => updateItem(item._id, { done: !item.done })}>{item.done ? <CheckCircle2 size={20}/> : <Circle size={20}/>}</button><span>{item.text}</span><button className="task-delete" aria-label={`Delete ${item.text}`} title="Delete" onClick={() => deleteItem(item._id)}><Trash2 size={15}/></button></div>) : <div className="lane-empty">Nothing here yet. <span>And that’s okay.</span></div>}</div></div>; })}</div></section>
      <section className="why-section"><div className="why-icon"><SlothMark size={58}/></div><div><span className="section-kicker">BUILT FOR THE SLOW LANE</span><h2>Less doing. More living.</h2><p>SlothSort uses an open-weight sentence-embedding model to sort your thoughts by meaning, not brittle keywords. Inference runs locally with Transformers.js; your notes are stored in MongoDB you control. No paid API, no account, and no sending your brain dump to someone else's server.</p></div><div className="why-tags"><span>OPEN WEIGHTS</span><span>LOCAL INFERENCE</span><span>YOUR DATA</span></div></section>
    </main><footer><div className="footer-brand"><SlothMark size={29}/> slothsort<span>.</span></div><span>Made for doing a little less, a little better.</span><span>Take it slow. © 2026</span></footer>{notice && <div className="toast" role="status"><Check size={17}/>{notice}</div>}</div>;
}
