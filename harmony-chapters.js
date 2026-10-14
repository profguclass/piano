/* Harmony tutorial: the chapters (text, examples, quiz questions and exercises). The engine is in harmony.js. */
(() => {
'use strict';
const A = window.Harmony.api, {parse, nm, pn, above, scale, rn, chordFromRoot, pcsOf, sortN, QNAME} = A;
const SUP = {6: '⁶', 7: '⁷', 65: '⁶₅', 43: '⁴₃', 42: '⁴₂', 64: '⁶₄'};
const fmt = s => s.split('/').map(p => p.replace(/M7$/, 'maj⁷').replace(/(65|43|42|64|7|6)$/, f => SUP[f])).join('/');       // V65 -> V⁶₅
const SUFFIX = {major: '', minor: 'm', dim: '°', aug: '+', dom7: '7', maj7: 'maj7', min7: 'm7', hdim7: 'ø7', dim7: '°7'};
const symOf = c => pn(nm(c.root)) + SUFFIX[c.quality];
const NUMS = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
const MAJKEYS = ['C', 'G', 'D', 'A', 'F', 'Bb', 'Eb'], MINKEYS = ['A', 'E', 'D', 'G', 'B', 'C'];
const ROOTS = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Bb', 'Eb', 'F#', 'Ab'];
const R = r => parse(r + '4');
const trio = (root, q) => chordFromRoot(R(root), q).map(n => nm(n)).join(' – ');
const cap = s => s[0].toUpperCase() + s.slice(1);

/* figures */
const prog = (key, mode, list, o = {}) => ({key, mode, clef: o.clef || 'treble', bpm: o.bpm, events: list.map(s => { const c = rn(s, key, mode, o.oct || 4); return {notes: c.notes, d: o.d || 'w', rn: fmt(s), sym: symOf(c)}; })});
const satb = (key, mode, list, o = {}) => ({key, mode, clef: 'grand', satb: true, bpm: o.bpm, events: list.map(([v, label, d]) => ({notes: v.split(' '), d: d || o.d || 'h', rn: label}))});
const block = (key, mode, list, o = {}) => ({key, mode, clef: 'grand', bpm: o.bpm, events: list.map(([v, label, sym, d]) => ({notes: v.split(' '), d: d || o.d || 'h', rn: label, sym}))});
const line = (key, mode, notes, o = {}) => ({key, mode, clef: 'treble', bpm: o.bpm, events: notes.map((n, i) => ({notes: [n], d: o.d || 'q', sym: o.sym?.[i], rn: o.rn?.[i]}))});
const melody = (key, list, o = {}) => ({key, mode: 'major', clef: 'grand', bpm: o.bpm, events: list.map(([n, b, d, sym, r]) => ({notes: [n, b], d: d || 'q', sym, rn: r}))});

/* questions and exercises */
const ask = (text, right, wrong, why, extra) => Object.assign(mc(text, right, wrong), {why}, extra);
const bank = list => () => { const [q, r, w, why] = pick(list); return ask(q, r, w, why); };
const chordStep = (sym, key, mode, inv) => {
  const c = rn(sym, key, mode), step = {label: fmt(sym), pcs: pcsOf(c.notes), names: c.notes.map(n => nm(n))};
  if (/(65|43|42|64|6)$/.test(sym.split('/')[0]) || inv) step.bass = ((c.notes[0].midi % 12) + 12) % 12;
  step.label += ' · ' + symOf(c);
  return step;
};
const progEx = (title, list, key, mode, help) => () => { const k = typeof key === 'function' ? key() : key; return {title: title.replace('{key}', pn(k) + (mode === 'minor' ? ' minor' : ' major')), help: help || 'Play each chord in turn, all its notes together, in any octave.', steps: list.map(s => chordStep(s, k, mode))}; };
const scaleEx = () => { const k = pick(MAJKEYS), s = scale(k + '4', 'major', 8); return {title: `Play the ${pn(k)} major scale`, help: 'One note at a time, going up from the tonic. Any octave.', steps: s.map((n, i) => ({label: String(i + 1), pcs: [((n.midi % 12) + 12) % 12], names: [nm(n)]}))}; };
const triadEx = () => { const r = pick(ROOTS), q = pick(['major', 'minor', 'dim', 'aug']), c = chordFromRoot(R(r), q); return {title: `Play the ${pn(r)} ${QNAME[q]}`, help: `It is made of ${c.map(n => nm(n)).join(', ')}. Play them together.`, steps: [{label: pn(r) + SUFFIX[q], pcs: pcsOf(c), names: c.map(n => nm(n))}]}; };
const triadsEx = () => { const qs = ['major', 'minor', 'dim', 'aug'], r = pick(ROOTS); return {title: `Four triads on ${pn(r)}`, help: 'Change one note each time: lower the third for minor, lower the fifth for diminished, raise it for augmented.', steps: qs.map(q => { const c = chordFromRoot(R(r), q); return {label: pn(r) + SUFFIX[q] + ' · ' + q, pcs: pcsOf(c), names: c.map(n => nm(n))}; })}; };
const invEx = () => { const r = pick(['C', 'F', 'G', 'D', 'A', 'Bb']), q = pick(['major', 'minor']), c = chordFromRoot(R(r), q), inv = pick([1, 2]);
  return {title: `Play ${pn(r)}${q === 'minor' ? ' minor' : ''} in ${inv === 1 ? 'first' : 'second'} inversion`, help: `The lowest note must be the ${inv === 1 ? 'third' : 'fifth'}: ${nm(c[inv])}.`, steps: [{label: `${pn(r)}${SUFFIX[q]}${inv === 1 ? '⁶' : '⁶₄'}`, pcs: pcsOf(c), names: c.map(n => nm(n)), bass: ((c[inv].midi % 12) + 12) % 12}]}; };
const noteSteps = (title, help, names) => () => ({title, help, steps: names.map(n => { const p = parse(n + '4'); return {label: nm(p), pcs: [((p.midi % 12) + 12) % 12], names: [nm(p)]}; })});
const seventhEx = () => { const r = pick(['C', 'G', 'D', 'F', 'A', 'E', 'Bb']), q = pick(['dom7', 'maj7', 'min7', 'hdim7']), c = chordFromRoot(R(r), q); return {title: `Play ${pn(r)}${SUFFIX[q]}`, help: `A ${QNAME[q]}: ${c.map(n => nm(n)).join(', ')}.`, steps: [{label: pn(r) + SUFFIX[q], pcs: pcsOf(c), names: c.map(n => nm(n))}]}; };
const cadEx = (title, pair) => () => { const k = pick(MAJKEYS); return progEx(title, pair, k, 'major')(); };

const CH = [];

/* 1 ---------------------------------------------------------------- */
CH.push({id: 'scales', title: 'Scales, keys and scale degrees', blurb: 'The major scale, the names of its notes, key signatures',
  body: `<p>Harmony is built on the <b>major scale</b>: seven different notes in a fixed pattern of whole steps (W) and half steps (H), <b>W W H W W W H</b>, after which the pattern repeats an octave higher. A half step is the smallest distance on the piano, from one key to the very next one, black or white.</p>
{{fig:cmaj|C major. The half steps lie between degrees 3–4 and 7–8.}}
<p>Each note of the scale is a <b>scale degree</b>, and each has a name that describes its job in the key:</p>
<table class="htab"><tr><th>1</th><td>Tonic</td><td>home; where the music rests</td></tr><tr><th>2</th><td>Supertonic</td><td>just above the tonic</td></tr><tr><th>3</th><td>Mediant</td><td>halfway to the dominant; decides major or minor</td></tr><tr><th>4</th><td>Subdominant</td><td>a fifth below the tonic</td></tr><tr><th>5</th><td>Dominant</td><td>a fifth above the tonic; the strongest pull towards home</td></tr><tr><th>6</th><td>Submediant</td><td>halfway between tonic and subdominant (below)</td></tr><tr><th>7</th><td>Leading tone</td><td>a half step below the tonic; it “leads” up to it</td></tr></table>
<p>The <b>key signature</b> lists the sharps or flats a key needs to keep that W W H W W W H pattern. Moving up a fifth adds a sharp (order F C G D A E B). Moving down a fifth adds a flat (order B E A D G C F). G major has one sharp, F♯, because only F♯ puts the half step between degrees 7 and 8.</p>
{{fig:gmaj|G major: one sharp, F♯, in the key signature.}}
<p>Every major key has a <b>relative minor</b> with the same key signature. It starts on the sixth degree, a minor third below the tonic: A minor goes with C major, E minor with G major.</p>`,
  figs: {
    cmaj: line('C', 'major', ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'], {sym: ['', 'W', 'W', 'H', 'W', 'W', 'W', 'H'], rn: ['1', '2', '3', '4', '5', '6', '7', '8'], bpm: 100}),
    gmaj: line('G', 'major', ['G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F#5', 'G5'], {sym: ['', 'W', 'W', 'H', 'W', 'W', 'W', 'H'], rn: ['1', '2', '3', '4', '5', '6', '7', '8'], bpm: 100}),
  },
  quiz: [
    () => { const [n, d] = pick([['tonic', '1st'], ['supertonic', '2nd'], ['mediant', '3rd'], ['subdominant', '4th'], ['dominant', '5th'], ['submediant', '6th'], ['leading tone', '7th']]); return ask(`Which scale degree is called the ${n}?`, d, ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th'], `The ${n} is the ${d} degree.`); },
    () => { const k = pick(MAJKEYS), s = scale(k + '4', 'major', 8).map(n => nm(n)); return ask(`What is the dominant of ${pn(k)} major?`, s[4], s.slice(0, 7).filter((_, i) => i !== 4), `The dominant is the 5th degree: ${s.join(' ')}.`); },
    () => { const k = pick(['G', 'D', 'A', 'F', 'Bb', 'Eb']), n = A.FIFTHS.major[k], d = n > 0 ? `${n} sharp${n > 1 ? 's' : ''}` : `${-n} flat${n < -1 ? 's' : ''}`; return ask(`Which major key has ${d}?`, pn(k) + ' major', ['G', 'D', 'A', 'F', 'Bb', 'Eb', 'C'].map(x => pn(x) + ' major'), 'Each fifth up adds a sharp, each fifth down adds a flat.'); },
    bank([['Which pattern of whole (W) and half (H) steps makes a major scale?', 'W W H W W W H', ['W H W W H W W', 'W W W H W W H', 'H W W H W W W'], 'The half steps fall between 3–4 and 7–8.'],
      ['Which degree is the leading tone?', 'The 7th', ['The 4th', 'The 5th', 'The 2nd'], 'It lies a half step below the tonic and leads up to it.'],
      ['What is the relative minor of C major?', 'A minor', ['E minor', 'D minor', 'C minor'], 'It starts on the 6th degree and shares the key signature.']]),
  ],
  play: [scaleEx, scaleEx, noteSteps('Tonic, dominant, tonic in C', 'The strongest two notes of the key: C, then G, then C.', ['C', 'G', 'C'])]});

/* 2 ---------------------------------------------------------------- */
const INTS = [['minor 2nd', 1, 1], ['major 2nd', 1, 2], ['minor 3rd', 2, 3], ['major 3rd', 2, 4], ['perfect 4th', 3, 5], ['augmented 4th', 3, 6], ['diminished 5th', 4, 6], ['perfect 5th', 4, 7], ['minor 6th', 5, 8], ['major 6th', 5, 9], ['minor 7th', 6, 10], ['major 7th', 6, 11]];
const ints = (root, names) => names.map(n => { const [, d, s] = INTS.find(x => x[0] === n); return [R(root), above(R(root), d, s)]; });
CH.push({id: 'intervals', title: 'Intervals', blurb: 'The distance between two notes: size and quality',
  body: `<p>An <b>interval</b> is the distance between two notes. Its <b>size</b> is the number of letter names it spans, counting both ends: C up to E is a 3rd (C–D–E). Its <b>quality</b> is the exact number of half steps: a <b>major</b> 3rd has 4, a <b>minor</b> 3rd has 3.</p>
{{fig:ints|Intervals above C. Listen to how the 2nds and 7ths grate and the 3rds and 6ths blend.}}
<table class="htab"><tr><th>Perfect</th><td>unison, 4th, 5th, octave</td><td>open, stable (4th, 5th: 5 and 7 half steps)</td></tr><tr><th>Major / minor</th><td>2nd, 3rd, 6th, 7th</td><td>minor is one half step smaller than major</td></tr><tr><th>Augmented</th><td>one half step larger than perfect or major</td><td>C–F♯ is an augmented 4th (6 half steps, the tritone)</td></tr><tr><th>Diminished</th><td>one half step smaller than perfect or minor</td><td>C–G♭ is a diminished 5th (also 6)</td></tr></table>
<p>Intervals are heard as <b>consonant</b> (stable: unisons, octaves, 5ths, 4ths — the “perfect” ones — and 3rds and 6ths, which are “imperfect” consonances) or <b>dissonant</b> (tense, asking to move on: 2nds, 7ths and the tritone). Chords are stacks of intervals, so every harmonic idea in the next chapters comes back to these.</p>
<p>The spelling matters: C–E♭ is a minor 3rd, but C–D♯ sounds the same on the piano and is an augmented 2nd. The letters tell you the size.</p>`,
  figs: {ints: {key: 'C', mode: 'major', clef: 'treble', bpm: 70, events: ints('C', ['minor 2nd', 'major 2nd', 'minor 3rd', 'major 3rd', 'perfect 4th', 'perfect 5th', 'major 6th', 'major 7th']).map(([a, b], i) => ({notes: [a, b], d: 'h', sym: ['m2', 'M2', 'm3', 'M3', 'P4', 'P5', 'M6', 'M7'][i]}))}},
  quiz: [
    () => { const r = pick(['C', 'D', 'E', 'F', 'G', 'A', 'Bb', 'Eb']), [name, d, s] = pick(INTS.filter(x => !['augmented 4th', 'diminished 5th'].includes(x[0])));
      return ask('Name this interval.', name, INTS.map(x => x[0]), `${name}: ${d + 1} letter names and ${s} half steps.`, {fig: {key: 'C', mode: 'major', clef: 'treble', events: [{notes: [R(r), above(R(r), d, s)], d: 'w'}]}}); },
    () => { const [name, d, s] = pick(INTS.slice(0, 4)); return ask(`How many half steps are in a ${name}?`, String(s), ['1', '2', '3', '4', '5'], `A ${name} has ${s} half steps.`); },
    bank([['Which of these is a dissonance?', 'Major 7th', ['Perfect 5th', 'Major 3rd', 'Minor 6th'], '7ths (like 2nds) clash and want to resolve.'],
      ['Which intervals are called “perfect”?', 'Unison, 4th, 5th and octave', ['2nd, 3rd, 6th and 7th', '3rd and 6th only', 'Only the octave'], 'These four keep one form; the others come in major and minor.'],
      ['How is a minor 3rd different from a major 3rd?', 'It is one half step smaller', ['It is one whole step smaller', 'It is a letter name larger', 'It is perfect'], 'Minor 3rd: 3 half steps; major 3rd: 4.'],
      ['C up to E♭: what interval is it?', 'Minor 3rd', ['Major 3rd', 'Augmented 2nd', 'Perfect 4th'], 'Three letter names (C–D–E), three half steps.']]),
  ],
  play: [() => { const r = pick(['C', 'D', 'F', 'G', 'A']), [name, d, s] = pick(INTS.slice(0, 4)), t = above(R(r), d, s); return {title: `Play a ${name} above ${pn(r)}`, help: `The two notes are ${r} and ${nm(t)}. Play them together.`, steps: [{label: name, pcs: pcsOf([R(r), t]), names: [pn(r), nm(t)]}]}; },
    () => { const r = pick(['C', 'F', 'G']), t = above(R(r), 4, 7); return {title: `Play a perfect 5th above ${pn(r)}`, help: 'A perfect 5th is 7 half steps.', steps: [{label: 'P5', pcs: pcsOf([R(r), t]), names: [pn(r), nm(t)]}]}; },
    () => { const r = pick(['C', 'D', 'E']), t = above(R(r), 2, 3), u = above(R(r), 2, 4); return {title: `A minor 3rd, then a major 3rd above ${pn(r)}`, help: 'The upper note moves up one half step.', steps: [{label: 'minor 3rd', pcs: pcsOf([R(r), t]), names: [pn(r), nm(t)]}, {label: 'major 3rd', pcs: pcsOf([R(r), u]), names: [pn(r), nm(u)]}]}; }]});

/* 3 ---------------------------------------------------------------- */
CH.push({id: 'triads', title: 'Triads', blurb: 'Three-note chords: major, minor, diminished, augmented',
  body: `<p>A <b>chord</b> is three or more notes sounded together. The simplest and most important chord is the <b>triad</b>: a note called the <b>root</b>, the note a third above it (the <b>third</b>) and the note a fifth above the root (the <b>fifth</b>). On the staff a triad in this form sits on three neighbouring lines or three neighbouring spaces.</p>
<p>The kind of triad depends on the two stacked thirds:</p>
<table class="htab"><tr><th>Major</th><td>major 3rd + minor 3rd</td><td>bright, stable. C–E–G</td></tr><tr><th>Minor</th><td>minor 3rd + major 3rd</td><td>darker, stable. C–E♭–G</td></tr><tr><th>Diminished</th><td>minor 3rd + minor 3rd</td><td>tense, unstable. C–E♭–G♭</td></tr><tr><th>Augmented</th><td>major 3rd + major 3rd</td><td>restless, unresolved. C–E–G♯</td></tr></table>
{{fig:triads|The four triads on C. From major, lower the third for minor, lower the fifth too for diminished; raise the fifth for augmented.}}
<p>Name the chord by its root: “C major”, “A minor” (written <b>Am</b>), “B diminished” (<b>B°</b>), “C augmented” (<b>C+</b>). Major and minor triads are <b>consonant</b>; diminished and augmented triads are <b>dissonant</b> and want to move.</p>`,
  figs: {triads: {key: 'C', mode: 'major', clef: 'treble', bpm: 56, events: ['major', 'minor', 'dim', 'aug'].map(q => ({notes: chordFromRoot(R('C'), q), d: 'w', sym: 'C' + SUFFIX[q]}))}},
  quiz: [
    () => { const r = pick(ROOTS), q = pick(['major', 'minor', 'dim', 'aug']); return ask(`Which notes make the ${pn(r)} ${QNAME[q]}?`, trio(r, q), ['major', 'minor', 'dim', 'aug'].map(x => trio(r, x)), `Root, third and fifth: ${trio(r, q)}.`); },
    () => { const r = pick(['C', 'D', 'E', 'F', 'G', 'A', 'Bb', 'Eb']), q = pick(['major', 'minor', 'dim', 'aug']); return ask('What kind of triad is this?', {major: 'Major', minor: 'Minor', dim: 'Diminished', aug: 'Augmented'}[q], ['Major', 'Minor', 'Diminished', 'Augmented'], `${{major: 'A major 3rd and a perfect 5th', minor: 'A minor 3rd and a perfect 5th', dim: 'A minor 3rd and a diminished 5th', aug: 'A major 3rd and an augmented 5th'}[q]}.`, {fig: {key: 'C', mode: 'major', clef: 'treble', events: [{notes: chordFromRoot(R(r), q), d: 'w'}]}}); },
    bank([['A diminished triad is built from…', 'Two minor 3rds', ['Two major 3rds', 'A major then a minor 3rd', 'A minor then a major 3rd'], 'Minor 3rd + minor 3rd gives a diminished 5th.'],
      ['An augmented triad is built from…', 'Two major 3rds', ['Two minor 3rds', 'A major then a minor 3rd', 'A perfect 4th and 5th'], 'Major 3rd + major 3rd gives an augmented 5th.'],
      ['Which triads are consonant (stable)?', 'Major and minor', ['Diminished and augmented', 'Only major', 'All four'], 'Diminished and augmented triads are dissonant.'],
      ['What is the fifth of the A minor triad?', 'E', ['C', 'A', 'G'], 'A minor is A–C–E.']]),
  ],
  play: [triadEx, triadEx, triadsEx]});

/* 4 ---------------------------------------------------------------- */
CH.push({id: 'triadsinkey', title: 'Triads in a key', blurb: 'Roman numerals, and what each chord does',
  body: `<p>Build a triad on each note of the major scale, using only the notes of the key, and you get seven chords. They are named with <b>Roman numerals</b>: <b>capitals for major</b>, small letters for minor, and ° for diminished.</p>
{{fig:triads7|The seven triads of C major. Every major key has the same pattern: I ii iii IV V vi vii°.}}
<p>In any major key the major triads are I, IV and V; the minor triads are ii, iii and vi; the diminished triad is vii°. Roman numerals describe a chord’s place in the key, not its pitch, so “V” means G major in C but D major in G.</p>
<h3>What the chords do</h3>
<p>Chords fall into three families, called <b>functions</b>:</p>
<table class="htab"><tr><th>Tonic (T)</th><td>I, vi (and iii)</td><td>home, rest</td></tr><tr><th>Subdominant (S)</th><td>IV, ii</td><td>moving away; preparing</td></tr><tr><th>Dominant (D)</th><td>V, vii°</td><td>tension; wants to return to I</td></tr></table>
<p>The basic harmonic journey is <b>T → S → D → T</b>. Here it is in four parts: <b>I – IV – V – I</b>.</p>
{{fig:tsdt|I – IV – V – I in C major, in four voices. The V chord pulls strongly back to I.}}
<p>V is the key chord of tension because its third is the <b>leading tone</b>, which falls just below the tonic and wants to rise to it.</p>`,
  figs: {triads7: prog('C', 'major', ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'], {d: 'h', bpm: 60}), tsdt: satb('C', 'major', [['C3 G3 E4 C5', 'I'], ['F2 A3 F4 C5', 'IV'], ['G2 G3 D4 B4', 'V'], ['C3 G3 E4 C5', 'I']], {bpm: 60})},
  quiz: [
    () => { const k = pick(['C', 'G', 'D', 'F', 'A', 'Bb']), i = pick([1, 2, 3, 4, 5, 6]), c = rn(NUMS[i], k, 'major'); return ask(`In ${pn(k)} major, which Roman numeral stands for the ${symOf(c)} chord?`, NUMS[i], NUMS, `It is built on degree ${i + 1} of the scale.`); },
    () => { const k = pick(['C', 'G', 'D', 'F']), i = pick([0, 1, 2, 3, 4, 5]), c = rn(NUMS[i], k, 'major'); return ask(`In ${pn(k)} major, what is the ${NUMS[i]} chord?`, symOf(c), [0, 1, 2, 3, 4, 5, 6].map(j => symOf(rn(NUMS[j], k, 'major'))), `Build a triad on degree ${i + 1}.`); },
    bank([['In a major key, which triads are minor?', 'ii, iii and vi', ['I, IV and V', 'ii, IV and vi', 'iii, V and vii°'], 'I, IV and V are the major ones; vii° is diminished.'],
      ['Which chords have dominant function?', 'V and vii°', ['I and vi', 'IV and ii', 'ii and iii'], 'Both contain the leading tone.'],
      ['Which chords have subdominant function?', 'IV and ii', ['V and vii°', 'I and vi', 'I and V'], 'They lead on to the dominant.'],
      ['What kind of chord is vii° in a major key?', 'Diminished', ['Minor', 'Major', 'Augmented'], 'Two minor thirds: a diminished triad.'],
      ['What is the usual order of function in a phrase?', 'Tonic, subdominant, dominant, tonic', ['Dominant, tonic, subdominant', 'Subdominant, tonic, dominant', 'Tonic, dominant, subdominant, dominant'], 'T → S → D → T.']]),
  ],
  play: [progEx('Play I – IV – V – I in {key}', ['I', 'IV', 'V', 'I'], () => pick(['C', 'G', 'F', 'D']), 'major'), progEx('Play I – vi – IV – V in {key}', ['I', 'vi', 'IV', 'V'], () => pick(['C', 'G', 'F', 'A']), 'major'), progEx('Play ii – V – I in {key}', ['ii', 'V', 'I'], () => pick(['C', 'G', 'D', 'Bb']), 'major')]});

/* 5 ---------------------------------------------------------------- */
CH.push({id: 'inversions', title: 'Inversions and figured bass', blurb: 'Different notes in the bass: root position, 6 and 6/4',
  body: `<p>A triad is in <b>root position</b> when the root is its lowest note. Put the third in the bass and it is in <b>first inversion</b>; put the fifth in the bass and it is in <b>second inversion</b>. The notes (and so the chord) stay the same; only the bass changes.</p>
{{fig:inv|C major in root position (I), first inversion (I⁶) and second inversion (I⁶₄).}}
<p>Baroque musicians wrote only the bass line and added numbers under it: <b>figured bass</b>. The numbers give the intervals above the bass note.</p>
<table class="htab"><tr><th>no figure, or 5/3</th><td>root position</td><td>I</td></tr><tr><th>6 (or 6/3)</th><td>first inversion</td><td>I⁶ (“one six”)</td></tr><tr><th>6/4</th><td>second inversion</td><td>I⁶₄ (“one six-four”)</td></tr></table>
<p>First inversion is smooth and common: the bass moves by step, so it gives a gentler, less final sound. Second inversion is unstable (the bass note, a fifth above the root, sounds like a leaning dissonance). It is used in particular ways: as a <b>cadential 6/4</b> before V (Chapter 7), as a <b>passing</b> chord between two others, and as a <b>pedal</b> chord over a held bass.</p>
<p>The <b>lowest note</b> is what counts, however the other notes are arranged above it.</p>`,
  figs: {inv: block('C', 'major', [['C3 E4 G4 C5', 'I', 'C', 'h'], ['E3 G4 C5 E5', 'I⁶', 'C/E', 'h'], ['G2 C4 E4 G4', 'I⁶₄', 'C/G', 'h']], {d: 'h', bpm: 60})},
  quiz: [
    () => { const r = pick(['C', 'D', 'F', 'G', 'A', 'Bb']), q = pick(['major', 'minor']), inv = pick([0, 1, 2]), c = chordFromRoot(R(r), q); const rot = c.map((n, i) => i < inv ? A.shiftOct(n, 1) : n);
      return ask('Which position is this chord in?', ['Root position', 'First inversion (6)', 'Second inversion (6/4)'][inv], ['Root position', 'First inversion (6)', 'Second inversion (6/4)'], `The lowest note is the ${['root', 'third', 'fifth'][inv]}.`, {fig: {key: 'C', mode: 'major', clef: 'treble', events: [{notes: sortN(rot), d: 'w'}]}}); },
    () => { const r = pick(['C', 'G', 'F', 'D']), c = chordFromRoot(R(r), 'major'), inv = pick([1, 2]); return ask(`In ${pn(r)} major in ${inv === 1 ? 'first' : 'second'} inversion, which note is in the bass?`, nm(c[inv]), c.map(n => nm(n)), `The ${inv === 1 ? 'third' : 'fifth'} of the chord.`); },
    bank([['What does a figure “6” under a bass note mean?', 'First inversion triad', ['Second inversion triad', 'A sixth chord on the root', 'A seventh chord'], 'The notes above the bass are a 3rd and a 6th.'],
      ['What does “6/4” mean?', 'Second inversion triad', ['First inversion triad', 'Root position triad', 'A diminished triad'], 'A 6th and a 4th above the bass.'],
      ['Which inversion has the third in the bass?', 'First inversion', ['Root position', 'Second inversion', 'None'], 'It is figured 6.'],
      ['Which triad position is the least stable?', 'Second inversion', ['Root position', 'First inversion', 'They are all equal'], 'It needs to be used in specific ways, such as the cadential 6/4.']]),
  ],
  play: [invEx, invEx, () => { const r = pick(['C', 'G', 'F']), c = chordFromRoot(R(r), 'major'); return {title: `The three positions of ${pn(r)} major`, help: 'Root position, then first, then second inversion. Watch the lowest note.', steps: [0, 1, 2].map(i => ({label: [pn(r), pn(r) + '⁶', pn(r) + '⁶₄'][i], pcs: pcsOf(c), names: c.map(n => nm(n)), bass: ((c[i].midi % 12) + 12) % 12}))}; }]});

/* 6 ---------------------------------------------------------------- */
CH.push({id: 'sevenths', title: 'Seventh chords', blurb: 'Adding a fourth note: V7, ii7, vii°7 and their inversions',
  body: `<p>Add another third on top of a triad and you get a <b>seventh chord</b>: root, third, fifth and <b>seventh</b>. There are five main kinds:</p>
{{fig:sevenths|Seventh chords on C: major 7th, dominant 7th, minor 7th, half-diminished 7th and fully diminished 7th.}}
<table class="htab"><tr><th>Major 7th</th><td>major triad + major 7th</td><td>Imaj7, IVmaj7</td></tr><tr><th>Dominant 7th</th><td>major triad + minor 7th</td><td>V7</td></tr><tr><th>Minor 7th</th><td>minor triad + minor 7th</td><td>ii7, vi7</td></tr><tr><th>Half-diminished</th><td>diminished triad + minor 7th</td><td>viiø7</td></tr><tr><th>Fully diminished</th><td>diminished triad + diminished 7th</td><td>vii°7 (in minor)</td></tr></table>
{{fig:dia7|The sevenths on each degree of C major: Imaj7 ii7 iii7 IVmaj7 V7 vi7 viiø7.}}
<h3>V7: the dominant seventh</h3>
<p>The most important seventh chord is <b>V7</b> (G–B–D–F in C). It contains a tritone, B and F, which wants to resolve: B up to C and F down to E. In the chord, the <b>seventh must fall by step</b>, and the leading tone rises to the tonic.</p>
{{fig:v7|V7 resolving to I. F falls to E, B rises to C. The tonic chord has no fifth (G), which is normal here.}}
<h3>Inversions</h3>
<p>A seventh chord has four inversions, named by the figures above the bass: root position <b>V⁷</b>, first inversion <b>V⁶₅</b> (third in the bass), second <b>V⁴₃</b> (fifth in the bass) and third <b>V⁴₂</b> (seventh in the bass).</p>
{{fig:v7inv|V7 in root position, then V⁶₅, V⁴₃ and V⁴₂.}}`,
  figs: {
    sevenths: {key: 'C', mode: 'major', clef: 'treble', bpm: 56, events: ['maj7', 'dom7', 'min7', 'hdim7', 'dim7'].map(q => ({notes: chordFromRoot(R('C'), q), d: 'w', sym: 'C' + SUFFIX[q]}))},
    dia7: prog('C', 'major', ['IM7', 'ii7', 'iii7', 'IVM7', 'V7', 'vi7', 'viiø7'], {d: 'h', bpm: 60}),
    v7: {...satb('C', 'major', [['G2 B3 F4 D5', 'V⁷'], ['C3 C4 E4 C5', 'I']], {bpm: 56}), incomplete: true},
    v7inv: block('C', 'major', [['G2 D4 F4 B4', 'V⁷'], ['B2 D4 F4 G4', 'V⁶₅'], ['D3 F4 G4 B4', 'V⁴₃'], ['F3 G4 B4 D5', 'V⁴₂']], {d: 'h', bpm: 60}),
  },
  quiz: [
    () => { const r = pick(['C', 'D', 'F', 'G', 'A', 'Bb', 'E']), q = pick(['dom7', 'maj7', 'min7', 'hdim7', 'dim7']); return ask('What kind of seventh chord is this?', cap(QNAME[q]), Object.values({dom7: 'Dominant seventh', maj7: 'Major seventh', min7: 'Minor seventh', hdim7: 'Half-diminished seventh', dim7: 'Fully diminished seventh'}), {dom7: 'A major triad with a minor 7th.', maj7: 'A major triad with a major 7th.', min7: 'A minor triad with a minor 7th.', hdim7: 'A diminished triad with a minor 7th.', dim7: 'A diminished triad with a diminished 7th.'}[q], {fig: {key: 'C', mode: 'major', clef: 'treble', events: [{notes: chordFromRoot(R(r), q), d: 'w'}]}}); },
    () => { const k = pick(['C', 'G', 'F', 'D']), c = rn('V7', k, 'major'); return ask(`Which notes make V7 in ${pn(k)} major?`, c.notes.map(n => nm(n)).join(' – '), ['V7', 'ii7', 'IM7', 'vi7'].map(s => rn(s, k, 'major').notes.map(n => nm(n)).join(' – ')), 'Build a dominant seventh on the 5th degree.'); },
    bank([['In V7 → I, what usually happens to the seventh of the chord?', 'It falls by step', ['It rises by step', 'It stays on the same note', 'It leaps up a fourth'], 'F falls to E in G7 → C.'],
      ['What does V⁶₅ tell you?', 'First inversion of a seventh chord', ['Second inversion triad', 'Root position seventh', 'Third inversion'], 'The third of the chord is in the bass.'],
      ['Which seventh chord is a diminished triad with a minor 7th?', 'Half-diminished', ['Fully diminished', 'Dominant', 'Minor'], 'Written ø7, for example B–D–F–A in C major.'],
      ['Which chord has a major triad with a minor seventh?', 'Dominant seventh', ['Major seventh', 'Minor seventh', 'Half-diminished'], 'It is built on the 5th degree.'],
      ['V⁴₂ has which note in the bass?', 'The seventh', ['The root', 'The third', 'The fifth'], 'F in G–B–D–F.']]),
  ],
  play: [seventhEx, seventhEx, progEx('Play ii7 – V7 – I in {key}', ['ii7', 'V7', 'I'], () => pick(['C', 'G', 'F']), 'major')]});

/* 7 ---------------------------------------------------------------- */
CH.push({id: 'cadences', title: 'Cadences', blurb: 'Musical punctuation: authentic, half, plagal, deceptive',
  body: `<p>A <b>cadence</b> is the harmonic ending of a phrase, like punctuation in a sentence. Each type has its own feel.</p>
<h3>Authentic: V → I</h3>
<p>The strongest ending, like a full stop. In a <b>perfect authentic cadence</b> (PAC) both chords are in root position and the soprano ends on the tonic. If the soprano ends on another note, or a chord is inverted, it is an <b>imperfect authentic cadence</b> (IAC).</p>
{{fig:pac|Perfect authentic cadence: V → I, soprano 7 → 1.}}
{{fig:iac|Imperfect authentic cadence: the soprano stays on the fifth of I.}}
<h3>Half cadence: ending on V</h3>
<p>A comma: the phrase stops on the dominant and asks for an answer. Any chord can lead to V: I, ii, IV…</p>
{{fig:hc|Half cadence: I → V.}}
<h3>Plagal: IV → I</h3>
<p>The “Amen” cadence: gentler than V–I, with no leading tone.</p>
{{fig:plagal|Plagal cadence: IV → I.}}
<h3>Deceptive: V → vi</h3>
<p>You expect I but get vi (it shares two notes with I). The soprano rises 7 → 1 as usual while the bass goes up to the sixth degree.</p>
{{fig:dec|Deceptive cadence: V → vi.}}
<h3>The cadential 6/4</h3>
<p>Before a final V, composers often put a <b>I⁶₄</b> chord: the tonic chord in second inversion. It is really V with two “suspended” notes (C over E and G): the C falls to B and the E to D as V arrives. It is the most common way to prepare a PAC in classical music.</p>
{{fig:c64|I⁶₄ – V – I: the 6th and the 4th above the bass fall to the 5th and the 3rd.}}`,
  figs: {
    pac: satb('C', 'major', [['G2 G3 D4 B4', 'V'], ['C3 G3 E4 C5', 'I']], {bpm: 56}),
    iac: satb('C', 'major', [['G2 B3 D4 G4', 'V'], ['C3 C4 E4 G4', 'I']], {bpm: 56}),
    hc: satb('C', 'major', [['C3 G3 E4 C5', 'I'], ['G2 G3 D4 B4', 'V']], {bpm: 56}),
    plagal: satb('C', 'major', [['F2 A3 F4 C5', 'IV'], ['C3 G3 E4 C5', 'I']], {bpm: 56}),
    dec: satb('C', 'major', [['G2 G3 D4 B4', 'V'], ['A2 E3 C4 C5', 'vi']], {bpm: 56}),
    c64: satb('C', 'major', [['G2 E4 G4 C5', 'I⁶₄', 'h'], ['G2 D4 G4 B4', 'V', 'q'], ['C3 E4 G4 C5', 'I', 'q']], {bpm: 56}),
  },
  quiz: [
    () => { const [a, b, n] = pick([['V', 'I', 'Authentic'], ['IV', 'I', 'Plagal'], ['V', 'vi', 'Deceptive'], ['I', 'V', 'Half'], ['ii', 'V', 'Half']]); return ask(`What kind of cadence is ${a} → ${b}?`, n, ['Authentic', 'Plagal', 'Deceptive', 'Half'], {Authentic: 'V → I is the full stop.', Plagal: 'IV → I is the “Amen”.', Deceptive: 'It goes to vi instead of I.', Half: 'It stops on V.'}[n]); },
    bank([['Which cadence ends on V and sounds unfinished, like a comma?', 'Half cadence', ['Plagal cadence', 'Perfect authentic cadence', 'Deceptive cadence'], 'The phrase is left open.'],
      ['What makes a perfect authentic cadence “perfect”?', 'Both chords in root position and the tonic in the soprano', ['It uses the subdominant', 'It ends on vi', 'It has a seventh in the bass'], 'Otherwise it is imperfect.'],
      ['Which cadence is called the “Amen” cadence?', 'Plagal (IV → I)', ['Authentic (V → I)', 'Deceptive (V → vi)', 'Half (I → V)'], 'It has no leading tone, so it is gentler.'],
      ['In a deceptive cadence V goes to…', 'vi', ['I', 'IV', 'iii'], 'You expect I but hear vi.'],
      ['The cadential 6/4 is…', 'A I⁶₄ chord that resolves to V', ['A V⁶₄ chord after I', 'A passing chord after IV', 'The same as a plagal cadence'], 'The 6th and 4th above the bass fall to the 5th and 3rd of V.']]),
    () => ask('Which cadence has the progression V → I with both chords in root position and the tonic on top?', 'Perfect authentic', ['Imperfect authentic', 'Half', 'Plagal'], 'This is the strongest ending.'),
  ],
  play: [cadEx('Authentic cadence V – I in {key}', ['V', 'I']), cadEx('Plagal cadence IV – I in {key}', ['IV', 'I']), cadEx('Deceptive cadence V – vi in {key}', ['V', 'vi'])]});

/* 8 ---------------------------------------------------------------- */
CH.push({id: 'progressions', title: 'Progressions and the circle of fifths', blurb: 'How chords follow one another',
  body: `<p>A <b>chord progression</b> is a series of chords. Some moves sound natural, others unexpected. The strongest <b>root movement</b> is down a fifth (or up a fourth): G → C, D → G, A → D. It happens within the key as a chain of descending fifths:</p>
{{fig:circle|The chain of falling fifths in C: I – IV – vii° – iii – vi – ii – V – I.}}
<p>You rarely hear the whole chain, but pieces of it are everywhere: <b>ii – V – I</b>, <b>vi – ii – V – I</b>, <b>iii – vi – ii – V</b>. Each chord leads to the next with a root that falls a fifth, and the whole drives to I.</p>
{{fig:iivi|ii – V – I: subdominant, dominant, tonic.}}
{{fig:ivi|I – vi – ii – V – I: a classic.}}
<h3>A few rules of thumb</h3>
<ul><li>Chords of the same function can replace each other: vi for I, ii for IV.</li><li>V often follows IV or ii, never the other way round: <b>V → IV</b> sounds backwards in classical style.</li><li>I can go anywhere; V goes to I (or vi); vii° goes to I.</li><li>Popular patterns: <b>I – IV – V – I</b>, <b>I – vi – IV – V</b> (the “fifties” progression), <b>I – V – vi – IV</b>.</li></ul>
<p>The <b>circle of fifths</b> arranges all twelve keys by fifths: C G D A E B F♯… going up a fifth adds a sharp; going down adds a flat. Neighbouring keys share most of their notes, which is why we can modulate between them smoothly (Chapter 12).</p>`,
  figs: {
    circle: prog('C', 'major', ['I', 'IV', 'vii°', 'iii', 'vi', 'ii', 'V', 'I'], {d: 'h', bpm: 60}),
    iivi: satb('C', 'major', [['D3 A3 F4 D5', 'ii'], ['G2 G3 D4 B4', 'V'], ['C3 G3 E4 C5', 'I', 'w']], {bpm: 56, d: 'h'}),
    ivi: satb('C', 'major', [['C3 G3 E4 C5', 'I'], ['A2 A3 E4 C5', 'vi'], ['D3 A3 F4 D5', 'ii'], ['G2 G3 D4 B4', 'V'], ['C3 G3 E4 C5', 'I', 'w']], {bpm: 56, d: 'h'}),
  },
  quiz: [
    () => { const p = pick([['ii', 'V', 'I'], ['I', 'IV', 'V', 'I'], ['I', 'vi', 'ii', 'V'], ['I', 'vi', 'IV', 'V']]), right = p[p.length - 1], shown = p.slice(0, -1).concat('?').join(' – '); return ask(`Which chord completes the progression ${shown}?`, right, ['I', 'ii', 'IV', 'V', 'vi', 'iii'], `${p.join(' – ')} is a standard progression.`); },
    bank([['What is the strongest root movement?', 'Down a fifth', ['Up a second', 'Down a third', 'Up a sixth'], 'G → C, D → G… the chain of falling fifths.'],
      ['Which chord normally follows ii in a cadential progression?', 'V', ['IV', 'iii', 'vii°'], 'ii – V – I.'],
      ['Which of these moves sounds “backwards” in classical style?', 'V → IV', ['IV → V', 'ii → V', 'V → I'], 'The dominant pulls ahead to the tonic.'],
      ['Which chord can replace I as a tonic substitute?', 'vi', ['V', 'ii', 'IV'], 'It shares two notes with I.'],
      ['Going up a fifth on the circle of fifths adds…', 'A sharp (or removes a flat)', ['A flat', 'A natural', 'Nothing'], 'C → G adds F♯.']]),
  ],
  play: [progEx('Play ii – V – I in {key}', ['ii', 'V', 'I'], () => pick(['C', 'G', 'F', 'Bb', 'D']), 'major'), progEx('Play I – vi – ii – V – I in {key}', ['I', 'vi', 'ii', 'V', 'I'], () => pick(['C', 'G', 'F']), 'major'), progEx('Play I – IV – vii° – iii – vi – ii – V – I in {key}', ['I', 'IV', 'vii°', 'iii', 'vi', 'ii', 'V', 'I'], 'C', 'major', 'The whole chain of falling fifths. Take your time.')]});

/* 9 ---------------------------------------------------------------- */
CH.push({id: 'voiceleading', title: 'Voice leading', blurb: 'Four-part writing: how each voice moves from chord to chord',
  body: `<p>Classical harmony is taught in <b>four parts</b>, the voices of a choir: <b>soprano</b> and <b>alto</b> (written on the treble staff) and <b>tenor</b> and <b>bass</b> (on the bass staff). Each voice should be a good, singable melody, and the four together should make the chords. This is <b>voice leading</b>.</p>
<h3>Ranges and spacing</h3>
<ul><li>Soprano C4–G5, alto G3–D5, tenor C3–G4, bass E2–D4.</li><li>Soprano–alto and alto–tenor are kept within an octave. The bass may be farther below.</li><li>Voices do not cross: soprano above alto above tenor above bass.</li></ul>
<h3>Doubling</h3>
<p>A triad has three notes, so one is doubled. In root position, <b>double the root</b>. Never double the leading tone.</p>
<h3>Moving smoothly</h3>
<ul><li>Keep <b>common tones</b> (notes shared by two chords) in the same voice.</li><li>Move the other voices to the <b>nearest</b> chord note, by step if possible.</li><li>Prefer <b>contrary motion</b> between the bass and the soprano.</li><li>The leading tone rises to the tonic; the seventh of a chord falls by step.</li></ul>
{{fig:good|I – IV – V – I with good voice leading: the C in the soprano stays through I and IV, then steps down to B and up to C.}}
<h3>Forbidden: parallel fifths and octaves</h3>
<p>If two voices move in the same direction by a perfect fifth, then another perfect fifth (or octave to octave), the voices lose their independence and merge. These <b>parallel fifths and octaves</b> are the classic faults of four-part writing.</p>
{{fig:badfifths|Wrong: the bass and tenor move together in parallel fifths (C–G, then D–A), and so do other voice pairs.}}
{{fig:badoct|Wrong: the bass and tenor move in parallel octaves (G–G, then A–A).}}
{{fig:fixed|Better: the same chords with the tenor going down to a different note, so the octaves disappear.}}`,
  figs: {
    good: satb('C', 'major', [['C3 G3 E4 C5', 'I'], ['F2 A3 F4 C5', 'IV'], ['G2 G3 D4 B4', 'V'], ['C3 G3 E4 C5', 'I']], {bpm: 56}),
    badfifths: {...satb('C', 'major', [['C3 G3 E4 C5', 'I'], ['D3 A3 F4 D5', 'ii']], {bpm: 56}), bad: true},
    badoct: {...satb('C', 'major', [['G2 G3 D4 B4', 'V'], ['A2 A3 E4 C5', 'vi']], {bpm: 56}), bad: true},
    fixed: satb('C', 'major', [['G2 G3 D4 B4', 'V'], ['A2 E3 C4 C5', 'vi']], {bpm: 56}),
  },
  quiz: [
    () => { const pairs = [['C3 G3 E4 C5', 'F2 A3 F4 C5', 'I', 'IV', false], ['G2 G3 D4 B4', 'C3 G3 E4 C5', 'V', 'I', false], ['G2 G3 D4 B4', 'A2 E3 C4 C5', 'V', 'vi', false], ['C3 G3 E4 C5', 'D3 A3 F4 D5', 'I', 'ii', true], ['G2 G3 D4 B4', 'A2 A3 E4 C5', 'V', 'vi', true]]; const [a, b, x, y, bad] = pick(pairs);
      return ask('Is there a fault in the way the voices move between these two chords?', bad ? 'Yes: parallel fifths or octaves' : 'No: the voice leading is correct', ['Yes: parallel fifths or octaves', 'No: the voice leading is correct', 'Yes: the leading tone is doubled', 'Yes: the voices cross'], bad ? 'Two voices move in the same direction keeping a perfect fifth or octave between them.' : 'No two voices move in parallel perfect intervals.', {fig: {...satb('C', 'major', [[a, x], [b, y]], {bpm: 56}), bad}}); },
    bank([['Which motion between two voices is forbidden?', 'Parallel perfect fifths', ['Parallel thirds', 'Parallel sixths', 'Contrary motion'], 'Parallel 3rds and 6ths are fine; perfect fifths and octaves are not.'],
      ['In a root-position triad, which note is usually doubled?', 'The root', ['The third', 'The leading tone', 'The fifth only'], 'The root is the strongest note.'],
      ['The soprano and alto should normally stay within…', 'An octave of each other', ['A fifth of each other', 'Two octaves of each other', 'A third of each other'], 'The same for alto and tenor.'],
      ['Which voice is lowest in four-part writing?', 'Bass', ['Tenor', 'Alto', 'Soprano'], 'Soprano, alto, tenor, bass from the top down.'],
      ['When two chords share a note, the voice usually…', 'Stays on it (common tone)', ['Leaps an octave', 'Moves by a third', 'Rests'], 'This keeps the connection smooth.'],
      ['What should usually happen to the leading tone in V → I?', 'It rises to the tonic', ['It falls a third', 'It is doubled', 'It stays'], 'B rises to C in C major.']]),
  ],
  play: [progEx('Play I – IV – V – I in {key}', ['I', 'IV', 'V', 'I'], () => pick(['C', 'G', 'F']), 'major', 'Try playing it with smooth voice leading: keep the common tone and move the other fingers as little as possible.'), progEx('Play vi – ii – V – I in {key}', ['vi', 'ii', 'V', 'I'], () => pick(['C', 'G', 'F']), 'major'), progEx('Play I – V – vi – IV in {key}', ['I', 'V', 'vi', 'IV'], () => pick(['C', 'G', 'D']), 'major')]});

/* 10 --------------------------------------------------------------- */
CH.push({id: 'nonchord', title: 'Non-chord tones', blurb: 'Notes that decorate chords: passing, neighbour, suspension…',
  body: `<p>Real melodies use notes that are not in the chord above them. These <b>non-chord tones</b> (NCTs) add motion and colour. They are heard as dissonances and are usually resolved by step to a chord tone. The chord stays the same: here it is C major (C–E–G) in each example.</p>
<h3>Passing tone</h3>
<p>Fills the gap between two chord tones by step, in one direction.</p>
{{fig:passing|E – F – G over C: F is a passing tone.}}
<h3>Neighbour tone</h3>
<p>Steps away from a chord tone and returns to the same one.</p>
{{fig:neighbor|E – F – E: F is an upper neighbour.}}
<h3>Suspension</h3>
<p>A note from the previous chord is held (tied) into the next, where it becomes a dissonance, and then resolves down by step. A <b>4–3</b> suspension (shown here over G in the bass) is the most usual.</p>
{{fig:susp|The C is held while the bass moves to G (the 4th above G), then falls to B (the 3rd).}}
<h3>Appoggiatura</h3>
<p>A dissonance approached by a leap, on a strong beat, resolved by step.</p>
{{fig:appog|A is reached by a leap and falls to G.}}
<h3>Escape tone</h3>
<p>Reached by step, left by a leap in the opposite direction.</p>
{{fig:escape|G – A – E: A is an escape tone.}}
<h3>Anticipation</h3>
<p>A note of the next chord arrives early.</p>
{{fig:anticip|The C in the melody sounds before the bass changes to C.}}
<h3>Pedal point</h3>
<p>A long note, usually in the bass, is held while the chords above change, creating dissonances that resolve when the harmony returns to the pedal note.</p>
{{fig:pedal|C in the bass is held under I – V⁷ – I.}}`,
  figs: {
    passing: melody('C', [['E4', 'C3', 'q', 'chord tone'], ['F4', 'C3', 'q', 'passing'], ['G4', 'C3', 'q', 'chord tone'], ['G4', 'C3', 'q', '']], {bpm: 70}),
    neighbor: melody('C', [['E4', 'C3', 'q', 'chord tone'], ['F4', 'C3', 'q', 'neighbour'], ['E4', 'C3', 'q', 'chord tone'], ['E4', 'C3', 'q', '']], {bpm: 70}),
    susp: melody('C', [['C5~', 'F2', 'h', 'prep.'], ['C5', 'G2', 'h', '4 (susp.)'], ['B4', 'G2', 'w', '3 (res.)']], {bpm: 60}),
    appog: melody('C', [['E4', 'C3', 'q', ''], ['A4', 'C3', 'q', 'appoggiatura'], ['G4', 'C3', 'h', 'resolution']], {bpm: 70}),
    escape: melody('C', [['G4', 'C3', 'q', 'chord tone'], ['A4', 'C3', 'q', 'escape'], ['E4', 'C3', 'h', 'chord tone']], {bpm: 70}),
    anticip: melody('C', [['D5', 'G2', 'h', 'V'], ['C5', 'G2', 'q', 'anticipation'], ['C5', 'C3', 'q', 'I']], {bpm: 70}),
    pedal: block('C', 'major', [['C3 E4 G4 C5', 'I', '', 'h'], ['C3 D4 F4 B4', 'V⁷', '', 'h'], ['C3 E4 G4 C5', 'I', '', 'w']], {bpm: 56}),
  },
  quiz: [
    bank([['A note that fills the gap between two chord tones by step is a…', 'Passing tone', ['Neighbour tone', 'Suspension', 'Anticipation'], 'It moves in one direction.'],
      ['A note that steps away from a chord tone and then returns to it is a…', 'Neighbour tone', ['Passing tone', 'Escape tone', 'Pedal point'], 'Up and back, or down and back.'],
      ['A note held from the previous chord that clashes, then falls by step, is a…', 'Suspension', ['Appoggiatura', 'Anticipation', 'Passing tone'], 'Preparation, suspension, resolution.'],
      ['A dissonance approached by leap and resolved by step is an…', 'Appoggiatura', ['Escape tone', 'Suspension', 'Anticipation'], 'It falls on a strong beat.'],
      ['A note that arrives early, before its chord, is an…', 'Anticipation', ['Suspension', 'Escape tone', 'Appoggiatura'], 'It sounds like the next chord’s note.'],
      ['A step followed by a leap in the opposite direction is an…', 'Escape tone', ['Neighbour tone', 'Passing tone', 'Suspension'], 'The note “escapes” the dissonance.'],
      ['A long bass note held while chords change above it is a…', 'Pedal point', ['Suspension', 'Ostinato', 'Cadence'], 'Often on the tonic or dominant.'],
      ['In a 4–3 suspension, the 4th…', 'Resolves down to the 3rd', ['Resolves up to the 5th', 'Stays put', 'Leaps to the root'], 'C falls to B over G.']]),
  ],
  play: [noteSteps('Passing tone: E – F – G', 'Play one note at a time.', ['E', 'F', 'G']), noteSteps('Neighbour tone: E – F – E', 'Up a step and back.', ['E', 'F', 'E']), noteSteps('4–3 suspension: C then B', 'Over a G in the bass: the 4th falls to the 3rd.', ['C', 'B'])]});

/* 11 --------------------------------------------------------------- */
CH.push({id: 'minor', title: 'Harmony in minor keys', blurb: 'Natural, harmonic and melodic minor; i, iv, V and the leading tone',
  body: `<p>A minor key has a minor third above the tonic. It comes in three forms of scale. <b>Natural minor</b> has the same notes as its relative major, starting on the 6th degree. <b>Harmonic minor</b> raises the 7th degree to make a leading tone, which gives the harmony its pull to the tonic. <b>Melodic minor</b> raises the 6th and 7th going up (to avoid an awkward augmented 2nd) and uses the natural form going down.</p>
{{fig:nat|A natural minor: no sharps or flats.}}
{{fig:harm|A harmonic minor: G♯ gives the leading tone.}}
{{fig:mel|A melodic minor going up: F♯ and G♯.}}
<p>The chords come from the harmonic minor scale: <b>i</b>, <b>ii°</b>, <b>III</b>, <b>iv</b>, <b>V</b>, <b>VI</b>, <b>vii°</b>. The important difference from major is that <b>V is major</b> (and vii° diminished) in minor too, because of the raised leading tone.</p>
{{fig:iiv|i – iv – V – i in A minor. The G♯ in the V chord is the leading tone.}}
<p>Minor pieces often end on a major tonic chord: the <b>Picardy third</b>.</p>
{{fig:picardy|i – iv – V – I with a Picardy third: C♯ instead of C.}}`,
  figs: {
    nat: line('A', 'minor', ['A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5'], {sym: ['', 'W', 'H', 'W', 'W', 'H', 'W', 'W'], bpm: 100}),
    harm: line('A', 'minor', ['A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G#5', 'A5'], {sym: ['', 'W', 'H', 'W', 'W', 'H', '1½', 'H'], bpm: 100}),
    mel: line('A', 'minor', ['A4', 'B4', 'C5', 'D5', 'E5', 'F#5', 'G#5', 'A5'], {sym: ['', 'W', 'H', 'W', 'W', 'W', 'W', 'H'], bpm: 100}),
    iiv: satb('A', 'minor', [['A2 E3 C4 A4', 'i'], ['D2 F3 D4 A4', 'iv'], ['E2 E3 B3 G#4', 'V'], ['A2 E3 C4 A4', 'i']], {bpm: 56}),
    picardy: satb('A', 'minor', [['A2 E3 C4 A4', 'i'], ['D2 F3 D4 A4', 'iv'], ['E2 E3 B3 G#4', 'V'], ['A2 E3 C#4 A4', 'I']], {bpm: 56}),
  },
  quiz: [
    () => { const k = pick(['A', 'E', 'D', 'G', 'B']), s = scale(k + '4', 'minor', 8, true), lt = nm(s[6]); return ask(`What is the leading tone in ${pn(k)} minor?`, lt, [nm(scale(k + '4', 'minor', 8)[6]), nm(s[5]), nm(s[4]), nm(s[0])], 'The 7th degree, raised a half step in harmonic minor.'); },
    () => { const k = pick(['A', 'E', 'D', 'G']), c = rn('V', k, 'minor'); return ask(`Which chord is V in ${pn(k)} minor?`, symOf(c), [symOf(rn('v', k, 'minor')), symOf(rn('iv', k, 'minor')), symOf(rn('i', k, 'minor')), symOf(rn('III', k, 'minor'))], 'The raised leading tone makes V a major chord.'); },
    bank([['Which note is raised in the harmonic minor scale?', 'The 7th', ['The 3rd', 'The 5th', 'The 2nd'], 'It makes a leading tone.'],
      ['What is the relative major of A minor?', 'C major', ['A major', 'E major', 'F major'], 'The same key signature.'],
      ['How many sharps or flats does A minor have?', 'None', ['One sharp', 'One flat', 'Three sharps'], 'It shares C major’s key signature.'],
      ['What is a Picardy third?', 'A major tonic chord at the end of a minor piece', ['A minor chord at the end of a major piece', 'A cadence on the dominant', 'A third in the bass'], 'The third of the last chord is raised.'],
      ['In a minor key, V is usually…', 'Major, with a raised leading tone', ['Minor', 'Diminished', 'Augmented'], 'The harmonic minor scale supplies the leading tone.'],
      ['Melodic minor going up raises…', 'The 6th and 7th degrees', ['Only the 3rd', 'Only the 7th', 'The 2nd and 4th'], 'It avoids the augmented 2nd between the 6th and 7th.']]),
  ],
  play: [progEx('Play i – iv – V – i in {key}', ['i', 'iv', 'V', 'i'], () => pick(['A', 'E', 'D']), 'minor'), progEx('Play i – VI – III – VII in {key}', ['i', 'VI', 'III', 'VII'], () => pick(['A', 'E', 'D']), 'minor'), progEx('Play ii° – V – i in {key}', ['ii°', 'V', 'i'], () => pick(['A', 'E', 'D', 'G']), 'minor')]});

/* 12 --------------------------------------------------------------- */
CH.push({id: 'chromatic', title: 'Chromatic harmony and modulation', blurb: 'Secondary dominants, borrowed chords, Neapolitan, augmented sixth, changing key',
  body: `<p>Chords with notes outside the key add colour and let the music move to new keys. These are <b>chromatic</b> chords.</p>
<h3>Secondary dominants</h3>
<p>Any diatonic chord can be approached by <b>its own dominant</b>, which briefly makes it sound like a tonic. A chord is written V/x, “the dominant of x”: <b>V/V</b> in C major is D major (with F♯), <b>V7/V</b> is D7 (D–F♯–A–C). It resolves to V in the usual way.</p>
{{fig:secdom|I – V⁷/V – V – I in C major. The F♯ in the V⁷/V chord is the leading tone of G and rises to G.}}
<p>Other common ones: V/vi (E major in C), V/ii (A major), V/IV (C7 leading to F).</p>
<h3>Borrowed chords</h3>
<p>Chords borrowed from the parallel minor (same tonic): <b>iv</b> and <b>♭VI</b> in a major key, for a darker colour.</p>
<h3>The Neapolitan sixth</h3>
<p>A major chord on the <b>lowered second degree</b>, usually in first inversion (<b>N⁶</b>), leading to V in minor.</p>
{{fig:neap|i – N⁶ – V – i in A minor: B♭–D–F with D in the bass.}}
<h3>Augmented sixth chords</h3>
<p>The lowered sixth degree and the raised fourth are an augmented sixth apart. They expand outwards to the dominant, as in the <b>Italian sixth</b> (♭6, 1, ♯4).</p>
{{fig:aug6|i – It⁺⁶ – V – i in A minor: F and D♯ expand to E.}}
<h3>Modulation</h3>
<p>To <b>modulate</b> is to change key. The usual method is a <b>pivot chord</b>: a chord that belongs to both keys, reinterpreted. For example vi in C is ii in G. Then a cadence in the new key (V7 – I) confirms it.</p>
{{fig:pivot|C major to G major: A minor is vi in C and ii in G (the pivot), then D⁷ – G.}}`,
  figs: {
    secdom: satb('C', 'major', [['C3 G3 E4 C5', 'I'], ['D3 D4 F#4 C5', 'V⁷/V'], ['G2 D4 G4 B4', 'V'], ['C3 E4 G4 C5', 'I']], {bpm: 56}),
    neap: block('A', 'minor', [['A2 E3 C4 A4', 'i'], ['D3 F4 Bb4 D5', 'N⁶'], ['E3 G#4 B4 E5', 'V'], ['A2 E3 C4 A4', 'i']], {bpm: 56}),
    aug6: block('A', 'minor', [['A2 E3 C4 A4', 'i'], ['F3 A3 D#4 A4', 'It⁺⁶'], ['E3 G#3 B3 E4', 'V'], ['A2 E3 C4 A4', 'i']], {bpm: 56}),
    pivot: block('C', 'major', [['C3 E4 G4 C5', 'C: I', '', 'q'], ['A2 E4 A4 C5', 'vi = ii', '', 'q'], ['D3 F#4 A4 C5', 'G: V⁷', '', 'q'], ['G2 D4 G4 B4', 'I', '', 'q']], {bpm: 56}),
  },
  quiz: [
    () => { const k = pick(['C', 'G', 'F', 'D']), c = rn('V7/V', k, 'major'); const others = ['V7/ii', 'V7/vi', 'V7/IV', 'V7'].map(s => symOf(rn(s, k, 'major'))); return ask(`In ${pn(k)} major, what chord is V7/V?`, symOf(c), others, 'Take the dominant seventh of the 5th degree.'); },
    () => { const k = pick(['C', 'G', 'F']), c = rn('V/vi', k, 'major'); return ask(`In ${pn(k)} major, what chord is V/vi?`, symOf(c), [symOf(rn('V/V', k, 'major')), symOf(rn('V/ii', k, 'major')), symOf(rn('V/IV', k, 'major')), symOf(rn('V', k, 'major'))], 'The major chord a fifth above vi.'); },
    bank([['What is a secondary dominant?', 'The dominant of a chord other than I', ['A dominant in the bass', 'A second V chord', 'A chord a third below V'], 'For example V7/V.'],
      ['What is the Neapolitan chord?', 'A major chord on the lowered 2nd degree, usually in first inversion', ['A minor chord on the 4th degree', 'A diminished chord on the 7th', 'A seventh chord on the 5th'], 'In A minor: B♭–D–F with D in the bass.'],
      ['What is a pivot chord?', 'A chord that belongs to both the old and the new key', ['A chord in the bass only', 'The last chord of a piece', 'A chord with a suspended note'], 'It is reinterpreted at the change of key.'],
      ['The Italian sixth chord contains…', 'The lowered 6th, the tonic and the raised 4th', ['The 2nd, 4th and 6th', 'The 3rd, 5th and 7th', 'The tonic and dominant only'], 'In A minor: F, A and D♯.'],
      ['How does V7/V normally resolve?', 'To V', ['To I', 'To IV', 'To vi'], 'It is the dominant of V.'],
      ['A “borrowed chord” comes from…', 'The parallel key (same tonic, other mode)', ['The relative key', 'A distant key', 'The dominant key'], 'For instance iv in a major key.']]),
  ],
  play: [progEx('Play I – V7/V – V – I in {key}', ['I', 'V7/V', 'V', 'I'], () => pick(['C', 'G', 'F']), 'major'), progEx('Play i – bII6 – V – i in {key}', ['i', 'bII6', 'V', 'i'], () => pick(['A', 'E', 'D']), 'minor'), progEx('Play I – V/vi – vi – IV – V – I in {key}', ['I', 'V/vi', 'vi', 'IV', 'V', 'I'], () => pick(['C', 'G']), 'major')]});

/* 13 --------------------------------------------------------------- */
CH.push({id: 'harmonizing', title: 'Harmonizing a melody', blurb: 'Putting it all together: choose the chords for a tune',
  body: `<p>To <b>harmonize</b> a melody, find the chords that fit under it. A method that works:</p>
<ol><li><b>Find the key</b> (the key signature and the last note) and the <b>cadences</b>: where the phrases end.</li><li>Choose the <b>harmonic rhythm</b>: usually one chord per bar, or per half bar. Chords change on strong beats.</li><li>For each bar, list the melody’s <b>strong-beat notes</b>. Pick a chord that contains them. Notes on weak beats may be non-chord tones (Chapter 10).</li><li>At the cadences use the standard endings (Chapter 7): V – I, or ending on V.</li><li>Link the chords with <b>falling fifths</b> and a good bass line (Chapter 8).</li><li>Check <b>voice leading</b> (Chapter 9).</li></ol>
<h3>An example</h3>
<p>The melody uses these notes: bar 1: C E G (chord tones of C); bar 2: F C A (chord tones of F); bar 3: D then B (a ii chord, then V); bar 4: C. The chords are <b>I – IV – ii V – I</b>, one chord per bar except in bar 3.</p>
{{fig:tune|Melody with the bass line and chords: I | IV | ii V | I.}}
<p>The notes of each bar guide the choice: <b>F A C</b> can only be IV (or ii⁷); <b>D</b> over G is a non-chord tone, and so on. Try other options (vi instead of I, V⁷ instead of V), keeping the cadences.</p>
<p>In the app you can practise this in the <b>Lead sheet</b> and <b>Improvisation</b> sight-reading tests (Lessons → each level’s sight reading), where you play chords or a melody over given chord symbols.</p>`,
  figs: {tune: melody('C', [['C5', 'C3', 'q', 'C', 'I'], ['E5', 'C3', 'q'], ['G5', 'C3', 'q'], ['E5', 'C3', 'q'], ['F5', 'F2', 'q', 'F', 'IV'], ['C5', 'F2', 'q'], ['A4', 'F2', 'q'], ['C5', 'F2', 'q'], ['D5', 'D3', 'h', 'Dm', 'ii'], ['B4', 'G2', 'h', 'G', 'V'], ['C5', 'C3', 'w', 'C', 'I']], {bpm: 80})},
  quiz: [
    () => { const t = pick([[['C', 'E', 'G'], 'I'], [['F', 'A', 'C'], 'IV'], [['G', 'B', 'D'], 'V'], [['A', 'C', 'E'], 'vi'], [['D', 'F', 'A'], 'ii']]); return ask(`A bar of a melody in C major has the notes ${t[0].join(', ')}. Which chord fits?`, t[1], ['I', 'ii', 'IV', 'V', 'vi'], `${t[0].join(' – ')} are the notes of ${symOf(rn(t[1], 'C', 'major'))}.`); },
    bank([['When harmonizing, what do you look for first?', 'The key and the cadences', ['The longest note', 'The highest note', 'The loudest beat'], 'Cadences mark the phrase ends.'],
      ['Chords usually change on…', 'Strong beats', ['Weak beats only', 'Every note', 'The last beat of the piece'], 'The melody’s strong-beat notes should be chord tones.'],
      ['A melody ends on the tonic. Which cadence fits?', 'V → I', ['I → V', 'ii → vi', 'vii° → iii'], 'The strongest ending.'],
      ['A melody phrase pauses on D (the 2nd degree), unfinished. Which cadence suits it?', 'Half cadence (ending on V)', ['Perfect authentic cadence', 'Plagal cadence', 'Picardy third'], 'D belongs to V (G–B–D).'],
      ['Which chord contains F, A and C?', 'IV (in C major)', ['I', 'V', 'vi'], 'F major.']]),
  ],
  play: [progEx('Play the tune’s chords: I – IV – ii – V – I in {key}', ['I', 'IV', 'ii', 'V', 'I'], () => pick(['C', 'G', 'F']), 'major'), progEx('Play I – vi – ii – V in {key}', ['I', 'vi', 'ii', 'V'], () => pick(['C', 'G', 'F', 'D']), 'major'), progEx('Play I – IV – I⁶₄ – V – I in {key}', ['I', 'IV', 'I64', 'V', 'I'], () => pick(['C', 'G', 'F']), 'major', 'The I⁶₄ must have the fifth of the chord in the bass.')]});

window.Harmony.register(CH);
})();
