/* Harmony tutorial: the theory engine (spelled notes, chords, Roman numerals), the figure drawing (MusicXML -> OpenSheetMusicDisplay),
   the quiz and the "play it yourself" exercises. The chapters themselves are in harmony-chapters.js. Loaded on demand from index.html. */
(() => {
'use strict';
const LET = 'CDEFGAB', SEMI = [0, 2, 4, 5, 7, 9, 11], ACC = {'': 0, '#': 1, '##': 2, b: -1, bb: -2};
const SYM = {'-2': '♭♭', '-1': '♭', 0: '', 1: '♯', 2: '♯♯'};

/* ---------- spelled notes ---------- */
const mk = (step, alter, oct) => ({step, alter, oct, midi: 12 * (oct + 1) + SEMI[step] + alter});
function parse(s) {
  const m = /^([A-G])(##|bb|#|b)?(\d)(~?)$/.exec(s);
  if (!m) throw new Error('bad note ' + s);
  const p = mk(LET.indexOf(m[1]), ACC[m[2] || ''], +m[3]); if (m[4]) p.tie = true; return p;
}
const nm = (p, oct = false) => LET[p.step] + SYM[p.alter] + (oct ? p.oct : '');            // C♯, B♭, F♯4
const asc = p => LET[p.step] + ({'-2': 'bb', '-1': 'b', 0: '', 1: '#', 2: '##'})[p.alter];                      // ASCII spelling for keys: Bb, F#
const pn = s => s.replace(/^([A-G])(##|bb|#|b)?/, (_, l, a) => l + (a ? SYM[ACC[a]] : ''));  // 'Bb' -> 'B♭' for display
const above = (p, dsteps, semis) => {                                                        // a note a given number of letter steps and semitones higher
  const abs = p.step + dsteps, step = abs % 7, oct = p.oct + Math.floor(abs / 7), midi = p.midi + semis;
  return mk(step, midi - (12 * (oct + 1) + SEMI[step]), oct);
};
const shiftOct = (p, n) => mk(p.step, p.alter, p.oct + n);
const bump = (p, n) => mk(p.step, p.alter + n, p.oct);                                      // raise or lower by semitones, same letter

const QUAL = {
  major: [[2, 4], [4, 7]], minor: [[2, 3], [4, 7]], dim: [[2, 3], [4, 6]], aug: [[2, 4], [4, 8]],
  sus2: [[1, 2], [4, 7]], sus4: [[3, 5], [4, 7]],
  maj9: [[2, 4], [4, 7], [6, 11], [8, 14]], dom9: [[2, 4], [4, 7], [6, 10], [8, 14]], min9: [[2, 3], [4, 7], [6, 10], [8, 14]], dom7b9: [[2, 4], [4, 7], [6, 10], [8, 13]], dom7s9: [[2, 4], [4, 7], [6, 10], [8, 15]],
  dom7: [[2, 4], [4, 7], [6, 10]], maj7: [[2, 4], [4, 7], [6, 11]], min7: [[2, 3], [4, 7], [6, 10]], hdim7: [[2, 3], [4, 6], [6, 10]], dim7: [[2, 3], [4, 6], [6, 9]],
};
const QNAME = {maj9: 'major ninth', dom9: 'dominant ninth', min9: 'minor ninth', dom7b9: 'dominant seventh flat nine', dom7s9: 'dominant seventh sharp nine', sus2: 'suspended 2nd chord', sus4: 'suspended 4th chord', major: 'major triad', minor: 'minor triad', dim: 'diminished triad', aug: 'augmented triad', dom7: 'dominant seventh', maj7: 'major seventh', min7: 'minor seventh', hdim7: 'half-diminished seventh', dim7: 'fully diminished seventh'};
const chordFromRoot = (root, q) => [root, ...QUAL[q].map(([d, s]) => above(root, d, s))];
const sortN = a => [...a].sort((x, y) => x.midi - y.midi);

const MAJ = [2, 2, 1, 2, 2, 2, 1], MIN = [2, 1, 2, 2, 1, 2, 2];
const PATS = {major: MAJ, ionian: MAJ, minor: MIN, aeolian: MIN, dorian: [2, 1, 2, 2, 2, 1, 2], phrygian: [1, 2, 2, 2, 1, 2, 2], lydian: [2, 2, 2, 1, 2, 2, 1], mixolydian: [2, 2, 1, 2, 2, 1, 2], locrian: [1, 2, 2, 1, 2, 2, 2]};
function scale(tonic, mode = 'major', n = 8, harm = false) {                                 // spelled scale notes from a tonic such as 'C4'
  const t = typeof tonic === 'string' ? parse(tonic) : tonic, pat = PATS[mode] || MAJ, midis = [t.midi];
  for (let i = 1; i < n; i++) midis.push(midis[i - 1] + pat[(i - 1) % 7]);
  return midis.map((mid, i) => {
    const abs = t.step + i, step = abs % 7, oct = t.oct + Math.floor(abs / 7);
    const m2 = mode === 'minor' && harm && i % 7 === 6 ? mid + 1 : mid;
    return mk(step, m2 - (12 * (oct + 1) + SEMI[step]), oct);
  });
}
const FIFTHS = {
  major: {C: 0, G: 1, D: 2, A: 3, E: 4, B: 5, 'F#': 6, 'C#': 7, F: -1, Bb: -2, Eb: -3, Ab: -4, Db: -5, Gb: -6, Cb: -7},
  minor: {A: 0, E: 1, B: 2, 'F#': 3, 'C#': 4, 'G#': 5, 'D#': 6, 'A#': 7, D: -1, G: -2, C: -3, F: -4, Bb: -5, Eb: -6, Ab: -7},
};

/* ---------- Roman numerals ---------- */
const ROMAN = /^([b#]?)(VII|VI|IV|V|III|II|I|vii|vi|iv|v|iii|ii|i)([°ø+]?)(M?)(65|43|42|64|7|6)?$/;
const DEG = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'];
const BASS_OF = {6: 1, 65: 1, 64: 2, 43: 2, 42: 3};
function rn(sym, key = 'C', mode = 'major', rootOct = 4) {                                    // a chord from its Roman numeral: {notes (low to high), root, quality}
  const [main, of] = sym.split('/');
  if (of) { const t = rn(of, key, mode, rootOct); return rn(main, asc(t.root), /^[iv]/.test(of) ? 'minor' : 'major', rootOct); }
  const m = ROMAN.exec(main); if (!m) throw new Error('bad numeral ' + sym);
  const [, pre, num, mark, M, fig] = m, deg = DEG.indexOf(num.toLowerCase()), seventh = ['7', '65', '43', '42'].includes(fig), up = num === num.toUpperCase();
  let q;
  if (mark === '°') q = seventh ? 'dim7' : 'dim'; else if (mark === 'ø') q = 'hdim7'; else if (mark === '+') q = 'aug';
  else if (up) q = seventh ? (M ? 'maj7' : 'dom7') : 'major'; else q = seventh ? 'min7' : 'minor';
  const harm = mode === 'minor' && deg === 6 && (mark === '°' || mark === 'ø');
  let root = scale(key + '4', mode, 8, harm)[deg];
  if (pre === 'b') root = bump(root, -1); else if (pre === '#') root = bump(root, 1);
  while (root.midi >= 12 * (rootOct + 2)) root = shiftOct(root, -1);
  while (root.midi < 12 * (rootOct + 1)) root = shiftOct(root, 1);
  let notes = chordFromRoot(root, q);
  for (let i = 0; i < (BASS_OF[fig] || 0); i++) notes[i] = shiftOct(notes[i], 1);
  return {notes: sortN(notes), root, quality: q};
}
const pcsOf = notes => [...new Set(notes.map(n => ((n.midi % 12) + 12) % 12))];

/* ---------- figures: a few chords or notes on a staff, drawn by OpenSheetMusicDisplay ---------- */
const DUR = {w: 8, h: 4, q: 2, e: 1, 'h.': 6, 'q.': 3}, TYPE = {w: 'whole', h: 'half', q: 'quarter', e: 'eighth', 'h.': 'half', 'q.': 'quarter'};   // 'q.' is a dotted quarter   // 2 divisions per quarter note
const toNotes = e => (e.notes || []).map(x => typeof x === 'string' ? parse(x) : x);
function beamTags(items, ts) {                      // beam runs of eighth notes within a beat: 'begin' / 'continue' / 'end' (or '' for a single note)
  const beat = ts[1] === 8 && ts[0] % 3 === 0 && ts[0] > 3 ? 3 : Math.max(1, 8 / ts[1]), tags = items.map(() => '');
  let pos = 0, run = [];
  const flush = () => { if (run.length > 1) run.forEach((k, j) => { tags[k] = j === 0 ? 'begin' : j === run.length - 1 ? 'end' : 'continue'; }); run = []; };
  items.forEach((it, k) => {
    const len = DUR[it.d];
    if (it.d === 'e' && it.note) { if (run.length && Math.floor(pos / beat) !== Math.floor(items.__last / beat)) flush(); run.push(k); items.__last = pos; }
    else flush();
    pos += len;
  });
  flush(); return tags;
}
function figureXml(f) {
  if (f.voices) return voicesXml(f);
  const ts = f.ts || [4, 4], mlen = ts[0] * 8 / ts[1], clef = f.clef || 'grand', grand = clef === 'grand';
  const fifths = FIFTHS[f.mode || 'major'][f.key || 'C'];
  const evs = f.events.map(e => ({...e, d: e.d || 'w', notes: toNotes(e)}));
  for (let i = 1; i < evs.length; i++)                                      // a note marked "~" is tied to the same pitch in the next event
    for (const n of evs[i - 1].notes) if (n.tie) { const t = evs[i].notes.find(x => x.midi === n.midi); if (t) t.tieStop = true; }
  const bars = []; let cur = [], t = 0;
  for (const e of evs) { cur.push(e); t += DUR[e.d]; if (t === mlen) { bars.push(cur); cur = []; t = 0; } else if (t > mlen) throw new Error('bar overflow in figure ' + (f.id || '')); }
  if (cur.length) { while (t < mlen) { const d = ['w', 'h', 'q', 'e'].find(x => DUR[x] <= mlen - t); cur.push({rest: true, d, notes: []}); t += DUR[d]; } bars.push(cur); }
  const satb = !!f.satb;
  const streams = satb ? [{staff: 1, voice: 1, stem: 'up'}, {staff: 1, voice: 2, stem: 'down'}, {staff: 2, voice: 3, stem: 'up'}, {staff: 2, voice: 4, stem: 'down'}]
    : grand ? [{staff: 1, voice: 1}, {staff: 2, voice: 2}] : [{staff: 1, voice: 1}];
  const stf = s => grand ? `<staff>${s}</staff>` : '';
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const note = (p, d, st, o = {}) => `<note>${o.chord ? '<chord/>' : ''}<pitch><step>${LET[p.step]}</step>${p.alter ? `<alter>${p.alter}</alter>` : ''}<octave>${p.oct}</octave></pitch><duration>${DUR[d]}</duration>${p.tieStop ? '<tie type="stop"/>' : ''}${p.tie ? '<tie type="start"/>' : ''}<voice>${st.voice}</voice><type>${TYPE[d]}</type>${d.endsWith('.') ? '<dot/>' : ''}${st.stem ? `<stem>${st.stem}</stem>` : ''}${stf(st.staff)}${o.beam ? `<beam number="1">${o.beam}</beam>` : ''}${p.tie || p.tieStop ? `<notations>${p.tieStop ? '<tied type="stop"/>' : ''}${p.tie ? '<tied type="start"/>' : ''}</notations>` : ''}</note>`;
  const rest = (d, st) => `<note><rest/><duration>${DUR[d]}</duration><voice>${st.voice}</voice><type>${TYPE[d]}</type>${d.endsWith('.') ? '<dot/>' : ''}${stf(st.staff)}</note>`;
  const words = (txt, place, staff) => `<direction placement="${place}"><direction-type><words font-size="${f.fs || 11}">${esc(txt)}</words></direction-type>${staff ? `<staff>${staff}</staff>` : ''}</direction>`;
  const measures = bars.map((bar, bi) => {
    let x = `<measure number="${bi + 1}">`;
    if (bi === 0) x += `<attributes><divisions>2</divisions><key><fifths>${fifths}</fifths></key><time><beats>${ts[0]}</beats><beat-type>${ts[1]}</beat-type></time>${grand ? '<staves>2</staves>' : ''}` +
      (grand ? '<clef number="1"><sign>G</sign><line>2</line></clef><clef number="2"><sign>F</sign><line>4</line></clef>' : clef === 'bass' ? '<clef><sign>F</sign><line>4</line></clef>' : '<clef><sign>G</sign><line>2</line></clef>') + '</attributes>';
    streams.forEach((st, si) => {
      if (si) x += `<backup><duration>${mlen}</duration></backup>`;
      const mineOf = e => {
        let mine;
        if (e.rest) mine = [];
        else if (satb) { const s2 = sortN(e.notes); if (s2.length !== 4) throw new Error('four voices needed'); mine = [s2[3 - si]]; }
        else if (grand) mine = e.notes.filter(n => (n.midi >= 60) === (st.staff === 1));
        else mine = e.notes;
        return sortN(mine);
      };
      const tags = beamTags(bar.map(e => ({d: e.d, note: mineOf(e).length > 0})), ts);
      for (const [ei, e] of bar.entries()) {
        if (si === 0) {
          if (e.sym) x += words(e.sym, 'above', grand ? 1 : 0);
          if (e.rn) x += words(e.rn, 'below', grand ? 2 : 0);
        }
        const mine = mineOf(e);
        if (!mine.length) x += rest(e.d, st); else mine.forEach((p, i) => { x += note(p, e.d, st, {chord: i > 0, beam: i === 0 ? tags[ei] : ''}); });
      }
    });
    return x + '</measure>';
  });
  return '<?xml version="1.0" encoding="UTF-8"?><score-partwise version="3.1"><part-list><score-part id="P1"><part-name>x</part-name></score-part></part-list><part id="P1">' + measures.join('') + '</part></score-partwise>';
}

/* A figure of independent lines (counterpoint): f.voices = [{staff, voice, events: [{notes, d, sym, rn}]}], each line with its own rhythm. */
function voicesXml(f) {
  const ts = f.ts || [4, 4], mlen = ts[0] * 8 / ts[1], fifths = FIFTHS[f.mode || 'major'][f.key || 'C'];
  const esc = x => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const lines = f.voices.map(v => ({...v, evs: v.events.map(e => ({...e, d: e.d || 'w', notes: toNotes(e)}))}));
  lines.forEach(v => { for (let i = 1; i < v.evs.length; i++) for (const n of v.evs[i - 1].notes) if (n.tie) { const t = v.evs[i].notes.find(x => x.midi === n.midi); if (t) t.tieStop = true; } });
  const split = evs => {
    const bars = []; let cur = [], t = 0;
    for (const e of evs) { cur.push(e); t += DUR[e.d]; if (t === mlen) { bars.push(cur); cur = []; t = 0; } else if (t > mlen) throw new Error('bar overflow in ' + (f.id || 'figure')); }
    if (cur.length) { while (t < mlen) { const d = ['w', 'h', 'q', 'e'].find(x => DUR[x] <= mlen - t); cur.push({rest: true, d, notes: []}); t += DUR[d]; } bars.push(cur); }
    return bars;
  };
  const barsOf = lines.map(v => split(v.evs)), nb = Math.max(...barsOf.map(b => b.length));
  barsOf.forEach(b => { while (b.length < nb) b.push([{rest: true, d: 'w', notes: []}]); });
  const note = (p, d, v, chord, beam) => `<note>${chord ? '<chord/>' : ''}<pitch><step>${LET[p.step]}</step>${p.alter ? `<alter>${p.alter}</alter>` : ''}<octave>${p.oct}</octave></pitch><duration>${DUR[d]}</duration>${p.tieStop ? '<tie type="stop"/>' : ''}${p.tie ? '<tie type="start"/>' : ''}<voice>${v.voice}</voice><type>${TYPE[d]}</type>${d.endsWith('.') ? '<dot/>' : ''}<stem>${v.stem || (v.staff === 1 ? 'up' : 'down')}</stem><staff>${v.staff}</staff>${beam ? `<beam number="1">${beam}</beam>` : ''}${p.tie || p.tieStop ? `<notations>${p.tieStop ? '<tied type="stop"/>' : ''}${p.tie ? '<tied type="start"/>' : ''}</notations>` : ''}</note>`;
  const words = (txt, place, staff) => `<direction placement="${place}"><direction-type><words font-size="${f.fs || 10}">${esc(txt)}</words></direction-type><staff>${staff}</staff></direction>`;
  let body = '';
  for (let bi = 0; bi < nb; bi++) {
    body += `<measure number="${bi + 1}">`;
    if (bi === 0) body += `<attributes><divisions>2</divisions><key><fifths>${fifths}</fifths></key><time><beats>${ts[0]}</beats><beat-type>${ts[1]}</beat-type></time><staves>2</staves><clef number="1"><sign>G</sign><line>2</line></clef><clef number="2"><sign>F</sign><line>4</line></clef></attributes>`;
    lines.forEach((v, vi) => {
      if (vi) body += `<backup><duration>${mlen}</duration></backup>`;
      const evsBar = barsOf[vi][bi], tags = beamTags(evsBar.map(e => ({d: e.d, note: !(e.rest || !e.notes.length)})), ts);
      for (const [ei, e] of evsBar.entries()) {
        if (e.sym) body += words(e.sym, 'above', v.staff);
        if (e.rn) body += words(e.rn, 'below', v.staff);
        if (e.rest || !e.notes.length) body += `<note><rest/><duration>${DUR[e.d]}</duration><voice>${v.voice}</voice><type>${TYPE[e.d]}</type>${e.d.endsWith('.') ? '<dot/>' : ''}<staff>${v.staff}</staff></note>`;
        else sortN(e.notes).forEach((p, i) => { body += note(p, e.d, v, i > 0, i === 0 ? tags[ei] : ''); });
      }
    });
    body += '</measure>';
  }
  return '<?xml version="1.0" encoding="UTF-8"?><score-partwise version="3.1"><part-list><score-part id="P1"><part-name>x</part-name></score-part></part-list><part id="P1">' + body + '</part></score-partwise>';
}

/* ---------- sound ---------- */
let heardTimers = [], heardStop = null;
let sentNotes = 0;
const held = new Map();                                  // MIDI notes we switched on and still owe a note-off
function offNote(m) { const h = held.get(m); if (!h) return; clearTimeout(h); held.delete(m); try { midiOut?.send([0x80, m, 0]); } catch {} }
function playNote(m, dur, vel) {                         // to the piano by MIDI when it is the sound, else the tablet's synth; the note-off is sent when due, not scheduled ahead
  try {
    if (midiOut && S.sound === 'piano') {
      offNote(m);
      midiOut.send([0x90, m, Math.round(30 + vel * 70)]); sentAt[m] = performance.now(); sentNotes++;
      held.set(m, setTimeout(() => { held.delete(m); try { midiOut?.send([0x80, m, 0]); } catch {} }, Math.max(150, dur * 1000)));
      return;
    }
  } catch (e) { console.warn('piano output failed, using the tablet sound', e); try { midiOut = null; } catch {} }
  tone(m, dur, vel);
}
function stopHearing() { heardTimers.forEach(clearTimeout); heardTimers = []; [...held.keys()].forEach(offNote); if (heardStop) { const f = heardStop; heardStop = null; try { f(); } catch {} } }
function planOf(f) {                              // [{t (in beats), notes: [{midi, beats}]}]: one step for every moment something begins (the highlight follows these)
  const lines = f.voices ? f.voices.map(v => v.events) : [f.events], steps = new Map();
  for (const events of lines) {
    const evs = events.map(e => ({e, ns: toNotes(e), beats: DUR[e.d || 'w'] / 2})); let t = 0;
    evs.forEach((x, i) => { x.t = t; t += x.beats; if (i) x.ns.forEach(n => { if (evs[i - 1].ns.some(m => m.tie && m.midi === n.midi)) n.stop = true; }); });
    evs.forEach((x, i) => {
      if (!steps.has(x.t)) steps.set(x.t, []);
      if (x.e.rest) return;
      x.ns.forEach(n => {
        if (n.stop) return;
        let d = x.beats, cur = n;
        for (let j = i + 1; cur.tie && j < evs.length; j++) { const nx = evs[j].ns.find(y => y.midi === n.midi); if (!nx) break; d += evs[j].beats; cur = nx; }
        steps.get(x.t).push({midi: n.midi, beats: d});
      });
    });
  }
  return [...steps.entries()].sort((a, b) => a[0] - b[0]).map(([t, notes]) => ({t, notes}));
}
function hear(f, onStep, onEnd) {                 // play a figure; tied notes sustain; a whole note never leaves a silent gap
  stopHearing(); heardStop = onEnd || null;
  const beat = Math.min(0.75, Math.max(0.45, 60 / (f.bpm || 84))), plan = planOf(f);
  let end = 0;
  plan.forEach((st, i) => {
    heardTimers.push(setTimeout(() => {
      if (onStep) onStep(i);
      st.notes.forEach(n => { try { playNote(n.midi, n.beats * beat * 0.97, 0.6); } catch (e) { console.warn(e); } });
    }, st.t * beat * 1000));
    st.notes.forEach(n => { end = Math.max(end, st.t + n.beats); });
  });
  heardTimers.push(setTimeout(() => { const f2 = heardStop; heardStop = null; if (f2) f2(); }, end * beat * 1000 + 300));
}

/* ---------- the dialog ---------- */
const chapters = [];
const state = {view: 'list', chapter: null, ex: null, quiz: null};
const $h = id => document.getElementById(id);
const prog = () => store.get('harmony', {});
const saveProg = (id, patch) => { const p = prog(); p[id] = Object.assign({}, p[id], patch); store.set('harmony', p); };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

async function drawFigure(el, f) {
  el.textContent = ''; el.style.width = ''; el.style.height = '';
  const o = new opensheetmusicdisplay.OpenSheetMusicDisplay(el, {autoResize: false, drawTitle: false, drawPartNames: false, drawComposer: false, drawCredits: false, backend: 'svg', autoBeam: true, followCursor: false});
  Object.assign(o.EngravingRules, {PageTopMargin: 0.5, PageBottomMargin: 0.5, PageLeftMargin: 1, PageRightMargin: 1, VoiceSpacingMultiplierVexflow: f.spread || 1.6, VoiceSpacingAddendVexflow: f.add ?? 8, AutoBeamNotes: true});
  await o.load(figureXml(f)); o.zoom = f.zoom || 0.85; o.render();
  const svg = el.querySelector('svg'); if (!svg) return o;               // fit the paper to the music: no long empty staff lines or blank space
  const sr = svg.getBoundingClientRect(); let right = 0, bottom = 0;
  svg.querySelectorAll('path, text, rect, line').forEach(n => {
    const r = n.getBoundingClientRect(); if (!r.width && !r.height) return;
    right = Math.max(right, r.right - sr.left); bottom = Math.max(bottom, r.bottom - sr.top);
  });
  el.style.width = Math.min(el.parentNode.clientWidth || 9999, Math.ceil(right + 12)) + 'px';
  el.style.height = Math.ceil(bottom + 10) + 'px';
  return o;
}
function figureBox(f, caption) {
  const box = document.createElement('div'); box.className = 'fig';
  box.innerHTML = `<div class="hfig"></div><div class="figbar"><button class="hear" aria-label="Hear this example">▶ Hear</button><span class="cap"></span></div><div class="route"></div>`;
  box.querySelector('.cap').innerHTML = caption || '';
  const btn = box.querySelector('.hear'); let osm = null;
  const route = box.querySelector('.route');
  const done = () => { btn.textContent = '▶ Hear'; btn.classList.remove('playing'); try { osm?.cursor.hide(); } catch {} if (route.textContent) route.textContent += ` · ${sentNotes} notes sent`; };
  btn.onclick = () => {
    if (btn.classList.contains('playing')) return stopHearing();
    try {
      const viaPiano = !!(midiOut && S.sound === 'piano'); sentNotes = 0;
      route.textContent = viaPiano ? `Playing on the piano by MIDI (${midiOut.name || 'MIDI output'})` : `Playing on the tablet speaker (sound setting: ${S.sound}; piano output ${midiOut ? 'found' : 'not found'})`;
      if (!viaPiano) { try { initAudio(); } catch {} }      // with the piano as the sound, no tablet audio is opened at all
      btn.textContent = '■ Stop'; btn.classList.add('playing');
      try { osm?.cursor.reset(); osm?.cursor.show(); } catch {}
      hear(f, i => { try { if (i) osm?.cursor.next(); } catch {} }, done);
    } catch (err) { console.error(err); done(); box.querySelector('.cap').textContent = 'Could not play this example: ' + (err.message || err); }
  };
  requestAnimationFrame(() => drawFigure(box.querySelector('.hfig'), f).then(o => { osm = o; }).catch(err => { box.querySelector('.hfig').textContent = 'Could not draw this example.'; console.error(err); }));
  return box;
}

function showList() {
  stopHearing(); state.view = 'list'; state.ex = null; state.quiz = null;
  $h('hback').hidden = true; $h('htitle').textContent = 'Harmony';
  const p = prog(), done = chapters.filter(c => (p[c.id] || {}).done).length;
  const body = $h('hbody');
  body.innerHTML = `<p class="muted">A short course in classical harmony: how chords are built, how they follow one another and how they are joined in four parts. Each chapter has examples to <b>hear</b>, a quiz and exercises to <b>play</b> on your piano (or the keys on screen). A chapter is done when you get 4 of 5 in its quiz. <b>${done} of ${chapters.length} done.</b></p><div class="hlist"></div><p class="muted" style="font-size:13px;margin-top:18px">Many topics follow the outline of <i>Music Theory for the 21st-Century Classroom</i> by Robert Hutchinson (University of Puget Sound; free under the GNU Free Documentation License, musictheory.pugetsound.edu). The explanations, examples, questions and Korean terms here are our own.</p>`;
  const list = body.querySelector('.hlist');
  const g = document.createElement('button'); g.className = 'hcard gloss'; g.innerHTML = `<span class="n">Aa</span><span class="t"><b>Glossary · 용어집</b><small>Key terms in English and Korean · 영어와 한국어 핵심 용어</small></span><span class="st">${glossary.length}</span>`; g.onclick = showGlossary; list.append(g);
  let lastPart = null;
  chapters.forEach((c, i) => {
    if (c.part && c.part !== lastPart) { lastPart = c.part; const h = document.createElement('h3'); h.className = 'hpart'; h.textContent = c.part; list.append(h); }
    const s = p[c.id] || {}, b = document.createElement('button'); b.className = 'hcard' + (s.done ? ' done' : '');
    b.innerHTML = `<span class="n">${i + 1}</span><span class="t"><b>${esc(c.title)}</b><small>${esc(c.blurb)}</small></span><span class="st">${s.done ? '✓' : s.quiz !== undefined ? `${s.quiz}/5` : ''}</span>`;
    b.onclick = () => showChapter(i); list.append(b);
  });
}

let glossary = [];
function showGlossary() {
  stopHearing(); state.view = 'glossary'; state.ex = null; state.quiz = null;
  $h('hback').hidden = false; $h('htitle').textContent = 'Glossary · 용어집';
  const lang = store.get('harmonyLang', 'both'), body = $h('hbody');
  body.innerHTML = `<p class="muted">Key terms of the course in English and Korean. Search in either language, and tap a chapter to read more. / 이 과정의 핵심 용어를 영어와 한국어로 정리했습니다. 두 언어 모두로 검색할 수 있습니다.</p>
    <div class="gtools"><input id="hsearch" type="search" placeholder="Search · 검색" aria-label="Search the glossary"><div class="seg" id="hlang"><button data-v="both">Both · 둘 다</button><button data-v="en">English</button><button data-v="ko">한국어</button></div></div>
    <p class="muted" id="hcount"></p><div id="glist"></div>`;
  const list = $h('glist'), q = $h('hsearch');
  const paint = () => {
    const l = store.get('harmonyLang', 'both'), t = q.value.trim().toLowerCase();
    $h('hlang').querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === l));
    const rows = glossary.filter(g => !t || g.slice(0, 4).join(' ').toLowerCase().includes(t)).sort((x, y) => x[0].toLowerCase().localeCompare(y[0].toLowerCase()));
    $h('hcount').textContent = `${rows.length} of ${glossary.length} terms · ${rows.length}개 / 전체 ${glossary.length}개`;
    list.innerHTML = '';
    for (const [en, ko, ed, kd, ch] of rows) {
      const d = document.createElement('div'); d.className = 'gterm';
      d.innerHTML = `<div class="gh"><b class="gen"></b><b class="gko"></b></div><p class="ged"></p><p class="gkd"></p><button class="glink"></button>`;
      d.querySelector('.gen').textContent = en; d.querySelector('.gko').textContent = ko;
      d.querySelector('.ged').textContent = ed; d.querySelector('.gkd').textContent = kd;
      d.querySelector('.gen').hidden = l === 'ko'; d.querySelector('.gko').hidden = l === 'en';
      d.querySelector('.ged').hidden = l === 'ko'; d.querySelector('.gkd').hidden = l === 'en';
      const k = chapters.findIndex(x => x.id === ch), c = chapters[k], bt = d.querySelector('.glink');
      if (c) { bt.textContent = `Chapter ${k + 1} · ${c.title} →`; bt.onclick = () => showChapter(k); } else bt.remove();
      list.append(d);
    }
    if (!rows.length) list.innerHTML = '<p class="muted">No matching term. · 일치하는 용어가 없습니다.</p>';
  };
  q.oninput = paint;
  $h('hlang').onclick = e => { const b = e.target.closest('button'); if (!b) return; store.set('harmonyLang', b.dataset.v); paint(); };
  paint(); $h('harmony').scrollTop = 0;
}
function showChapter(i) {
  stopHearing(); const c = chapters[i]; state.view = 'chapter'; state.chapter = i; state.ex = null; state.quiz = null;
  $h('hback').hidden = false; $h('htitle').textContent = `${i + 1} · ${c.title}`;
  const body = $h('hbody'), s = prog()[c.id] || {};
  body.innerHTML = '<div class="hchap"></div>';
  const wrap = body.querySelector('.hchap');
  wrap.innerHTML = c.body.replace(/\{\{ch:([\w-]+)\}\}/g, (_, id) => { const k = chapters.findIndex(x => x.id === id); return k < 0 ? 'the chapter on ' + id : `Chapter ${k + 1}`; }).replace(/\{\{fig:([\w-]+)(?:\|([^}]*))?\}\}/g, (_, id, cap) => `<div class="figslot" data-id="${id}" data-cap="${esc(cap || '')}"></div>`);
  wrap.querySelectorAll('.figslot').forEach(slot => {
    const f = c.figs[slot.dataset.id]; if (!f) { slot.textContent = '(missing example)'; return; }
    slot.replaceWith(figureBox({id: slot.dataset.id, ...f}, slot.dataset.cap));
  });
  const act = document.createElement('div'); act.className = 'hact';
  act.innerHTML = `<h3>Test yourself</h3><p class="muted">Five questions; 4 right completes the chapter.${s.quiz !== undefined ? ` Best so far: ${s.quiz}/5.` : ''}</p><button class="primary" id="hquiz">Start the quiz</button>
    ${c.play && c.play.length ? `<h3>Play it</h3><p class="muted">${c.play.length} short exercise${c.play.length > 1 ? 's' : ''}. Play on your piano or on the keys below.${s.played ? ` Completed so far: ${s.played}.` : ''}</p><button class="primary" id="hplay">Start the exercises</button>` : ''}`;
  wrap.append(act);
  const next = chapters[i + 1];
  if (next) { const n = document.createElement('p'); n.innerHTML = `<button id="hnext">Next chapter: ${esc(next.title)} →</button>`; wrap.append(n); n.firstChild.onclick = () => showChapter(i + 1); }
  $h('hquiz').onclick = () => startQuiz(i); if ($h('hplay')) $h('hplay').onclick = () => startPlay(i);
  $h('harmony').scrollTop = 0;
}

/* ---------- quiz ---------- */
function startQuiz(i) {
  const c = chapters[i], qs = []; const seen = new Set();
  for (let tries = 0; qs.length < 5 && tries < 60; tries++) {
    const g = c.quiz[tries % c.quiz.length], q = g(); if (seen.has(q.text + (q.fig ? JSON.stringify(q.fig.events) : ''))) continue;
    seen.add(q.text + (q.fig ? JSON.stringify(q.fig.events) : '')); qs.push(q);
  }
  state.quiz = {i, qs, n: 0, right: 0}; quizShow();
}
function quizShow() {
  const z = state.quiz, c = chapters[z.i], q = z.qs[z.n], body = $h('hbody');
  body.innerHTML = `<div class="hq"><p class="muted">Question ${z.n + 1} of ${z.qs.length}</p><h3></h3><div class="qfig"></div><div class="opts"></div><div class="why" aria-live="polite"></div></div>`;
  body.querySelector('h3').textContent = q.text;
  if (q.fig) { const box = figureBox(q.fig, ''); box.querySelector('.cap').remove(); body.querySelector('.qfig').append(box); }
  const opts = body.querySelector('.opts');
  q.answers.forEach(([v, label]) => {
    const b = document.createElement('button'); b.textContent = label; b.dataset.v = v;
    b.onclick = () => {
      opts.querySelectorAll('button').forEach(x => { x.disabled = true; if (x.dataset.v === String(q.answer)) x.classList.add('right'); });
      const ok = String(v) === String(q.answer); if (ok) z.right++; else b.classList.add('wrong');
      body.querySelector('.why').innerHTML = `${ok ? '<b>Correct.</b> ' : '<b>Not quite.</b> '}${q.why ? esc(q.why) : ''} <button class="primary" id="hnq">${z.n + 1 < z.qs.length ? 'Next question' : 'See the result'}</button>`;
      $h('hnq').onclick = () => { z.n++; z.n < z.qs.length ? quizShow() : quizEnd(); };
    };
    opts.append(b);
  });
}
function quizEnd() {
  const z = state.quiz, c = chapters[z.i], old = prog()[c.id] || {};
  const best = Math.max(old.quiz || 0, z.right), done = old.done || z.right >= 4;
  saveProg(c.id, {quiz: best, done});
  $h('hbody').innerHTML = `<div class="hq"><h3>${z.right} of ${z.qs.length}</h3><p>${z.right >= 4 ? 'Well done: this chapter is complete.' : 'Read the chapter again, listen to the examples and try once more.'}</p>
    <p><button class="primary" id="hagain">Try again</button> <button id="hchap">Back to the chapter</button> <button id="hlistb">All chapters</button></p></div>`;
  $h('hagain').onclick = () => startQuiz(z.i); $h('hchap').onclick = () => showChapter(z.i); $h('hlistb').onclick = showList;
}

/* ---------- exercises: play chords on the piano or the keys on screen ---------- */
function startPlay(i) {
  const c = chapters[i], list = c.play.map(g => g());
  state.ex = {i, list, n: 0}; playShow();
}
function playKeys() {
  const lo = 48, hi = 83, whites = []; for (let m = lo; m <= hi; m++) if (![1, 3, 6, 8, 10].includes(m % 12)) whites.push(m);
  const w = 100 / whites.length; let h = '';
  whites.forEach(m => { h += `<div class="w" data-m="${m}"></div>`; });
  for (let m = lo; m <= hi; m++) if ([1, 3, 6, 8, 10].includes(m % 12)) h += `<div class="b" data-m="${m}" style="width:${w * 0.62}%;left:${(whites.indexOf(m - 1) + 1) * w - w * 0.31}%"></div>`;
  return `<div class="hkeys" id="hkeys">${h}</div>`;
}
function playShow() {
  const z = state.ex, ex = z.list[z.n], body = $h('hbody');
  ex.step = 0; ex.got = new Map(); clearTimeout(ex.timer);
  body.innerHTML = `<div class="hq"><p class="muted">Exercise ${z.n + 1} of ${z.list.length}</p><h3>${esc(ex.title)}</h3><p class="muted">${esc(ex.help || '')}</p>
    <div class="steps" id="hsteps"></div><div class="why" id="hfeed" aria-live="polite">Play the first chord.</div>
    ${playKeys()}<p><button id="hhint">Show the notes</button> <button id="hskip">Skip</button> <button id="hstop">Stop</button></p></div>`;
  paintSteps(); wireKeys();
  $h('hhint').onclick = () => { ex.hint = true; paintSteps(); };
  $h('hskip').onclick = () => playNext(); $h('hstop').onclick = () => { state.ex = null; showChapter(z.i); };
}
function paintSteps() {
  const ex = state.ex.list[state.ex.n];
  $h('hsteps').innerHTML = ex.steps.map((s, k) => `<span class="stp${k < ex.step ? ' ok' : k === ex.step ? ' now' : ''}"><b>${esc(s.label)}</b>${ex.hint || k < ex.step ? `<small>${s.names.join(' ')}</small>` : ''}</span>`).join('');
}
function wireKeys() {
  const kb = $h('hkeys');
  kb.querySelectorAll('div').forEach(k => {
    k.addEventListener('pointerdown', e => { e.preventDefault(); const m = +k.dataset.m; try { playNote(m, 0.7, 0.5); } catch {} hKey(m); });
  });
}
function flashKey(m, cls) { const k = document.querySelector(`#hkeys [data-m="${m}"]`); if (!k) return; k.classList.add(cls); setTimeout(() => k.classList.remove(cls), 220); }
function hKey(m) {                                    // a key pressed on the piano or on screen
  const z = state.ex; if (!z || state.view === 'list') return flashKey(m, 'on');
  const ex = z.list[z.n]; if (!ex || ex.step >= ex.steps.length) return;
  const st = ex.steps[ex.step], pc = ((m % 12) + 12) % 12;
  clearTimeout(ex.timer); ex.timer = setTimeout(() => { ex.got = new Map(); }, 2600);
  if (st.midi !== undefined ? m !== st.midi : !st.pcs.includes(pc)) { ex.got = new Map(); flashKey(m, 'bad'); $h('hfeed').textContent = `${NOTE_NAMES[pc]} is not in this chord. Try again.`; return; }
  flashKey(m, 'on'); ex.got.set(pc, Math.min(ex.got.get(pc) ?? 999, m));
  if (ex.got.size < st.pcs.length) { $h('hfeed').textContent = `${ex.got.size} of ${st.pcs.length} notes…`; return; }
  const low = Math.min(...ex.got.values()) % 12;
  if (st.bass !== undefined && low !== st.bass) { ex.got = new Map(); $h('hfeed').textContent = `The right notes, but the lowest note should be ${NOTE_NAMES[st.bass]}. Try again.`; return; }
  ex.step++; ex.got = new Map(); paintSteps();
  if (ex.step >= ex.steps.length) { $h('hfeed').innerHTML = `<b>Done.</b> <button class="primary" id="hnx">${z.n + 1 < z.list.length ? 'Next exercise' : 'Finish'}</button>`; $h('hnx').onclick = playNext; }
  else $h('hfeed').textContent = 'Good. Next chord.';
}
const NOTE_NAMES = ['C', 'C♯/D♭', 'D', 'D♯/E♭', 'E', 'F', 'F♯/G♭', 'G', 'G♯/A♭', 'A', 'A♯/B♭', 'B'];
function playNext() {
  const z = state.ex; if (!z) return; const ex = z.list[z.n];
  if (ex.step >= ex.steps.length) { const s = prog()[chapters[z.i].id] || {}; saveProg(chapters[z.i].id, {played: (s.played || 0) + 1}); }
  z.n++; if (z.n < z.list.length) return playShow();
  state.ex = null; showChapter(z.i);
}

function open() {
  $h('harmony').hidden = false; document.body.style.overflow = 'hidden';
  if (state.view === 'chapter' && state.chapter !== null && !state.quiz && !state.ex) showChapter(state.chapter); else showList();
}
function close() { stopHearing(); $h('harmony').hidden = true; document.body.style.overflow = ''; }
function wire() {
  $h('hclose').onclick = close; $h('harmony').onclick = e => { if (e.target === $h('harmony')) close(); };
  $h('hback').onclick = () => showList();
}
window.Harmony = {
  register(list) { chapters.length = 0; chapters.push(...list); }, registerGlossary(list) { glossary = list; }, _chapters: () => chapters, open, close, wire, isOpen: () => !$h('harmony').hidden, key: hKey,
  api: {planOf, parse, nm, pn, mk, above, scale, rn, chordFromRoot, pcsOf, sortN, figureXml, QUAL, QNAME, FIFTHS, shiftOct, bump, ROMAN, DUR},
};
if (typeof module !== 'undefined') module.exports = window.Harmony;
})();
