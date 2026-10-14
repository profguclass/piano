/* Harmony tutorial: the chapters (text, examples, quiz questions and exercises). The engine is in harmony.js. */
(() => {
'use strict';
const A = window.Harmony.api, {parse, nm, pn, above, scale, rn, chordFromRoot, pcsOf, sortN, QNAME} = A;
const SUP = {6: '⁶', 7: '⁷', 65: '⁶₅', 43: '⁴₃', 42: '⁴₂', 64: '⁶₄'};
const fmt = s => s.split('/').map(p => p.replace(/M7$/, 'maj⁷').replace(/(65|43|42|64|7|6)$/, f => SUP[f]).replace(/^b(?=[IViv])/, '♭').replace(/^#(?=[IViv])/, '♯')).join('/');       // V65 -> V⁶₅
const SUFFIX = {sus2: 'sus2', sus4: 'sus4', major: '', minor: 'm', dim: '°', aug: '+', dom7: '7', maj7: 'maj7', min7: 'm7', hdim7: 'ø7', dim7: '°7'};
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
<p>The spelling matters: C–E♭ is a minor 3rd, but C–D♯ sounds the same on the piano and is an augmented 2nd. The letters tell you the size.</p>
<h3>Inversion and compound intervals</h3>
<p>To <b>invert</b> an interval, move its lower note up an octave (or its upper note down). The size of an interval and the size of its inversion always add up to <b>9</b>: a 3rd becomes a 6th, a 2nd becomes a 7th, a 4th becomes a 5th. The <b>quality</b> flips too: major becomes minor and minor becomes major, augmented becomes diminished and diminished becomes augmented, while perfect stays perfect.</p>
{{fig:invert|A major 3rd (C–E) inverted is a minor 6th (E–C). A perfect 5th (C–G) inverted is a perfect 4th (G–C).}}
<p>An interval larger than an octave is a <b>compound interval</b>: a 9th is a 2nd plus an octave, a 10th a 3rd plus an octave. In harmony we usually reduce them to the simple interval (a 10th is treated as a 3rd), as the chords in this course do.</p>`,
  figs: {invert: {key: 'C', mode: 'major', clef: 'treble', bpm: 70, events: [{notes: ['C4', 'E4'], d: 'h', sym: 'M3'}, {notes: ['E4', 'C5'], d: 'h', sym: 'm6'}, {notes: ['C4', 'G4'], d: 'h', sym: 'P5'}, {notes: ['G4', 'C5'], d: 'h', sym: 'P4'}]}, ints: {key: 'C', mode: 'major', clef: 'treble', bpm: 70, events: ints('C', ['minor 2nd', 'major 2nd', 'minor 3rd', 'major 3rd', 'perfect 4th', 'perfect 5th', 'major 6th', 'major 7th']).map(([a, b], i) => ({notes: [a, b], d: 'h', sym: ['m2', 'M2', 'm3', 'M3', 'P4', 'P5', 'M6', 'M7'][i]}))}},
  quiz: [
    () => { const [n, inv] = pick([['minor 2nd', 'major 7th'], ['major 2nd', 'minor 7th'], ['minor 3rd', 'major 6th'], ['major 3rd', 'minor 6th'], ['perfect 4th', 'perfect 5th'], ['perfect 5th', 'perfect 4th'], ['major 6th', 'minor 3rd'], ['minor 7th', 'major 2nd']]); return ask(`What is the inversion of a ${n}?`, inv, ['minor 2nd', 'major 7th', 'major 2nd', 'minor 7th', 'minor 3rd', 'major 6th', 'major 3rd', 'minor 6th', 'perfect 4th', 'perfect 5th'], 'The sizes add up to 9, and major and minor swap.'); },
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
<p>Name the chord by its root: “C major”, “A minor” (written <b>Am</b>), “B diminished” (<b>B°</b>), “C augmented” (<b>C+</b>). Major and minor triads are <b>consonant</b>; diminished and augmented triads are <b>dissonant</b> and want to move.</p>
<h3>Lead-sheet symbols and slash chords</h3>
<p>In popular music and jazz chords are written as <b>lead-sheet symbols</b> instead of notes. The symbol gives the root and the quality, and leaves it to the player to choose the voicing: <b>C</b> (major), <b>Cm</b> (minor), <b>C°</b> (diminished), <b>C+</b> (augmented). If the lowest note (the <b>bass</b>) is not the root, a <b>slash chord</b> names it after the slash: <b>C/E</b> is a C major triad with E in the bass. The first letter is always the root; the letter after the slash is only the bass note. Note the difference between <i>root</i> (the bottom of the stack of thirds) and <i>bass</i> (the lowest sounding note).</p>
<p>To read a chord from a staff, put the notes in thirds (all on lines or all on spaces) to find the root, measure the two thirds to find the quality, and check the lowest note for inversion.</p>
<h3>Suspended chords</h3>
<p>A <b>sus</b> chord (short for suspended) replaces the third of the triad, so it is neither major nor minor. In <b>sus4</b> a perfect 4th takes the place of the third; in <b>sus2</b> a major 2nd does. Both keep the perfect 5th. They sound open and unresolved, and often move to the major or minor chord on the same root.</p>
{{fig:sus|C, Csus4 and Csus2: the 4th or the 2nd replaces the third.}}
<table class="htab"><tr><th>Augmented</th><td>4 + 4 half steps</td></tr><tr><th>Major</th><td>4 + 3</td></tr><tr><th>Minor</th><td>3 + 4</td></tr><tr><th>Diminished</th><td>3 + 3</td></tr><tr><th>Sus2</th><td>2 + 5</td></tr><tr><th>Sus4</th><td>5 + 2</td></tr></table>`,
  figs: {sus: {key: 'C', mode: 'major', clef: 'treble', bpm: 56, events: ['major', 'sus4', 'sus2'].map(q => ({notes: chordFromRoot(R('C'), q), d: 'w', sym: 'C' + SUFFIX[q]}))}, triads: {key: 'C', mode: 'major', clef: 'treble', bpm: 56, events: ['major', 'minor', 'dim', 'aug'].map(q => ({notes: chordFromRoot(R('C'), q), d: 'w', sym: 'C' + SUFFIX[q]}))}},
  quiz: [
    () => { const r = pick(['C', 'D', 'E', 'F', 'G', 'A', 'Bb', 'Eb']), q = pick(['major', 'minor', 'dim', 'aug']), inv = pick([0, 0, 1, 2]), c = chordFromRoot(R(r), q), rot = sortN(c.map((n, i) => i < inv ? A.shiftOct(n, 1) : n)), sym = pn(r) + SUFFIX[q] + (inv ? '/' + nm(c[inv]) : '');
      const wrongs = [...['major', 'minor', 'dim', 'aug'].filter(x => x !== q).map(x => pn(r) + SUFFIX[x] + (inv ? '/' + nm(c[inv]) : '')), pn(r) + SUFFIX[q] + (inv ? '' : '/' + nm(c[1]))]; return ask('Which lead-sheet symbol names this chord?', sym, wrongs, 'Root and quality first; after a slash, the lowest note if it is not the root.', {fig: {key: 'C', mode: 'major', clef: 'treble', events: [{notes: rot, d: 'w'}]}}); },
    () => { const r = pick(['C', 'D', 'F', 'G', 'A']), q = pick(['sus2', 'sus4']), c = chordFromRoot(R(r), q); return ask(`Which notes make ${pn(r)}${SUFFIX[q]}?`, c.map(n => nm(n)).join(' – '), [chordFromRoot(R(r), q === 'sus2' ? 'sus4' : 'sus2'), chordFromRoot(R(r), 'major'), chordFromRoot(R(r), 'minor')].map(x => x.map(n => nm(n)).join(' – ')), q === 'sus2' ? 'The 2nd replaces the third; the fifth stays.' : 'The 4th replaces the third; the fifth stays.'); },
    () => { const r = pick(ROOTS), q = pick(['major', 'minor', 'dim', 'aug']); return ask(`Which notes make the ${pn(r)} ${QNAME[q]}?`, trio(r, q), ['major', 'minor', 'dim', 'aug'].map(x => trio(r, x)), `Root, third and fifth: ${trio(r, q)}.`); },
    () => { const r = pick(['C', 'D', 'E', 'F', 'G', 'A', 'Bb', 'Eb']), q = pick(['major', 'minor', 'dim', 'aug']); return ask('What kind of triad is this?', {major: 'Major', minor: 'Minor', dim: 'Diminished', aug: 'Augmented'}[q], ['Major', 'Minor', 'Diminished', 'Augmented'], `${{major: 'A major 3rd and a perfect 5th', minor: 'A minor 3rd and a perfect 5th', dim: 'A minor 3rd and a diminished 5th', aug: 'A major 3rd and an augmented 5th'}[q]}.`, {fig: {key: 'C', mode: 'major', clef: 'treble', events: [{notes: chordFromRoot(R(r), q), d: 'w'}]}}); },
    bank([['A diminished triad is built from…', 'Two minor 3rds', ['Two major 3rds', 'A major then a minor 3rd', 'A minor then a major 3rd'], 'Minor 3rd + minor 3rd gives a diminished 5th.'],
      ['An augmented triad is built from…', 'Two major 3rds', ['Two minor 3rds', 'A major then a minor 3rd', 'A perfect 4th and 5th'], 'Major 3rd + major 3rd gives an augmented 5th.'],
      ['Which triads are consonant (stable)?', 'Major and minor', ['Diminished and augmented', 'Only major', 'All four'], 'Diminished and augmented triads are dissonant.'],
      ['What is the fifth of the A minor triad?', 'E', ['C', 'A', 'G'], 'A minor is A–C–E.']]),
  ],
  play: [triadEx, triadEx, triadsEx, () => { const r = pick(['C', 'G', 'F', 'D']), a = chordFromRoot(R(r), 'sus4'), b = chordFromRoot(R(r), 'major'), c2 = chordFromRoot(R(r), 'sus2'); return {title: `Suspend and resolve on ${pn(r)}`, help: 'Play the sus4 chord, then the major chord it resolves to, then the sus2 chord.', steps: [[a, 'sus4'], [b, ''], [c2, 'sus2']].map(([c, t]) => ({label: pn(r) + t, pcs: pcsOf(c), names: c.map(n => nm(n))}))}; }]});

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
<p>First inversion is smooth and common: the bass moves by step, so it gives a gentler, less final sound. Second inversion is unstable (the bass note, a fifth above the root, sounds like a leaning dissonance). It is used in particular ways: as a <b>cadential 6/4</b> before V ({{ch:cadences}}), as a <b>passing</b> chord between two others, and as a <b>pedal</b> chord over a held bass.</p>
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
<p>The <b>circle of fifths</b> arranges all twelve keys by fifths: C G D A E B F♯… going up a fifth adds a sharp; going down adds a flat. Neighbouring keys share most of their notes, which is why we can modulate between them smoothly ({{ch:chromatic}}).</p>`,
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
<ol><li><b>Find the key</b> (the key signature and the last note) and the <b>cadences</b>: where the phrases end.</li><li>Choose the <b>harmonic rhythm</b>: usually one chord per bar, or per half bar. Chords change on strong beats.</li><li>For each bar, list the melody’s <b>strong-beat notes</b>. Pick a chord that contains them. Notes on weak beats may be non-chord tones ({{ch:nonchord}}).</li><li>At the cadences use the standard endings ({{ch:cadences}}): V – I, or ending on V.</li><li>Link the chords with <b>falling fifths</b> and a good bass line ({{ch:progressions}}).</li><li>Check <b>voice leading</b> ({{ch:voiceleading}}).</li></ol>
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


/* 14 --------------------------------------------------------------- */
const CF = ['C3', 'D3', 'F3', 'E3', 'G3', 'F3', 'D3', 'C3'];                               // the cantus firmus used for all the species
const simple = (cp, cf) => { const a = parse(cp.replace('~', '')), b = parse(cf), d = ((a.step - b.step) % 7 + 7) % 7; return d === 0 ? (a.midi === b.midi ? 1 : 8) : d + 1; };
function cpFig(species, bars, o = {}) {                                                   // bars: the counterpoint notes of each bar ('r' = rest); returns a two-line figure with interval numbers above
  const dur = {1: 'w', 2: 'h', 3: 'q', 4: 'h'}[species], cp = [], cf = [];
  bars.forEach((nots, bi) => nots.forEach(n => cp.push(n === 'r' ? {rest: true, notes: [], d: dur} : {notes: [n], d: dur, sym: String(simple(n, CF[bi]))})));
  CF.forEach(n => cf.push({notes: [n], d: 'w'}));
  return {key: 'C', mode: 'major', clef: 'grand', bpm: 120, fs: 10, cp: {species, bars, cf: CF}, voices: [{staff: 1, voice: 1, stem: 'up', events: cp}, {staff: 2, voice: 2, stem: 'down', events: cf}], ...o};
}
const S1 = [['C4'], ['B3'], ['A3'], ['E4'], ['D4'], ['A3'], ['B3'], ['C4']];
const S2 = [['C4', 'A3'], ['B3', 'C4'], ['D4', 'F4'], ['G4', 'E4'], ['D4', 'E4'], ['D4', 'C4'], ['D4', 'B3'], ['C4']];
const S3 = [['G4', 'F4', 'E4', 'G4'], ['F4', 'E4', 'D4', 'B3'], ['A3', 'C4', 'D4', 'F4'], ['G4', 'A4', 'B4', 'C5'], ['G4', 'A4', 'B4', 'G4'], ['D5', 'C5', 'A4', 'G4'], ['F4', 'E4', 'D4', 'B3'], ['C4']];
const S4 = [['r', 'G4~'], ['G4', 'F4~'], ['F4', 'A4~'], ['A4', 'G4~'], ['G4', 'E4~'], ['E4', 'D4~'], ['D4', 'B3'], ['C4']];
const motion = (lo, up, label) => ({key: 'C', mode: 'major', clef: 'grand', bpm: 80, voices: [{staff: 1, voice: 1, stem: 'up', events: up.map((n, i) => ({notes: [n], d: 'h', sym: i ? label : ''}))}, {staff: 2, voice: 2, stem: 'down', events: lo.map(n => ({notes: [n], d: 'h'}))}]});
const twoNotes = (lo, up) => ({key: 'C', mode: 'major', clef: 'grand', bpm: 80, voices: [{staff: 1, voice: 1, events: [{notes: [up], d: 'w'}]}, {staff: 2, voice: 2, events: [{notes: [lo], d: 'w'}]}]});
const WHITE_UP = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'], WHITE_LO = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'];
const classify = (l1, u1, l2, u2) => { const dl = parse(l2).midi - parse(l1).midi, du = parse(u2).midi - parse(u1).midi; if (!dl || !du) return 'Oblique'; if ((dl > 0) !== (du > 0)) return 'Contrary'; return (parse(u1).midi - parse(l1).midi) === (parse(u2).midi - parse(l2).midi) ? 'Parallel' : 'Similar'; };
const pairStep = i => { const a = parse(CF[i]), b = parse(S1[i][0]); return {label: `${nm(a)} + ${nm(b)}`, pcs: pcsOf([a, b]), names: [nm(a), nm(b)], bass: ((a.midi % 12) + 12) % 12}; };
CH.push({id: 'counterpoint', title: 'Counterpoint', blurb: 'Independent melodies sounding together: the five species',
  body: `<p><b>Counterpoint</b> (from the Latin <i>punctus contra punctum</i>, “note against note”) is the art of combining two or more <b>independent melodies</b> so that they sound well together. Harmony looks at the music <b>vertically</b>: the chords. Counterpoint looks at it <b>horizontally</b>: each line must be a good melody in its own right, and the lines must also fit each other. {{ch:voiceleading}} (voice leading) was counterpoint in miniature; here the lines have more freedom and the rules are stated more strictly.</p>
<p>The classic way to learn it, set down by <b>Johann Joseph Fux</b> in 1725 (<i>Gradus ad Parnassum</i>) and studied by Haydn, Mozart and Beethoven, is in five stages called <b>species</b>. In each you write a <b>counterpoint</b> (here above) against a given melody in long notes, the <b>cantus firmus</b> (“fixed song”, CF).</p>
{{fig:cf|The cantus firmus used in every example: C D F E G F D C. It starts and ends on the tonic, rises to one high point (G) and ends by step (D to C).}}
<h3>Intervals between the lines</h3>
<table class="htab"><tr><th>Perfect consonances</th><td>unison, 5th, octave</td><td>open and stable; use at the start and end</td></tr><tr><th>Imperfect consonances</th><td>3rds and 6ths</td><td>sweet; the backbone of the writing</td></tr><tr><th>Dissonances</th><td>2nds, 7ths, tritone, and the 4th (between two voices)</td><td>tense; only when the rules allow</td></tr></table>
<h3>Four kinds of motion</h3>
<p>Two lines can move in four ways. <b>Contrary</b> and <b>oblique</b> motion keep the lines independent; <b>parallel</b> motion by 3rds or 6ths is fine for a short time; parallel 5ths and octaves are forbidden ({{ch:voiceleading}}).</p>
{{fig:m_par|Parallel: both lines move the same way by the same interval.}}
{{fig:m_sim|Similar: both move the same way, but the interval changes.}}
{{fig:m_con|Contrary: the lines move in opposite directions.}}
{{fig:m_obl|Oblique: one line stays, the other moves.}}
<h3>First species: note against note</h3>
<p>One counterpoint note to each note of the cantus firmus. The numbers above the staff show the interval with the cantus firmus.</p>
<ul><li>Begin and end on a <b>perfect consonance</b> (the octave, fifth or unison at the start; the octave or unison at the end).</li><li>Use <b>only consonances</b> on every note.</li><li>No <b>parallel 5ths or octaves</b>; do not arrive at a perfect interval by similar motion; no more than three 3rds or 6ths in a row.</li><li>The line moves mostly by <b>step</b>, with small leaps; after a large leap, step back the other way; no tritone; one high point.</li><li>The last bars: the <b>major 6th</b> over the cantus firmus’s D, then the octave (here B then C).</li></ul>
{{fig:s1|First species: 8 · 6 · 3 · 8 · 5 · 3 · 6 · 8.}}
<h3>Second species: two notes against one</h3>
<p>Two half notes to each cantus note. The <b>strong</b> (first) half of each bar must be a consonance. The <b>weak</b> half may be a dissonance only as a <b>passing tone</b>: reached and left by step in the same direction. Avoid parallel 5ths and octaves between consecutive strong beats.</p>
{{fig:s2|Second species. In bar 2 the C (a 7th over D) is a passing tone between B and D.}}
<h3>Third species: four notes against one</h3>
<p>Four quarter notes to a bar. The first and third notes must be consonant; the second and fourth may be passing dissonances. Keep the line flowing, with a smooth curve and one high point (here D).</p>
{{fig:s3|Third species: four notes to each note of the cantus firmus.}}
<h3>Fourth species: syncopation</h3>
<p>The counterpoint is <b>tied over the bar line</b>, so it is delayed against the cantus firmus. When the new bass note arrives, the tied note often becomes a dissonance, a <b>suspension</b>, and must then <b>resolve down by step</b> to a consonance. In two parts above a bass the usual suspensions are <b>4–3</b> and <b>7–6</b>. The numbers above the staff show them: bars 2 and 4 have 4–3 and bar 6 has 7–6.</p>
{{fig:s4|Fourth species: the tied notes make the suspensions 4–3, 4–3 and 7–6. Compare with {{ch:nonchord}}.}}
<h3>Fifth species: florid counterpoint</h3>
<p>All the earlier species combined: notes of different lengths, with suspensions, passing tones and <b>cambiata</b> figures, so the line sounds like real, flowing melody. This is the style of Palestrina and the starting point of Bach’s two-part inventions.</p>
<h3>Counterpoint in real music</h3>
<p>Composers use counterpoint in <b>imitation</b> (a line is repeated by another voice), the <b>canon</b> (strict imitation, as in a round such as <i>Frère Jacques</i>), the <b>invention</b> and the <b>fugue</b>. A good test: if you remove one line, the other should still make sense as a melody.</p>`,
  figs: {
    cf: {key: 'C', mode: 'major', clef: 'grand', bpm: 120, voices: [{staff: 2, voice: 2, events: CF.map(n => ({notes: [n], d: 'w'}))}, {staff: 1, voice: 1, events: CF.map(() => ({rest: true, notes: [], d: 'w'}))}]},
    m_par: motion(['F3', 'G3'], ['A4', 'B4'], 'parallel'),
    m_sim: motion(['C3', 'D3'], ['E4', 'A4'], 'similar'),
    m_con: motion(['D3', 'C3'], ['F4', 'G4'], 'contrary'),
    m_obl: motion(['C3', 'C3'], ['E4', 'G4'], 'oblique'),
    s1: cpFig(1, S1), s2: cpFig(2, S2), s3: cpFig(3, S3), s4: cpFig(4, S4),
  },
  quiz: [
    () => { const i = Math.floor(Math.random() * 7), j = pick([i + 1, i + 2, i + 3, i + 4].filter(x => x < 8)), lo = WHITE_LO[i], up = WHITE_UP[j], semis = parse(up).midi - parse(lo).midi, pcSemi = ((semis % 12) + 12) % 12;
      const cons = [0, 3, 4, 7, 8, 9].includes(pcSemi); return ask('Is the interval between these two notes a consonance or a dissonance?', cons ? 'Consonance' : 'Dissonance', ['Consonance', 'Dissonance', 'Perfect consonance only', 'Neither'], cons ? 'It is a 3rd, 5th, 6th or octave (or unison).' : 'In counterpoint, 2nds, 7ths, tritones and 4ths between two voices are dissonant.', {fig: twoNotes(lo, up)}); },
    () => { const i = Math.floor(Math.random() * 6), l1 = WHITE_LO[i], u1 = pick(WHITE_UP.slice(1, 6)), l2 = pick(WHITE_LO.filter(x => x !== l1)), u2 = pick(WHITE_UP.filter(x => x !== u1)); const ans = classify(l1, u1, l2, u2);
      return ask('What kind of motion is this?', ans, ['Parallel', 'Similar', 'Contrary', 'Oblique'], {Parallel: 'Same direction, same interval.', Similar: 'Same direction, different interval.', Contrary: 'Opposite directions.', Oblique: 'One line stays still.'}[ans], {fig: {key: 'C', mode: 'major', clef: 'grand', bpm: 80, voices: [{staff: 1, voice: 1, events: [u1, u2].map(n => ({notes: [n], d: 'h'}))}, {staff: 2, voice: 2, events: [l1, l2].map(n => ({notes: [n], d: 'h'}))}]}}); },
    bank([['What is a cantus firmus?', 'A given melody in long notes to write against', ['The highest line of a fugue', 'A kind of suspension', 'A cadence at the end of a phrase'], 'The Latin means “fixed song”.'],
      ['In first species counterpoint, how many notes are written against each note of the cantus firmus?', 'One', ['Two', 'Four', 'As many as you like'], 'It is “note against note”.'],
      ['Which intervals are perfect consonances?', 'Unison, 5th and octave', ['3rds and 6ths', '2nds and 7ths', 'The 4th and the tritone'], 'The 3rds and 6ths are imperfect consonances.'],
      ['Which motion is forbidden between two voices when it leads to 5ths or octaves?', 'Parallel motion', ['Contrary motion', 'Oblique motion', 'Stepwise motion'], 'Parallel 5ths and octaves destroy the independence of the lines.'],
      ['In second species, when may the weak half note be a dissonance?', 'As a passing tone, reached and left by step', ['Never', 'Whenever it is a leap', 'On the first beat'], 'Strong beats must always be consonant.'],
      ['What is a suspension in fourth species?', 'A tied note that becomes a dissonance and resolves down by step', ['A note that leaps up', 'An interval of a 5th', 'A rest on the first beat'], 'The usual ones are 4–3 and 7–6.'],
      ['Which species uses syncopation (notes tied over the bar line)?', 'Fourth', ['First', 'Second', 'Third'], 'It produces the suspensions.'],
      ['What is florid counterpoint?', 'Fifth species: all the earlier species mixed', ['Counterpoint in three parts', 'Counterpoint without a cantus firmus', 'Another name for a fugue'], 'It is the most melodic and free species.'],
      ['The usual last bars of a first-species counterpoint above the cantus firmus are…', 'A major 6th, then an octave', ['A 3rd, then a 5th', 'A 4th, then a unison', 'A 7th, then a 3rd'], 'B over D, then C over C.']]),
  ],
  play: [
    () => ({title: 'First species: bars 1–4, both lines together', help: 'Play the cantus firmus note and the counterpoint note together: C+C, D+B, F+A, E+E. Any octave, but the cantus firmus must be the lowest.', steps: [0, 1, 2, 3].map(pairStep)}),
    () => ({title: 'First species: bars 5–8, both lines together', help: 'The cantus firmus is the lowest note. The last two bars are the usual cadence: a major 6th, then the octave.', steps: [4, 5, 6, 7].map(pairStep)}),
    () => { const kinds = [['major 3rd', 2, 4], ['perfect 5th', 4, 7], ['major 6th', 5, 9], ['minor 3rd', 2, 3]], bass = ['C', 'D', 'F', 'E', 'G'].sort(() => Math.random() - 0.5).slice(0, 4); return {title: 'Consonances above a cantus firmus', help: 'Play the bass note and the consonance above it, together.', steps: bass.map((b, i) => { const [name, d, sm] = kinds[i % kinds.length], a = R(b), t = above(a, d, sm); return {label: `${pn(b)} + ${name}`, pcs: pcsOf([a, t]), names: [pn(b), nm(t)], bass: ((a.midi % 12) + 12) % 12}; }) }; },
  ]});

/* 15 --------------------------------------------------------------- */
const mel = (list) => list.map(([n, d, sym]) => n === 'r' ? {rest: true, notes: [], d} : {notes: Array.isArray(n) ? n : [n], d, sym});
const bassLine = (list) => list.map(([n, d, r]) => n === 'r' ? {rest: true, notes: [], d} : {notes: Array.isArray(n) ? n : [n], d, rn: r});
const twoLines = (mode, key, m, b, bpm) => ({key, mode, clef: 'grand', bpm: bpm || 100, fs: 10, voices: [{staff: 1, voice: 1, stem: 'up', events: mel(m)}, {staff: 2, voice: 2, stem: 'down', events: bassLine(b)}]});
const ODE = [['E4', 'q', 'antecedent'], ['E4', 'q'], ['F4', 'q'], ['G4', 'q'], ['G4', 'q'], ['F4', 'q'], ['E4', 'q'], ['D4', 'q'], ['C4', 'q'], ['C4', 'q'], ['D4', 'q'], ['E4', 'q'], ['E4', 'q.'], ['D4', 'e'], ['D4', 'h', 'half cadence'],
  ['E4', 'q', 'consequent'], ['E4', 'q'], ['F4', 'q'], ['G4', 'q'], ['G4', 'q'], ['F4', 'q'], ['E4', 'q'], ['D4', 'q'], ['C4', 'q'], ['C4', 'q'], ['D4', 'q'], ['E4', 'q'], ['D4', 'q.'], ['C4', 'e'], ['C4', 'h', 'perfect authentic cadence']];
const ODE_BASS = [['C3', 'w', 'I'], ['G2', 'w', 'V'], ['C3', 'w', 'I'], ['C3', 'h', 'I'], ['G2', 'h', 'V'], ['C3', 'w', 'I'], ['G2', 'w', 'V'], ['C3', 'w', 'I'], ['G2', 'h', 'V'], ['C3', 'h', 'I']];
const SENT = [['C5', 'q', 'basic idea'], ['D5', 'q'], ['E5', 'h'], ['D5', 'q', 'idea repeated a step higher'], ['E5', 'q'], ['F5', 'h'], ['D5', 'q', 'continuation: shorter, driving to the cadence'], ['B4', 'q'], ['D5', 'q'], ['G4', 'q'], ['C5', 'w', 'cadence']];
const SENT_BASS = [['C3', 'w', 'I'], ['D3', 'w', 'ii'], ['G2', 'w', 'V'], ['C3', 'w', 'I']];
const UNLABELLED = [
  {names: 'I – IV – V – I', key: 'C', mode: 'major', v: ['C3 G3 E4 C5', 'F2 A3 F4 C5', 'G2 G3 D4 B4', 'C3 G3 E4 C5']},
  {names: 'ii – V – I', key: 'C', mode: 'major', v: ['D3 A3 F4 D5', 'G2 G3 D4 B4', 'C3 G3 E4 C5']},
  {names: 'I – vi – ii – V – I', key: 'C', mode: 'major', v: ['C3 G3 E4 C5', 'A2 A3 E4 C5', 'D3 A3 F4 D5', 'G2 G3 D4 B4', 'C3 G3 E4 C5']},
  {names: 'i – iv – V – i', key: 'A', mode: 'minor', v: ['A2 E3 C4 A4', 'D2 F3 D4 A4', 'E2 E3 B3 G#4', 'A2 E3 C4 A4']},
  {names: 'I – V – I', key: 'C', mode: 'major', v: ['C3 G3 E4 C5', 'G2 G3 D4 B4', 'C3 G3 E4 C5']},
];
CH.push({id: 'form', title: 'Form and analysis', blurb: 'Motives, phrases, periods, and the large forms: binary, ternary, rondo, sonata',
  body: `<p><b>Form</b> is the shape of a piece: how its parts are arranged in time. Harmony gives each part its own colour and, above all, its <b>cadences</b>, the points where the music pauses or ends. <b>Analysis</b> means finding that shape and the harmony inside it, so that you understand what you are playing.</p>
<h3>From motive to phrase</h3>
<ul><li>A <b>motive</b> is the smallest meaningful musical idea: a few notes with a recognisable rhythm, like the opening of Beethoven’s Fifth.</li><li>A <b>phrase</b> is a musical sentence that ends with a cadence. In classical music it is most often <b>four bars</b> long.</li><li>Phrases are built by <b>repetition</b>, <b>sequence</b> (the same idea at a different pitch), <b>variation</b> and <b>contrast</b>.</li></ul>
<h3>The period</h3>
<p>Two phrases together make a <b>period</b>: an <b>antecedent</b> (a “question”) that ends on a weak cadence, usually a <b>half cadence</b>, and a <b>consequent</b> (the “answer”) that begins the same way and ends on a stronger one, a <b>perfect authentic cadence</b>. Beethoven’s <i>Ode to Joy</i> is a perfect example:</p>
{{fig:ode|Ode to Joy as a period. Both phrases begin alike; the first ends on V (D over a G bass), the second on I.}}
<h3>The sentence</h3>
<p>Another common eight-bar or four-bar design is the <b>sentence</b>: a <b>basic idea</b>, its repetition (often a step higher), and then a <b>continuation</b> that uses shorter units and drives to a cadence. Here is a four-bar version:</p>
{{fig:sentence|A sentence: idea, repetition in sequence, continuation and cadence, over I – ii – V – I.}}
<h3>The large forms</h3>
<table class="htab"><tr><th>Binary (AB)</th><td>Two sections, often both repeated. The first moves away from the tonic (to the dominant, or the relative major in minor); the second returns. Typical of Baroque dances. In <b>rounded binary</b> the opening music comes back at the end of B.</td></tr>
<tr><th>Ternary (ABA)</th><td>A, a contrasting B, then A again. Minuets with their trios, many slow movements and the “da capo” aria. The return of A gives a sense of coming home.</td></tr>
<tr><th>Rondo (ABACA…)</th><td>A refrain that keeps returning, with contrasting episodes between: ABACA, or ABACABA.</td></tr>
<tr><th>Theme and variations</th><td>A theme followed by several changed versions of it (melody, harmony, rhythm or texture). The harmony and phrase lengths usually stay.</td></tr>
<tr><th>Sonata form</th><td>The most important form of the Classical period, used for the first movements of sonatas, symphonies and quartets: <b>exposition</b> (first theme in the tonic, a transition, second theme in the dominant, or the relative major in a minor key), <b>development</b> (themes are broken up and modulate through many keys) and <b>recapitulation</b> (both themes return in the tonic), often with a closing <b>coda</b>.</td></tr>
<tr><th>Minuet and trio</th><td>A dance in ternary form: minuet, contrasting trio, minuet again. The usual third movement of a Classical symphony or quartet.</td></tr></table>
<h3>How to analyze a piece</h3>
<ol><li><b>Find the key</b> from the key signature and the last chord. Watch for accidentals that hint at modulation.</li><li><b>Mark the cadences</b>. They divide the music into phrases and show which ones are open (half cadence) and which closed (authentic).</li><li><b>Group the phrases</b> into periods, sentences or larger sections, and label the sections with letters (A, B, A′…).</li><li><b>Label the chords</b> with Roman numerals and inversions, and circle the non-chord tones ({{ch:nonchord}}).</li><li><b>Look for the plan</b>: what returns, what is new, where the music changes key.</li></ol>
<p>Practise on the pieces you play in the app. Open any lesson or Library piece, play it through, and see where its phrases end.</p>`,
  figs: {
    ode: twoLines('major', 'C', ODE, ODE_BASS, 100),
    sentence: twoLines('major', 'C', SENT, SENT_BASS, 90),
  },
  quiz: [
    () => { const p = pick(UNLABELLED); return ask('Which chord progression is this?', p.names, UNLABELLED.map(x => x.names), 'Name each chord: the bass note gives the root in these examples.', {fig: {key: p.key, mode: p.mode, clef: 'grand', satb: true, bpm: 70, events: p.v.map(v => ({notes: v.split(' '), d: 'h'}))}}); },
    () => { const [plan, name] = pick([['A B', 'Binary'], ['A B A', 'Ternary'], ['A B A C A', 'Rondo'], ['Theme, variation 1, variation 2, variation 3…', 'Theme and variations'], ['Exposition, development, recapitulation', 'Sonata form'], ['Minuet, trio, minuet', 'Minuet and trio (a ternary form)']]); return ask(`A piece is laid out as “${plan}”. What is its form?`, name, ['Binary', 'Ternary', 'Rondo', 'Theme and variations', 'Sonata form'], `${plan} describes ${name.toLowerCase()}.`); },
    bank([['In a period, how does the antecedent phrase usually end?', 'On a half cadence', ['On a perfect authentic cadence', 'On a deceptive cadence', 'On a plagal cadence'], 'It asks a question that the consequent answers.'],
      ['In a period, how does the consequent phrase usually end?', 'On a perfect authentic cadence', ['On a half cadence', 'On the subdominant', 'With a modulation'], 'It is the stronger answer.'],
      ['How long is a typical classical phrase?', 'Four bars', ['Two bars', 'Sixteen bars', 'One bar'], 'Two phrases make an eight-bar period.'],
      ['What is a motive?', 'The smallest meaningful musical idea', ['A whole section of a piece', 'A kind of cadence', 'A key change'], 'A few notes with a characteristic rhythm.'],
      ['What is a sequence?', 'The same idea repeated at a different pitch', ['The same idea repeated exactly', 'A change of tempo', 'A kind of rest'], 'Often a step higher or lower.'],
      ['In a sentence, what follows the basic idea and its repetition?', 'A continuation leading to a cadence', ['A repeat of the whole', 'A silence', 'A new key signature'], 'The units get shorter as the cadence approaches.'],
      ['Which form has the plan ABA?', 'Ternary', ['Binary', 'Rondo', 'Sonata'], 'The first section comes back after a contrast.'],
      ['In a sonata-form exposition in a major key, where is the second theme usually?', 'In the dominant key', ['In the tonic', 'In the subdominant', 'In the relative minor'], 'It returns in the tonic in the recapitulation.'],
      ['What happens in the development section of a sonata form?', 'Themes are broken up and modulate through various keys', ['The first theme returns exactly', 'The piece ends', 'A new slow melody starts'], 'It is the most unsettled part.'],
      ['Which form is built on a returning refrain with contrasting episodes?', 'Rondo', ['Binary', 'Fugue', 'Canon'], 'ABACA…'],
      ['What is the first step in analyzing a piece?', 'Find the key', ['Count the notes', 'Find the loudest bar', 'Name the composer'], 'Then mark the cadences.']]),
  ],
  play: [
    progEx('Play the harmony of Ode to Joy’s first phrase in {key}', ['I', 'V', 'I', 'V'], () => pick(['C', 'G', 'F']), 'major', 'One chord per bar, ending on V: a half cadence. This is the antecedent phrase.'),
    progEx('Play the second phrase: I – V – I – V – I in {key}', ['I', 'V', 'I', 'V', 'I'], () => pick(['C', 'G', 'F']), 'major', 'The same chords, but the last bars end on I: a perfect authentic cadence.'),
    progEx('Play the sentence’s chords: I – ii – V – I in {key}', ['I', 'ii', 'V', 'I'], () => pick(['C', 'G', 'F', 'D']), 'major', 'Idea (I), repetition in sequence (ii), continuation to the cadence (V – I).'),
  ]});

const rline = (ts, durs, labels) => ({key: 'C', mode: 'major', clef: 'treble', ts, bpm: 100, events: durs.map((d, i) => ({notes: ['C5'], d, sym: (labels && labels[i]) || undefined}))});
const noteLabel = m => ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'][m % 12] + (Math.floor(m / 12) - 1);

/* ================= Foundations: notation and rhythm ================= */
const oneNote = (clef, n) => ({key: 'C', mode: 'major', clef, bpm: 70, events: [{notes: [n], d: 'w'}]});
const lineLabels = (clef, notes, labels, d) => ({key: 'C', mode: 'major', clef, bpm: 90, events: notes.map((n, i) => ({notes: [n], d: d || 'q', sym: labels[i]}))});
CH.push({id: 'notation', title: 'Notation: staff, clefs, registers, accidentals', blurb: 'Reading the page: lines and spaces, middle C, octave numbers, sharps, flats, enharmonics',
  body: `<p>Music is written on a <b>staff</b> of five lines and four spaces, read from the bottom up: higher on the staff means higher in pitch. A <b>clef</b> at the start fixes which note each line stands for. The <b>treble clef</b> (the G clef) curls round the second line, which is G above middle C; the <b>bass clef</b> (the F clef) has its two dots around the fourth line, which is F below middle C. Notes beyond the staff sit on short <b>ledger lines</b>.</p>
{{fig:tlines|Treble clef. Lines from the bottom: E G B D F (“Every Good Boy Does Fine”); spaces: F A C E (“FACE”).}}
{{fig:blines|Bass clef. Lines: G B D F A (“Good Boys Do Fine Always”); spaces: A C E G (“All Cows Eat Grass”).}}
<p>Piano music uses both clefs joined by a bracket: the <b>grand staff</b>. The note exactly between them is <b>middle C</b> (C4). It sits on the first ledger line below the treble staff and on the first ledger line above the bass staff, the same key on the keyboard either way.</p>
{{fig:middlec|Middle C written in both clefs: the same note.}}
<p>Other clefs exist (the alto and tenor clefs are C clefs that mark where middle C is, used for viola and trombone), but piano players need only the first two.</p>
<h3>Octave registers</h3>
<p>The seven note names A B C D E F G repeat up and down the keyboard. Notes eight steps apart share a name and are an <b>octave</b> apart. To name a note exactly we add a <b>register number</b> that changes at each C: B3 is followed by C4. Middle C is C4; the lowest note of an 88-key piano is A0 and the highest is C8.</p>
{{fig:regs|The Cs of the piano: C2, C3, C4 (middle C), C5 and C6.}}
<h3>Accidentals</h3>
<p>Between most white keys there is a black key. An <b>accidental</b> raises or lowers a note: the <b>sharp</b> (♯) raises it a half step, the <b>flat</b> (♭) lowers it a half step, the <b>double sharp</b> raises it a whole step, the <b>double flat</b> lowers it a whole step, and the <b>natural</b> (♮) cancels any earlier accidental in the bar or in the key signature. An accidental lasts until the end of the bar.</p>
{{fig:acc|F, F♯, F♭, F double sharp and F double flat.}}
<h3>Enharmonic notes</h3>
<p>The same key can have two names: C♯ and D♭ are <b>enharmonic</b>. The same is true of every black key, and of some white keys too (E and F♭, B and C♭, C and B♯). Which spelling is right depends on the key and the chord, so spelling matters even when the sound is identical.</p>
{{fig:enh|Enharmonic pairs: C♯ = D♭, D♯ = E♭, E = F♭, B = C♭.}}`,
  figs: {
    tlines: lineLabels('treble', ['E4', 'G4', 'B4', 'D5', 'F5', 'F4', 'A4', 'C5'], ['E', 'G', 'B', 'D', 'F', 'F', 'A', 'C'], 'q'),
    blines: lineLabels('bass', ['G2', 'B2', 'D3', 'F3', 'A3', 'A2', 'C3', 'E3'], ['G', 'B', 'D', 'F', 'A', 'A', 'C', 'E'], 'q'),
    middlec: {key: 'C', mode: 'major', clef: 'grand', bpm: 70, voices: [{staff: 1, voice: 1, events: [{notes: ['C4'], d: 'w', sym: 'C4 (treble)'}]}, {staff: 2, voice: 2, events: [{notes: ['C4'], d: 'w', rn: 'C4 (bass)'}]}]},
    regs: {key: 'C', mode: 'major', clef: 'grand', bpm: 70, events: ['C2', 'C3', 'C4', 'C5', 'C6'].map(n => ({notes: [n], d: 'h', sym: n}))},
    acc: {key: 'C', mode: 'major', clef: 'treble', bpm: 70, events: [['F4', 'natural'], ['F#4', 'sharp'], ['Fb4', 'flat'], ['F##4', 'double sharp'], ['Fbb4', 'double flat']].map(([n, l]) => ({notes: [n], d: 'q', sym: l})).concat([{rest: true, notes: [], d: 'q'}, {rest: true, notes: [], d: 'q'}, {rest: true, notes: [], d: 'q'}])},
    enh: {key: 'C', mode: 'major', clef: 'treble', bpm: 70, events: ['C#4', 'Db4', 'D#4', 'Eb4', 'E4', 'Fb4', 'B3', 'Cb4'].map(n => ({notes: [n], d: 'q'}))},
  },
  quiz: [
    () => { const clef = pick(['treble', 'bass']), pool = clef === 'treble' ? ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5'] : ['E2', 'F2', 'G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'], n = pick(pool); return ask('Name this note and its register.', n, pool, `This is ${n}.`, {fig: oneNote(clef, n)}); },
    () => { const [a, b] = pick([['F♯', 'G♭'], ['C♯', 'D♭'], ['D♯', 'E♭'], ['G♯', 'A♭'], ['A♯', 'B♭'], ['E', 'F♭'], ['B', 'C♭'], ['C', 'B♯'], ['F', 'E♯']]); return ask(`Which note is enharmonic with ${a}?`, b, ['G♭', 'A♭', 'E♭', 'F♭', 'B♭', 'D♭', 'C♭', 'B♯', 'E♯'].filter(x => x !== a), 'The same key on the piano, spelled differently.'); },
    bank([['What does a double sharp do?', 'Raises the note by two half steps', ['Raises it by one half step', 'Lowers it by a whole step', 'Cancels a sharp'], 'It raises the pitch by a whole step.'],
      ['What does a natural sign do?', 'Cancels an earlier sharp or flat', ['Raises the note', 'Lowers the note', 'Makes the note longer'], 'It restores the plain note name.'],
      ['Which note is middle C?', 'C4', ['C3', 'C5', 'C1'], 'The register number changes at each C.'],
      ['Where is middle C written in treble clef?', 'On a ledger line below the staff', ['On the bottom line', 'On the top line', 'Above the staff'], 'In bass clef it is on a ledger line above the staff.'],
      ['Which clef has its dots around the fourth line (F)?', 'The bass clef', ['The treble clef', 'The alto clef', 'The tenor clef'], 'It is the F clef.'],
      ['A B C D E F G repeat. What do we call two notes eight steps apart?', 'An octave', ['A fifth', 'A unison', 'A second'], 'They share the same note name.'],
      ['How long does an accidental last?', 'Until the end of the bar', ['For the whole piece', 'For one note only', 'Until the next rest'], 'A new bar cancels it.']]),
  ],
  play: [
    () => ({title: 'Middle C and its neighbours', help: 'Play exactly these keys, one at a time: C4 is middle C.', steps: [60, 62, 64, 65, 67].map(m => ({label: noteLabel(m), pcs: [m % 12], names: [noteLabel(m)], midi: m}))}),
    () => ({title: 'The Cs of the keyboard', help: 'Play C3, C4, then C5: the same note in three registers.', steps: [48, 60, 72].map(m => ({label: noteLabel(m), pcs: [m % 12], names: [noteLabel(m)], midi: m}))}),
    () => { const [a, b, ma] = pick([['F♯4', 'G♭4', 66], ['C♯4', 'D♭4', 61], ['A♯4', 'B♭4', 70]]); return {title: `Enharmonic notes: ${a} and ${b}`, help: 'They are the same key. Play it twice, once for each name.', steps: [a, b].map(l => ({label: l, pcs: [ma % 12], names: [l], midi: ma}))}; },
  ]});

CH.push({id: 'rhythm', title: 'Rhythm and meter', blurb: 'Time signatures, note values, dots and ties, simple and compound meter, tuplets, syncopation',
  body: `<p><b>Rhythm</b> organises music in time. Underneath it is the <b>beat</b> (or pulse), the steady unit you tap your foot to; its speed is the <b>tempo</b>, measured in beats per minute (60 bpm is one beat a second) or named with Italian words such as Adagio (slow), Andante (walking pace) and Allegro (fast). The beats are grouped into bars (measures) by the <b>meter</b>.</p>
<h3>Note values</h3>
<p>Each note value lasts half as long as the one before it: whole note, half note, quarter note, eighth note, sixteenth note… Every value has a matching <b>rest</b> for silence. In 4/4 time a whole note fills a bar, a half note half a bar and a quarter note one beat.</p>
<p>A <b>dot</b> after a note adds half its value: a dotted half note lasts three beats, a dotted quarter one and a half. A <b>tie</b> joins two notes of the <b>same pitch</b> into one longer sound. A <b>slur</b> looks similar but joins notes of <b>different</b> pitches and only means “play smoothly”.</p>
<h3>Time signatures and meter</h3>
<p>The <b>time signature</b> has two numbers. The top says how many; the bottom says of what: 3/4 means three quarter notes in each bar. Meter is described by two words:</p>
<table class="htab"><tr><th>How the beat divides</th><td><b>Simple</b>: in two parts (top number 2, 3 or 4: 2/4, 3/4, 4/4, 3/8…)<br><b>Compound</b>: in three parts (top number 6, 9 or 12: 6/8, 9/8, 12/8…); the beat is a <b>dotted note</b></td></tr>
<tr><th>How many beats</th><td><b>Duple</b> (two), <b>triple</b> (three), <b>quadruple</b> (four). In compound meters divide the top number by three: 6/8 has two beats, 9/8 three, 12/8 four.</td></tr></table>
<p>Say the division first: 3/4 is “simple triple”, 4/4 “simple quadruple”, 6/8 “compound duple”, 12/8 “compound quadruple”.</p>
{{fig:m34|3/4: three beats in a bar, each divided in two (simple triple).}}
{{fig:m44|4/4: four beats; beats 1 and 3 are strong (simple quadruple).}}
{{fig:m68|6/8: two beats, each a dotted quarter divided in three (compound duple).}}
{{fig:m128|12/8: four dotted-quarter beats (compound quadruple).}}
<h3>Tuplets</h3>
<p>A <b>tuplet</b> squeezes a group the beat does not naturally hold. The <b>triplet</b> puts three notes in the time of two: three eighth notes in a quarter-note beat. In simple meter a triplet sounds like compound meter, so music that is triplet all the way is usually written in 6/8, 9/8 or 12/8 instead. The same idea gives quintuplets (5 in the time of 4), sextuplets and, in compound meter, <b>duplets</b> (two in the time of three).</p>
<h3>Syncopation and beaming</h3>
<p><b>Syncopation</b> stresses weak beats or weak parts of a beat, and often ties a note over a strong beat. Because it needs to show the beat, notes are <b>beamed</b> in groups that make each beat visible: write the rhythm so that the downbeats can be seen. (The exception is a few common syncopated patterns that are easier to read with a tie than written out.)</p>
{{fig:sync|Syncopation: the long notes begin on weak parts of the beat.}}
{{fig:ties|A tie (same pitch) makes one long note: here a half note tied to a quarter lasts three beats, like a dotted half.}}`,
  figs: {
    m34: rline([3, 4], ['q', 'q', 'q', 'h', 'q'], ['1', '2', '3', '1', '3']),
    m44: rline([4, 4], ['q', 'q', 'q', 'q', 'h', 'q', 'q'], ['1', '2', '3', '4', '1', '3', '4']),
    m68: rline([6, 8], ['q.', 'q.', 'e', 'e', 'e', 'e', 'e', 'e'], ['1', '2', '1', '', '', '2', '', '']),
    m128: rline([12, 8], ['q.', 'q.', 'q.', 'q.'], ['1', '2', '3', '4']),
    sync: rline([4, 4], ['e', 'q', 'e', 'q', 'q', 'e', 'q', 'e', 'h'], ['', 'syncopated', '', 'syncopated', '', '', '', '', '']),
    ties: {key: 'C', mode: 'major', clef: 'treble', bpm: 90, events: [{notes: ['C5~'], d: 'h'}, {notes: ['C5'], d: 'q'}, {notes: ['C5'], d: 'q'}, {notes: ['C5'], d: 'h.', sym: 'dotted half'}, {notes: ['C5'], d: 'q'}]},
  },
  quiz: [
    () => { const [ts, name, why] = pick([['2/4', 'simple duple', 'Two beats, each divided in two.'], ['3/4', 'simple triple', 'Three beats, each divided in two.'], ['4/4', 'simple quadruple', 'Four beats, each divided in two.'], ['2/2', 'simple duple', 'Two half-note beats, each divided in two.'], ['3/8', 'simple triple', 'Three eighth-note beats.'], ['6/8', 'compound duple', 'Two beats, each divided in three.'], ['9/8', 'compound triple', 'Three beats, each divided in three.'], ['12/8', 'compound quadruple', 'Four beats, each divided in three.'], ['6/4', 'compound duple', 'Two dotted-half beats.']]); return ask(`What is the meter of ${ts}?`, name, ['simple duple', 'simple triple', 'simple quadruple', 'compound duple', 'compound triple', 'compound quadruple'], why); },
    () => { const [ts, n] = pick([['6/8', 'a dotted quarter note'], ['9/8', 'a dotted quarter note'], ['12/8', 'a dotted quarter note'], ['3/4', 'a quarter note'], ['4/4', 'a quarter note'], ['2/2', 'a half note'], ['6/4', 'a dotted half note'], ['3/8', 'an eighth note']]); return ask(`In ${ts}, what note value is the beat?`, n, ['a dotted quarter note', 'a quarter note', 'a half note', 'a dotted half note', 'an eighth note'], 'In compound meters the beat is a dotted note.'); },
    () => { const [q, a, why] = pick([['How many beats does a dotted half note last in 4/4?', '3', 'A half note (2) plus half of it (1).'], ['How many beats does a dotted quarter note last in 4/4?', '1½', 'A quarter note plus an eighth.'], ['A half note is tied to a quarter note in 4/4. How many beats is the sound?', '3', '2 + 1.'], ['How many eighth notes fit in one 4/4 bar?', '8', 'Two per beat, four beats.'], ['How many sixteenth notes make one quarter note?', '4', 'Each division halves the value.'], ['How many quarter-note beats are in a bar of 3/4?', '3', 'The top number says how many.']]); return ask(q, a, ['1', '1½', '2', '3', '4', '6', '8'], why); },
    bank([['What does a triplet do?', 'Fits three notes in the time of two', ['Fits two notes in the time of three', 'Makes a note three times longer', 'Adds three beats to a bar'], 'For example three eighths in one quarter-note beat.'],
      ['What is the difference between a tie and a slur?', 'A tie joins notes of the same pitch; a slur joins different pitches', ['A tie is louder', 'A slur joins notes of the same pitch', 'There is no difference'], 'A tie makes one longer note.'],
      ['In 6/8, how many beats are in a bar?', 'Two', ['Six', 'Three', 'Four'], 'The beat is a dotted quarter note.'],
      ['What is syncopation?', 'Emphasis on weak beats or weak parts of the beat', ['A very fast tempo', 'A gradual getting louder', 'A change of key'], 'It often ties a note across a strong beat.'],
      ['What does “Allegro” mean?', 'Fast', ['Slow', 'Walking pace', 'Very loud'], 'Adagio is slow; Andante is a walking pace.'],
      ['What does tempo describe?', 'The speed of the beat', ['How loud the music is', 'The number of bars', 'The key'], 'It can be given in beats per minute.'],
      ['When music is all in triplets, which time signature is usually used?', 'A compound one, such as 6/8 or 12/8', ['2/4', '4/4', '3/4'], 'The beat then naturally divides in three.']]),
  ]});

/* ================= Popular music: harmony and form ================= */
const flat = x => x.replace(/b/g, '♭');
const chordSyms = (list, key, mode) => list.map(s => symOf(rn(s, key, mode))).join(' – ');
const POP_MAJOR = [['I', 'V', 'vi', 'IV'], ['vi', 'IV', 'I', 'V'], ['IV', 'I', 'V', 'vi'], ['I', 'bVII', 'IV', 'I'], ['I', 'IV', 'V', 'IV']];
const POP_MINOR = [['i', 'VII', 'VI', 'VII'], ['i', 'VII', 'VI', 'V'], ['VI', 'VII', 'i', 'VII'], ['i', 'VI', 'III', 'VII']];
CH.push({id: 'popharmony', title: 'Harmony in popular music', blurb: 'Function flowchart, ♭VII, the I–V–vi–IV progression, i–VII–VI–VII and the Andalusian cadence',
  body: `<p>Rock, pop and folk music use the same chords as classical music, but they favour a few patterns and add some of their own. This chapter shows how the function ideas of {{ch:triadsinkey}} and {{ch:progressions}} work in popular styles.</p>
<h3>The function flowchart</h3>
<p>Chords are grouped by <b>function</b>, and the usual order of the groups is <b>tonic → pre-dominant → dominant → tonic</b>:</p>
<table class="htab"><tr><th>Tonic (T)</th><td>I (home). <b>vi</b>, <b>iii</b> and I⁶ can <i>prolong</i> the tonic: they keep the tonic feeling going.</td></tr>
<tr><th>Pre-dominant (PD)</th><td><b>ii</b> and <b>IV</b>: they lead away from the tonic towards the dominant. They may be preceded by a tonic or each other (ii after IV is rare).</td></tr>
<tr><th>Dominant (D)</th><td><b>V</b> and <b>vii°</b>: tension that wants to return to the tonic. They are never followed by a pre-dominant in classical style.</td></tr></table>
<p>Popular music keeps this plan but treats it more loosely. IV may go straight back to I (the plagal move) and V may be followed by IV or vi.</p>
<h3>The subtonic chord, ♭VII</h3>
<p>The chord built on the <b>lowered 7th degree</b> (the <b>subtonic</b>), written <b>♭VII</b>, is everywhere in rock. In C major it is B♭ major. Borrowed from the parallel minor (or the Mixolydian mode), it can stand in for any function except tonic, and it often leads to IV and then I: <b>♭VII – IV – I</b>.</p>
{{fig:b7|I – ♭VII – IV – I in C: C, B♭, F, C.}}
<h3>The “best-seller” progression</h3>
<p>Perhaps the most used progression in recent popular music is <b>I – V – vi – IV</b> (C – G – Am – F in C major). It can be <b>rotated</b>, starting from a different chord: <b>vi – IV – I – V</b> and <b>IV – I – V – vi</b> contain exactly the same four chords in the same cycle. If you take the first chord of vi – IV – I – V as the tonic, the same progression in minor is <b>i – VI – III – VII</b>.</p>
{{fig:bestseller|I – V – vi – IV in C major.}}
{{fig:rotated|The same cycle started on vi: vi – IV – I – V.}}
<h3>i – VII – VI – VII and the Andalusian cadence</h3>
<p>In minor keys, <b>i – VII – VI – VII</b> (Am – G – F – G) is another favourite. It is close to the descending bass of the <b>Andalusian cadence</b> of flamenco, <b>i – VII – VI – V</b> (Am – G – F – E), which ends on a major V. Like the progression above it can be rotated: VI – VII – i – VII.</p>
{{fig:andal|The Andalusian cadence in A minor: Am – G – F – E. The bass descends 1 – ♭7 – ♭6 – 5.}}
<p>When a progression looks strange in the classical rules, look for a <b>sequence</b>: the same step of the circle of fifths repeating, with a fifth up and a step down, or the reverse. It often explains chords that would otherwise break the flowchart.</p>`,
  figs: {
    b7: prog('C', 'major', ['I', 'bVII', 'IV', 'I'], {d: 'h', bpm: 70}),
    bestseller: prog('C', 'major', ['I', 'V', 'vi', 'IV'], {d: 'h', bpm: 70}),
    rotated: prog('C', 'major', ['vi', 'IV', 'I', 'V'], {d: 'h', bpm: 70}),
    andal: prog('A', 'minor', ['i', 'VII', 'VI', 'V'], {d: 'h', bpm: 70}),
  },
  quiz: [
    () => { const mj = Math.random() < 0.65, pats = mj ? POP_MAJOR : POP_MINOR, key = pick(mj ? ['C', 'G', 'D', 'F', 'A', 'Bb'] : ['A', 'E', 'D', 'G']), p = pick(pats); return ask(`In ${pn(key)} ${mj ? 'major' : 'minor'}, which Roman numerals match ${chordSyms(p, key, mj ? 'major' : 'minor')}?`, p.map(fmt).join(' – '), pats.map(x => x.map(fmt).join(' – ')), 'Find the scale degree of each root; ♭VII is a major chord a whole step below the tonic.'); },
    () => { const key = pick(['C', 'G', 'F', 'D']); const c = rn('bVII', key, 'major'); return ask(`In ${pn(key)} major, what chord is ♭VII?`, symOf(c), [symOf(rn('VII', key, 'major')), symOf(rn('vii°', key, 'major')), symOf(rn('IV', key, 'major')), symOf(rn('V', key, 'major'))].filter(x => x !== symOf(c)), 'Lower the 7th degree by a half step and build a major triad on it.'); },
    bank([['Which progression is called the “best-seller” progression?', 'I – V – vi – IV', ['I – IV – V – I', 'ii – V – I', 'i – iv – V – i'], 'It is used in a huge number of popular songs.'],
      ['Which of these is a rotation of I – V – vi – IV?', 'vi – IV – I – V', ['I – IV – V – I', 'ii – V – I – vi', 'V – IV – I – ii'], 'The same four chords in the same cycle, starting from another point.'],
      ['The Andalusian cadence in A minor is…', 'Am – G – F – E', ['Am – Dm – E – Am', 'C – G – Am – F', 'Am – F – C – G'], 'The bass falls 1 – ♭7 – ♭6 – 5.'],
      ['In classical-style function, which chords are pre-dominant?', 'ii and IV', ['V and vii°', 'I and vi', 'iii and I⁶'], 'They lead towards the dominant.'],
      ['Which chord can prolong the tonic function?', 'vi', ['V', 'ii', 'IV'], 'It shares two notes with I.'],
      ['What does ♭VII lead to in rock songs?', 'Often IV and then I', ['Only V', 'Only ii', 'Never I'], '♭VII – IV – I is a common ending.'],
      ['i – VI – III – VII in minor is the same cycle as which progression in the relative major?', 'vi – IV – I – V', ['I – V – vi – IV', 'ii – V – I', 'I – IV – V – I'], 'Hear the first chord as vi instead of i.']]),
  ],
  play: [
    progEx('Play I – V – vi – IV in {key}', ['I', 'V', 'vi', 'IV'], () => pick(['C', 'G', 'D', 'F']), 'major'),
    progEx('Play I – ♭VII – IV – I in {key}', ['I', 'bVII', 'IV', 'I'], () => pick(['C', 'G', 'D', 'F']), 'major'),
    progEx('Play i – VII – VI – V (Andalusian) in {key}', ['i', 'VII', 'VI', 'V'], () => pick(['A', 'E', 'D']), 'minor'),
  ]});

const BLUES = ['I7', 'I7', 'I7', 'I7', 'IV7', 'IV7', 'I7', 'I7', 'V7', 'IV7', 'I7', 'I7'];
CH.push({id: 'popforms', title: 'Form in popular music', blurb: 'Verse–chorus, AABA, ABAC, the 12-bar blues, harmonically open and closed sections',
  body: `<p>Popular songs are usually built from sections of <b>4, 8, 12 or 16 bars</b>. Naming the sections and counting their bars is the first step of analyzing one. (Names can vary: one person’s “pre-chorus” is another’s “verse, part b”.)</p>
<h3>Verse–chorus form</h3>
<p>The most common form today. The <b>chorus</b> holds the hook, the memorable refrain; the <b>verse</b> carries the story and has less memorable music, and it returns with new words. Many songs add an <b>introduction</b>, a <b>pre-chorus</b> that builds up to the chorus, a <b>post-chorus</b>, a <b>bridge</b> of contrasting material, and an instrumental <b>solo</b> or <b>interlude</b>. In a <b>simple</b> verse–chorus form, verse and chorus use the same chords; in a <b>contrasting</b> one the chord progressions differ.</p>
<div class="fbar"><span class="i" style="--w:1">Intro</span><span class="a" style="--w:2">Verse 1</span><span class="a" style="--w:2">Verse 2</span><span class="c" style="--w:2">Chorus</span><span class="a" style="--w:2">Verse 3</span><span class="c" style="--w:2">Chorus</span><span class="b" style="--w:2">Bridge</span><span class="c" style="--w:2">Chorus</span></div>
<h3>AABA form</h3>
<p>Typical of Broadway and Tin Pan Alley songs from the 1930s to the 1950s and still alive in the 1960s and later: <b>A – A – B – A</b>, each section usually 8 bars, 32 bars in all. The A sections carry the main tune; the <b>B section</b> (the “bridge” or “middle eight”) contrasts. The whole 32 bars is called the <b>refrain</b> or <b>chorus</b> (and a song may have a <b>verse</b> before it).</p>
<div class="fbar"><span class="a" style="--w:1">A</span><span class="a" style="--w:1">A</span><span class="b" style="--w:1">B (bridge)</span><span class="a" style="--w:1">A</span></div>
<h3>ABAC form</h3>
<p>Another 32-bar plan of the same era: <b>A – B – A – C</b>. The first two sections often begin similarly, and the last (C) gives a new ending. A variant is <b>A – B – A – B′</b>, where B′ starts like B and ends differently.</p>
<div class="fbar"><span class="a" style="--w:1">A</span><span class="b" style="--w:1">B</span><span class="a" style="--w:1">A</span><span class="c" style="--w:1">C</span></div>
<h3>The 12-bar blues</h3>
<p>The <b>12-bar blues</b> is a fixed chord pattern in three four-bar lines. In its basic form all chords are dominant sevenths: <b>I⁷</b> for four bars, <b>IV⁷</b> for two, <b>I⁷</b> for two, then <b>V⁷, IV⁷, I⁷, I⁷</b>. (A V⁷ in the last bar, the <b>turnaround</b>, leads back to the beginning.) It lies behind the blues, early rock ’n’ roll and a lot of jazz.</p>
{{fig:blues|The 12-bar blues in C, one chord to a bar: C⁷ ×4, F⁷ ×2, C⁷ ×2, G⁷, F⁷, C⁷, C⁷.}}
<h3>Harmonically closed and open sections</h3>
<p>A section is <b>harmonically closed</b> if it ends on the tonic (I). It is <b>harmonically open</b> if it ends on another chord, usually V (sometimes IV). In AABA form the A sections are usually closed and the B section is open, ending on V, so the return of A feels like coming home. In verse–chorus form the sections that lead into the chorus (verse, pre-chorus, bridge) are usually open, while the chorus is often closed.</p>`,
  figs: {blues: {key: 'C', mode: 'major', clef: 'treble', bpm: 80, events: BLUES.map(s => { const c = rn(s, 'C', 'major'); return {notes: c.notes, d: 'w', sym: symOf(c), rn: fmt(s)}; })}},
  quiz: [
    () => { const [plan, name] = pick([['A A B A', 'AABA form'], ['A B A C', 'ABAC form'], ['Intro, verse, chorus, verse, chorus, bridge, chorus', 'Verse–chorus form'], ['I⁷ ×4, IV⁷ ×2, I⁷ ×2, V⁷, IV⁷, I⁷ ×2', '12-bar blues']]); return ask(`Which form is this: ${plan}?`, name, ['AABA form', 'ABAC form', 'Verse–chorus form', '12-bar blues'], `${plan} describes ${name}.`); },
    () => { const key = pick(['C', 'G', 'F', 'D', 'A', 'Bb']), bar = pick([1, 5, 7, 9, 10, 12]), s = BLUES[bar - 1]; return ask(`In a 12-bar blues in ${pn(key)}, what is the chord in bar ${bar}?`, symOf(rn(s, key, 'major')), ['I7', 'IV7', 'V7'].map(x => symOf(rn(x, key, 'major'))), `Bar ${bar} is ${fmt(s)}.`); },
    bank([['How many bars are in the basic blues form?', '12', ['8', '16', '32'], 'Three lines of four bars.'],
      ['How many bars does a classic AABA song have?', '32', ['12', '16', '64'], 'Four sections of eight bars.'],
      ['In AABA form, what is the B section often called?', 'The bridge (or middle eight)', ['The refrain', 'The coda', 'The verse'], 'It contrasts with the A sections.'],
      ['What is a harmonically open section?', 'One that ends on a chord other than the tonic, usually V', ['One that ends on I', 'One with no chords', 'One in a new key'], 'It makes the listener expect more.'],
      ['Which section of a verse–chorus song holds the “hook”?', 'The chorus', ['The verse', 'The introduction', 'The bridge'], 'It is the most memorable refrain.'],
      ['In a simple verse–chorus form…', 'The verse and chorus use the same chord progression', ['The chorus has no chords', 'The verse is in another key', 'There is no bridge'], 'In a contrasting form they differ.'],
      ['What is the last chord of the blues turnaround usually?', 'V⁷', ['ii', 'vi', 'IV'], 'It leads back to the start.']]),
  ],
  play: [
    progEx('Play the first eight bars of a blues in {key}: I⁷ – IV⁷ – I⁷ – V⁷', ['I7', 'IV7', 'I7', 'V7'], () => pick(['C', 'G', 'F']), 'major'),
    progEx('Play the 12-bar blues changes in {key}: I⁷ – IV⁷ – I⁷ – V⁷ – IV⁷ – I⁷', ['I7', 'IV7', 'I7', 'V7', 'IV7', 'I7'], () => pick(['C', 'G', 'F', 'Bb']), 'major'),
    progEx('Play an AABA song’s bridge ending: ii – V – I in {key}', ['ii', 'V', 'I'], () => pick(['C', 'G', 'F']), 'major'),
  ]});

/* ================= Melody, phrases and texture ================= */
const SC = scale('C4', 'major', 16);
const mfig = bars => ({key: 'C', mode: 'major', clef: 'treble', bpm: 90, fs: 10, events: bars.flatMap(b => b.degs.map((d, i) => ({notes: [nm(SC[d], true)], d: b.durs[i], sym: i === 0 ? b.label : undefined})))});
const MOTIVE_BARS = [
  {label: 'motive', degs: [2, 4, 3, 2], durs: ['q', 'q', 'q', 'q']},
  {label: 'sequence', degs: [3, 5, 4, 3], durs: ['q', 'q', 'q', 'q']},
  {label: 'inversion', degs: [2, 0, 1, 2], durs: ['q', 'q', 'q', 'q']},
  {label: 'retrograde', degs: [2, 3, 4, 2], durs: ['q', 'q', 'q', 'q']},
  {label: 'interval change', degs: [2, 5, 3, 2], durs: ['q', 'q', 'q', 'q']},
  {label: 'rhythm change', degs: [2, 4, 3, 2], durs: ['q.', 'e', 'q', 'q']},
  {label: 'ornamented', degs: [2, 3, 4, 3, 2], durs: ['q', 'e', 'e', 'q', 'q']},
  {label: 'extended', degs: [2, 4, 3, 2, 1, 0], durs: ['q', 'q', 'q', 'q', 'h', 'h']},
];
const AUG_BARS = [{label: 'motive', degs: [2, 4, 3, 2], durs: ['q', 'q', 'q', 'q']}, {label: 'augmentation (all values doubled)', degs: [2, 4, 3, 2], durs: ['h', 'h', 'h', 'h']}];
const ODE4 = ODE.slice(0, 15).map(x => [...x]); ODE4[0][2] = 'subphrase a'; ODE4[8][2] = 'subphrase b'; ODE4[14][2] = 'half cadence';
CH.push({id: 'melody', title: 'Melodic analysis: motives and phrases', blurb: 'Motive, fragment, sequence, inversion, augmentation and the other ways melodies grow',
  body: `<p>A melody is built from small units. A <b>motive</b> (or motif) is the smallest recognisable melodic idea, usually a few notes with a characteristic rhythm; the opening four notes of Beethoven’s Fifth Symphony are the most famous. A compound motive can be split into <b>fragments</b> (some writers call them <i>germs</i>), each of which can be developed on its own.</p>
<h3>How motives are changed</h3>
<p>Composers rarely repeat a motive exactly. Here are the usual ways of altering it; the staff shows each on one simple motive in C major.</p>
{{fig:mot|The same four-note motive changed in seven ways, bar by bar.}}
<table class="htab"><tr><th>Sequence</th><td>the whole motive moved to another pitch level (so common that it is not counted as an alteration)</td></tr>
<tr><th>Inversion</th><td>every interval turned upside down, like a mirror image. <i>Real</i> inversion keeps exact intervals; <i>tonal</i> inversion follows the scale of the key, as here.</td></tr>
<tr><th>Retrograde</th><td>the notes in reverse order (rare in tonal music)</td></tr>
<tr><th>Intervallic change</th><td>the rhythm stays; some intervals differ</td></tr>
<tr><th>Rhythmic change</th><td>some, but not all, rhythmic values differ</td></tr>
<tr><th>Ornamentation</th><td>passing tones, neighbour tones and other non-chord tones are added</td></tr>
<tr><th>Extension</th><td>extra notes are added at the end</td></tr>
<tr><th>Augmentation / diminution</th><td>all rhythmic values doubled / halved</td></tr></table>
{{fig:aug|Augmentation: every value doubled.}}
<p>J. S. Bach’s Invention No. 1 in C major is a master class in these techniques. Its opening seven-note motive splits into two overlapping fragments, and Bach develops each by sequence, inversion and augmentation.</p>
<h3>The phrase</h3>
<p>A <b>phrase</b> is the smallest musical unit that gives a sense of completion. In classical music a phrase always ends with a <b>cadence</b>; in popular music it may end when a lyric line or a four-bar length is complete. Most phrases are <b>four bars</b> long, though five-, six-, seven- and eight-bar phrases (and, rarely, three-bar ones) occur. A phrase often falls into two <b>subphrases</b> of two bars.</p>
{{fig:phrase|The first phrase of Ode to Joy: two subphrases of two bars (a and b), ending on a half cadence.}}`,
  figs: {mot: mfig(MOTIVE_BARS), aug: mfig(AUG_BARS), phrase: twoLines('major', 'C', ODE4, ODE_BASS.slice(0, 5), 100)},
  quiz: [
    () => { const [name, desc] = pick([['sequence', 'The motive repeated at another pitch level'], ['inversion', 'Every interval turned upside down'], ['retrograde', 'The notes played in reverse order'], ['augmentation', 'All rhythmic values doubled'], ['diminution', 'All rhythmic values halved'], ['ornamentation', 'Passing tones and neighbour tones added'], ['extension', 'Extra notes added at the end'], ['rhythmic change', 'Some, but not all, rhythmic values changed'], ['intervallic change', 'The rhythm stays but some intervals change']]); return ask(`In melodic analysis, what is ${name}?`, desc, ['The motive repeated at another pitch level', 'Every interval turned upside down', 'The notes played in reverse order', 'All rhythmic values doubled', 'All rhythmic values halved', 'Passing tones and neighbour tones added', 'Extra notes added at the end', 'Some, but not all, rhythmic values changed', 'The rhythm stays but some intervals change'], `${cap(name)}: ${desc.toLowerCase()}.`); },
    () => { const bars = [['inversion', 2], ['retrograde', 3], ['interval change', 4], ['rhythm change', 5]], [label, i] = pick(bars); return ask('The first bar is the motive. How is the second bar related to it?', {inversion: 'Inversion', retrograde: 'Retrograde', 'interval change': 'Intervallic change', 'rhythm change': 'Rhythmic change'}[label], ['Inversion', 'Retrograde', 'Intervallic change', 'Rhythmic change', 'Sequence'], {inversion: 'The intervals are mirrored: up becomes down.', retrograde: 'The notes are in reverse order.', 'interval change': 'The rhythm is the same but one or two intervals differ.', 'rhythm change': 'The pitches are the same but the rhythm is changed.'}[label], {fig: mfig([MOTIVE_BARS[0], MOTIVE_BARS[i]].map((b, k) => ({...b, label: k ? '?' : 'motive'})))}); },
    bank([['What is a motive?', 'The smallest recognisable melodic idea', ['A complete musical sentence', 'A cadence', 'A kind of chord'], 'A phrase, by contrast, completes a unit.'],
      ['How long is the most common phrase?', 'Four bars', ['Two bars', 'Three bars', 'Sixteen bars'], 'But five-, six- and eight-bar phrases also occur.'],
      ['In classical music, what always ends a phrase?', 'A cadence', ['A rest', 'A double bar line', 'A change of key'], 'Without a cadence it is not a phrase.'],
      ['What is a subphrase?', 'A part of a phrase, often two bars', ['Two phrases together', 'A kind of cadence', 'A repeated motive'], 'A four-bar phrase often has two subphrases.'],
      ['What is a fragment (or germ)?', 'A small part of a compound motive', ['A cadence', 'A chord inversion', 'A very long phrase'], 'Each fragment can be developed alone.'],
      ['What is the difference between real and tonal inversion?', 'Real keeps exact intervals; tonal follows the scale', ['Real is faster', 'Tonal inverts rhythm', 'There is none'], 'In tonal music the inversion usually fits the key.']]),
  ]});

CH.push({id: 'phrases', title: 'Phrases in combination', blurb: 'Authentic cadences, the sentence, periods of every kind, double periods, phrase groups, elision',
  body: `<p>Phrases join to make larger units. The shape of the join depends mainly on the <b>cadences</b> and on whether the phrases <b>begin alike</b>.</p>
<h3>Two kinds of authentic cadence</h3>
<p>A <b>perfect authentic cadence</b> (PAC) has three requirements: both chords are in <b>root position</b>, the chord before is <b>V</b> (or V⁷), not vii°, and the <b>tonic note is in the top voice</b> of the final chord. If one is missing it is an <b>imperfect authentic cadence</b> (IAC). A <b>conclusive</b> cadence ends on the tonic; an <b>inconclusive</b> one does not. In order of conclusiveness: PAC, then IAC, then (usually) the plagal cadence, then the half and deceptive cadences.</p>
<h3>The sentence</h3>
<p>A phrase with a particular design: a <b>basic idea</b> (motive or subphrase <i>a</i>), its <b>repetition</b> (exact, or in sequence, or adapted to the harmony), and a <b>continuation</b>: related or new material that leads to the cadence, often with shorter units and faster harmonic rhythm.</p>
<h3>The period</h3>
<p>A <b>period</b> has at least two phrases, the last ending on a more conclusive cadence than the first. The first is the <b>antecedent</b> (the question), the last the <b>consequent</b> (the answer). A period is <b>parallel</b> if both phrases begin with similar melody, <b>contrasting</b> if they begin differently. A phrase that returns with a different cadence is marked with a prime: a, a′, a″.</p>
<div class="fbar"><span class="a" style="--w:1">a · HC</span><span class="c" style="--w:1">a′ · PAC</span></div>
<p style="margin-top:-6px"><small>Parallel period</small></p>
<div class="fbar"><span class="a" style="--w:1">a · HC</span><span class="c" style="--w:1">b · PAC</span></div>
<p style="margin-top:-6px"><small>Contrasting period</small></p>
<h3>Larger periods</h3>
<ul><li>An <b>asymmetrical period</b> has three or five phrases, so the antecedents and consequents are unequal in number.</li>
<li>A <b>double period</b> has at least four phrases in two groups: an <b>antecedent group</b> (two phrases) ending on an inconclusive cadence, and a <b>consequent group</b> that answers it with a conclusive one. It is <i>parallel</i> if both groups begin with the same melody.</li>
<li>Four phrases may also be a <b>repeated period</b> (the same period twice), which is not a double period: the cadence after the second phrase gives it away.</li></ul>
<div class="fbar"><span class="a" style="--w:1">a</span><span class="a" style="--w:1">b · HC</span><span class="c" style="--w:1">a′</span><span class="c" style="--w:1">c · PAC</span></div>
<p style="margin-top:-6px"><small>Parallel double period: antecedent group, then consequent group</small></p>
<h3>Not periods: phrase groups and chains</h3>
<p>When the final cadence is a <b>half cadence</b>, the result is not a period. A <b>phrase group</b> has at least two phrases that begin alike; a <b>phrase chain</b> has at least two phrases with contrasting melodies. Both leave the music open.</p>
<h3>Elision</h3>
<p>An <b>elision</b> joins phrases by overlap: the last bar of one phrase is also the first bar of the next, so the cadence is the start of the following music and the flow does not stop.</p>`,
  figs: {},
  quiz: [
    () => { const [d, name] = pick([['a (HC) – a′ (PAC)', 'Parallel period'], ['a (HC) – b (PAC)', 'Contrasting period'], ['a – b (HC) ‖ a′ – c (PAC)', 'Parallel double period'], ['(a – a′) played twice, each time ending HC then PAC', 'Repeated period'], ['a (IAC) – a′ (HC)', 'Phrase group'], ['a (IAC) – b (IAC) – c (HC)', 'Phrase chain']]); return ask(`Which form is this: ${d}?`, name, ['Parallel period', 'Contrasting period', 'Parallel double period', 'Repeated period', 'Phrase group', 'Phrase chain'], 'Look at the final cadence and at whether the phrases begin alike.'); },
    bank([['What are the three requirements of a perfect authentic cadence?', 'Root-position V and I, with the tonic in the top voice of I', ['V⁶ to I⁶', 'vii° to I with 3 in the top voice', 'IV to I in any position'], 'If one is missing, it is an imperfect authentic cadence.'],
      ['A V–I cadence in which the tonic chord is inverted is…', 'An imperfect authentic cadence', ['A perfect authentic cadence', 'A half cadence', 'A plagal cadence'], 'All three requirements must be met for a PAC.'],
      ['In a period, the first phrase is called the…', 'Antecedent', ['Consequent', 'Elision', 'Subphrase'], 'The “question”.'],
      ['In a parallel period…', 'The two phrases begin with similar melody', ['The two phrases are in different keys', 'Both end with a half cadence', 'There are three phrases'], 'In a contrasting period they begin differently.'],
      ['What ends a phrase group or phrase chain?', 'A half cadence', ['A perfect authentic cadence', 'A plagal cadence', 'A Picardy third'], 'That is why they are not periods.'],
      ['What is an elision?', 'The last bar of one phrase is also the first bar of the next', ['A silence between phrases', 'A repeated phrase', 'A kind of cadence'], 'It makes the phrases overlap.'],
      ['How many phrases does a double period have, at least?', 'Four', ['Two', 'Three', 'Six'], 'An antecedent group and a consequent group.'],
      ['In a sentence, what comes after the basic idea and its repetition?', 'A continuation leading to the cadence', ['A second sentence', 'A trio', 'A coda'], 'It often uses shorter units.']]),
  ],
  play: [
    progEx('Half cadence in {key}: I – V', ['I', 'V'], () => pick(['C', 'G', 'F']), 'major', 'A phrase ending on V: a half cadence.'),
    progEx('Perfect authentic cadence in {key}: V – I', ['V', 'I'], () => pick(['C', 'G', 'F']), 'major', 'Both chords in root position.'),
    progEx('Imperfect authentic cadence in {key}: V⁶ – I', ['V6', 'I'], () => pick(['C', 'G', 'F']), 'major', 'V is in first inversion (the leading tone in the bass), so the cadence is imperfect.'),
  ]});

const TEX = {
  chorale: satb('C', 'major', [['C3 G3 E4 C5', 'I'], ['F2 A3 F4 C5', 'IV'], ['G2 G3 D4 B4', 'V'], ['C3 G3 E4 C5', 'I']], {bpm: 70}),
  alberti: twoLines('major', 'C', [['E5', 'h'], ['G5', 'h'], ['D5', 'h'], ['B4', 'h']], [['C3', 'e'], ['G3', 'e'], ['E3', 'e'], ['G3', 'e'], ['C3', 'e'], ['G3', 'e'], ['E3', 'e'], ['G3', 'e'], ['G2', 'e'], ['D3', 'e'], ['B2', 'e'], ['D3', 'e'], ['G2', 'e'], ['D3', 'e'], ['B2', 'e'], ['D3', 'e']], 90),
  arpeggio: twoLines('major', 'C', [['G4', 'w'], ['F4', 'w']], [['C3', 'e'], ['E3', 'e'], ['G3', 'e'], ['C4', 'e'], ['E4', 'e'], ['C4', 'e'], ['G3', 'e'], ['E3', 'e'], ['F2', 'e'], ['A2', 'e'], ['C3', 'e'], ['F3', 'e'], ['A3', 'e'], ['F3', 'e'], ['C3', 'e'], ['A2', 'e']], 90),
  repeated: twoLines('major', 'C', [[['C4', 'E4', 'G4'], 'e'], [['C4', 'E4', 'G4'], 'e'], [['C4', 'E4', 'G4'], 'e'], [['C4', 'E4', 'G4'], 'e'], [['C4', 'E4', 'G4'], 'e'], [['C4', 'E4', 'G4'], 'e'], [['C4', 'E4', 'G4'], 'e'], [['C4', 'E4', 'G4'], 'e']], [['C3', 'h'], ['C3', 'h']], 90),
  oompah: twoLines('major', 'C', [['r', 'q'], [['C4', 'E4', 'G4'], 'q'], ['r', 'q'], [['C4', 'E4', 'G4'], 'q'], ['r', 'q'], [['B3', 'D4', 'G4'], 'q'], ['r', 'q'], [['C4', 'E4', 'G4'], 'q']], [['C3', 'q'], ['r', 'q'], ['C3', 'q'], ['r', 'q'], ['G2', 'q'], ['r', 'q'], ['C3', 'q'], ['r', 'q']], 100),
  offbeat: twoLines('major', 'C', [['r', 'e'], [['C4', 'E4', 'G4'], 'e'], ['r', 'e'], [['C4', 'E4', 'G4'], 'e'], ['r', 'e'], [['C4', 'E4', 'G4'], 'e'], ['r', 'e'], [['C4', 'E4', 'G4'], 'e']], [['C3', 'q'], ['C3', 'q'], ['C3', 'q'], ['C3', 'q']], 90),
  clave: {key: 'C', mode: 'major', clef: 'treble', bpm: 100, events: [{notes: ['C5'], d: 'q.', sym: '3'}, {notes: ['C5'], d: 'q.', sym: '3'}, {notes: ['C5'], d: 'q', sym: '2'}]},
  riff: {key: 'A', mode: 'minor', clef: 'bass', bpm: 100, events: ['A2', 'C3', 'A2', 'D3', 'A2', 'E3', 'D3', 'C3'].map(n => ({notes: [n], d: 'e'}))},
};
const TEX_NAMES = {chorale: 'Chorale texture', alberti: 'Alberti bass', arpeggio: 'Arpeggiated accompaniment', repeated: 'Repeated block chords', oompah: 'Oom-pah (bass and afterbeat chords)', offbeat: 'Offbeat chords'};
CH.push({id: 'textures', title: 'Accompaniment textures', blurb: 'Chorale, arpeggios, Alberti bass, block chords, afterbeats, offbeats, clave, riffs; contrast between sections',
  body: `<p><b>Texture</b> is how the layers of a piece fit together. It has a <b>vertical</b> side (how many notes sound at once) and a <b>horizontal</b> side (how busy the rhythm is). The simplest and most common texture is <b>melody with accompaniment</b>, and the same chords can be dressed in many different accompaniment patterns.</p>
<h3>Chorale texture</h3>
<p>One chord for every melody note, all voices moving together: <b>homorhythmic</b>, like a hymn. It is the texture of the four-part examples in this course.</p>
{{fig:chorale|Chorale texture: every voice has the same rhythm.}}
<h3>Arpeggiated accompaniments</h3>
<p>The chord is played one note at a time, up, down or both, usually in the left hand under a melody. The <b>Alberti bass</b>, much used in Classical piano music, is a special arpeggio pattern of low – high – middle – high.</p>
{{fig:arpeggio|Rising and falling arpeggios over C and F chords.}}
{{fig:alberti|Alberti bass: lowest, highest, middle, highest (C–G–E–G, then G–D–B–D).}}
<h3>Block chords</h3>
<p>The chord is struck as a unit, often repeated: <b>repeated eighth notes</b> or quarter notes are standard in rock, pop and in classical accompaniments. Rhythms such as “beat 1, then the ‘and’ after 2” are the fingerprints of many songs.</p>
{{fig:repeated|Repeated eighth-note chords over a held bass.}}
<h3>Afterbeats and offbeats</h3>
<p><b>Afterbeats</b> are chords that come <i>after</i> the main beat: the “oom-pah” of waltzes, marches and polkas puts the bass on the beat and the chord on the afterbeat. <b>Offbeats</b> are chords placed on the upbeats (the “ands”) so that the downbeats are left empty, as in polka and reggae.</p>
{{fig:oompah|Oom-pah: the bass on beats 1 and 3, the chord on the afterbeats.}}
{{fig:offbeat|Offbeat chords: the chords sit on the “ands”.}}
<h3>Clave and cross-rhythm</h3>
<p>The <b>3–2 son clave</b> of Afro-Cuban music is a pattern of five attacks over two bars (three, then two). Its first bar divides eight eighth notes as <b>3 + 3 + 2</b>, a cross-rhythm that also shapes much rock and pop (the “Bo Diddley beat”).</p>
{{fig:clave|3 + 3 + 2: a dotted quarter, a dotted quarter and a quarter, eight eighths in all.}}
<h3>Riffs and ostinato</h3>
<p>A <b>riff</b> is a short repeated pattern, often in the bass or on guitar; a repeated pattern of any kind is an <b>ostinato</b>. Sometimes a song is recognised by its riff alone.</p>
{{fig:riff|A bass riff in A minor, built on a pentatonic shape.}}
<h3>Creating contrast</h3>
<p>To make a new section sound different, change one or more of the <b>elements of music</b>: melody, harmony (key or chord pattern), rhythm, timbre (instrument or voice), texture, dynamics and articulation (loud or soft, staccato or legato) and tempo. A chorus is often louder and thicker than a verse, a bridge often moves to a new key or a new pattern.</p>`,
  figs: TEX,
  quiz: [
    () => { const k = pick(Object.keys(TEX_NAMES)); return ask('Which accompaniment texture is this?', TEX_NAMES[k], Object.values(TEX_NAMES), {chorale: 'All voices share one rhythm.', alberti: 'Low, high, middle, high: C–G–E–G.', arpeggio: 'The chord is spread out one note at a time.', repeated: 'The chord is struck again and again as a block.', oompah: 'Bass on the beat, chord on the afterbeat.', offbeat: 'Chords on the upbeats.'}[k], {fig: TEX[k]}); },
    bank([['What does “homorhythmic” mean?', 'All voices move in the same rhythm', ['Only one voice sings', 'The voices imitate each other', 'There is no rhythm'], 'A chorale texture is homorhythmic.'],
      ['What is an Alberti bass?', 'A broken-chord pattern: low, high, middle, high', ['A bass note held for a whole bar', 'A walking bass line', 'Chords on the offbeat'], 'It was much used by Classical composers.'],
      ['What is a riff?', 'A short repeated pattern', ['A very slow passage', 'A cadence', 'A key change'], 'An ostinato is a repeated pattern of any kind.'],
      ['Where do offbeat chords fall?', 'On the upbeats (“ands”)', ['On every downbeat', 'Only on beat 1', 'Only at cadences'], 'Typical of polka and reggae.'],
      ['How does the 3–2 son clave divide its first bar?', '3 + 3 + 2', ['2 + 2 + 2 + 2', '4 + 4', '3 + 2 + 3'], 'Eight eighth notes in three groups.'],
      ['What is an oom-pah pattern?', 'Bass on the beat, chord on the afterbeat', ['A very loud chord', 'An ornament', 'A tremolo'], 'Waltzes, marches and polkas use it.'],
      ['Which of these is NOT an element of music used to create contrast?', 'The composer’s name', ['Texture', 'Timbre', 'Dynamics'], 'The elements are melody, harmony, rhythm, timbre, texture, dynamics, articulation and tempo.']]),
  ],
  play: [
    () => { const r = pick(['C', 'G', 'F']), c = chordFromRoot(R(r), 'major'), seq = [0, 2, 1, 2].map(i => c[i]); return {title: `Alberti bass on ${pn(r)}: low – high – middle – high`, help: `One note at a time: ${seq.map(n => nm(n)).join(' – ')}. Any octave.`, steps: seq.map(n => ({label: nm(n), pcs: [((n.midi % 12) + 12) % 12], names: [nm(n)]}))}; },
    () => { const r = pick(['C', 'G', 'F']), a = R(r), c = chordFromRoot(a, 'major'); return {title: `Oom-pah on ${pn(r)}`, help: 'First the bass note alone, then the chord above it.', steps: [{label: 'oom', pcs: [((a.midi % 12) + 12) % 12], names: [pn(r)]}, {label: 'pah', pcs: pcsOf(c), names: c.map(n => nm(n))}]}; },
    () => { const r = pick(['C', 'G', 'F']), c = chordFromRoot(R(r), 'major'), seq = [c[0], c[1], c[2], A.shiftOct(c[0], 1)]; return {title: `Rising arpeggio on ${pn(r)}`, help: 'Play the notes of the chord one after another, going up.', steps: seq.map(n => ({label: nm(n), pcs: [((n.midi % 12) + 12) % 12], names: [nm(n)]}))}; },
  ]});

/* order and parts of the course */
const PARTS = [
  ['Foundations', ['notation', 'rhythm', 'scales', 'intervals']],
  ['Chords and progressions', ['triads', 'triadsinkey', 'inversions', 'sevenths', 'cadences', 'progressions', 'popharmony']],
  ['Melody, phrase and texture', ['nonchord', 'melody', 'phrases', 'textures']],
  ['Four-part writing', ['voiceleading', 'vldetails']],
  ['Minor keys and chromatic harmony', ['minor', 'chromatic', 'secondary', 'mixture', 'neapolitan', 'modulation']],
  ['Form and analysis', ['form', 'popforms', 'binaryternary', 'sonatarondo', 'harmonizing']],
  ['Counterpoint', ['counterpoint', 'fugue']],
  ['Beyond tonality', ['jazz', 'impressionism', 'settheory', 'serialism', 'minimalism']],
];
const ordered = [];
for (const [part, ids] of PARTS) for (const id of ids) { const c = CH.find(x => x.id === id); if (c) { c.part = part; ordered.push(c); } }
for (const c of CH) if (!ordered.includes(c)) { c.part = c.part || 'More'; ordered.push(c); }
CH.length = 0; CH.push(...ordered);

window.Harmony.register(CH);
})();
