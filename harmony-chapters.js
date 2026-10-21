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
<p>Every major key has a <b>relative minor</b> with the same key signature. It starts on the sixth degree, a minor third below the tonic: A minor goes with C major, E minor with G major.</p>
<h3>The scale as two tetrachords</h3>
<p>A <b>tetrachord</b> is a four-note segment of a scale. The major scale is two identical tetrachords, each <b>W W H</b>, joined by one whole step: <b>W W H – W – W W H</b>. In C major the lower tetrachord is C D E F, the upper G A B C. This is a useful way to build the scale from any note.</p>
<p>A major scale uses the <b>musical alphabet in order</b>, every letter once: D major is D E F♯ G A B C♯, never D E G♭ G (which skips F and uses G twice).</p>
<h3>Key signatures: the 15 major keys</h3>
<p>A <b>key signature</b> is written at the start of each line, after the clef, so that the sharps or flats the key always needs do not have to be written before every note. There are <b>15</b> major key signatures: C major with none, and seven with sharps and seven with flats.</p>
<table class="htab"><tr><th>Sharps</th><td>G (1) · D (2) · A (3) · E (4) · B (5) · F♯ (6) · C♯ (7)</td></tr>
<tr><th>Flats</th><td>F (1) · B♭ (2) · E♭ (3) · A♭ (4) · D♭ (5) · G♭ (6) · C♭ (7)</td></tr></table>
<p>The sharps always appear in the order <b>F C G D A E B</b>; the flats in the reverse order, <b>B E A D G C F</b> (think of the word BEAD, then G C F). Mnemonics help: <i>Father Charles Goes Down And Ends Battle</i> for the sharps, and backwards for the flats. Because three keys can be written two ways (B = C♭, F♯ = G♭, C♯ = D♭), they are called <b>enharmonic keys</b>: the notes sound the same but are spelled differently.</p>
<h3>The circle of fifths</h3>
<p>Arrange the keys in a circle by perfect fifths and the key signatures grow by one: going <b>clockwise</b> (up a fifth: C, G, D, A…) each key has one more sharp; going <b>counter-clockwise</b> (up a fourth: C, F, B♭, E♭…) each has one more flat. At the bottom of the circle, the keys with six to seven sharps or flats overlap.</p>
<h3>Reading a key signature</h3>
<ul><li><b>Sharps:</b> the key is a <b>half step above the last sharp</b>. Sharps F♯ C♯ G♯: the last is G♯, a half step above is A, so the key is A major.</li>
<li><b>Flats:</b> the key is the <b>second-to-last flat</b>. Flats B♭ E♭ A♭: the second-to-last is E♭, so the key is E♭ major. (One flat, B♭, is F major: memorize this one.)</li></ul>
<p>Practise both directions: given a key, write its signature in the correct order; given a signature, name the key.</p>`,
  figs: {
    cmaj: line('C', 'major', ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'], {sym: ['', 'W', 'W', 'H', 'W', 'W', 'W', 'H'], rn: ['1', '2', '3', '4', '5', '6', '7', '8'], bpm: 100}),
    gmaj: line('G', 'major', ['G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F#5', 'G5'], {sym: ['', 'W', 'W', 'H', 'W', 'W', 'W', 'H'], rn: ['1', '2', '3', '4', '5', '6', '7', '8'], bpm: 100}),
  },
  quiz: [
    () => { const k = pick(['G', 'D', 'A', 'E', 'B', 'F#']), n = A.FIFTHS.major[k], last = ['F', 'C', 'G', 'D', 'A', 'E', 'B'][n - 1];
      return ask(`A key signature has ${n} sharp${n > 1 ? 's' : ''}, and the last one is ${last}♯. Which major key is it?`, pn(k) + ' major', ['G', 'D', 'A', 'E', 'B', 'F#'].filter(x => x !== k).slice(0, 4).map(x => pn(x) + ' major'), `A half step above ${last}♯ is the key note: ${pn(k)}.`); },
    () => { const k = pick(['Bb', 'Eb', 'Ab', 'Db', 'Gb']), n = -A.FIFTHS.major[k], fl = ['B', 'E', 'A', 'D', 'G', 'C', 'F'].slice(0, n);
      return ask(`A key signature has the flats ${fl.map(x => x + '♭').join(', ')}. Which major key is it?`, pn(k) + ' major', ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'F'].filter(x => x !== k).slice(0, 4).map(x => pn(x) + ' major'), `The second-to-last flat names the key: ${pn(k)}.`); },
    bank([['What is a tetrachord?', 'A four-note scale segment', ['A four-note chord', 'A chord with four flats', 'A scale of four keys'], 'The major scale is two W W H tetrachords joined by a whole step.'],
      ['In what order do sharps appear in a key signature?', 'F C G D A E B', ['C G D A E B F', 'B E A D G C F', 'A B C D E F G'], 'The flats come in the reverse order.'],
      ['In what order do flats appear in a key signature?', 'B E A D G C F', ['F C G D A E B', 'C D E F G A B', 'F B E A D G C'], 'Remember the word BEAD, then G C F.'],
      ['How many major key signatures are there?', '15', ['7', '12', '24'], 'C with none, seven with sharps and seven with flats.'],
      ['Which major key has one flat?', 'F major', ['B♭ major', 'G major', 'E♭ major'], 'Its flat is B♭.'],
      ['Which keys are enharmonic with C♯ major?', 'D♭ major', ['C major', 'B♭ major', 'A major'], 'Same sounds, different spelling.'],
      ['Going clockwise round the circle of fifths, each key adds…', 'One sharp (or loses one flat)', ['One flat', 'A natural', 'A double sharp'], 'Up a fifth adds a sharp.']]),
    () => { const [n, d] = pick([['tonic', '1st'], ['supertonic', '2nd'], ['mediant', '3rd'], ['subdominant', '4th'], ['dominant', '5th'], ['submediant', '6th'], ['leading tone', '7th']]); return ask(`Which scale degree is called the ${n}?`, d, ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th'], `The ${n} is the ${d} degree.`); },
    () => { const k = pick(MAJKEYS), s = scale(k + '4', 'major', 8).map(n => nm(n)); return ask(`What is the dominant of ${pn(k)} major?`, s[4], s.slice(0, 7).filter((_, i) => i !== 4), `The dominant is the 5th degree: ${s.join(' ')}.`); },
    () => { const k = pick(['G', 'D', 'A', 'F', 'Bb', 'Eb']), n = A.FIFTHS.major[k], d = n > 0 ? `${n} sharp${n > 1 ? 's' : ''}` : `${-n} flat${n < -1 ? 's' : ''}`; return ask(`Which major key has ${d}?`, pn(k) + ' major', ['G', 'D', 'A', 'F', 'Bb', 'Eb', 'C'].map(x => pn(x) + ' major'), 'Each fifth up adds a sharp, each fifth down adds a flat.'); },
    bank([['Which pattern of whole (W) and half (H) steps makes a major scale?', 'W W H W W W H', ['W H W W H W W', 'W W W H W W H', 'H W W H W W W'], 'The half steps fall between 3–4 and 7–8.'],
      ['Which degree is the leading tone?', 'The 7th', ['The 4th', 'The 5th', 'The 2nd'], 'It lies a half step below the tonic and leads up to it.'],
      ['What is the relative minor of C major?', 'A minor', ['E minor', 'D minor', 'C minor'], 'It starts on the 6th degree and shares the key signature.']]),
  ],
  play: [
    noteSteps('Play the order of sharps', 'F, C, G, D, A, E, B: a new sharp is added each time you go up a fifth.', ['F', 'C', 'G', 'D', 'A', 'E', 'B']),scaleEx, scaleEx, noteSteps('Tonic, dominant, tonic in C', 'The strongest two notes of the key: C, then G, then C.', ['C', 'G', 'C'])]});

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
<p>An interval larger than an octave is a <b>compound interval</b>: a 9th is a 2nd plus an octave, a 10th a 3rd plus an octave. In harmony we usually reduce them to the simple interval (a 10th is treated as a 3rd), as the chords in this course do.</p>
<h3>Melodic and harmonic intervals</h3>
<p>Intervals measure the distance between two pitches. If the notes sound one after the other (horizontally) it is a <b>melodic</b> interval; if they sound together (vertically) it is a <b>harmonic</b> interval.</p>
<h3>Finding the number</h3>
<p>Count letter names, both ends included. A quick check on the staff: <b>odd</b> numbers (unison, 3rd, 5th, 7th) go from a line to a line or a space to a space; <b>even</b> numbers (2nd, 4th, 6th, octave) go from a line to a space or a space to a line.</p>
<h3>Which qualities go with which numbers</h3>
<p>Unisons, 4ths, 5ths and octaves are <b>perfect</b> and are never major or minor; 2nds, 3rds, 6ths and 7ths are <b>major or minor</b> and are never perfect. Any size can be <b>augmented</b> (a half step larger than perfect or major) or <b>diminished</b> (a half step smaller than perfect or minor). Perfect intervals are usually natural-to-natural, sharp-to-sharp or flat-to-flat; the exceptions are the 4ths and 5ths between B and F (B to F♯ and F to B♭).</p>
<h3>Two ways to identify an interval</h3>
<ol><li><b>With the major scale.</b> Treat the lower note as tonic. If the upper note is in the major scale of the lower note, the interval is perfect or major. If it is a half step lower than a major interval, it is minor. (E♭ is not in F major, so F–E♭ is not a major 7th; it is a minor 7th.) If the lower note has an accidental, cover it, find the interval, then restore the accidental.</li>
<li><b>By counting half steps.</b> Memorize the table below.</li></ol>
<table class="htab"><tr><th>m2</th><td>1</td><th>M2</th><td>2</td><th>m3</th><td>3</td><th>M3</th><td>4</td></tr>
<tr><th>P4</th><td>5</td><th>TT (+4 / °5)</th><td>6</td><th>P5</th><td>7</td><th>m6</th><td>8</td></tr>
<tr><th>M6</th><td>9</td><th>m7</th><td>10</td><th>M7</th><td>11</td><th>P8</th><td>12</td></tr></table>
<p>A <b>tritone</b> is the generic name for an augmented 4th or diminished 5th (six half steps); the two are enharmonic.</p>
<h3>Writing an interval</h3>
<ul><li><b>Above a note:</b> use the major scale (a minor 6th above A: A major has F♯, a major 6th, so F♮ is a minor 6th), or count half steps (8 half steps from A is F).</li>
<li><b>Below a note:</b> small intervals (up to a perfect 4th) can be built from whole and half steps. For larger ones, <b>invert</b> the interval, find the note above, and put it below the given note.</li></ul>
<p>Augmented and diminished sixths and sevenths are saved for the chapters on seventh chords and augmented sixth chords.</p>`,
  figs: {invert: {key: 'C', mode: 'major', clef: 'treble', bpm: 70, events: [{notes: ['C4', 'E4'], d: 'h', sym: 'M3'}, {notes: ['E4', 'C5'], d: 'h', sym: 'm6'}, {notes: ['C4', 'G4'], d: 'h', sym: 'P5'}, {notes: ['G4', 'C5'], d: 'h', sym: 'P4'}]}, ints: {key: 'C', mode: 'major', clef: 'treble', bpm: 70, events: ints('C', ['minor 2nd', 'major 2nd', 'minor 3rd', 'major 3rd', 'perfect 4th', 'perfect 5th', 'major 6th', 'major 7th']).map(([a, b], i) => ({notes: [a, b], d: 'h', sym: ['m2', 'M2', 'm3', 'M3', 'P4', 'P5', 'M6', 'M7'][i]}))}},
  quiz: [
    bank([['What is a harmonic interval?', 'Two notes sounding at the same time', ['Two notes one after another', 'A very consonant interval', 'An interval in the bass'], 'A melodic interval is measured horizontally.'],
      ['How many half steps are in a perfect fifth?', '7', ['6', '8', '5'], 'A perfect fourth has 5 and a tritone 6.'],
      ['How many half steps are in a major sixth?', '9', ['8', '10', '7'], 'A minor sixth has 8.'],
      ['Which intervals can be perfect?', 'Unison, 4th, 5th and octave', ['2nd, 3rd, 6th and 7th', 'Only the octave', 'All of them'], 'The others are major or minor.'],
      ['On the staff, an interval of a 5th goes from…', 'A line to a line or a space to a space', ['A line to a space', 'Always a line to a line', 'A space to a ledger line'], 'Odd numbers keep the same kind of position.'],
      ['What is the tritone?', 'An augmented 4th or diminished 5th', ['A major third', 'A perfect fifth', 'An octave'], 'Six half steps.'],
      ['How do you write a large interval below a given note?', 'Invert it, find the note above, then place it below', ['Write it above instead', 'Use only whole steps', 'Count in thirds'], 'Inversion makes it small.']]),
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
<p>V is the key chord of tension because its third is the <b>leading tone</b>, which falls just below the tonic and wants to rise to it.</p>
<h3>Reading and writing Roman numerals</h3>
<p>Roman numerals show chords as <b>patterns</b> instead of note names, which makes it easy to see that two pieces use the same progression and to <b>transpose</b> (move a progression to another key). The rules:</p>
<ul><li><b>Capital</b> numerals are major triads (I, IV, V); <b>lower case</b> are minor (ii, iii, vi).</li>
<li>A <b>+</b> marks an augmented triad (III⁺); a <b>°</b> a diminished triad (vii°).</li>
<li>The numeral names the <b>scale degree of the root</b>, in the key you have named: <i>C: V</i> is G major.</li>
<li>For an inversion, write the chord figure (see {{ch:inversions}}). Until then you can write a slash: I/3 means I with its third in the bass.</li></ul>
<p>In major, the qualities always follow the pattern <b>M – m – m – M – M – m – dim</b> (I ii iii IV V vi vii°). In minor, which has three scale forms, there are more possibilities ({{ch:minor}}).</p>
<h3>Diatonic and chromatic</h3>
<p><b>Diatonic</b> means “using only the notes of the key signature”. The seven triads above are all diatonic. A chord with a note outside the key is <b>chromatic</b> (secondary dominants, borrowed chords and so on come later).</p>
<h3>The Nashville number system</h3>
<p>Studio musicians often write chords with <b>Arabic numbers</b> instead of Roman numerals: in C major, 1 = C, 2m = Dm, 3m = Em, 4 = F, 5 = G, 6m = Am, 7° = B°. The idea is the same: numbers state the chord’s place in the key, so a chart works in any key.</p>
<table class="htab"><tr><th>Roman</th><td>I</td><td>ii</td><td>iii</td><td>IV</td><td>V</td><td>vi</td><td>vii°</td></tr><tr><th>Nashville</th><td>1</td><td>2m</td><td>3m</td><td>4</td><td>5</td><td>6m</td><td>7°</td></tr><tr><th>In G major</th><td>G</td><td>Am</td><td>Bm</td><td>C</td><td>D</td><td>Em</td><td>F♯°</td></tr></table>`,
  figs: {triads7: prog('C', 'major', ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'], {d: 'h', bpm: 60}), tsdt: satb('C', 'major', [['C3 G3 E4 C5', 'I'], ['F2 A3 F4 C5', 'IV'], ['G2 G3 D4 B4', 'V'], ['C3 G3 E4 C5', 'I']], {bpm: 60})},
  quiz: [
    () => { const k = pick(MAJKEYS), n = 1 + Math.floor(Math.random() * 7), s = scale(k + '4', 'major', 8), Q = ['', 'm', 'm', '', '', 'm', '°'], nums = ['1', '2m', '3m', '4', '5', '6m', '7°'], sym = i => pn(nm(s[i])) + Q[i];
      return ask(`In ${pn(k)} major, which chord is the Nashville number ${nums[n - 1]}?`, sym(n - 1), [0, 1, 2, 3, 4, 5, 6].filter(i => i !== n - 1).map(sym), `Count ${n} notes up the ${pn(k)} major scale and add the quality of that degree.`); },
    bank([['What does a lower-case Roman numeral stand for?', 'A minor triad', ['A major triad', 'A diminished triad', 'An augmented triad'], 'Capitals are major; ° marks diminished.'],
      ['What pattern of triad qualities does a major key follow?', 'Major, minor, minor, major, major, minor, diminished', ['Major, major, minor, minor, major, major, diminished', 'Minor, major, major, minor, minor, major, diminished', 'All major'], 'I ii iii IV V vi vii°.'],
      ['What does “diatonic” mean?', 'Using only notes of the key signature', ['Using all twelve notes', 'Using only the tonic chord', 'Played in two parts'], 'The opposite is chromatic.'],
      ['Why use Roman numerals instead of chord names?', 'The pattern is the same in every key, so you can compare and transpose', ['They are easier to play', 'They show the tempo', 'They show the inversion only'], 'V is G in C and D in G.'],
      ['What is the Nashville number system?', 'Chords written as Arabic numbers for the scale degree of the root', ['A kind of tuning', 'A cadence in country music', 'A way of notating tempo'], '1, 4, 5 are the I, IV and V chords.']]),
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
<p>The <b>lowest note</b> is what counts, however the other notes are arranged above it.</p>
<h3>Figured bass symbols in detail</h3>
<p>Figured bass was the shorthand of the Baroque continuo player: only the bass line was written, with numbers for the intervals to be played above it.</p>
<table class="htab"><tr><th>5/3 (or nothing)</th><td>root position triad</td></tr><tr><th>6 (6/3)</th><td>first inversion triad</td></tr><tr><th>6/4</th><td>second inversion triad</td></tr><tr><th>7</th><td>root position seventh chord</td></tr><tr><th>6/5</th><td>first inversion seventh chord</td></tr><tr><th>4/3</th><td>second inversion seventh chord</td></tr><tr><th>4/2</th><td>third inversion seventh chord</td></tr></table>
<p>An accidental next to a figure alters that interval above the bass (a ♯ alone raises the third; a slash through a figure raises that note). Figures are usually omitted for root position triads.</p>
<h3>Four kinds of six-four chords</h3>
<ul><li><b>Cadential</b>: a I⁶₄ on a strong beat, right before V (see {{ch:cadences}}); the 6th and 4th above the bass fall to the 5th and 3rd of V.</li>
<li><b>Passing</b>: a second-inversion chord that links two chords while the bass moves by step, for example I – V⁶₄ – I⁶.</li>
<li><b>Pedal</b> (neighbour): the bass stays on one note while the upper voices move to neighbour tones and back: I – IV⁶₄ – I over a held bass.</li>
<li><b>Arpeggiated</b>: a second-inversion chord that arises only because the bass arpeggiates the chord.</li></ul>`,
  figs: {inv: block('C', 'major', [['C3 E4 G4 C5', 'I', 'C', 'h'], ['E3 G4 C5 E5', 'I⁶', 'C/E', 'h'], ['G2 C4 E4 G4', 'I⁶₄', 'C/G', 'h']], {d: 'h', bpm: 60})},
  quiz: [
    bank([['Which figures mean first inversion of a seventh chord?', '6/5', ['4/3', '4/2', '7'], 'The third of the chord is in the bass.'],
      ['Which figures mean third inversion of a seventh chord?', '4/2', ['6/5', '4/3', '7'], 'The seventh is in the bass.'],
      ['Which six-four chord comes right before V on a strong beat?', 'Cadential six-four', ['Passing six-four', 'Pedal six-four', 'Arpeggiated six-four'], 'The 6th and 4th resolve to the 5th and 3rd of V.'],
      ['Which six-four chord keeps the bass still while the upper voices move by step?', 'Pedal six-four', ['Cadential six-four', 'Passing six-four', 'None'], 'Think of an organ pedal note.'],
      ['Which six-four chord links two chords while the bass moves by step?', 'Passing six-four', ['Cadential six-four', 'Pedal six-four', 'Arpeggiated six-four'], 'For example I – V⁶₄ – I⁶.']]),
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
{{fig:v7inv|V7 in root position, then V⁶₅, V⁴₃ and V⁴₂.}}
<h3>Building them by thirds</h3>
<p>Chords are built in thirds, so their members have odd numbers: root, third, fifth, <b>seventh</b>, and later <b>ninth, eleventh and thirteenth</b> (the fifteenth would be the double octave, so chords stop at the thirteenth). The five kinds of seventh chord differ in how the three stacked thirds are made:</p>
<table class="htab"><tr><th>Major 7th (maj7, Δ7)</th><td>M3 + m3 + M3</td><td>C E G B</td></tr>
<tr><th>Dominant 7th (7)</th><td>M3 + m3 + m3</td><td>C E G B♭</td></tr>
<tr><th>Minor 7th (m7, −7)</th><td>m3 + M3 + m3</td><td>C E♭ G B♭</td></tr>
<tr><th>Half-diminished (ø7, m7♭5)</th><td>m3 + m3 + M3</td><td>C E♭ G♭ B♭</td></tr>
<tr><th>Fully diminished (°7, dim7)</th><td>m3 + m3 + m3</td><td>C E♭ G♭ B♭♭</td></tr></table>
<p>Other labels exist: Δ7 or MM7 for major seventh, Mm7 or “dom7” for the dominant seventh, m7♭5 for half-diminished. In Roman numerals, <b>V7</b> means a major triad with a minor seventh, <b>vi7</b> a minor triad with a minor seventh, <b>IM7</b> (or Imaj7) a major triad with a major seventh, <b>viiø7</b> a half-diminished seventh and <b>vii°7</b> a fully diminished one.</p>
<h3>The sevenths of a minor key</h3>
{{fig:min7|The seventh chords of A minor: i7, iiø7, IIIM7, iv7, V7, VIM7 and vii°7. V7 and vii°7 use the raised 7th (G♯).}}
<p>In major the qualities are IM7, ii7, iii7, IVM7, <b>V7</b>, vi7 and viiø7. In minor (harmonic form) they are i7, iiø7, IIIM7, iv7, <b>V7</b>, VIM7 and vii°7. Only V7 is a dominant seventh in either mode.</p>
<h3>A V7 substitute: IV over 5</h3>
<p>In pop, a triad on IV over the dominant in the bass (<b>IV/5</b>, F/G in C major) is a popular stand-in for V7: its notes G, F, A, C include the seventh F and sound and act like V7. It is heard in “O-o-h Child” and at the opening of “The Long and Winding Road” (A♭/B♭ in E♭).</p>`,
  figs: {
    min7: block('A', 'minor', [['A2 E3 G3 C4', 'i7'], ['B2 F3 A3 D4', 'iiø7'], ['C3 G3 B3 E4', 'IIIM7'], ['D3 A3 C4 F4', 'iv7'], ['E3 B3 D4 G#4', 'V7'], ['F3 C4 E4 A4', 'VIM7'], ['G#3 D4 F4 B4', 'vii°7']], {bpm: 70, d: 'h'}),
    sevenths: {key: 'C', mode: 'major', clef: 'treble', bpm: 56, events: ['maj7', 'dom7', 'min7', 'hdim7', 'dim7'].map(q => ({notes: chordFromRoot(R('C'), q), d: 'w', sym: 'C' + SUFFIX[q]}))},
    dia7: prog('C', 'major', ['IM7', 'ii7', 'iii7', 'IVM7', 'V7', 'vi7', 'viiø7'], {d: 'h', bpm: 60}),
    v7: {...satb('C', 'major', [['G2 B3 F4 D5', 'V⁷'], ['C3 C4 E4 C5', 'I']], {bpm: 56}), incomplete: true},
    v7inv: block('C', 'major', [['G2 D4 F4 B4', 'V⁷'], ['B2 D4 F4 G4', 'V⁶₅'], ['D3 F4 G4 B4', 'V⁴₃'], ['F3 G4 B4 D5', 'V⁴₂']], {d: 'h', bpm: 60}),
  },
  quiz: [
    () => { const [d, a] = pick([[1, 'major seventh'], [2, 'minor seventh'], [3, 'minor seventh'], [4, 'major seventh'], [5, 'dominant seventh'], [6, 'minor seventh'], [7, 'half-diminished seventh']]), o = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th'][d]; return ask(`In a major key, what kind of seventh chord is built on the ${o} degree?`, a, ['major seventh', 'minor seventh', 'dominant seventh', 'half-diminished seventh', 'fully diminished seventh'].filter(x => x !== a).slice(0, 4), 'Only V gives a dominant seventh; vii gives a half-diminished seventh.'); },
    () => { const [t, a] = pick([['M3 + m3 + M3', 'Major seventh'], ['M3 + m3 + m3', 'Dominant seventh'], ['m3 + M3 + m3', 'Minor seventh'], ['m3 + m3 + M3', 'Half-diminished seventh'], ['m3 + m3 + m3', 'Fully diminished seventh']]); return ask(`Which seventh chord is built from the thirds ${t}?`, a, ['Major seventh', 'Dominant seventh', 'Minor seventh', 'Half-diminished seventh', 'Fully diminished seventh'].filter(x => x !== a).slice(0, 4), 'Check how each third is made, from the bottom.'); },
    bank([['What do the numbers 9, 11 and 13 stand for in chords?', 'Extensions stacked above the seventh', ['The key signature', 'The tempo', 'Inversions'], 'The 15th would repeat the root two octaves up.'],
      ['What is the Roman numeral for the seventh chord on the 7th degree of a minor key (harmonic minor)?', 'vii°7', ['viiø7', 'VII7', 'vii7'], 'It is fully diminished: the raised 7th and a diminished seventh.'],
      ['Which other chord often substitutes for V7 in pop?', 'IV with 5 in the bass (F/G)', ['ii with 5 in the bass', 'vi with 1 in the bass', 'I with 3 in the bass'], 'It contains the seventh, F, above G.']]),
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
{{fig:c64|I⁶₄ – V – I: the 6th and the 4th above the bass fall to the 5th and the 3rd.}}
<h3>What a cadence is</h3>
<p>A <b>cadence</b> is a harmonic arrival point: a short moment of rest at the end of a phrase, like a comma or a full stop in a sentence. The ear gets time to take in what it has heard, then the music goes on. Four basic types are met first: the <b>authentic</b> (V – I), <b>plagal</b> (IV – I), <b>deceptive</b> (V – vi) and <b>half</b> (ending on V) cadences. Each has a different strength of stop.</p>
<h3>Hearing them in real music</h3>
<ul><li><b>Authentic</b> cadences end countless national anthems and Beatles-era songs, from “The Star-Spangled Banner” to “I Want to Hold Your Hand”.</li>
<li><b>Plagal</b> cadences are the “Amen” of hymns (“Amazing Grace”) and appear in pop (Pink’s “Just Give Me a Reason”).</li>
<li><b>Deceptive</b> cadences are heard in Mozart’s “Voi che sapete”, in “True Colors” and at the famous opening of Wagner’s <i>Tristan und Isolde</i>.</li>
<li><b>Half</b> cadences end the first phrase of many Classical themes (the opening of Mozart’s <i>Eine kleine Nachtmusik</i>) and pop choruses (Ed Sheeran’s “Thinking Out Loud”).</li></ul>
<h3>“V to not-I”</h3>
<p>Strictly, a deceptive cadence means that V <i>did not go to I</i>. V – vi is the most common choice, but V can go to other chords too: in Mozart’s <i>Ave verum corpus</i> V goes to IV⁶ (IV with its third, the 6th degree, in the bass). The effect is the same: the expected tonic is replaced with a surprise.</p>
{{fig:dc6|A deceptive cadence to IV⁶ in C major: V goes not to I but to F major with A in the bass.}}
<h3>Chords with no third</h3>
<p>Rock and pop often use <b>power chords</b>: only the root and the fifth, written with a “5” (B5, G5). Chords with some notes left out are called <b>incomplete chords</b>. They sound open and powerful, and they can fill any chord’s function. Label them with the root and “5”, then analyze them like ordinary chords.</p>`,
  figs: {
    dc6: block('C', 'major', [['G2 B3 D4 G4', 'V'], ['A2 C4 F4 A4', 'IV⁶']], {bpm: 56}),
    pac: satb('C', 'major', [['G2 G3 D4 B4', 'V'], ['C3 G3 E4 C5', 'I']], {bpm: 56}),
    iac: satb('C', 'major', [['G2 B3 D4 G4', 'V'], ['C3 C4 E4 G4', 'I']], {bpm: 56}),
    hc: satb('C', 'major', [['C3 G3 E4 C5', 'I'], ['G2 G3 D4 B4', 'V']], {bpm: 56}),
    plagal: satb('C', 'major', [['F2 A3 F4 C5', 'IV'], ['C3 G3 E4 C5', 'I']], {bpm: 56}),
    dec: satb('C', 'major', [['G2 G3 D4 B4', 'V'], ['A2 E3 C4 C5', 'vi']], {bpm: 56}),
    c64: satb('C', 'major', [['G2 E4 G4 C5', 'I⁶₄', 'h'], ['G2 D4 G4 B4', 'V', 'q'], ['C3 E4 G4 C5', 'I', 'q']], {bpm: 56}),
  },
  quiz: [
    bank([['What is a cadence?', 'A harmonic arrival point at the end of a phrase', ['A fast scale', 'A change of tempo', 'A kind of rest'], 'Like a comma or full stop in a sentence.'],
      ['Which cadence is the “Amen” of a hymn?', 'Plagal (IV – I)', ['Authentic (V – I)', 'Half (ending on V)', 'Deceptive (V – vi)'], 'It sounds softer than V – I.'],
      ['What is a more accurate description of a deceptive cadence?', 'V to something other than I', ['IV to I', 'I to V', 'A cadence on vi'], 'V – vi is the most common choice, but not the only one.'],
      ['What is a power chord?', 'A chord with only a root and fifth', ['A chord with a seventh', 'A chord with four fifths', 'A very loud tonic'], 'Written with a 5, such as B5.'],
      ['Which cadence is a phrase ending on V?', 'The half cadence', ['The authentic cadence', 'The plagal cadence', 'The deceptive cadence'], 'It feels like a comma: the music must go on.']]),
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
<p>The <b>circle of fifths</b> arranges all twelve keys by fifths: C G D A E B F♯… going up a fifth adds a sharp; going down adds a flat. Neighbouring keys share most of their notes, which is why we can modulate between them smoothly ({{ch:chromatic}}).</p>
<h3>Harmonic sequences</h3>
<p>A <b>harmonic sequence</b> repeats a short pattern of chords at a new pitch level, so the roots move by the same interval again and again. The pattern matters more than the usual rules of function, so a sequence can contain progressions that would sound odd on their own (for example vii° followed by iii).</p>
<ul><li><b>Descending fifths</b> (the circle of fifths): I – IV – vii° – iii – vi – ii – V – I. Every root falls a fifth (or rises a fourth); the only diminished chord is vii°, which stands in for a perfect fifth.</li>
<li><b>Descending thirds</b>: I – vi – IV – ii – V – I. Each root falls a third; it is the reverse of the “step up by thirds” idea and is common in the Baroque.</li>
<li><b>Pachelbel</b> (descending 5–6 pattern): I – V – vi – iii – IV – I – IV – V. It has been the backbone of countless pieces and pop songs.</li></ul>
{{fig:seq3|A descending-thirds sequence in C major: I – vi – IV – ii – V – I.}}
{{fig:pach|The Pachelbel sequence in C major: I – V – vi – iii – IV – I – IV – V.}}
<p>To spot a sequence, look for the <b>same interval between roots</b> repeating at least twice. Label the chords with Roman numerals anyway, then add a bracket to show the repeating pattern.</p>
<h3>The circle of fifths progression in minor</h3>
<p>The chain of descending fifths is a favourite of Baroque composers (Bach, Handel, Vivaldi), especially in minor, where the chord on the lowered 7th, the <b>subtonic VII</b>, fits in: <b>i – iv – VII – III – VI – ii° – V – i</b>. Not every chord needs to be in root position: in Handel’s Passacaglia in G minor the same chain is heard with inversions (i, iv⁶, VII, III, VI, ii°⁶, V, i), and you hear the sequence of <i>roots</i> even where the bass does not show them. Pieces from every era use it: Mozart’s Piano Sonata K. 545 (I – IV – vii°⁶ – iii), Wagner, “Fly Me to the Moon” and “I Will Survive” (all in seventh chords).</p>
{{fig:circmin|The circle of fifths progression in A minor: Am – Dm – G – C – F – B° – E – Am.}}
<p>This is the <b>circle of fifths for harmonic progression</b>. It differs from the circle of fifths for key signatures: it contains only the <b>seven diatonic notes</b> of one key, so one of its fifths is a diminished fifth (vii° – iii in major, or ii° – V in minor).</p>
<h3>Why it feels inevitable: sequence</h3>
<p>The bass line of the chain is a <b>melodic sequence</b>: an idea repeated at a different pitch (down a fifth then up a fourth, or the equivalent). Listeners feel that the pattern must go on until it reaches the tonic. A sequence can be short (as in the famous four-note motive of Beethoven’s Fifth, repeated a step lower) or long.</p>
<h3>Harmonic rhythm</h3>
<p><b>Harmonic rhythm</b> is how long each chord lasts. In “Fly Me to the Moon” each chord lasts four beats (whole-note harmonic rhythm); in Mozart’s K. 545 and in Wagner each lasts two beats, a faster harmonic rhythm. It may stay steady or change: Dan Smith’s “Pompeii” changes from four-beat to two-beat chords. Every progression in this chapter can be played with different harmonic rhythm, and a faster one raises the energy ({{ch:contrast}}).</p>
<h3>Shorter pieces of the circle</h3>
<ul><li><b>ii – V – I</b>: the standard in classical and especially jazz (the Great American Songbook of the 1930s–50s is full of it: “Take the ‘A’ Train”, “Tune-Up”, “As Time Goes By”).</li>
<li><b>vi – ii – V – I</b> contains the last four chords of the circle; <b>iii – vi – ii – V</b> the last four before the resolution.</li>
<li><b>I – vi – ii – V</b> was so common in the 1930s–50s that it is called the <b>1950s progression</b> (“Blue Moon”, “Why Do Fools Fall in Love”).</li>
<li><b>ii – V – I – vi</b>: the vi after the cadence links back to ii; such a loop is a <b>turnaround</b> (more in {{ch:jazz}}).</li>
<li>These patterns can be <b>rotated</b>: <b>ii – V – iii – vi</b> (as in Earth, Wind &amp; Fire’s “September”) is the same circle started in a different place.</li></ul>
{{fig:iiivi|iii – vi – ii – V: the middle of the circle of fifths, ready to resolve to I.}}
{{fig:turn|ii – V – I – vi: a turnaround. The vi leads back to ii.}}
<h3>Harmonic function: four groups</h3>
<p>Not every progression uses the circle. The idea of <b>harmonic function</b> says that chords have tendencies: to progress to certain chords or to stay at rest. We recognize four functions:</p>
<table class="htab"><tr><th>Tonic (ton.)</th><td>I: stability and rest; it needs to go nowhere.</td></tr>
<tr><th>Dominant (dom.)</th><td>V and vii°: they contain the leading tone (7) and the supertonic (2) and tend to go to I. I⁶₄ is a dominant function when it moves to V (as in the cadential six-four).</td></tr>
<tr><th>Pre-dominant (pre-dom.)</th><td>IV and ii: they contain the subdominant (4) and the submediant (6) and tend to go to a dominant.</td></tr>
<tr><th>Tonic prolongation (ton. prol.)</th><td>vi and iii: they share two notes with the tonic triad, usually follow I and lead to a pre-dominant.</td></tr></table>
<p>The usual route is <b>tonic → (prolongation) → pre-dominant → dominant → tonic</b>. Two exceptions: <b>IV → I</b> is the plagal cadence, so IV is labelled tonic prolongation there; and V → vi (deceptive) leaves the dominant for a tonic substitute. In minor the flowchart is the same with one addition, <b>VII</b>, which goes to III.</p>
<h3>Four ways to travel</h3>
<ul><li><b>Tonic – dominant – tonic</b>: the most elemental progression, I – V – I (or I – vii°⁶ – I). Mozart, Beethoven, Verdi’s “La donna è mobile” and “Hey Jude” begin this way.</li>
<li><b>Tonic – pre-dominant – dominant – tonic</b>: I – ii – V – I, I – IV – V – I, I – ii⁶ – V – I or I – IV – V⁷ – I (Bach’s C major Prelude, Chopin’s Waltz in A♭, “I’ll Be There for You”). Progressions with vii° after the pre-dominant are rare because the diminished chord is unstable.</li>
<li><b>Tonic – prolongation – pre-dominant – dominant</b>: I – vi – IV – V (the 1950s doo-wop progression: “Heart and Soul”, “Earth Angel”, “I Will Always Love You”, “All of Me”) or, in classical music, I – vi – ii⁶ – V, where the bass starts with descending thirds. Rotated, it becomes IV – V – I – vi.</li></ul>
{{fig:ivi26|I – vi – ii⁶ – V in C: the bass falls by thirds (C – A – F) and then to G.}}
<h3>Exceptions explained by sequences</h3>
<p>When a progression breaks the function rules, a sequence may explain it. In a falling-fifths or other sequence the pattern is repeated whatever each chord “wants” to do, so you may meet iii – vi – ii or a chord whose normal move is ignored. Always look for the repeated idea before you decide that a progression is irregular.</p>`,
  figs: {
    circmin: prog('A', 'minor', ['i', 'iv', 'VII', 'III', 'VI', 'ii°', 'V', 'i'], {d: 'h', bpm: 60}),
    iiivi: prog('C', 'major', ['iii', 'vi', 'ii', 'V'], {d: 'h', bpm: 60}),
    turn: prog('C', 'major', ['ii', 'V', 'I', 'vi'], {d: 'h', bpm: 60}),
    ivi26: block('C', 'major', [['C3 E4 G4 C5', 'I'], ['A2 E4 A4 C5', 'vi'], ['F3 D4 A4 D5', 'ii⁶'], ['G2 D4 G4 B4', 'V']], {bpm: 60, d: 'h'}),
    seq3: prog('C', 'major', ['I', 'vi', 'IV', 'ii', 'V', 'I'], {d: 'h', bpm: 60}),
    pach: prog('C', 'major', ['I', 'V', 'vi', 'iii', 'IV', 'I', 'IV', 'V'], {d: 'h', bpm: 60}),
    circle: prog('C', 'major', ['I', 'IV', 'vii°', 'iii', 'vi', 'ii', 'V', 'I'], {d: 'h', bpm: 60}),
    iivi: satb('C', 'major', [['D3 A3 F4 D5', 'ii'], ['G2 G3 D4 B4', 'V'], ['C3 G3 E4 C5', 'I', 'w']], {bpm: 56, d: 'h'}),
    ivi: satb('C', 'major', [['C3 G3 E4 C5', 'I'], ['A2 A3 E4 C5', 'vi'], ['D3 A3 F4 D5', 'ii'], ['G2 G3 D4 B4', 'V'], ['C3 G3 E4 C5', 'I', 'w']], {bpm: 56, d: 'h'}),
  },
  quiz: [
    () => { const [c, f] = pick([['I', 'tonic'], ['vi', 'tonic prolongation'], ['iii', 'tonic prolongation'], ['ii', 'pre-dominant'], ['IV', 'pre-dominant'], ['V', 'dominant'], ['vii°', 'dominant']]); return ask(`In a major key, which harmonic function does the ${c} chord usually have?`, f, ['tonic', 'tonic prolongation', 'pre-dominant', 'dominant'].filter(x => x !== f), `${c} is a ${f} chord in the usual flowchart (I – vi – IV – V…).`); },
    bank([['What is the circle of fifths progression in A minor?', 'i – iv – VII – III – VI – ii° – V – i', ['i – ii – iii – iv – V – vi – vii', 'i – V – vi – IV', 'i – VII – VI – VII'], 'Each root falls a fifth; the VII is the subtonic chord.'],
      ['What is the 1950s progression?', 'I – vi – ii – V (and I – vi – IV – V)', ['I – IV – V – I only', 'ii – V – I', 'I – iii – V – I'], 'It was common in the 1930s–50s.'],
      ['What is harmonic rhythm?', 'How long each chord lasts', ['The rhythm of the melody', 'The tempo', 'The number of voices'], 'Four-beat or two-beat chords, for example.'],
      ['What is a turnaround?', 'A short progression after a cadence that leads back to the start, such as ii – V – I – vi', ['A key change', 'A kind of cadence', 'A rest between phrases'], 'The vi leads back to the ii.'],
      ['Which two chords contain the leading tone (7) and so have dominant function?', 'V and vii°', ['IV and vi', 'ii and iii', 'I and IV'], 'They tend to resolve to I.'],
      ['Which functional exception is IV – I?', 'IV is tonic prolongation in the plagal cadence', ['I is dominant', 'vi is a pre-dominant', 'V is tonic'], 'The plagal cadence is an exception to the flowchart.'],
      ['Which progression usually follows the pattern tonic – tonic prolongation – pre-dominant – dominant?', 'I – vi – IV – V', ['I – IV – V – I', 'I – V – I', 'ii – V – I'], 'Rotated, it becomes IV – V – I – vi.']]),
    bank([['What is a harmonic sequence?', 'A chord pattern repeated at a new pitch level', ['A cadence', 'A chord with a seventh', 'A change of key'], 'The roots move by the same interval each time.'],
      ['In a descending-fifths sequence in C major, which chord follows IV?', 'vii°', ['V', 'ii', 'iii'], 'I – IV – vii° – iii – vi – ii – V – I.'],
      ['Which sequence goes I – vi – IV – ii – V – I?', 'Descending thirds', ['Descending fifths', 'Ascending seconds', 'Chromatic mediants'], 'Each root is a third lower than the one before.'],
      ['Which progression is the Pachelbel sequence in C major?', 'I – V – vi – iii – IV – I – IV – V', ['I – IV – V – I', 'I – vi – ii – V', 'ii – V – I – vi'], 'It is the “Canon in D” pattern.'],
      ['Why can a sequence break the usual rules of progression?', 'The repeating pattern outweighs the normal function of each chord', ['Because it is always in a minor key', 'Because the bass stays still', 'Because it has no tonic'], 'It sounds logical because of the repetition.']]),
    () => { const p = pick([['ii', 'V', 'I'], ['I', 'IV', 'V', 'I'], ['I', 'vi', 'ii', 'V'], ['I', 'vi', 'IV', 'V']]), right = p[p.length - 1], shown = p.slice(0, -1).concat('?').join(' – '); return ask(`Which chord completes the progression ${shown}?`, right, ['I', 'ii', 'IV', 'V', 'vi', 'iii'], `${p.join(' – ')} is a standard progression.`); },
    bank([['What is the strongest root movement?', 'Down a fifth', ['Up a second', 'Down a third', 'Up a sixth'], 'G → C, D → G… the chain of falling fifths.'],
      ['Which chord normally follows ii in a cadential progression?', 'V', ['IV', 'iii', 'vii°'], 'ii – V – I.'],
      ['Which of these moves sounds “backwards” in classical style?', 'V → IV', ['IV → V', 'ii → V', 'V → I'], 'The dominant pulls ahead to the tonic.'],
      ['Which chord can replace I as a tonic substitute?', 'vi', ['V', 'ii', 'IV'], 'It shares two notes with I.'],
      ['Going up a fifth on the circle of fifths adds…', 'A sharp (or removes a flat)', ['A flat', 'A natural', 'Nothing'], 'C → G adds F♯.']]),
  ],
  play: [
    progEx('Play the circle of fifths in {key}: i – iv – VII – III – VI – ii° – V – i', ['i', 'iv', 'VII', 'III', 'VI', 'ii°', 'V', 'i'], () => pick(['A', 'E', 'D', 'G']), 'minor'),
    progEx('Play the 1950s progression in {key}: I – vi – ii – V', ['I', 'vi', 'ii', 'V'], () => pick(['C', 'G', 'F', 'D']), 'major'),
    progEx('Play the turnaround in {key}: ii – V – I – vi', ['ii', 'V', 'I', 'vi'], () => pick(['C', 'G', 'F', 'D']), 'major'),
    progEx('Play the descending-thirds sequence in {key}: I – vi – IV – ii – V – I', ['I', 'vi', 'IV', 'ii', 'V', 'I'], () => pick(['C', 'G', 'F', 'D']), 'major'),
    progEx('Play the Pachelbel sequence in {key}', ['I', 'V', 'vi', 'iii', 'IV', 'I', 'IV', 'V'], () => pick(['C', 'G', 'D']), 'major'),progEx('Play ii – V – I in {key}', ['ii', 'V', 'I'], () => pick(['C', 'G', 'F', 'Bb', 'D']), 'major'), progEx('Play I – vi – ii – V – I in {key}', ['I', 'vi', 'ii', 'V', 'I'], () => pick(['C', 'G', 'F']), 'major'), progEx('Play I – IV – vii° – iii – vi – ii – V – I in {key}', ['I', 'IV', 'vii°', 'iii', 'vi', 'ii', 'V', 'I'], 'C', 'major', 'The whole chain of falling fifths. Take your time.')]});

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
{{fig:fixed|Better: the same chords with the tenor going down to a different note, so the octaves disappear.}}
<h3>Two ways to score four parts</h3>
<p><b>Voice leading</b> (also called <b>part writing</b>) is the set of rules for how voices move from chord to chord. Its aims are <b>independent parts</b>, good <b>spacing</b> of each chord and an <b>economy of motion</b> that keeps every part singable. In <b>chorale style</b> the soprano and alto are written in the treble clef and the tenor and bass in the bass clef (SATB). In <b>keyboard (piano) style</b> the three upper voices all sit in the right hand on the treble staff, with the bass alone in the left hand. Three-part chords are sometimes scored SAB (soprano, alto, bass).</p>
<h3>Four types of motion</h3>
<ul><li><b>Contrary</b>: the two voices move in opposite directions.</li>
<li><b>Oblique</b>: one voice stays and the other moves.</li>
<li><b>Similar</b> (also “direct”): both voices move in the same direction, by step or by leap.</li>
<li><b>Parallel</b>: a special kind of similar motion in which both voices move the <b>same interval</b> (for example both up a step, or both down a third).</li></ul>
<h3>Objectionable parallels</h3>
<p>Avoid <b>parallel fifths and octaves</b> between any two voices, along with their octave equivalents (parallel twelfths and unisons). From the Renaissance through the Romantic era these were thought to destroy the independence of the parts. <b>Parallel thirds, fourths and sixths</b> were acceptable (fourths with care); parallel seconds and sevenths were generally not used.</p>
<h3>Rules of melody</h3>
<p>Each part is a melody. These rules summarize the style of J. S. Bach’s 371 chorales:</p>
<ol><li><b>Tendency tones</b> (scale degrees 2, 4, 6 and 7) should resolve: 7 goes up to 8 (1) and, to a lesser extent, 4 goes down to 3; 6 and 2 usually fall by step.</li>
<li>Avoid <b>augmented</b> intervals.</li>
<li>A leap larger than a 4th, or any leap of a diminished interval, should change direction afterwards.</li>
<li>Consecutive leaps should <b>outline a triad</b>; other consecutive leaps are hard to sing.</li></ol>
<h3>Why the spacing rule?</h3>
<p>The upper voices are kept close: no more than an octave from soprano to alto and from alto to tenor. This reflects the <b>overtone series</b>: the notes of a chord ring best when the wide intervals are low and the notes are close together at the top. The distance from the bass to the tenor may be larger than an octave.</p>`,
  figs: {
    good: satb('C', 'major', [['C3 G3 E4 C5', 'I'], ['F2 A3 F4 C5', 'IV'], ['G2 G3 D4 B4', 'V'], ['C3 G3 E4 C5', 'I']], {bpm: 56}),
    badfifths: {...satb('C', 'major', [['C3 G3 E4 C5', 'I'], ['D3 A3 F4 D5', 'ii']], {bpm: 56}), bad: true},
    badoct: {...satb('C', 'major', [['G2 G3 D4 B4', 'V'], ['A2 A3 E4 C5', 'vi']], {bpm: 56}), bad: true},
    fixed: satb('C', 'major', [['G2 G3 D4 B4', 'V'], ['A2 E3 C4 C5', 'vi']], {bpm: 56}),
  },
  quiz: [
    bank([['What is parallel motion?', 'Both voices move in the same direction by the same interval', ['One voice stays still', 'The voices move in opposite directions', 'The voices cross'], 'It is a special kind of similar motion.'],
      ['What is oblique motion?', 'One voice stays and the other moves', ['Both voices move up', 'Both voices move in opposite directions', 'Both voices leap'], 'Contrary motion has the voices going opposite ways.'],
      ['Which parallel intervals are acceptable between two voices?', 'Thirds and sixths', ['Fifths', 'Octaves', 'Sevenths'], 'Parallel fifths, octaves, twelfths and unisons are objectionable.'],
      ['In keyboard style, where are the three upper voices written?', 'On the treble staff, played by the right hand', ['On the bass staff', 'In three different clefs', 'Only in the alto clef'], 'The bass is alone in the left hand.'],
      ['Which scale degrees are the tendency tones?', '2, 4, 6 and 7', ['1, 3 and 5', '1 and 5 only', '3 and 6 only'], 'They tend to resolve to the nearest tonic-chord note.'],
      ['After a leap larger than a 4th, a voice should…', 'Change direction', ['Leap again in the same direction', 'Stay on the same note', 'Move by an augmented second'], 'It helps keep the line singable.'],
      ['Why is the soprano–alto distance kept within an octave?', 'The chord sounds best when the notes at the top are close together', ['The alto cannot sing high', 'It is a rule of notation', 'To avoid parallel fifths'], 'It follows the spacing of the overtone series.']]),
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
{{fig:pedal|C in the bass is held under I – V⁷ – I.}}
<h3>Three more types</h3>
<p><b>Double neighbour</b> (neighbour group): both the upper and the lower neighbour appear before the return to the chord tone (E – F – D – E over C). <b>Retardation</b>: like a suspension, it is an accented non-chord tone held from the previous chord, but it resolves <b>up</b> by step (7 – 8, for instance, a leading tone held over the tonic and rising to it). <b>Incomplete neighbour</b>: a handy “utility” label for a neighbour-like note that is approached by leap and left by step, or the other way round, when no other label fits.</p>
{{fig:dneigh|A double neighbour: E – F – D – E over C.}}
{{fig:retard|A retardation: the leading tone B is held into the tonic chord and rises to C.}}
<h3>Classifying non-chord tones</h3>
<p>Non-chord tones are named by how they are <b>approached and left</b>:</p>
<table class="htab"><tr><th>Passing tone</th><td>by step, left by step in the same direction</td></tr><tr><th>Neighbour tone</th><td>by step, left by step in the opposite direction (back to the same note)</td></tr><tr><th>Appoggiatura</th><td>by leap, left by step (usually accented)</td></tr><tr><th>Escape tone</th><td>by step, left by a leap in the opposite direction</td></tr><tr><th>Suspension</th><td>by the same note, left by a step down (accented)</td></tr><tr><th>Retardation</th><td>by the same note, left by a step up (accented)</td></tr><tr><th>Anticipation</th><td>by step or the same note, left by the same note (the next chord’s note)</td></tr><tr><th>Pedal point</th><td>a held note that starts as a chord tone, then becomes a non-chord tone</td></tr></table>
<p>The qualifiers <b>accented</b> (on the beat) and <b>unaccented</b> (off the beat), <b>chromatic</b> (outside the key) and <b>metrical / sub-metrical / super-metrical</b> (as long as, shorter than or longer than the beat) can be added. Suspensions are numbered by the interval of the held note and its resolution above the bass (4–3, 7–6, 9–8, and the bass suspension 2–3, written 2–3 even though the literal interval is a 10th–9th).</p>`,
  figs: {
    dneigh: melody('C', [['E4', 'C3', 'q', 'chord tone'], ['F4', 'C3', 'q', 'upper'], ['D4', 'C3', 'q', 'lower'], ['E4', 'C3', 'q', 'chord tone']], {bpm: 70}),
    retard: melody('C', [['B4~', 'G2', 'h', 'V'], ['B4', 'C3', 'h', '7 (retardation)'], ['C5', 'C3', 'w', '8']], {bpm: 60}),
    passing: melody('C', [['E4', 'C3', 'q', 'chord tone'], ['F4', 'C3', 'q', 'passing'], ['G4', 'C3', 'q', 'chord tone'], ['G4', 'C3', 'q', '']], {bpm: 70}),
    neighbor: melody('C', [['E4', 'C3', 'q', 'chord tone'], ['F4', 'C3', 'q', 'neighbour'], ['E4', 'C3', 'q', 'chord tone'], ['E4', 'C3', 'q', '']], {bpm: 70}),
    susp: melody('C', [['C5~', 'F2', 'h', 'prep.'], ['C5', 'G2', 'h', '4 (susp.)'], ['B4', 'G2', 'w', '3 (res.)']], {bpm: 60}),
    appog: melody('C', [['E4', 'C3', 'q', ''], ['A4', 'C3', 'q', 'appoggiatura'], ['G4', 'C3', 'h', 'resolution']], {bpm: 70}),
    escape: melody('C', [['G4', 'C3', 'q', 'chord tone'], ['A4', 'C3', 'q', 'escape'], ['E4', 'C3', 'h', 'chord tone']], {bpm: 70}),
    anticip: melody('C', [['D5', 'G2', 'h', 'V'], ['C5', 'G2', 'q', 'anticipation'], ['C5', 'C3', 'q', 'I']], {bpm: 70}),
    pedal: block('C', 'major', [['C3 E4 G4 C5', 'I', '', 'h'], ['C3 D4 F4 B4', 'V⁷', '', 'h'], ['C3 E4 G4 C5', 'I', '', 'w']], {bpm: 56}),
  },
  quiz: [
    bank([['What is a double neighbour?', 'Both the upper and the lower neighbour before returning to the chord tone', ['A neighbour held for two beats', 'Two suspensions together', 'A neighbour in two voices'], 'E – F – D – E over a C chord.'],
      ['What is a retardation?', 'A held note that resolves up by step', ['A held note that resolves down by step', 'A very slow tempo', 'A rest before a chord'], 'A suspension resolves down; a retardation resolves up.'],
      ['Which non-chord tone is approached by leap and left by step?', 'Appoggiatura', ['Passing tone', 'Neighbour tone', 'Escape tone'], 'It is usually on the beat.'],
      ['Which non-chord tone is approached by step and left by a leap in the opposite direction?', 'Escape tone', ['Appoggiatura', 'Suspension', 'Anticipation'], 'The note “escapes” the dissonance.'],
      ['What does “accented” mean for a non-chord tone?', 'It occurs on the beat', ['It is louder than the others', 'It has an accent mark', 'It is chromatic'], 'Unaccented ones occur off the beat.'],
      ['How is a 4–3 suspension numbered?', 'By the interval above the bass: 4th resolving to 3rd', ['By the number of beats', 'By the bar number', 'By the key'], 'Reduce larger intervals to simple ones.'],
      ['What kind of note is an anticipation?', 'A note of the next chord that arrives early', ['A held note from the last chord', 'A note left by leap', 'A repeated bass note'], 'It is common at cadences.']]),
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
{{fig:picardy|i – iv – V – I with a Picardy third: C♯ instead of C.}}
<h3>Minor key signatures: parallel and relative</h3>
<p>A minor key signature agrees with the <b>natural minor</b> scale. Compared with the major scale on the same tonic, natural minor lowers the <b>3rd, 6th and 7th</b> degrees, so C minor has three flats (B♭, E♭, A♭). To find a minor key signature, <b>add three flats</b> (or subtract three sharps) from the signature of the <b>parallel major</b>, the major key with the same tonic: E major has four sharps, so E minor has one.</p>
<p>The <b>relative</b> key, by contrast, has the same signature but a different tonic. The relative minor lies a minor third (three half steps) below its major: E♭ major and C minor both have three flats; the relative major of C minor is E♭ major. In writing, small capitals or lower case mark minor (c), capitals major (C).</p>
<table class="htab"><tr><th>Parallel</th><td>same tonic, different signature (C major / C minor)</td></tr><tr><th>Relative</th><td>same signature, different tonic (C major / A minor)</td></tr></table>
<h3>Which minor scale?</h3>
<p>Real music does not stick to one scale: the three forms are tidy summaries of what composers do. In a minor key written with its signature, you must <b>raise scale degrees by accidentals</b>: the harmonic form raises only the 7th; the ascending melodic form raises the 6th and 7th. A melody that leads up to the tonic usually raises both (to avoid the awkward augmented second), and coming down it usually keeps the natural 7th and 6th, as in a Bach invention or the opening of Mozart’s Symphony No. 40.</p>
<h3>Triads in minor: more than seven</h3>
<p>Because scale degrees 6 and 7 can each take two forms, there are <b>13 possible diatonic triads</b> in minor. In practice these are the common ones (here in A minor):</p>
<table class="htab"><tr><th>i</th><td>A C E</td><td>tonic</td></tr><tr><th>ii°</th><td>B D F</td><td>pre-dominant</td></tr><tr><th>III</th><td>C E G</td><td>the relative major triad</td></tr><tr><th>iv</th><td>D F A</td><td>pre-dominant</td></tr><tr><th>V</th><td>E G♯ B</td><td>dominant (raised 7)</td></tr><tr><th>VI</th><td>F A C</td><td>tonic substitute or pre-dominant</td></tr><tr><th>VII</th><td>G B D</td><td>subtonic triad (natural 7)</td></tr><tr><th>vii°</th><td>G♯ B D</td><td>leading-tone triad (raised 7)</td></tr></table>
<p>Do not confuse <b>VII</b> and <b>vii°</b>. The <b>subtonic triad VII</b> is built on the lowered 7th, a whole step below the tonic, and needs no accidental in a minor key: it is found in circle-of-fifths progressions and in rock and pop. The <b>leading-tone triad vii°</b> is built on the raised 7th, a half step below the tonic, and usually works as a passing chord or as a substitute for V.</p>
{{fig:subt|A minor: the subtonic triad VII (G–B–D) and the leading-tone triad vii° (G♯–B–D) differ by one note.}}`,
  figs: {
    subt: block('A', 'minor', [['G3 B3 D4 G4', 'VII', 'G', 'h'], ['G#3 B3 D4 G#4', 'vii°', 'G♯°', 'h']], {bpm: 56}),
    nat: line('A', 'minor', ['A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5'], {sym: ['', 'W', 'H', 'W', 'W', 'H', 'W', 'W'], bpm: 100}),
    harm: line('A', 'minor', ['A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G#5', 'A5'], {sym: ['', 'W', 'H', 'W', 'W', 'H', '1½', 'H'], bpm: 100}),
    mel: line('A', 'minor', ['A4', 'B4', 'C5', 'D5', 'E5', 'F#5', 'G#5', 'A5'], {sym: ['', 'W', 'H', 'W', 'W', 'W', 'W', 'H'], bpm: 100}),
    iiv: satb('A', 'minor', [['A2 E3 C4 A4', 'i'], ['D2 F3 D4 A4', 'iv'], ['E2 E3 B3 G#4', 'V'], ['A2 E3 C4 A4', 'i']], {bpm: 56}),
    picardy: satb('A', 'minor', [['A2 E3 C4 A4', 'i'], ['D2 F3 D4 A4', 'iv'], ['E2 E3 B3 G#4', 'V'], ['A2 E3 C#4 A4', 'I']], {bpm: 56}),
  },
  quiz: [
    () => { const k = pick(MAJKEYS), s = scale(k + '4', 'major', 8), mn = pn(nm(s[5])), others = [s[1], s[2], s[3], s[4]].map(n => pn(nm(n))); return ask(`What is the relative minor of ${pn(k)} major?`, mn + ' minor', others.map(x => x + ' minor'), `It begins on the 6th degree of ${pn(k)} major.`); },
    () => { const k = pick(['A', 'E', 'B', 'D', 'G', 'C']), n = A.FIFTHS.minor ? A.FIFTHS.minor[k] : null; const fm = A.FIFTHS.major[k] - 3, d = x => x === 0 ? 'no sharps or flats' : x > 0 ? `${x} sharp${x > 1 ? 's' : ''}` : `${-x} flat${x < -1 ? 's' : ''}`;
      return ask(`How many sharps or flats does ${pn(k)} minor have?`, d(fm), [d(fm + 1), d(fm - 1), d(fm + 3), d(fm - 3)].filter(x => x !== d(fm)), `Take the parallel major (${pn(k)} major has ${d(A.FIFTHS.major[k])}) and add three flats.`); },
    bank([['Which scale degrees are lowered in natural minor, compared with the parallel major?', 'The 3rd, 6th and 7th', ['The 2nd, 5th and 7th', 'Only the 7th', 'The 4th and 6th'], 'That is why C minor has three flats.'],
      ['What is the parallel minor of E major?', 'E minor', ['C♯ minor', 'A minor', 'B minor'], 'Same tonic, different signature.'],
      ['How many possible diatonic triads does minor have?', '13', ['7', '9', '12'], 'Degrees 6 and 7 each have two forms.'],
      ['What is the difference between VII and vii° in A minor?', 'VII is G–B–D (natural 7th); vii° is G♯–B–D (raised 7th)', ['They are the same chord', 'VII is minor; vii° is major', 'VII is on the 6th degree'], 'The subtonic is a whole step below the tonic; the leading tone a half step.'],
      ['Which minor chords are most often used?', 'i, ii°, III, iv, V, VI, VII and vii°', ['Only i, iv and V', 'Only the harmonic minor chords', 'Seven major chords'], 'Both natural-minor and harmonic-minor chords appear.']]),
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
{{fig:pivot|C major to G major: A minor is vi in C and ii in G (the pivot), then D⁷ – G.}}
<p>Each of these topics has its own chapter with more detail: {{ch:secondary}}, {{ch:mixture}}, {{ch:neapolitan}} and {{ch:modulation}}.</p>`,
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
<h3>More rules of species counterpoint</h3>
<ul><li><b>Endings</b>: approach the final octave or unison by <b>contrary motion</b>, one voice ending ^7–^8 and the other ^2–^1. In a minor mode, raise the leading tone (add a sharp) at the final cadence.</li>
<li><b>Allowed leaps</b> in the line: 3rds, 4ths, 5ths, ascending minor 6ths and octaves; a large leap is followed by a step in the opposite direction. Avoid outlining a tritone, avoid repeating notes, and avoid repeating a note across a bar line.</li>
<li><b>Direct 5ths and octaves</b> (a perfect interval approached by similar motion) are not allowed. In second species avoid octaves, and fifths, on consecutive downbeats.</li>
<li><b>Third species</b> also allows the <b>cambiata</b> (“changing note”): a dissonant second quarter note left by a leap of a third.</li>
<li><b>Fourth species</b> begins with a half rest, ties the third beat of each bar over the bar line, and has a 7–6 suspension in the bar before the end. Suspensions above the cantus firmus are 4–3, 7–6 and 9–8.</li></ul>
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
    bank([['How should the final octave or unison be approached?', 'By contrary motion', ['By parallel motion', 'By a leap', 'By similar motion'], 'One voice ends 7–8, the other 2–1.'],
      ['What is a cambiata?', 'A dissonant second note of a bar left by a leap of a third (third species)', ['A suspension in fourth species', 'A cadence', 'A cantus firmus'], 'It is an allowed exception to stepwise dissonance.'],
      ['Which leaps are allowed in first-species lines?', '3rds, 4ths, 5ths, ascending minor 6ths and octaves', ['Any leap', 'Only steps', 'Leaps of a 7th'], 'Large leaps are followed by a step back.'],
      ['What are direct 5ths and octaves?', 'A perfect interval approached by similar motion', ['A 5th between three voices', 'A perfect interval held for a bar', 'A 5th at the start'], 'They are not allowed in species counterpoint.']]),
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
<p>Practise on the pieces you play in the app. Open any lesson or Library piece, play it through, and see where its phrases end.</p>
<p>More detail: {{ch:melody}} (motives and phrases), {{ch:phrases}} (periods, sentences, double periods), {{ch:popforms}} (verse–chorus, AABA, blues), {{ch:binaryternary}} and {{ch:sonatarondo}} (the large forms).</p>`,
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
{{fig:ties|A tie (same pitch) makes one long note: here a half note tied to a quarter lasts three beats, like a dotted half.}}
<h3>Common errors in rhythmic notation</h3>
<p>Rhythm is written to be <b>read at a glance</b>, so the page should show where the beats fall. Avoid these mistakes:</p>
<ul><li><b>Hiding the middle of a 4/4 bar.</b> A single long note that starts on beat 2 and lasts through beat 3 hides the half-bar. Write it as two notes joined by a tie, unless the syncopation is the point.</li>
<li><b>Beaming across the beat in the wrong place.</b> In 4/4 group eighth notes by beat (or by half bar) and not across the middle of the bar; in 6/8 beam in two groups of three, not three groups of two.</li>
<li><b>Using a dot where a tie is clearer.</b> A dot lengthens a note by half its value, but a dotted note must not make beat 2 or 3 disappear. Across a barline you must use a tie.</li>
<li><b>Untidy rests.</b> Use the rest that matches the length of silence and shows the beat. A whole rest fills <i>any</i> empty bar (in 3/4 as well as 4/4).</li>
<li><b>Bars that do not add up.</b> Check the sum of every bar against the time signature; only the first bar of a piece (a pickup, or <i>anacrusis</i>) and the last may be short.</li></ul>`,
  figs: {
    m34: rline([3, 4], ['q', 'q', 'q', 'h', 'q'], ['1', '2', '3', '1', '3']),
    m44: rline([4, 4], ['q', 'q', 'q', 'q', 'h', 'q', 'q'], ['1', '2', '3', '4', '1', '3', '4']),
    m68: rline([6, 8], ['q.', 'q.', 'e', 'e', 'e', 'e', 'e', 'e'], ['1', '2', '1', '', '', '2', '', '']),
    m128: rline([12, 8], ['q.', 'q.', 'q.', 'q.'], ['1', '2', '3', '4']),
    sync: rline([4, 4], ['e', 'q', 'e', 'q', 'q', 'e', 'q', 'e', 'h'], ['', 'syncopated', '', 'syncopated', '', '', '', '', '']),
    ties: {key: 'C', mode: 'major', clef: 'treble', bpm: 90, events: [{notes: ['C5~'], d: 'h'}, {notes: ['C5'], d: 'q'}, {notes: ['C5'], d: 'q'}, {notes: ['C5'], d: 'h.', sym: 'dotted half'}, {notes: ['C5'], d: 'q'}]},
  },
  quiz: [
    bank([['In 4/4, what is wrong with a half note starting on beat 2?', 'It hides the middle of the bar; use two tied quarter notes', ['It is always too loud', 'A half note can only start on beat 1', 'It makes the bar too long'], 'Show the half-bar unless syncopation is intended.'],
      ['How should eighth notes in 6/8 normally be beamed?', 'In two groups of three', ['In three groups of two', 'In one group of six', 'They are never beamed'], 'Each group is one dotted-quarter beat.'],
      ['Which rest fills an empty bar in 3/4?', 'A whole rest', ['A dotted half rest', 'Three quarter rests', 'A half rest'], 'The whole rest means “a full bar of silence” in any meter.'],
      ['When must you use a tie and not a dot?', 'When the note continues across a barline', ['When the note is short', 'When the music is fast', 'Never'], 'A dot only extends a note inside the bar.']]),
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
{{fig:phrase|The first phrase of Ode to Joy: two subphrases of two bars (a and b), ending on a half cadence.}}
<h3>More about changing a motive</h3>
<ul><li><b>Real or tonal inversion.</b> In a <i>real</i> inversion every interval is exactly mirrored (a major third up becomes a major third down). In a <i>tonal</i> inversion the mirror follows the scale of the key, so a third may be major in one place and minor in another. Bach’s Invention No. 1 inverts its first seven notes in bar 3; most inversions in this course are tonal.</li>
<li><b>Intervallic change</b> is looser than inversion: the rhythm is kept and the motive is clearly recognizable, but one or two intervals are different (as in “The Very Thought of You” and “I’m Not in Love”).</li>
<li><b>Rhythmic change</b> alters some but not all of the durations. In Beethoven’s <i>Pathétique</i> Sonata the opening motive has dotted rhythms in the slow introduction; in the development section the rhythm is changed and the motive is shortened when it is sequenced up a step.</li>
<li><b>Ornamentation</b> adds passing and neighbour tones to the motive, like the four-note motive of “Sir Duke”. <b>Extension</b> adds notes at the end when the motive returns.</li>
<li><b>Retrograde</b> (reversing the notes) is rare in tonal music, but occurs in pop (the hook of “Toxic”).</li>
<li><b>Transposition</b> is simply a <b>sequence</b>; it is so common that we do not call it an alteration.</li></ul>
<h3>Motives developed by Beethoven</h3>
<p>The first four bars of the main theme of Beethoven’s First Symphony contain four motives. Later in the movement he takes each one in turn and develops it by sequence: motive 1 alone, motive 2 alone, motives 2 and 3 together and motive 4. Pulling motives out of a theme and developing them is the usual method of Classical composers.</p>
<h3>Phrases: length and completion</h3>
<p>A phrase gives a sense of completion. In classical music this is a <b>cadence</b>: every phrase ends on one of the four cadence types (authentic, half, deceptive or, less often, plagal). Most phrases have <b>four bars</b>, but eight is also common, and phrases of five, six, seven (rare, often involving an elision) and three bars exist. In popular music a phrase is often complete when a lyric line is finished or when a melody reaches four bars, even without a cadence: “My Girl” and “I’m Every Woman” have four-bar phrases that sound complete, and “Irreplaceable” has a five-bar phrase ending on a borrowed minor iv. A six-bar phrase ends the Minuet of Mozart’s Symphony No. 40 on V⁷ – i.</p>
<h3>Subphrases</h3>
<p>A <b>subphrase</b> is a unit between a motive and a phrase; most are <b>two bars</b> long. Name subphrases with letters: <b>a</b>, <b>b</b>. If a subphrase returns with a small change, add a <b>prime</b>: <b>a′</b> (“a prime”); a second change gives <b>a″</b> (“a double prime”). A subphrase that is only <b>transposed</b> (a sequence) keeps the same name, <b>a</b>.</p>
{{fig:subph|Two subphrases: a (bars 1–2) and a′ (bars 3–4), which begins the same way but ends differently.}}
<p>How do you tell a motive from a subphrase? A motive is short (two to seven notes); a subphrase has six or more notes and fills two bars. Many pieces have ideas at all three levels: in “Don’t Stop Believin’” you can hear motives, subphrases and phrases at once. Sometimes it is more helpful to name the subphrases and skip the motives, if the motives are not extracted and developed.</p>
<h3>How to analyze a melody</h3>
<ol><li>Number the <b>motives</b> (1, 2…) and mark where one is altered.</li><li>Letter the <b>subphrases</b> (a, a′, b…).</li><li>Mark the <b>phrases</b> and name each cadence.</li><li>Write the chords, then circle the non-chord tones in the melody.</li></ol>`,
  figs: {
    subph: line('C', 'major', ['C4', 'D4', 'E4', 'C4', 'G4', 'E4', 'D4', 'C4', 'C4', 'D4', 'E4', 'C4', 'A4', 'G4', 'F4', 'E4'], {bpm: 90, d: 'q', sym: ['a', '', '', '', '', '', '', '', 'a′', '', '', '', '', '', '', '']}),mot: mfig(MOTIVE_BARS), aug: mfig(AUG_BARS), phrase: twoLines('major', 'C', ODE4, ODE_BASS.slice(0, 5), 100)},
  quiz: [
    bank([['How long is a typical subphrase?', 'Two bars', ['One bar', 'Four bars', 'Eight bars'], 'Most phrases have four bars, divided into two subphrases.'],
      ['How do you label a subphrase that returns with a small change?', 'a′ (a prime)', ['b', 'A', 'a with a line over it'], 'A second change gives a″.'],
      ['What do you call a subphrase that is just transposed (a sequence)?', 'The same letter, a', ['a′', 'b', 'A′'], 'A sequence is not counted as an alteration.'],
      ['What is the difference between real and tonal inversion?', 'Real keeps exact intervals; tonal follows the scale of the key', ['Real is upside down; tonal is backwards', 'They are the same', 'Tonal changes the rhythm'], 'In tonal inversion a third may be major or minor as the key demands.'],
      ['Which alteration keeps the rhythm but changes some of the intervals?', 'Intervallic change', ['Rhythmic change', 'Augmentation', 'Retrograde'], 'The motive stays recognisable.'],
      ['How does a phrase in a classical piece end?', 'With a cadence', ['With a rest', 'With a trill', 'With a change of key signature'], 'In popular music it may end with the lyric line.'],
      ['Which has more notes: a motive or a subphrase?', 'A subphrase (six or more notes)', ['A motive', 'They are the same size', 'Neither has notes'], 'Motives have two to seven notes.']]),
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
<p>An <b>elision</b> joins phrases by overlap: the last bar of one phrase is also the first bar of the next, so the cadence is the start of the following music and the flow does not stop.</p>
<h3>Real examples</h3>
<ul><li><b>Sentence:</b> in the opening of Mozart’s Piano Sonata K. 331 the first motive is sequenced down a step in bar 2, bar 3 has related material and bar 4 reaches the cadence. In Beethoven’s Op. 2 No. 1 the intervals of subphrase a change in bars 3–4 to fit the dominant harmony, motive 2 is taken from a and a′ in bars 5–6, and bars 7–8 lead to a half cadence. In K. 333 unrelated material follows subphrase a and its repetition.</li>
<li><b>Period with HC then PAC (parallel):</b> the opening of Mozart’s K. 331 is both: its two phrases are sentences. <b>IAC then PAC (parallel):</b> Haydn’s Piano Sonata Hob. XVI:9 (finale), Beethoven’s “Für Elise” and Bill Withers’s “Lean on Me”.</li>
<li><b>Contrasting period:</b> the second movement of Beethoven’s <i>Pathétique</i> Sonata and Schumann’s “Little Morning Wanderer”.</li>
<li><b>Asymmetrical period:</b> Chopin’s Prelude Op. 28 No. 20 has one antecedent phrase and two consequent phrases. <b>Double period:</b> Beethoven’s Op. 10 No. 1, second movement (parallel, with an a b a b′ plan). <b>Repeated period (not double):</b> Beethoven’s Op. 53, first movement, where each phrase is ornamented the second time.</li>
<li><b>Phrase group:</b> Couperin’s “Le Petit-Rien”. <b>Phrase chain:</b> the rondo of Beethoven’s Sonatina in F, Anh. 5 No. 2.</li>
<li><b>Elision:</b> the opening of Mozart’s <i>Eine kleine Nachtmusik</i>: the last bar of one phrase is also the first of the next.</li></ul>
<h3>More about cadences in periods</h3>
<p>Conclusive cadences end on the tonic; inconclusive ones do not. A PAC is more conclusive than an IAC. A root-position plagal cadence can follow an inverted IAC and count as more conclusive. A period normally has either <b>an HC then an authentic cadence (IAC or PAC)</b> or <b>an IAC then a PAC</b>. In a double period the antecedent group may be an IAC followed by an HC; look at how many phrases there are before labelling the cadence schemes, and not at pairs only.</p>
<h3>Labelling phrases</h3>
<p>Use letters for melodic material (a, b, c) and the <b>prime</b> (′) when a phrase returns with the same beginning but a <b>different cadence</b>. In this chapter the prime is only for a different cadence, not for ornamentation or a new accompaniment. If you need more than a″ or a‴, use subscripts (a₁, a₂, a₃). A section that is the same phrase twice is called a <b>repeated phrase</b> (or repeated period if there are four). A complete diagram uses cadence abbreviations (HC, DC, PC, IAC, PAC) with the letters, for example a · HC | a′ · PAC.</p>
<h3>How to analyze a passage</h3>
<ol><li>Label the chords at the end of each phrase to find the cadence.</li><li>Name the cadence (PAC, IAC, HC, PC, DC).</li><li>Study the motives: is a phrase a sentence?</li><li>Draw the diagram and name the form: sentence, parallel period, contrasting period, asymmetrical period, parallel double period, repeated phrase, phrase group or phrase chain.</li></ol>`,
  figs: {},
  quiz: [
    bank([['What is a repeated period?', 'Four phrases that are the same period twice, not a double period', ['A period that repeats the cadence', 'A period in two keys', 'A period of eight phrases'], 'The cadence after the second phrase gives it away.'],
      ['What does a prime (′) show in this chapter?', 'The phrase begins the same but ends with a different cadence', ['The phrase is ornamented', 'The phrase is transposed', 'The phrase is louder'], 'It is not for ornamentation or a change of texture.'],
      ['Which pair of cadences normally forms a period?', 'HC then authentic, or IAC then PAC', ['PAC then HC', 'DC then HC', 'PC then PC'], 'The last cadence is more conclusive.'],
      ['How many phrases does an asymmetrical period have?', 'Three or five', ['Two', 'Four', 'Eight'], 'The antecedents and consequents are unequal in number.'],
      ['What ends a phrase group or phrase chain?', 'A half cadence', ['A PAC', 'A plagal cadence', 'A deceptive cadence'], 'That is why they are not periods.'],
      ['What difference is there between a phrase group and a phrase chain?', 'In a group the phrases begin alike; in a chain they contrast', ['Group is in major, chain in minor', 'Group has four phrases, chain has two', 'There is no difference'], 'Both end on a half cadence.']]),
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
<p>To make a new section sound different, change one or more of the <b>elements of music</b>: melody, harmony (key or chord pattern), rhythm, timbre (instrument or voice), texture, dynamics and articulation (loud or soft, staccato or legato) and tempo. A chorus is often louder and thicker than a verse, a bridge often moves to a new key or a new pattern.</p>
<h3>Vertical and horizontal texture</h3>
<p>Texture has two dimensions. The <b>vertical</b> dimension is how many notes (or voices) sound at once: Barber’s <i>Adagio for Strings</i> has a chord of five voices with a sixth, the melody, above it. The <b>horizontal</b> dimension is how busy the rhythm is: in Barber the values are slow; in the finale of Mozart’s String Quartet K. 428 there are only four voices, but sixteenth notes and syncopations make the texture very active. Always ask both questions when you listen: <i>how many layers? how fast do they move?</i></p>
<h3>Melody with accompaniment: more detail</h3>
<ul><li><b>Chorale texture</b> may be “nearly” homorhythmic: in Schubert’s <i>Die Nebensonnen</i> the melody sometimes moves in a different rhythm from the chords beneath it, and in pop (“Some Nights”) the chords follow the vocal line almost note for note.</li>
<li><b>Arpeggiated accompaniments</b> often pair an arpeggio in one part with a bass line in octaves below (Beethoven’s piano sonatas), or a broken chord over a pedal tone.</li>
<li><b>Block chords</b> can be played as quarter notes, as eighth notes or in a rhythm of your own: the pattern of the accompaniment is often the signature of a song.</li>
<li><b>Afterbeats</b> (a term from Schoenberg) are repeated chords after the beat, usually in eighth notes; the afterbeats can also be passing-tone figures harmonized in thirds rather than repeated chords, as in some Classical sonatas.</li></ul>
<h3>Distinctive bass lines and riffs</h3>
<p>Sometimes a song is known by its <b>bass line</b> or by a <b>guitar riff</b>, a short repeated pattern: the bass lines of “Day Tripper”, “Good Times”, “Another One Bites the Dust”, “Superfreak” and “Under Pressure”, or the guitar riffs of “You Really Got Me”, “Immigrant Song” and “Walk This Way”. A riff is an ostinato that also tells you the harmony, so analyze it by writing the chord that each bass note supports.</p>
<h3>Listening to texture</h3>
<p>The goal of this chapter is not a catalog but awareness. When you hear any accompaniment, name (1) the pattern (chorale, arpeggio, block chords, afterbeats…), (2) its rhythm (including cross-rhythms such as 3 + 3 + 2) and (3) what changes when a new section begins.</p>`,
  figs: TEX,
  quiz: [
    bank([['What does the vertical dimension of texture describe?', 'How many notes or voices sound at once', ['How fast the rhythm is', 'The key of the music', 'The loudness'], 'The horizontal dimension is the activity of the rhythm.'],
      ['What are afterbeats?', 'Repeated chords played after the beat', ['Notes before the downbeat', 'The last beat of a bar', 'A kind of trill'], 'The term comes from Schoenberg.'],
      ['What is a riff?', 'A short repeated pattern, often in the bass or on guitar', ['A very long melody', 'A cadence', 'A change of key'], 'It is a kind of ostinato.'],
      ['Which is a four-voice texture with very busy rhythm?', 'A string quartet with sixteenth notes', ['A slow chorale', 'A single melody', 'A held chord'], 'Voices are few, but the rhythm is active.'],
      ['What two questions do you ask when listening to texture?', 'How many layers, and how fast do they move?', ['What key and what tempo?', 'Who wrote it and when?', 'How loud and how high?'], 'One question is vertical, one is horizontal.']]),
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

/* ================= Four-part writing in detail; chromatic harmony ================= */
const modEx = (title, pairs, help) => () => { const [k1, k2] = pick(pairs); return {title: title.replace('{k1}', pn(k1)).replace('{k2}', pn(k2)), help: help || 'Play each chord in turn. The chords after the pivot belong to the new key.', steps: [chordStep('I', k1, 'major'), chordStep('vi', k1, 'major'), chordStep('V7', k2, 'major'), chordStep('I', k2, 'major')]}; };
const triadSet = (key, mode) => (mode === 'major' ? ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] : ['i', 'ii°', 'III', 'iv', 'V', 'VI', 'vii°']).map(s => symOf(rn(s, key, mode)));
CH.push({id: 'vldetails', title: 'Voice leading in detail', blurb: 'Rules of melody, inversions and doubling, bass motion, sevenths, non-chord tones',
  body: `<p>{{ch:voiceleading}} gave the basic rules. Here they are applied to the chords of the earlier chapters. The model is the style of J. S. Bach’s chorales, in which every voice is a singable melody.</p>
<h3>Rules of melody (each voice)</h3>
<ul><li>Move mostly by <b>step</b>; keep leaps small and avoid augmented intervals.</li><li>A leap larger than a 4th, or any leap of a diminished interval, should be followed by a step in the <b>opposite</b> direction.</li><li>Consecutive leaps in the same direction should outline a triad.</li><li>Each voice stays in its range and no two voices cross or leap past each other.</li></ul>
<h3>Triads in root position</h3>
<p><b>Double the root</b>: the bass is the root, so the root appears again in an upper voice. How the upper voices move depends on how far the <b>bass</b> moves:</p>
<table class="htab"><tr><th>Bass moves by a 3rd or 6th</th><td>keep two common tones and move the third voice by step</td></tr>
<tr><th>Bass moves by a 2nd</th><td>move all three upper voices in <b>contrary motion</b> to the bass (exception: the deceptive progression V–vi: the leading tone rises, the other voices move down)</td></tr>
<tr><th>Bass moves by a 4th or 5th</th><td>either keep one common tone and move the other two voices by step, or move all upper voices in the same direction to the nearest chord tones</td></tr></table>
<h3>First- and second-inversion triads</h3>
<ul><li><b>First inversion</b>: do <b>not</b> double the bass (the third). Double the root or the fifth, whichever makes the smoothest line. Exceptions: in a first-inversion <b>diminished</b> triad (vii°⁶) double the third (the bass), and never double the leading tone, so never the third of V. In a row of first-inversion chords, alternate which note is doubled.</li>
<li><b>Second inversion</b>: <b>double the fifth</b> (the bass). It is used as a cadential, passing or pedal (neighbour) six-four chord.</li>
<li>When the roots of two chords are a 2nd apart, check for parallel fifths: put the fifth of one chord below the root of the other.</li></ul>
{{fig:inv|I – I⁶ – ii⁶ – V – I. In I⁶ and ii⁶ the bass (the third) is not doubled; the doubled notes are the root (I⁶) and the fifth (ii⁶).}}
<h3>Seventh chords</h3>
<p>One general rule: <b>the seventh resolves down by step</b>; every other voice moves smoothly to the nearest chord tone. The leading tone rises to the tonic. For <b>V⁷ → I</b> there are two good solutions: a <b>complete V⁷ → incomplete I</b> (no fifth, tripled root), or an <b>incomplete V⁷</b> (no fifth) → <b>complete I</b>. In a circle-of-fifths chain of root-position seventh chords, <b>alternate complete and incomplete chords</b>. The fully and half-diminished seventh chords on the leading tone are made only of tendency tones, so check that resolving them does not create parallel fifths.</p>
{{fig:v7inc|Incomplete V⁷ (no fifth) resolving to a complete I: the seventh F falls to E, the leading tone B rises to C.}}
<h3>Adding non-chord tones</h3>
<p>Decorate a plain chord progression with passing tones, neighbours, suspensions and the rest ({{ch:nonchord}}), but first find the fifths and octaves in the original: a non-chord tone must not turn into a parallel fifth or octave. Avoid decorating two voices on the same beat unless they move in parallel thirds or sixths.</p>
<h3>The deceptive progression</h3>
<p>When the bass moves by a second in a deceptive progression (V – VI in minor), always move the <b>third of V up by step</b> while the other voices move in contrary motion to the bass. This produces a doubled third in VI. In major, use the same solution if scale degree 7 is in the soprano (because it is a tendency tone); if the leading tone is in an inner voice it may fall instead.</p>
{{fig:dcmin|V – VI in C minor: the third of V (B) rises to C, the soprano and tenor move down, and the third (C) is doubled in VI.}}
<h3>When the bass repeats</h3>
<p>When the bass note stays, either repeat the upper notes, or <b>change the position</b> of the upper notes (arpeggiate them to different chord members) while keeping the correct doubling (root, root, third, fifth).</p>
<h3>Parallel fifths between roots a second apart</h3>
<p>When two chords have roots a second apart (even when inverted), revoice each so that the fifth of the chord lies below the root of the chord in the upper voices: then you get parallel <i>fourths</i> (acceptable) rather than parallel fifths, as in ii⁶ – I⁶ and I – vii°⁶.</p>
<h3>Doubling at a glance</h3>
<table class="htab"><tr><th>Root position</th><td>double the bass (the root)</td></tr><tr><th>First inversion</th><td>do not double the bass; exceptions: vii°⁶ and ii°⁶ (double the bass), and consecutive first-inversion chords (alternate)</td></tr><tr><th>Second inversion</th><td>double the bass (the fifth)</td></tr></table>
<p>Bass moves by a <b>3rd or 6th</b>: hold two common tones and move one voice by step. By a <b>4th or 5th</b>: hold one common tone and move two voices by step, or move all upper voices the same direction. By a <b>2nd</b>: move the upper voices contrary to the bass (except in the deceptive progression). Keep track of what each voice doubles.</p>
<h3>More about seventh chords</h3>
<ul><li>The one exception to “the seventh falls” is I – V⁴₃ – I⁶, as in the main theme of Mozart’s Piano Sonata K. 331: the seventh rises. The resulting parallel fifths are unequal (one is diminished), which was thought acceptable.</li>
<li>In a circle of fifths with <b>inverted</b> seventh chords, resolve every seventh down by step: two voices stay on common tones (tied) while two resolve down.</li>
<li>When V⁴₃ goes to V⁷, watch for parallel fifths if the fifth is above the root; move the upper voices upward to the nearest chord notes or use an incomplete V⁷.</li>
<li>If ^7 is not in the soprano in V⁷ – I, you may resolve it down a third (to the fifth of I), with a complete I.</li>
<li>In piano music the seventh sometimes resolves “wrongly” to suit the hand; this is not accepted in voice-leading exercises.</li></ul>
<h3>Resolving vii°⁷ and viiø⁷</h3>
<p>These chords consist only of tendency tones (7, 2, 4, 6), and resolving all of them can create parallel fifths. The rule: when the <b>seventh of the chord is voiced above the third</b>, resolve the third (scale degree 2) <b>up</b> by step while 4 → 3, 6 → 5 and 7 → 8. If the seventh is below the third, resolve every voice normally. Revoicing the chord (parallel fourths are fine here) is another solution.</p>
{{fig:vii7|viiø⁷ – I in C major: the 7th (A) is above the 3rd (D), so D rises to E instead of falling to C.}}
<h3>When to use seventh chords</h3>
<p>Use sevenths to add tension as you approach the tonic: they occur most in the dominant chords (V, vii°) and pre-dominants (ii, less often IV). Chords such as iii⁷, vi⁷, IVM7 and IM7 are less common in the classical style.</p>
<h3>Voice leading chromatic chords</h3>
<ul><li><b>Secondary chords</b>: resolve the seventh down by step and alternate complete and incomplete chords in successive root-position sevenths. The chromatic third of a secondary dominant falls by half step to the seventh of the next chord, which cancels the chromaticism. A secondary vii°⁷ or viiø⁷ follows the vii°⁷ rule above. Exception: vii°⁷/V – V, where the melody requires the seventh above the third: write parallel (unequal) fifths rather than doubling the leading tone.</li>
<li><b>Borrowed chords</b>: handle them like the diatonic version (iiø⁷ like ii⁷). When ♭6 is a chord member, <b>resolve it down by step</b>. V – ♭VI is voiced like the deceptive cadence in minor: the third of V rises, the others move contrary to the bass. For ♭III, ♭VII, i and v there are no special rules.</li>
<li><b>Neapolitan sixth</b>: double the bass (the third) and resolve ♭2 down to the nearest note in the next chord.</li>
<li><b>Augmented sixths</b>: ♯4 almost always rises to 5, whether the chord goes to V, to the cadential six-four or elsewhere. Exception: if it resolves to V⁷, ♯4 falls to ♮4, the seventh of V⁷. In the “enharmonic German” sixth (♭6, 1, ♯2, ♯4), ♯2 and ♯4 rise to members of a major chord.</li></ul>
<h3>Adding non-chord tones: recipes</h3>
<ul><li>A repeated note: add an upper or lower <b>neighbor</b>.</li>
<li>A falling or rising step: add a <b>suspension</b> (delay the resolution), an <b>escape tone</b> (step in the opposite direction, then leap), a <b>chromatic passing tone</b> or an <b>appoggiatura</b> (leap one step past the note of resolution, put it on the beat and move the resolution after the beat).</li>
<li>A leap of a third: fill it with a passing tone; a leap of a 4th or more: do not embellish.</li>
<li>When two voices embellish on the same beat, they should make <b>consonant intervals</b> (3rds, 5ths, 6ths, 8ves); if they cannot, stagger them rhythmically. First mark the 5ths and 8ves of the plain progression and do not let a non-chord tone slide into one of them.</li></ul>`,
  figs: {
    dcmin: block('C', 'minor', [['G2 D3 B3 G4', 'V'], ['Ab2 C3 C4 Eb4', 'VI']], {bpm: 56, d: 'h'}),
    vii7: block('C', 'major', [['B2 F3 D4 A4', 'viiø⁷'], ['C3 E3 E4 G4', 'I']], {bpm: 56, d: 'h'}),
    inv: satb('C', 'major', [['C3 G3 E4 C5', 'I'], ['E3 G3 C4 C5', 'I⁶'], ['F3 A3 D4 A4', 'ii⁶'], ['G3 B3 D4 G4', 'V'], ['C3 C4 E4 G4', 'I', 'h']], {d: 'h', bpm: 60}),
    v7inc: satb('C', 'major', [['G2 G3 F4 B4', 'V⁷ (no 5th)'], ['C3 G3 E4 C5', 'I']], {bpm: 60}),
  },
  quiz: [
    bank([['In the deceptive progression V – VI in minor, which note rises by step?', 'The third of V (the leading tone)', ['The root of V', 'The fifth of V', 'No note rises'], 'The third of VI is doubled as a result.'],
      ['When may the seventh of a V⁷ chord rise?', 'In the I – V⁴₃ – I⁶ progression, as in Mozart K. 331', ['Never', 'Always in the soprano', 'Only in minor'], 'The resulting parallel fifths are unequal.'],
      ['In vii°⁷ – I, when the seventh is above the third, which voice rises?', 'The third (scale degree 2)', ['The root', 'The fifth', 'The bass'], 'That avoids parallel fifths.'],
      ['How do you double the Neapolitan sixth in four parts?', 'Double the bass (the third) and resolve ♭2 down', ['Double the fifth', 'Never double anything', 'Double ♯4'], 'N⁶ is a first-inversion chord.'],
      ['Which scale degree in an augmented sixth chord usually rises to 5?', '♯4', ['♭6', '1', '3'], 'The exception is a resolution to V⁷, where it falls to ♮4.'],
      ['What should you do with ♭6 in a borrowed chord?', 'Resolve it down by step', ['Double it', 'Resolve it up', 'Leave it as a pedal'], 'It is a tendency tone.'],
      ['Two voices both embellish on the same beat. What intervals should they make?', 'Consonant ones: 3rds, 5ths, 6ths or 8ves', ['Seconds and sevenths', 'Tritones', 'Unisons only'], 'Otherwise stagger them rhythmically.']]),
    () => { const r = pick(['C', 'G', 'F', 'D', 'A', 'Bb']), q = pick(['major', 'minor']), c = chordFromRoot(R(r), q), inv = pick([0, 1, 2]), ruleNote = [c[0], c[0], c[2]][inv];
      const where = ['root position', 'first inversion', 'second inversion'][inv], right = inv === 0 ? 'the root' : inv === 1 ? 'the root or the fifth' : 'the fifth (the bass)';
      return ask(`In four-part writing, what is normally doubled in the ${pn(r)} ${q === 'minor' ? 'minor ' : ''}triad in ${where}?`, right, ['the root', 'the root or the fifth', 'the fifth (the bass)', 'the third', 'the leading tone'], inv === 0 ? 'Double the root (the bass).' : inv === 1 ? 'Do not double the bass; the root or the fifth, whichever moves most smoothly.' : 'Double the fifth, which is the bass.'); },
    () => { const [d, m] = pick([['3rd or 6th', 'keep two common tones and move one voice by step'], ['2nd', 'move the upper voices in contrary motion to the bass'], ['4th or 5th', 'keep one common tone and move two voices by step, or move all upper voices the same way']]); return ask(`In root-position triads, the bass moves by a ${d}. What do the upper voices do?`, m, ['keep two common tones and move one voice by step', 'move the upper voices in contrary motion to the bass', 'keep one common tone and move two voices by step, or move all upper voices the same way', 'leap in parallel with the bass'], 'This is the usual summary of root-position voice leading.'); },
    bank([['What happens to the seventh of a seventh chord?', 'It resolves down by step', ['It rises by step', 'It is doubled', 'It leaps up a fourth'], 'This is the one general rule for seventh chords.'],
      ['What is the best way to voice a circle-of-fifths chain of root-position seventh chords?', 'Alternate complete and incomplete chords', ['Always use complete chords', 'Always omit the root', 'Always double the third'], 'This avoids parallel fifths and keeps the voices smooth.'],
      ['In a first-inversion diminished triad (vii°⁶), what is doubled?', 'The third (the bass)', ['The root', 'The fifth', 'Nothing is doubled'], 'The root is the leading tone, which must not be doubled.'],
      ['Which note must never be doubled in V?', 'The third (the leading tone)', ['The root', 'The fifth', 'The bass'], 'The leading tone must rise to the tonic.'],
      ['What follows a large leap in a melody line?', 'A step in the opposite direction', ['Another leap the same way', 'A rest', 'A repeated note'], 'It makes the line singable.'],
      ['Which note is doubled in a second-inversion triad?', 'The fifth (the bass)', ['The root', 'The third', 'The seventh'], 'Cadential, passing and pedal six-four chords all double the bass.']]),
  ],
  play: [progEx('Play I – I⁶ – ii⁶ – V – I in {key}', ['I', 'I6', 'ii6', 'V', 'I'], () => pick(['C', 'G', 'F']), 'major', 'The bass note of each inverted chord must be the lowest note you play.'),
    progEx('Play V⁷ – I in {key} (the leading tone and seventh resolve)', ['V7', 'I'], () => pick(['C', 'G', 'F', 'D']), 'major'),
    progEx('Play a circle of fifths with sevenths in {key}: ii⁷ – V⁷ – I', ['ii7', 'V7', 'I'], () => pick(['C', 'G', 'F']), 'major')]});

const SECD = ['V7/ii', 'ii', 'V7/iii', 'iii', 'V7/IV', 'IV', 'V7/V', 'V', 'V7/vi', 'vi'];
CH.push({id: 'secondary', title: 'Secondary dominants and diminished chords', blurb: 'Tonicizing the chords of the key; how to analyze and write them; irregular resolutions',
  body: `<p>To <b>tonicize</b> a chord is to treat it, for a moment, like a tonic by approaching it with its own dominant. A <b>secondary dominant</b> is a major triad or a major–minor seventh chord that resolves to (or tonicizes) a chord other than I. The Roman numeral after the slash names the chord being tonicized: <b>V⁷/V</b> is “the V⁷ of V”, D⁷ in C major.</p>
{{fig:secd|The secondary dominants of C major, each followed by the chord it tonicizes: V⁷/ii – ii, V⁷/iii – iii, V⁷/IV – IV, V⁷/V – V, V⁷/vi – vi.}}
<ul><li>Their chromatic note is usually a <b>raised</b> note that acts as the leading tone of the target. The one lowered note is the 7th of V⁷/IV (B♭ in the C⁷ of C major), which acts as the 4th degree of F.</li>
<li>Only <b>major and minor</b> chords are tonicized. Diminished chords (vii° in major, ii° in minor) are not, because an unstable chord does not sound like a tonic.</li>
<li>In C major the D⁷ that leads to G is labelled V⁷/V, not II⁷: the label shows its function.</li></ul>
<h3>How to analyze a secondary dominant</h3>
<ol><li>Stack the chord in thirds. Is it a major triad or a major–minor seventh chord? If not, it is not a secondary dominant.</li><li>Find the note a <b>perfect fifth below</b> its root. If that note is the root of a diatonic chord, the chord is the secondary dominant of it.</li></ol>
<h3>How to write one</h3>
<p>Find the root of the chord being tonicized, then find the key in which that chord would be I. Build the V or V⁷ of that key: for V⁷/ii in C major, ii is D, the dominant of D is A, so the chord is A–C♯–E–G.</p>
<h3>Secondary diminished chords</h3>
<p>The leading-tone chord has dominant function, so a <b>vii°</b> (triad, vii°⁷ or viiø⁷) built on the leading tone of any major or minor chord can approach it. Its root is a <b>minor 2nd below</b> the root of the target. Minor chords are tonicized by <b>fully diminished</b> sevenths, major chords usually by <b>half-diminished</b> sevenths (fully diminished ones also work).</p>
{{fig:secdim|vii°⁷/V – V, vii°⁷/vi – vi, viiø⁷/V – V and vii°⁷/ii – ii in C major.}}
<h3>Irregular resolutions</h3>
<p>A secondary chord does not have to resolve to the chord it tonicizes. Common irregular resolutions are the <b>deceptive</b> kind, such as V⁷/vi going to IV instead of vi (the A♭ ... resolving sideways), or a secondary dominant used simply to <b>colour</b> and intensify a pre-dominant or the dominant itself.</p>
<h3>Why tonicize?</h3>
<p>Sing the bass of a chain of secondary dominants (I – V⁶/ii – ii – V⁶/iii – iii – V⁶/IV – IV – V⁶/V – V – V⁶/vi – vi…). Each secondary chord is chromatic and so it <b>intensifies the drive</b> to the next chord, like a tiny dominant. Secondary dominants are common in classical music (Verdi’s “La donna è mobile”, Tchaikovsky’s Nutcracker) and in pop (“Yesterday”, “Don’t Know Why”, “I Want You to Want Me”, “Saturday in the Park”).</p>
<p>A chord may be labelled with a Roman numeral for its own root (D⁷ in C major is II⁷), but this hides what it does: it leads to G, the dominant. The label <b>V⁷/V</b> says that. Because ii is minor (and in minor ii° is diminished), an uppercase II is itself a chromatic harmony; the correct label is V/V. Diminished chords (vii° and ii°) are not tonicized, because an unstable chord does not sound like a tonic; there is no V/vii°.</p>
<h3>Secondary dominants in minor</h3>
<p>The same ideas apply in minor: triads and seventh chords that are major or major–minor tonicize minor or major targets. In A minor: V⁷/iv = A⁷, V⁷/V = B⁷, V⁷/VI = C⁷, V⁷/VII = D⁷ and V⁷/III = G⁷. (V/III is the same chord as VII and V/iv = I with a major third.) The raised notes act as leading tones; in major the only secondary dominant with a <b>lowered</b> note is V⁷/IV, whose B♭ is the 4th degree of F.</p>
{{fig:secmin|Secondary dominant sevenths in A minor: V⁷/iv, V⁷/V, V⁷/VI, V⁷/VII and V⁷/III.}}
<p>Be careful with F major in C minor: if it goes to B♭ it is V/VII; if it has pre-dominant function and moves to G (in any inversion) or B°, it is simply IV. The <b>function</b>, not the notes alone, decides. B♭⁷ is correctly labelled V⁷/III or VII⁷, since both lead to III.</p>
<h3>Irregular resolutions: some real cases</h3>
<ul><li>V/V resolving to <b>IV</b> in place of V: “Yesterday”, “Forget You” (IV can substitute for V in pop).</li>
<li>V/V resolving to <b>♭VII</b> in a major key: “I Want You to Want Me”.</li>
<li>V⁷/IV going to <b>ii</b> in place of IV: the C⁷ in “Baby Love”. Its B♭ falls to A, which becomes the fifth of Dm instead of the third of F.</li>
<li><b>V/vi going to IV</b>: a very common deceptive move (“(Sittin’ on) the Dock of the Bay”, “Imagine”, a Beethoven sonata). You can hear it as a chromatic version of iii – IV, or as V/vi to VI/vi, a deceptive move within the vi area.</li></ul>
<p>The conclusion: secondary chords do not always resolve strictly to the chord they appear to tonicize.</p>
<h3>Secondary diminished chords in detail</h3>
<p>Because vii° has dominant function, diminished triads and half- or fully diminished sevenths tonicize any chord above a half step. The chords are <b>chromatic</b> in an essential way (unlike chromatic passing notes). A good sequence to hear is I – vii°⁷/ii – ii – vii°⁷/iii – iii – viiø⁷/IV – IV… A few rules:</p>
<ul><li><b>Minor</b> triads are tonicized by <b>fully diminished</b> sevenths.</li>
<li><b>Major</b> triads are traditionally tonicized by <b>half-diminished</b> sevenths, but fully diminished ones can be used too.</li>
<li>In minor, vii°/III is not listed because it is ii°: the chord iiø⁷ has the same notes as viiø⁷/III but a different function (iiø⁷ goes to V; viiø⁷/III goes to III).</li>
<li>To analyze: stack in thirds; if the quality is diminished or half-/fully-diminished seventh, find the note a <b>minor second above</b> its root; if that is the root of a diatonic chord, you have found the tonicized chord. G♯ up a minor second is A, which is 5 in D major, so G♯° is vii°/V in D.</li>
<li>To write: find the root of the target, go a minor second below for the root of the vii°⁷, and build the chord. For vii°⁷/iv in C minor: iv is F, a minor second below is E, so build E–G–B♭–D♭.</li></ul>
<p>Examples: Bach’s “Jesu, Joy of Man’s Desiring”, the “Trepak” in Tchaikovsky’s Nutcracker, Billy Joel’s “Just the Way You Are” and Queen’s “We Are the Champions”.</p>`,
  figs: {
    secmin: block('A', 'minor', [['A2 C#4 E4 G4', 'V⁷/iv'], ['B2 D#4 F#4 A4', 'V⁷/V'], ['C3 E4 G4 Bb4', 'V⁷/VI'], ['D3 F#4 A4 C5', 'V⁷/VII'], ['G2 B3 D4 F4', 'V⁷/III']], {bpm: 70, d: 'h'}),
    secd: {key: 'C', mode: 'major', clef: 'treble', bpm: 70, events: SECD.map(s => { const c = rn(s, 'C', 'major'); return {notes: c.notes, d: 'h', rn: fmt(s), sym: symOf(c)}; })},
    secdim: prog('C', 'major', ['vii°7/V', 'V', 'vii°7/vi', 'vi', 'viiø7/V', 'V', 'vii°7/ii', 'ii'], {d: 'h', bpm: 70}),
  },
  quiz: [
    bank([['Why is there no secondary dominant of vii°?', 'A diminished chord is too unstable to sound like a tonic', ['It is too high', 'It has no root', 'It is never used in major'], 'Only major and minor chords are tonicized.'],
      ['What does V/V resolve to normally, and what can it replace in pop?', 'V; IV can substitute for V', ['I; vi', 'IV; ii', 'vi; iii'], 'Yesterday goes V/V to IV.'],
      ['Which chords tonicize minor triads (in secondary diminished chords)?', 'Fully diminished sevenths', ['Half-diminished sevenths only', 'Augmented triads', 'Dominant sevenths'], 'Major triads are traditionally tonicized by half-diminished sevenths.'],
      ['How do you find the tonicized chord of a secondary diminished chord?', 'Go a minor second above its root', ['Go a fifth below the root', 'Go a third above the root', 'Go an octave'], 'The diminished chord resolves up by half step.'],
      ['What is V/vi going to IV an example of?', 'An irregular (deceptive) resolution of a secondary chord', ['A half cadence', 'A modulation', 'A pedal point'], 'It is common in rock and in Beethoven.']]),
    () => { const k = pick(['C', 'G', 'F', 'D']), t = pick(['ii', 'iii', 'IV', 'V', 'vi']), c = rn('V7/' + t, k, 'major'), tc = rn(t, k, 'major'); return ask(`In ${pn(k)} major, which chord leads to ${symOf(tc)} as its dominant seventh?`, symOf(c), ['ii', 'iii', 'IV', 'V', 'vi'].map(x => symOf(rn('V7/' + x, k, 'major'))), `The V⁷ of ${t}: a perfect fifth above ${pn(nm(tc.root))}.`); },
    () => { const k = pick(['C', 'G', 'F']), t = pick(['ii', 'iii', 'IV', 'V', 'vi']), tc = rn(t, k, 'major'); return ask(`What is the Roman numeral for the secondary dominant seventh that leads to ${symOf(tc)} in ${pn(k)} major?`, `V⁷/${t}`, ['ii', 'iii', 'IV', 'V', 'vi'].map(x => `V⁷/${x}`), 'The numeral after the slash is the chord being tonicized.'); },
    () => { const k = pick(['C', 'G', 'F']), t = pick(['ii', 'V', 'vi']), c = rn('vii°7/' + t, k, 'major'); return ask(`In ${pn(k)} major, which notes make vii°⁷/${t}?`, c.notes.map(n => nm(n)).join(' – '), ['ii', 'V', 'vi', 'IV'].filter(x => x !== t).map(x => rn('vii°7/' + x, k, 'major').notes.map(n => nm(n)).join(' – ')), 'It is a diminished seventh chord on the leading tone of the target.'); },
    bank([['What does “tonicize” mean?', 'To treat a chord like a tonic by approaching it with its dominant', ['To change key for the rest of the piece', 'To play the tonic note loudly', 'To remove the tonic'], 'A tonicization is brief; a modulation is lasting.'],
      ['Which chords are NOT tonicized by secondary dominants?', 'Diminished chords', ['Major chords', 'Minor chords', 'The dominant'], 'Unstable chords do not sound like tonics.'],
      ['How do you check that a chord is a secondary dominant?', 'A perfect fifth below its root is the root of a diatonic chord', ['It contains the tonic note', 'It has no seventh', 'It is a diminished triad'], 'Also check that it is major or major–minor seventh.'],
      ['What is the root of a secondary diminished chord?', 'A minor 2nd below the root of the chord it tonicizes', ['A fifth below the target', 'The tonic', 'A major 3rd above the target'], 'It is the leading tone of the target.'],
      ['Which seventh chord usually tonicizes a minor chord?', 'Fully diminished seventh', ['Half-diminished seventh', 'Major seventh', 'Minor seventh'], 'Major chords usually get half-diminished sevenths.'],
      ['In C major, D⁷ leading to G is labelled…', 'V⁷/V', ['II⁷', 'ii⁷', 'V⁷'], 'The label shows function, not just root.']]),
  ],
  play: [progEx('Play V⁷/V – V – I in {key}', ['V7/V', 'V', 'I'], () => pick(['C', 'G', 'F']), 'major'), progEx('Play I – V⁷/vi – vi in {key}', ['I', 'V7/vi', 'vi'], () => pick(['C', 'G', 'F']), 'major'), progEx('Play ii – vii°⁷/V – V – I in {key}', ['ii', 'vii°7/V', 'V', 'I'], () => pick(['C', 'G']), 'major')]});

CH.push({id: 'mixture', title: 'Mode mixture and borrowed chords', blurb: 'Borrowing from the parallel minor: iv, ♭VI, ♭VII, ♭III, ii°; the ♭VI deceptive cadence; the Picardy third',
  body: `<p><b>Mode mixture</b> means mixing the major and minor modes: in a major key, chords are <b>borrowed</b> from the <b>parallel minor</b> (the minor key with the same tonic, such as C minor for C major). The effect is a sudden darkening. The borrowed notes are the lowered scale degrees <b>♭6</b> (the most common), <b>♭3</b> and <b>♭7</b>.</p>
{{fig:borr|Chords borrowed into C major: iv, ♭VI, ♭VII, ♭III, ii° and iiø⁷.}}
<table class="htab"><tr><th>iv</th><td>minor subdominant: F minor in C major (F–A♭–C)</td></tr>
<tr><th>♭VI</th><td>A♭ major in C major: very common, often before ♭VII – I</td></tr>
<tr><th>♭VII</th><td>B♭ major (also the subtonic of {{ch:popharmony}})</td></tr>
<tr><th>♭III</th><td>E♭ major</td></tr>
<tr><th>ii° / iiø⁷</th><td>D–F–A♭ (–C): a pre-dominant with ♭6</td></tr></table>
<p>To label a borrowed chord, simply give its root, quality and inversion. Unlike a secondary chord it has no slash. To write one from a Roman numeral, use the scale degrees of the <b>parallel minor</b>: ♭VI in C major is the chord on the lowered 6th, A♭.</p>
<h3>The deceptive cadence with ♭VI</h3>
<p>A deceptive cadence can go V – ♭VI instead of V – vi, followed by ♭VII – I, a dramatic “epic” ending.</p>
{{fig:epic|V – ♭VI – ♭VII – I in C major.}}
<h3>Borrowing the other way: the Picardy third</h3>
<p>Borrowing from the major inside a minor key is rare: a major tonic in the middle of a minor passage usually functions as V/iv, and the raised 6th and 7th belong to melodic minor anyway. The one regular place is the very end: a minor piece may close on a major I, the <b>Picardy third</b>, common in the Baroque.</p>
<h3>Where mixture is heard</h3>
<p>Mode mixture and “borrowed chords” mean the same thing: chords taken from the parallel minor into a major key. The lowered scale degrees ♭6 (the most common), ♭3 and ♭7 mark the borrowed chords. Famous examples:</p>
<ul><li>The Beatles’ “Blackbird”: iv (D minor) in A major. The change from major to minor gives a sudden emotional effect.</li>
<li>Strauss’s <i>Also sprach Zarathustra</i>: the major I goes immediately to the minor i.</li>
<li>Radiohead’s “Creep”: IV is followed by the borrowed iv; Nirvana’s “Lithium”: ♭VI and ♭VII.</li>
<li>Brahms’s Symphony No. 3 (third movement): I alternates with a borrowed vii°⁷ over a pedal; Tchaikovsky’s “Waltz of the Flowers” alternates I with vii°⁷/I over a tonic pedal.</li>
<li>Bass lines that start on 1 and fall through the borrowed ♭7 and ♭6 (“Beautiful”, Hoyt Axton’s “Joy to the World”, “Part of Your World”): the lowered degrees are borrowed notes.</li></ul>
<h3>Harmonizing a borrowed scale degree</h3>
<p>♭6 can be harmonized as the <b>root</b> (♭VI), the <b>third</b> (iv), the <b>fifth</b> (ii° or iiø⁷) or the <b>seventh</b> (vii°⁷ or ♭VII⁷) of a chord. ♭3 and ♭7 can be harmonized as root, third or fifth. You do not have to memorize the list; realize that the <b>quality of the diatonic chord changes</b> when a note from the minor mode joins it.</p>
{{fig:b6|Chords in C major that contain A♭ (♭6): ♭VI, iv, ii°, iiø⁷, vii°⁷ and ♭VII⁷.}}
<h3>Analyzing and writing borrowed chords</h3>
<p>Unlike a secondary chord, a borrowed chord is labelled by its <b>root, quality and inversion</b> only. Example: a half-diminished chord with C in the bass built on A in G major (A–C–E♭–G): stack in thirds, A is 2 in G major, and the thirds are m3–m3–M3, so it is iiø⁷, and since the third is in the bass the figure is ⁶₅.</p>
<p>To <b>write</b> one, read the numeral’s quality carefully. ♭VI is built on the lowered 6th: in A major 6 is F♯, so ♭6 is F♮, and stacking M3 + m3 gives F♮–A–C♮. A flat before a Roman numeral means “a half step below the scale degree”, <b>not</b> that the root has an accidental ♭ in front of it.</p>
<h3>The “epic” ending</h3>
<p>The deceptive V – ♭VI with ♭VI – ♭VII – I is the ending of many arrangements of “The Star-Spangled Banner” (as sung at the Super Bowl and presidential inaugurations) and of the animated film <i>Beauty and the Beast</i>: it sounds dramatic, if somewhat clichéd.</p>
<h3>Borrowing from major in a minor key</h3>
<p>This is rare: a major tonic in the middle of a minor passage usually acts as V/iv, and a raised 6th or 7th is just melodic minor. The one regular place is the final chord: the Picardy third, as in the Sarabande of Bach’s French Suite No. 1 in D minor.</p>`,
  figs: {
    b6: block('C', 'major', [['Ab2 C4 Eb4 Ab4', '♭VI'], ['F3 Ab3 C4 F4', 'iv'], ['D3 F3 Ab3 D4', 'ii°'], ['D3 F3 Ab3 C4', 'iiø⁷'], ['B2 D4 F4 Ab4', 'vii°⁷'], ['Bb2 D4 F4 Ab4', '♭VII⁷']], {bpm: 70, d: 'h'}),
    borr: prog('C', 'major', ['iv', 'bVI', 'bVII', 'bIII', 'ii°', 'iiø7'], {d: 'h', bpm: 70}),
    epic: prog('C', 'major', ['V', 'bVI', 'bVII', 'I'], {d: 'h', bpm: 70}),
  },
  quiz: [
    bank([['Which scale degree is most often lowered in a borrowed chord?', '6 (♭6)', ['♭2', '♭5', '4'], '♭3 and ♭7 also occur.'],
      ['Which chords in C major contain A♭?', '♭VI, iv, ii°, iiø⁷ and vii°⁷', ['I, IV and V', 'ii, iii and vi', 'Only ♭VI'], 'A♭ is ♭6 of C major.'],
      ['How is a borrowed chord labelled, compared with a secondary chord?', 'By root, quality and inversion; there is no slash', ['With a slash and the tonicized chord', 'With a plus sign', 'With a figured-bass 5'], 'Secondary chords need the slash.'],
      ['What does a flat before a Roman numeral (♭VI) mean?', 'The root is a half step below the scale degree', ['The chord has a flat in front of its root', 'The chord is diminished', 'The chord is in the bass'], 'In C major ♭VI is A♭, built on ♭6.'],
      ['Which lowered scale degrees are borrowed from the parallel minor?', '♭6 (most common), ♭3 and ♭7', ['♭2 and ♭5', 'Only ♯4', '♯1 and ♯5'], 'They are the notes that differ between major and natural minor.']]),
    () => { const k = pick(['C', 'G', 'F', 'D', 'A']), s = pick(['iv', 'bVI', 'bVII', 'bIII']), c = rn(s, k, 'major'); return ask(`In ${pn(k)} major, what chord is ${fmt(s)}?`, symOf(c), ['iv', 'bVI', 'bVII', 'bIII', 'IV'].map(x => symOf(rn(x, k, 'major'))), 'Borrow it from the parallel minor.'); },
    () => { const k = pick(['C', 'G', 'F', 'D']), c = rn('iv', k, 'major'); return ask(`In ${pn(k)} major, which notes make the borrowed iv chord?`, c.notes.map(n => nm(n)).join(' – '), [rn('IV', k, 'major'), rn('ii', k, 'major'), rn('bVI', k, 'major')].map(x => x.notes.map(n => nm(n)).join(' – ')), 'A minor triad on the 4th degree.'); },
    bank([['What is mode mixture?', 'Borrowing chords from the parallel mode', ['Changing key permanently', 'Playing in two keys at once', 'Using only the major scale'], 'A major key borrows from its parallel minor.'],
      ['Which borrowed scale degree is the most common?', '♭6', ['♭3', '♭7', '♯4'], '♭VI and iv both contain it.'],
      ['Which key is the parallel minor of D major?', 'D minor', ['B minor', 'A minor', 'F♯ minor'], 'Same tonic, other mode.'],
      ['What is a deceptive cadence with ♭VI?', 'V – ♭VI', ['V – vi', 'IV – I', 'V – I'], 'It is often followed by ♭VII – I.'],
      ['Where do pieces in minor commonly borrow from the major?', 'At the end, in the Picardy third', ['In every bar', 'In the bass only', 'Never'], 'A major tonic closes the minor piece.'],
      ['How is a borrowed chord labelled?', 'With its root, quality and inversion; no slash', ['With a slash, like V/V', 'With the letter “B”', 'It cannot be labelled'], 'A secondary chord has a slash; a borrowed chord does not.']]),
  ],
  play: [progEx('Play I – iv – I in {key}', ['I', 'iv', 'I'], () => pick(['C', 'G', 'F', 'D']), 'major'), progEx('Play I – ♭VI – ♭VII – I in {key}', ['I', 'bVI', 'bVII', 'I'], () => pick(['C', 'G', 'F']), 'major'), progEx('Play V – ♭VI – ♭VII – I in {key}', ['V', 'bVI', 'bVII', 'I'], () => pick(['C', 'G']), 'major')]});

const sixth = (key, kind) => { const s = scale(key + '4', 'minor', 8), b6 = s[5], one = s[0], s4 = bump(s[3], 1); return kind === 'It' ? [b6, one, s4] : kind === 'Fr' ? [b6, one, s[1], s4] : [b6, one, s[2], s4]; };
const bump = A.bump;
CH.push({id: 'neapolitan', title: 'Neapolitan and augmented sixth chords', blurb: 'The ♭II chord, Italian, French and German sixths, enharmonic spelling, chromatic bass lines',
  body: `<p>Two chromatic chords intensify the move to the dominant: the <b>Neapolitan</b> and the <b>augmented sixth</b> chords. Both have <b>pre-dominant</b> function and both lead to V.</p>
<h3>The Neapolitan chord</h3>
<p>The <b>Neapolitan</b> (N) is a <b>major chord on the lowered 2nd degree</b> (♭II), a chromatically altered ii. It is used mostly in <b>first inversion</b>, the <b>Neapolitan sixth</b> (N⁶), and usually in minor, where it leads to V (often through a cadential ⁶₄). In C minor N⁶ is D♭–F–A♭ with F in the bass.</p>
{{fig:neap|i – N⁶ – V – i in C minor: D♭ major in first inversion.}}
<h3>Augmented sixth chords</h3>
<p>An <b>augmented sixth chord</b> contains the lowered 6th degree (♭6) and the raised 4th (♯4), an <b>augmented sixth</b> apart. Both lead outwards to the dominant: ♭6 falls to 5 and ♯4 rises to 5. All stacked in thirds contain a <b>diminished third</b>, which no chord seen so far had. There are three types:</p>
<table class="htab"><tr><th>Italian (It⁺⁶)</th><td>♭6, 1, ♯4: three notes (the tonic is doubled)</td></tr>
<tr><th>French (Fr⁺⁶)</th><td>♭6, 1, 2, ♯4: adds the 2nd degree</td></tr>
<tr><th>German (Ger⁺⁶)</th><td>♭6, 1, ♭3, ♯4: adds the ♭3. It sounds like a dominant seventh on ♭6 (in C minor A♭⁷, with the G♭ spelled F♯)</td></tr></table>
{{fig:aug6|It⁺⁶ and Fr⁺⁶ in C minor, resolving to V.}}
<p>The German sixth followed directly by V gives parallel fifths, so it is normally taken through a <b>cadential ⁶₄</b> (i⁶₄ – V):</p>
{{fig:ger|Ger⁺⁶ – i⁶₄ – V – i: the A♭ falls to G, the F♯ rises to G, the C and E♭ stay.}}
<p>In lead-sheet notation an augmented sixth chord is written as a dominant seventh on ♭6 (a “misspelled” seventh chord): It⁺⁶ is the same as a seventh chord with its fifth omitted.</p>
<h3>Descending chromatic bass lines</h3>
<p>A famous pattern is the bass falling by half steps from the tonic to the dominant: <b>1 – ♮7 – ♭7 – 6 – ♭6 – 5</b>. Composers harmonize it with all the chords of this and earlier chapters: secondary chords, borrowed chords, augmented sixths and sometimes unusual diatonic chords. The chromatic pre-dominants (N⁶, It⁺⁶, Fr⁺⁶, Ger⁺⁶, borrowed iv and iiø⁷) are all alternative ways of harmonizing the ♭6 before the dominant.</p>
<h3>The lament bass</h3>
<p>The most famous descending bass is the <b>lament bass</b>, a fall from tonic to dominant: in A minor, A – G – F – E, usually harmonized i – v⁶ – iv⁶ – V. It is called the lament because of Baroque laments (such as Purcell’s <i>Dido’s Lament</i>), and it is still heard in pop. When the steps are filled with half steps, A – G♯ – G – F♯ – F – E, it becomes the <b>chromatic bass line</b> described above, with a new chord on almost every note.</p>
{{fig:lament|The lament bass in A minor: A – G – F – E under i – v⁶ – iv⁶ – V.}}
<h3>Which chromatic chord is it?</h3>
<p>Several chords lead to V with a chromatic note. Look at the bass and at the raised or lowered notes:</p>
<table class="htab"><tr><th>Major triad with ♭2 and 4 in the bass</th><td>Neapolitan sixth (N⁶).</td></tr>
<tr><th>♭6 in the bass and ♯4 above it</th><td>An augmented sixth chord (It⁺⁶, Fr⁺⁶ or Ger⁺⁶): the two notes spread outward to 5.</td></tr>
<tr><th>♯4 and the bass on 2, or the chord is a dominant of V</th><td>A secondary chord, V/V or vii°/V: it resolves to V as well, but it contains no ♭6.</td></tr>
<tr><th>♭6 in a major chord on ♭6, with no ♯4</th><td>A borrowed ♭VI (mode mixture).</td></tr>
<tr><th>iv, ii° or ii⁶ without chromatic notes</th><td>Ordinary pre-dominants; borrowed iv in a major key is the milder cousin of N⁶.</td></tr></table>
<p>All of these are <b>chromatic pre-dominants</b>: different colours for the same job of preparing V. The stronger the chromatic note (a ♯4 or ♭2), the more urgent the approach to the dominant.</p>
<h3>The Neapolitan in real music</h3>
<p>In classical music the ♭II chord is simply called <b>N</b> (and N⁶ in first inversion, its most common form). It is a chromatically altered ii, so it has pre-dominant function. Composers often change texture, register or dynamics when it occurs, as in the first movement of Beethoven’s Symphony No. 7. In the first movement of the “Moonlight” Sonata a D major chord with F♯ in the bass (N⁶ in C♯ minor) leads to G♯⁷ and then to the cadence C♯m/G♯ – G♯sus4 – G♯⁷ – C♯m. Try replacing the Neapolitan with iv or ii°⁶ and hear the difference. The same chord darkens film music: John Williams’s “Raiders March”, Michael Giacchino’s <i>Star Trek</i> end credits and the Zimmer–Holkenborg music for <i>Batman v Superman</i>.</p>
<h3>Recognizing augmented sixths</h3>
<p>All augmented sixth chords contain ♭6 and ♯4 (in minor ♭6 needs no accidental, since 6 is already lowered). The Italian adds 1, the French adds 1 and 2, and the German adds 1 and ♭3: ♭6 – ♯4 – 1 is the core of all three. The names have no known origin; the 1964 Harvard Dictionary calls them “rather pointlessly… distinguished”. The <b>enharmonic German</b> (EnGer⁺⁶) respells the ♭3 as ♯2, so that the chord resolves only to a major I⁶₄ (♭6 – 1 – ♯2 – ♯4).</p>
<p>Because none of the chords you have met contains a <b>diminished third</b> when stacked in thirds, the rule is: <b>a chord with a diminished third is an augmented sixth chord</b>. Then find which scale degrees are present to decide which kind it is.</p>
<h3>Lead-sheet view</h3>
<p>For lead-sheet symbols, treat an augmented sixth chord as a <b>dominant seventh chord on ♭6 with a misspelled seventh</b>: A♭–C–E♭–F♯ is written A♭7 (A♭–C–E♭–G♭). The classical label shows how the chord resolves (the ♯4 rising), while the lead-sheet label shows the sound. Italian = a dominant seventh with the fifth omitted; German = a complete dominant seventh on ♭6.</p>
<h3>Examples</h3>
<ul><li><b>Italian:</b> Beethoven’s Fifth Symphony (first movement) in C minor; Duke Ellington’s “It Don’t Mean a Thing”, spelled as a dominant seventh without a fifth.</li>
<li><b>French:</b> Schubert’s “Der Wegweiser” (Winterreise) in G minor: i … Fr⁺⁶ – V – i, with the French sixth intensifying the drive to V.</li>
<li><b>German:</b> the William Tell Overture (Rossini) goes to the dominant-function I⁶₄; Coltrane’s minor blues “Mr. P.C.” has a VI⁷ that is a German sixth going to V; the “Pink Panther” theme; Fiona Apple’s “Criminal” (F7 in A minor) and “Friend Like Me” from <i>Aladdin</i> (Am – F7 – E = i – Ger⁺⁶ – V).</li>
<li><b>Enharmonic German:</b> Schumann’s <i>Dichterliebe</i>, “Am leuchtenden Sommermorgen”: a G♭⁷ would be G♭–B♭–D♭–F♭, but the F♭ is respelled E♮ and the D♭ as C♯ (a “doubly augmented fourth”), so that they resolve upward.</li></ul>
<h3>Descending chromatic bass lines</h3>
<p>The chromatic descent <b>1 – ♮7 – ♭7 – 6 – ♭6 – 5</b> can be harmonized with secondary chords, borrowed chords, augmented sixths and rarely used diatonic chords. Examples across centuries: Purcell’s “Dido’s Lament”, Bach’s <i>Crucifixus</i> (B minor Mass), Beethoven’s 32 Variations in C minor, George Harrison’s “While My Guitar Gently Weeps”, “Stairway to Heaven”, “Dream On”, “Interstate Love Song”, “Jar of Hearts”. The harmonization of 6 can use vi°⁷/vi chords of the melodic minor scale. <b>The chromatic pre-dominants</b> (N⁶, augmented sixths, borrowed iv, ii°) are all ways of harmonizing ♭6 before the dominant.</p>`,
  figs: {
    lament: block('A', 'minor', [['A2 C4 E4 A4', 'i'], ['G2 B3 E4 G4', 'v⁶'], ['F2 A3 D4 F4', 'iv⁶'], ['E2 B3 E4 G#4', 'V']], {bpm: 56, d: 'q'}),
    neap: block('C', 'minor', [['C3 Eb4 G4 C5', 'i'], ['F3 Ab4 Db5 F5', 'N⁶'], ['G2 D4 G4 B4', 'V'], ['C3 Eb4 G4 C5', 'i']], {bpm: 60}),
    aug6: block('C', 'minor', [['Ab2 C4 F#4 C5', 'It⁺⁶'], ['G2 D4 G4 B4', 'V'], ['Ab2 C4 D4 F#4', 'Fr⁺⁶'], ['G2 D4 G4 B4', 'V']], {bpm: 60}),
    ger: block('C', 'minor', [['Ab2 C4 Eb4 F#4', 'Ger⁺⁶'], ['G2 C4 Eb4 G4', 'i⁶₄'], ['G2 D4 G4 B4', 'V'], ['C3 Eb4 G4 C5', 'i']], {bpm: 60}),
  },
  quiz: [
    bank([['Which rule identifies an augmented sixth chord when stacked in thirds?', 'It contains a diminished third', ['It has a major seventh', 'It is always in root position', 'It has an augmented triad'], 'No earlier chord has one.'],
      ['How is an augmented sixth labelled in lead-sheet notation?', 'As a dominant seventh on ♭6 with a misspelled seventh', ['As a major triad', 'As a minor seventh', 'As a sus chord'], 'A♭7 = A♭ C E♭ G♭, spelled A♭ C E♭ F♯.'],
      ['What does the enharmonic German sixth resolve to?', 'Only a major I⁶₄', ['Only a minor i', 'A deceptive cadence', 'The Neapolitan'], 'The ♭3 is respelled as ♯2, which rises.'],
      ['Which famous piece features a Neapolitan sixth in its first movement?', 'Beethoven’s Moonlight Sonata', ['Pachelbel’s Canon', 'The Star-Spangled Banner', 'Twinkle, Twinkle'], 'Also Beethoven’s Symphony No. 7.'],
      ['Which bass line is the descending chromatic bass?', '1 – 7 – ♭7 – 6 – ♭6 – 5', ['1 – 2 – 3 – 4', '1 – 5 – 1', '1 – 3 – 5'], 'Dido’s Lament and Stairway to Heaven use versions of it.']]),
    bank([['What is the lament bass in A minor?', 'A – G – F – E', ['A – B – C – D', 'A – E – A – E', 'A – C – E – A'], 'It falls from the tonic to the dominant, usually under i – v⁶ – iv⁶ – V.'],
      ['The bass is ♭6 and there is a ♯4 above it. Which chord is it?', 'An augmented sixth chord', ['A Neapolitan', 'A borrowed iv', 'A deceptive cadence'], 'The two notes a sixth apart expand to 5.'],
      ['Which chord is a major triad on ♭2 in first inversion?', 'Neapolitan sixth', ['German sixth', 'Italian sixth', 'Picardy third'], 'N⁶ has 4 in the bass.'],
      ['What do N⁶, augmented sixths, borrowed iv and ii° have in common?', 'They are all pre-dominant chords', ['They are all tonic chords', 'They are all cadences', 'They all contain a seventh'], 'Each prepares V.']]),
    () => { const k = pick(['A', 'C', 'D', 'G', 'E']), kind = pick(['It', 'Fr', 'Ger']), notes = sixth(k, kind); const names = x => x.map(n => nm(n)).join(' – ');
      return ask(`In ${pn(k)} minor, which notes make the ${kind}⁺⁶ chord?`, names(notes), ['It', 'Fr', 'Ger'].filter(x => x !== kind).map(x => names(sixth(k, x))).concat([names([bump(notes[0], 1), ...notes.slice(1)])]), 'All contain ♭6 and ♯4; add 1 (Italian), 1 and 2 (French) or 1 and ♭3 (German).'); },
    () => { const k = pick(['A', 'E', 'D', 'G', 'C']), s = scale(k + '4', 'minor', 8), root = bump(s[1], -1), c = chordFromRoot(root, 'major'); return ask(`In ${pn(k)} minor, which notes make the Neapolitan chord?`, c.map(n => nm(n)).join(' – '), [chordFromRoot(s[1], 'dim'), chordFromRoot(s[3], 'minor'), chordFromRoot(s[4], 'major')].map(x => x.map(n => nm(n)).join(' – ')), 'A major triad on the lowered 2nd degree.'); },
    bank([['What is the Neapolitan chord?', 'A major chord on the lowered 2nd degree', ['A minor chord on ♭6', 'A diminished chord on the 7th', 'A dominant seventh on the 5th'], 'It is usually used in first inversion (N⁶).'],
      ['What function do Neapolitan and augmented sixth chords have?', 'Pre-dominant', ['Tonic', 'Dominant', 'Deceptive'], 'Both lead to V.'],
      ['Which two scale degrees do all augmented sixth chords contain?', '♭6 and ♯4', ['2 and 5', '1 and 3', '♭7 and 4'], 'An augmented sixth apart: they expand to 5.'],
      ['Which augmented sixth chord has the ♭3 as well?', 'The German sixth', ['The Italian sixth', 'The French sixth', 'None'], 'It sounds like a dominant seventh on ♭6.'],
      ['Which augmented sixth chord adds scale degree 2?', 'The French sixth', ['The Italian sixth', 'The German sixth', 'None'], 'Its notes: ♭6, 1, 2, ♯4.'],
      ['Which chord interval is unique to augmented sixth chords when stacked in thirds?', 'A diminished third', ['An augmented fifth', 'A major seventh', 'A perfect fourth'], 'This is the quick way to spot them.'],
      ['How is a German sixth usually followed to avoid parallel fifths?', 'Through a cadential six-four', ['By a deceptive cadence', 'By I⁶', 'By a pause'], 'Ger⁺⁶ – i⁶₄ – V.']]),
  ],
  play: [progEx('Play i – N⁶ – V – i in {key}', ['i', 'bII6', 'V', 'i'], () => pick(['C', 'A', 'D', 'G']), 'minor', 'In N⁶ the third of the chord (♭II⁶) must be the lowest note.'),
    () => { const k = pick(['C', 'A', 'D']), notes = sixth(k, 'Ger'), pcs = pcsOf(notes), v = rn('V', k, 'minor'); return {title: `German sixth then V in ${pn(k)} minor`, help: `Ger⁺⁶ is ${notes.map(n => nm(n)).join(', ')}: the lowest note is ♭6.`, steps: [{label: 'Ger⁺⁶', pcs, names: notes.map(n => nm(n)), bass: ((notes[0].midi % 12) + 12) % 12}, {label: 'V', pcs: pcsOf(v.notes), names: v.notes.map(n => nm(n))}]}; },
    () => { const k = pick(['C', 'A', 'D']), notes = sixth(k, 'It'), pcs = pcsOf(notes), v = rn('V', k, 'minor'); return {title: `Italian sixth then V in ${pn(k)} minor`, help: `It⁺⁶ is ${notes.map(n => nm(n)).join(', ')}.`, steps: [{label: 'It⁺⁶', pcs, names: notes.map(n => nm(n)), bass: ((notes[0].midi % 12) + 12) % 12}, {label: 'V', pcs: pcsOf(v.notes), names: v.notes.map(n => nm(n))}]}; }]});

const closeKeys = k => { const m = A.FIFTHS.major[k]; return [k, ...Object.keys(A.FIFTHS.major).filter(x => Math.abs(A.FIFTHS.major[x] - m) === 1)]; };
CH.push({id: 'modulation', title: 'Modulation', blurb: 'Changing key: pivot chords, direct, common-tone, sequential and enharmonic modulation',
  body: `<p>To <b>modulate</b> is to change key within a piece. A <b>tonicization</b> is brief (a secondary dominant and its target); a modulation must be <b>confirmed by a cadence</b> in the new key, usually a pre-dominant – V – I (or V⁷ – I) cadence. In popular music a change of key is simply called a “key change”.</p>
<h3>Key relationships</h3>
<p>The <b>closely related keys</b> have key signatures at most one sharp or flat away from the home key: for any major or minor key there are <b>five</b>, including the relative key. In C major: G major, F major, and the relative minors A minor, E minor and D minor (and, of course, A minor itself counts as the relative). Baroque and Classical composers modulated to the <b>dominant</b> from a major key and to the <b>relative major</b> from a minor key; Romantic composers went to more distant keys.</p>
<h3>Pivot chord modulation</h3>
<p>A <b>pivot chord</b> belongs to both keys and is reinterpreted at the change. For example, A minor is <b>vi in C major</b> and <b>ii in G major</b>. The best pivots have tonic (or tonic-prolonging) function in the old key and pre-dominant function in the new one, so the move to the new dominant feels natural.</p>
{{fig:pivot|C major to G major: A minor is vi in C and ii in G (the pivot), then D⁷ and G.}}
<p>To analyze a modulation, listen for the new cadence, work backwards from it to the pre-dominant chords of the new key, and look for the last chord that fits both keys. Recurring accidentals (a new leading tone, for example F♯ in C major) show where the new key begins. The pivot may also be a <b>borrowed</b> chord, a <b>secondary</b> chord, or even a <b>Neapolitan</b>, which can bridge two distant keys.</p>
<h3>Modulation without a pivot chord</h3>
<ul><li><b>Direct (phrase) modulation</b>: a phrase ends in the old key and the next one simply begins in the new key. It is the usual “key change” of pop songs.</li>
<li><b>Common-tone modulation</b>: a single note shared by two chords is the hinge. The chords are typically <b>chromatic mediants</b>: major (or minor) chords whose roots are a third apart and that share just one note, such as C major and E major (sharing E).</li>
<li><b>Sequential modulation</b>: an idea and its harmonies are repeated at a new pitch level until the new key is reached.</li></ul>
{{fig:ct|Common-tone modulation: C major to E major, hinged on the shared note E.}}
<h3>Enharmonic modulation</h3>
<p>In an <b>enharmonic modulation</b> the pivot chord is respelled so that it means two different things, like a pun. Two sonorities are used:</p>
<ul><li>The <b>dominant seventh</b> and the <b>German sixth</b> sound alike. G⁷ (G–B–D–F) is V⁷ in C major; respelled G–B–D–E♯ it is Ger⁺⁶ in B minor, and resolves to F♯.</li>
<li>The <b>fully diminished seventh</b> chord divides the octave into equal minor thirds, so it can be respelled four ways and resolve to four different keys.</li></ul>
{{fig:enhm|G⁷ in C major reinterpreted as a German sixth in B minor: the same sounding chord, spelled F or E♯.}}
<h3>Key change or modulation?</h3>
<p>In popular music a change of key is called a <b>key change</b> (Beyoncé’s “Love on Top”, “My Heart Will Go On”, Bon Jovi’s “Livin’ on a Prayer” all rise to a new key for the last chorus). Classical theory keeps the word <b>modulation</b> for the slower, subtler change of key found in many classical pieces, but the pop key change is the same as the <b>direct modulation</b> described below.</p>
<h3>Tonicization or modulation?</h3>
<p>A tonicization can be as short as two chords (V/V – V) but may last several bars, as in Schubert’s song “Abschied”. A modulation needs a <b>cadence that confirms the new key</b>, usually (not always) a <b>cadential formula</b>: pre-dominant (ii or IV) – V – I, often through a cadential six-four. Douglass Green calls a V – I cadence with a pre-dominant prefix a <i>full cadence</i>. It establishes a key more strongly than a bare V – I, which leaves room for doubt, especially when the harmonic rhythm is fast (Bach’s chorales change chord on every beat).</p>
<h3>Finding the pivot</h3>
<ol><li>Listen for the cadence in the new key.</li><li>Work <b>backwards</b> from it: was the new V approached by a pre-dominant (ii or IV) of the new key?</li><li>Analyze from the beginning of the phrase until you reach the new key.</li><li>Look for a logical pivot. If two successive chords could both pivot, bracket two chords on each side.</li></ol>
<h3>Common chords between two keys</h3>
<p>For a diatonic pivot you need chords that are diatonic (same root and quality) in both keys. Take G major and D major:</p>
<table class="htab"><tr><th>G major</th><td>G</td><td>Am</td><td>Bm</td><td>C</td><td>D</td><td>Em</td><td>F♯°</td></tr><tr><th>D major</th><td>G</td><td>A</td><td>Bm</td><td>C♯°</td><td>D</td><td>Em</td><td>F♯m</td></tr></table>
<p>Aligning the two scales shows that G, Bm, D and Em belong to both. In Roman numerals: G = I in G and IV in D; Bm = iii in G and vi in D; D = V in G and I in D; Em = vi in G and ii in D.</p>
<h3>Which function should the pivot have?</h3>
<p>Composers seldom choose a pivot that is already a <b>dominant</b> in the new key: the modulation would sound abrupt. The best pivots have <b>tonic or tonic-prolongation function in the old key and pre-dominant function in the new one</b>: G is I in G major and the pre-dominant IV in D major, so it leads smoothly to the new V. Bach’s chorale “Ermuntre dich” does exactly this (a pivot that is Ton. in G and Pre-Dom. in D). There are also modulations with a pivot that is tonic in the old key and dominant in the new (as in Bach’s “Es ist das Heil uns kommen her”) or tonic in one and tonic-prolongation in the other.</p>
<h3>Recognizing the new key</h3>
<ul><li>Look for <b>recurring accidentals</b>, and add them to the key signature in your mind. A new <b>flat</b> usually acts as 4 of the new key; a new <b>sharp</b> usually acts as the leading tone 7 (if several sharps appear, the “sharpest” in the order F C G D A E B is 7).</li>
<li>An accidental that is <b>cancelled</b> soon afterwards points to a tonicization or a chromatic note; one that is <b>not cancelled</b> and is repeated points to a modulation.</li>
<li>Check that a cadential formula affirms the new key.</li></ul>
<h3>Chromatic pivot chords</h3>
<p>The pivot may be a chromatic chord in one or both keys:</p>
<ul><li><b>Secondary common chord</b>: the same chord is a secondary chord in both keys (Schubert’s “Abschied”).</li>
<li><b>Borrowed common chord</b> (mode mixture): the pivot is a borrowed chord in one key. In Beethoven’s Piano Sonata Op. 110 (first movement) a borrowed i⁶ in D♭ major, respelled as C♯ minor, becomes vi⁶ in E major.</li>
<li><b>Neapolitan common chord</b>: the ♭II chord can bridge two keys that are far apart. In Schubert’s “Frühlingssehnsucht” a Neapolitan in D minor (with a dominant-seventh quality) acts as V⁶₅ in A♭ minor, a tritone away.</li>
<li><b>Augmented sixth chord</b>: see enharmonic modulation below.</li></ul>
<h3>Modulation without a pivot chord</h3>
<ul><li><b>Direct (phrase) modulation</b>: no pivot, no preparation. In Schubert’s “Kriegers Ahnung” the music stops on a half cadence in C minor, and the next phrase starts on A♭ major. It is the most common “modulation” in pop.</li>
<li><b>Common-tone modulation</b>: one note is shared by two chords of the old and new keys. In Beethoven’s Second Symphony the note C♯ is the hinge between C♯ major (V in F♯ minor) and an A dominant seventh (V⁷ in D major); in a Schubert trio the note A links A major (V in D minor) and F major.</li></ul>
<h3>Chromatic mediants</h3>
<p>The two chords of a common-tone modulation are usually <b>chromatic mediants</b>: chords of the <b>same quality</b> (both major or both minor), with roots a <b>third apart</b>, that share <b>only one note</b>. Any major or minor triad has <b>four</b> chromatic mediants. For C major they are E major (shares E), A♭ major (shares C), A major (shares E) and E♭ major (shares G).</p>
{{fig:med|C major followed by its four chromatic mediants: E, A♭, A and E♭ major.}}
<p>Chromatic mediants can also be used without modulating, for a sudden shimmering colour: Wagner’s <i>Das Rheingold</i> and the film music of John Williams (<i>Return of the Jedi</i>, <i>The Phantom Menace</i>) use them often.</p>
<h3>Sequential modulation</h3>
<p>In a <b>sequential modulation</b> a melody and its harmonies are repeated at a new pitch level until a new key is reached. In the last movement of Beethoven’s Piano Sonata Op. 2 No. 1 the idea is simply repeated in the new key; in Mozart’s Oboe Concerto K. 314 an idea in C major is repeated up a step in D major and again in E minor, reaching F♯° (vii° in G major); in an aria from <i>Don Giovanni</i> an idea in F minor is repeated a whole step lower in E♭ minor, which leads to the home key of E♭ major.</p>
<h3>More about enharmonic modulation</h3>
<ul><li>The word “pun” is exact: G⁷ in C major (V⁷) and G⁷ spelled G–B–D–E♯ (a German sixth in B minor) sound the same, but only one spelling is written, and the analyst must imagine the other. Most often the <b>top</b> note of the chord is respelled (B♭ becomes A♯), or the bottom three notes.</li>
<li>Dominant sevenths of secondary dominants (V⁷/V and so on) can also be reinterpreted as German sixths, and vice versa. Examples: Tchaikovsky’s “Waltz of the Flowers” (D⁷ = Ger⁺⁶ in F♯ minor), Beethoven’s Fifth Symphony, second movement (V⁷ in A♭ = Ger⁺⁶ in C), and Les Misérables (Ger⁺⁶ in E minor = V⁷ in F).</li>
<li>Each <b>diminished seventh</b> chord points to <b>four</b> keys, since each of its four notes can be 7 and resolve up a half step. G♯°⁷ (G♯–B–D–F) resolves to A (minor or major), C, E♭ and G♭. Each note can also be heard as the 7th of a dominant seventh chord and fall a half step to the root of V⁷.</li>
<li>In Beethoven’s <i>Pathétique</i> Sonata the same diminished chord is reinterpreted several times, and in the second movement of Beethoven’s Fifth the E°⁷ of C major leads to a German sixth in A♭ major (spelled unusually, E–A♭–C♭–D). In Schubert’s “Der Atlas” a G♯°⁷ in G minor is reinterpreted as E♯°⁷ in B minor: because it never resolves in G minor, you cannot be sure which resolution was intended.</li></ul>
{{fig:dimfour|The same fully diminished seventh chord (G♯°⁷, respelled as needed) resolving to four tonics: A minor, C minor, E♭ minor and G♭ major.}}`,
  figs: {
    med: block('C', 'major', [['C3 E4 G4 C5', 'C'], ['E3 E4 G#4 B4', 'E'], ['Ab2 Eb4 Ab4 C5', 'A♭'], ['A2 E4 A4 C#5', 'A'], ['Eb3 Eb4 G4 Bb4', 'E♭']], {bpm: 56, d: 'h'}),
    dimfour: block('A', 'minor', [['G#3 B3 D4 F4', 'vii°⁷'], ['A3 C4 E4 A4', 'a'], ['G#3 B3 D4 F4', 'vii°⁷'], ['C3 G3 C4 Eb4', 'c'], ['G#3 B3 D4 F4', 'vii°⁷'], ['Eb3 Bb3 Eb4 Gb4', 'e♭'], ['G#3 B3 D4 F4', 'vii°⁷'], ['Gb3 Db4 Gb4 Bb4', 'G♭']], {bpm: 56, d: 'h'}),
    pivot: block('C', 'major', [['C3 E4 G4 C5', 'C: I', '', 'q'], ['A2 E4 A4 C5', 'vi = ii', '', 'q'], ['D3 F#4 A4 C5', 'G: V⁷', '', 'q'], ['G2 D4 G4 B4', 'I', '', 'q']], {bpm: 60}),
    ct: block('C', 'major', [['C3 E4 G4 C5', 'C: I', 'C', 'h'], ['E3 E4 G#4 B4', 'E: I', 'E', 'h']], {bpm: 56}),
    enhm: block('C', 'major', [['G2 B3 D4 F4', 'C: V⁷', 'G⁷', 'q'], ['G2 B3 D4 E#4', 'b: Ger⁺⁶', '', 'q'], ['F#2 C#4 F#4 A#4', 'V', 'F♯', 'q'], ['B2 B3 D4 F#4', 'i', 'Bm', 'q']], {bpm: 56}),
  },
  quiz: [
    () => { const [k, m] = pick([['C', 'E'], ['C', 'Ab'], ['C', 'A'], ['C', 'Eb'], ['G', 'B'], ['G', 'Eb'], ['F', 'A'], ['F', 'Db']]);
      const ok = {C: ['E', 'Ab', 'A', 'Eb'], G: ['B', 'Eb', 'Bb', 'E'], F: ['A', 'Db', 'Ab', 'D']}; const lst = ok[k] || [m];
      return ask(`Which major chord is a chromatic mediant of ${pn(k)} major?`, pn(m) + ' major', ['D', 'F', 'G', 'C', 'A', 'B', 'Bb', 'Gb', 'Ab', 'E'].filter(x => !lst.includes(x) && x !== k).slice(0, 4).map(x => pn(x) + ' major'), 'A chromatic mediant has the same quality, a root a third away and exactly one common note.'); },
    bank([['What confirms a modulation?', 'A cadence in the new key, often pre-dominant – V – I', ['A change of dynamic', 'A fermata', 'A new time signature'], 'Without it the new key is only tonicized.'],
      ['Which kind of pivot chord is smoothest?', 'Tonic in the old key and pre-dominant in the new key', ['Dominant in the new key', 'Any diminished chord', 'The same function in both'], 'It leads naturally to the new V.'],
      ['What does a recurring new sharp usually mean in a modulation?', 'It is the leading tone (7) of the new key', ['It is the tonic of the old key', 'It is the 4th degree', 'It is a passing tone'], 'Look for the “sharpest sharp”.'],
      ['What does a new flat usually represent?', 'The 4th degree of the new key', ['The leading tone', 'The tonic', 'The mediant'], 'A new flat acts like the last flat of a signature.'],
      ['How many chromatic mediants does a triad have?', 'Four', ['Two', 'Six', 'One'], 'Two a third above and two a third below, sharing one note each.'],
      ['What is a direct (phrase) modulation?', 'A sudden change of key with no pivot or preparation', ['A change using a common note', 'A change using a sequence', 'A change using a diminished seventh'], 'It is the pop “key change”.'],
      ['Which two sonorities are used in enharmonic modulation?', 'The dominant seventh and the fully diminished seventh', ['Major and minor triads', 'Suspensions and appoggiaturas', 'Pedal points'], 'Both can be respelled and given a different meaning.']]),
    () => { const k = pick(['C', 'G', 'D', 'F', 'A', 'Bb', 'Eb']), cl = closeKeys(k), d = Object.keys(A.FIFTHS.major).filter(x => Math.abs(A.FIFTHS.major[x] - A.FIFTHS.major[k]) >= 3); return ask(`Which of these keys is closely related to ${pn(k)} major?`, pn(pick(cl.slice(1))) + ' major', d.slice(0, 5).map(x => pn(x) + ' major'), 'Closely related keys differ by at most one sharp or flat.'); },
    () => { const [k1, k2] = pick([['C', 'G'], ['G', 'D'], ['F', 'C'], ['D', 'A']]), s1 = triadSet(k1, 'major'), s2 = triadSet(k2, 'major'), common = s1.filter(x => s2.includes(x)), other = s1.filter(x => !s2.includes(x));
      const ans = pick(common); return ask(`Which chord could be a pivot between ${pn(k1)} major and ${pn(k2)} major?`, ans, other.concat(s2.filter(x => !s1.includes(x))).slice(0, 4), `${ans} is diatonic in both keys.`); },
    () => { const [a, b, n] = pick([['G⁷', 'a German sixth in B minor', 'enharmonic modulation'], ['a phrase ends, the next begins in a new key', '', 'direct modulation'], ['A minor, vi in C and ii in G', '', 'pivot chord modulation'], ['one shared note links two chromatic-mediant chords', '', 'common-tone modulation']]); return ask(`Which kind of modulation is this: ${b ? a + ' read as ' + b : a}?`, n, ['enharmonic modulation', 'direct modulation', 'pivot chord modulation', 'common-tone modulation', 'sequential modulation'], 'Compare the ways the two keys are joined.'); },
    bank([['What confirms a modulation?', 'A cadence in the new key', ['A change of dynamics', 'A pause', 'A key signature'], 'Without one it is only a tonicization.'],
      ['How many closely related keys does a key have?', 'Five', ['Two', 'Three', 'Seven'], 'Including its relative key.'],
      ['What is a pivot chord?', 'A chord common to both keys', ['A chord in the bass', 'A chord with a seventh', 'The last chord of the piece'], 'It is reinterpreted at the change of key.'],
      ['Where do Classical composers usually modulate from a major key?', 'To the dominant', ['To the subdominant', 'To the tritone', 'To the Neapolitan'], 'From minor they go to the relative major.'],
      ['What are chromatic mediants?', 'Chords of the same quality with roots a third apart sharing one note', ['Chords a fifth apart', 'Chords on the leading tone', 'Chords of different qualities'], 'C major and E major, for example.'],
      ['In an enharmonic modulation, V⁷ is reinterpreted as…', 'A German sixth', ['An Italian sixth', 'A Neapolitan', 'A borrowed iv'], 'The two chords sound the same but are spelled differently.'],
      ['How many keys can a fully diminished seventh chord point to?', 'Four', ['One', 'Two', 'Seven'], 'It can be spelled four ways, so it resolves to four tonics.']]),
  ],
  play: [modEx('Modulate from {k1} major to {k2} major: I – vi (=ii) – V⁷ – I', [['C', 'G'], ['G', 'D'], ['F', 'C']], 'The second chord is the pivot.'),
    modEx('Modulate from {k1} major to {k2} major', [['D', 'A'], ['Bb', 'F'], ['A', 'E']]),
    () => { const k = pick(['C', 'G', 'F']), t = above(R(k), 2, 4), a = chordFromRoot(R(k), 'major'), b = chordFromRoot(t, 'major'); return {title: `Common-tone modulation: ${pn(k)} major to ${nm(t)} major`, help: `The two chords share one note.`, steps: [{label: pn(k), pcs: pcsOf(a), names: a.map(n => nm(n))}, {label: nm(t), pcs: pcsOf(b), names: b.map(n => nm(n))}]}; }]});

/* ================= Larger forms: binary, ternary, sonata, rondo; fugue ================= */
const FUGUE_S = ['C4', 'G4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4'], FUGUE_A = ['G4', 'D5', 'E5', 'D5', 'C5', 'B4', 'A4', 'G4'];
CH.push({id: 'binaryternary', title: 'Binary and ternary forms', blurb: 'Sectional or continuous, simple, balanced and rounded binary; ternary; telling rounded binary from ternary',
  body: `<p>Binary and ternary forms divide a piece into <b>two</b> or <b>three</b> sections. By convention capital letters name <b>sections</b> (A, B) and lower-case letters name the <b>phrases</b> inside them (a, b).</p>
<h3>Describing a binary or ternary form</h3>
<ul><li><b>Sectional</b>: the first section (A) ends on the <b>tonic</b>, so it could stand alone. <b>Continuous</b>: A does not end on the tonic: it ends in a new key or on the dominant, and pulls the music onward.</li>
<li><b>Two-reprise</b>: both sections are repeated (A :‖ B :‖).</li>
<li><b>Rounded</b>: the opening material returns after the contrasting section.</li></ul>
<p>A complete name puts the descriptors together: <i>two-reprise continuous rounded binary</i>.</p>
<h3>Three kinds of binary form</h3>
<table class="htab"><tr><th>Simple binary</th><td>No special features: B develops ideas from A and ends differently. Common in Baroque and early Classical music.</td></tr>
<tr><th>Balanced binary</th><td>A ends in a new key (usually V, or the relative major in minor) and B <b>ends with the same cadence transposed to the home key</b>. Typical of Baroque dance suites by Bach and Handel.</td></tr>
<tr><th>Rounded binary</th><td>The opening melody returns in the middle of B and runs on to the end. Very common in the Classical period, in themes of variations and in minuets.</td></tr></table>
<div class="fbar"><span class="a" style="--w:2">A · ends on V (or a new key)</span><span class="b" style="--w:2">B · ends on I</span></div>
<p style="margin-top:-6px"><small>Continuous binary</small></p>
<div class="fbar"><span class="a" style="--w:2">A · ends on V</span><span class="b" style="--w:1">B (departure)</span><span class="a" style="--w:1">A′ (return) · I</span></div>
<p style="margin-top:-6px"><small>Rounded binary</small></p>
<h3>Ternary form</h3>
<p><b>Ternary form</b> is <b>A – B – A</b>: a first section, a contrasting section (often in the dominant, the relative key or the parallel key), then the first section again, so the piece feels like going out and coming home. Each section is usually a self-contained unit, often a period or a rounded binary in itself, and it is often longer than eight bars. It is the form of minuets with trios and of many Romantic character pieces such as nocturnes.</p>
<div class="fbar"><span class="a" style="--w:2">A · closed</span><span class="b" style="--w:2">B · contrast</span><span class="a" style="--w:2">A · closed</span></div>
<h3>Rounded binary or ternary?</h3>
<p>Pieces of five or six phrases can be either. Weigh three clues:</p>
<ol><li><b>Proportion</b>: if the contrasting section is too short to stand alone (about half the length of A or less), think rounded binary.</li><li><b>Nature</b>: if the contrasting section is built from motives of A and sits on the dominant (often a dominant pedal), think rounded binary. If it has its own melody and stable harmony, think ternary.</li><li><b>Era</b>: Baroque and Classical composers favour binary forms; Romantic composers favour ternary. These are only tendencies, so weigh the clues together.</li></ol>
<h3>The binary principle and its keys</h3>
<p>The <b>binary principle</b> (Spencer and Temko) says that the first section of a binary form <b>modulates to a new key</b> and the second section <b>modulates back</b> to the first key. Baroque music shows it very often:</p>
<table class="htab"><tr><th>Major</th><td>First section: I → modulation → <b>V</b>. Second section: V → modulation → I.</td></tr>
<tr><th>Minor</th><td>First section: i → modulation → <b>III</b> (or v). Second section: III (or v) → modulation → i.</td></tr></table>
<p>Because the first section of a balanced binary ends in a new key, it is always a <b>continuous</b> binary form.</p>
<h3>Examples to listen for</h3>
<ul><li><b>Balanced binary:</b> Bach’s Invention No. 8 in F major: the nine bars that modulate from F major to C major at the end of the first section are repeated, transposed, as the last nine bars that modulate from B♭ major to F major. Also the Courante of Bach’s French Suite No. 6.</li>
<li><b>Rounded binary:</b> Mozart’s Piano Sonata K. 284, third movement, and Schubert’s Minuets D. 41 are both <i>two-reprise continuous rounded binary</i>: the opening melody returns after a contrasting phrase (often with a different texture and register) at the start of the second section, and both sections are repeated. In rounded binary the return is often <b>shortened</b>.</li>
<li><b>Simple binary:</b> the Gavotte I of Bach’s English Suite No. 3: the second section may begin like the first (large-scale A A′) and then develop its motives, but the opening melody does not come back and the ending differs.</li>
<li><b>Sectional ternary:</b> Brahms’s “Wiegenlied” has a first section that ends on the tonic. <b>Continuous</b>: Haydn’s Symphony No. 94, second movement.</li></ul>
<h3>More about ternary form</h3>
<p>Douglass Green describes ternary form (A B A) as <b>statement, digression, restatement</b>. Mozart’s Andante in E♭, K. 15mm, is a simple example. Romantic character pieces (nocturnes, intermezzos, “songs without words”) by Schubert, Chopin, Mendelssohn, Schumann and Brahms are often in a <b>larger</b> ternary form whose sections may be longer than eight bars, as in Rachmaninoff’s Prelude in C♯ minor, Op. 3 No. 2. A <b>compound ternary</b> form is one in which the A or B section is itself a binary or ternary form: the minuet and trio and the <i>da capo</i> aria are compound.</p>
<h3>An example of the three tests: Beethoven’s Bagatelle Op. 119 No. 9</h3>
<p>Bars 9–12 contrast with bars 1–8, and they last <b>half as long</b> as the opening section, so the <b>proportion</b> suggests rounded binary. The melody of the contrast is built from the contour of the first four notes of bar 1, and its harmony alternates V with I⁶₄: the <b>nature</b> also suggests rounded binary. Beethoven is a bridge between the Classical and Romantic eras, so the third test (<b>era</b>) cannot decide; two out of three tests point to rounded binary.</p>`,
  figs: {},
  quiz: [
    bank([['What does the binary principle say?', 'The first section modulates to a new key and the second modulates back', ['Both sections stay in the tonic', 'The second section is always minor', 'The first section is always repeated'], 'In major the new key is usually V; in minor it is III (or v).'],
      ['What is a compound ternary form?', 'A ternary form with a binary or ternary form inside one section', ['A ternary form in compound meter', 'A form with six sections', 'A form with two keys'], 'The minuet and trio is an example.'],
      ['Which phrase describes ternary form?', 'Statement, digression, restatement', ['Question, answer, question', 'Theme, variation, variation', 'Introduction, body, coda'], 'It is the A B A plan.'],
      ['Why is a balanced binary always continuous?', 'Its first section ends in a new key, not on the tonic', ['Because it has no repeats', 'Because it is in minor', 'Because it has three sections'], 'A continuous A section does not end on the tonic.'],
      ['Which genres by Chopin and Schumann are often in larger ternary form?', 'Nocturnes and character pieces', ['Fugues', 'Chorales', 'Rondos only'], 'Their sections may be longer than eight bars.']]),
    () => { const [d, n] = pick([['A ends on the tonic', 'sectional'], ['A ends on V or in a new key', 'continuous'], ['both A and B are repeated', 'two-reprise'], ['the opening material returns after the contrast', 'rounded']]); return ask(`Which term fits: ${d}?`, n, ['sectional', 'continuous', 'two-reprise', 'rounded'], 'These words describe binary and ternary forms.'); },
    () => { const [d, n] = pick([['A ends in the dominant key, and B ends with the same cadence in the home key', 'Balanced binary'], ['the opening melody returns inside B', 'Rounded binary'], ['B develops A’s ideas, no return and no matching cadence', 'Simple binary'], ['A, a contrasting B with its own melody, then A again', 'Ternary form']]); return ask(`Which form is this: ${d}?`, n, ['Balanced binary', 'Rounded binary', 'Simple binary', 'Ternary form'], 'Compare the two sections and their cadences.'); },
    bank([['How many sections does ternary form have?', 'Three (A B A)', ['Two', 'Four', 'Five'], 'The first returns after a contrast.'],
      ['What does “continuous” mean for a binary form?', 'The first section does not end on the tonic', ['The piece never stops', 'There are no repeats', 'It has only one phrase'], 'It often ends in a new key or on V.'],
      ['Which form is typical of Baroque dance suites?', 'Balanced binary', ['Sonata-rondo', 'Twelve-bar blues', 'Strophic form'], 'The two sections end with the same cadence in different keys.'],
      ['Which clue suggests rounded binary rather than ternary?', 'A short B section on a dominant pedal built from A’s motives', ['A long B section in a new key', 'A new melody in B', 'A repeated A after a coda'], 'Short, dependent contrasts point to rounded binary.'],
      ['In which era were ternary forms especially favoured?', 'The Romantic era', ['The Renaissance', 'The Baroque era only', 'The 20th century only'], 'Character pieces like nocturnes use it.'],
      ['What do capital letters label in a form diagram?', 'Sections', ['Phrases', 'Chords', 'Dynamics'], 'Phrases get lowercase letters.']]),
  ],
  play: [
    progEx('First section of a continuous binary: end with V – I in {key}', ['I', 'IV', 'V', 'I'], () => pick(['G', 'D', 'C']), 'major', 'Imagine this is the key the first section modulates to (the dominant).'),
    progEx('Rounded binary: the return of A on the tonic. Play V – I in {key}', ['V', 'I'], () => pick(['C', 'G', 'F']), 'major'),
    progEx('Ternary form: B in the dominant, back to I. Play I – V – I in {key}', ['I', 'V', 'I'], () => pick(['C', 'G', 'F']), 'major'),
  ]});

CH.push({id: 'sonatarondo', title: 'Sonata and rondo forms', blurb: 'Exposition, development, recapitulation; four structural functions; rondo; the movements of a Classical sonata',
  body: `<p><b>Sonata form</b> is the most important form of the Classical period, used for the first movements (and often more) of sonatas, symphonies and string quartets. It grows from rounded and balanced binary form and has three large sections:</p>
<div class="fbar"><span class="a" style="--w:3">Exposition: PT (I) · TR · ST (V) · CT (V)</span><span class="b" style="--w:2">Development: many keys</span><span class="a" style="--w:3">Recapitulation: PT · TR · ST (I) · CT (I)</span><span class="i" style="--w:1">Coda</span></div>
<ul><li><b>Exposition</b>: presents the themes. The <b>primary theme</b> (PT) is in the tonic; a <b>transition</b> (TR, also called a bridge) moves to the new key; the <b>secondary theme</b> (ST) arrives in the <b>dominant</b> (the <b>relative major</b> if the piece is in minor); a <b>closing theme</b> (CT) rounds it off. Haydn and Mozart often ended the transition on a half cadence followed by a pause to announce the secondary theme. The exposition is usually repeated.</li>
<li><b>Development</b>: breaks the themes into fragments, sequences them and passes through many keys, often with irregular phrases. It ends by returning to the tonic’s dominant (the <b>retransition</b>).</li>
<li><b>Recapitulation</b>: brings back the primary theme in the tonic, but this time the transition does <b>not</b> leave the tonic, so the secondary and closing themes are also in the <b>tonic</b>. A <b>coda</b> may finish. Something first heard away from the tonic returns in the tonic: the <b>sonata principle</b>.</li></ul>
<p>A <b>sonatina form</b> is a sonata form with no development. In real pieces there may be several secondary themes, a development that brings in new material, or no closing theme.</p>
<h3>Four structural functions</h3>
<p>Any passage in a piece can be heard as doing one of four jobs:</p>
<table class="htab"><tr><th>Expository</th><td>presents stable material: clear melody, defined phrases, a steady tonal centre (the themes)</td></tr>
<tr><th>Transitional</th><td>moves from one key to another, often with a more active accompaniment and tonicizations</td></tr>
<tr><th>Developmental</th><td>fragments and sequences earlier ideas, modulates through many keys, may use irregular phrase lengths and elision</td></tr>
<tr><th>Terminative</th><td>ends a section by emphatically alternating tonic and dominant chords to confirm the key (the closing theme)</td></tr></table>
<h3>Rondo form</h3>
<p>A <b>rondo</b> has a returning <b>refrain</b> (A) separated by contrasting <b>episodes</b>: the five-part <b>ABACA</b> or the seven-part <b>ABACABA</b>. The first episode (B) is in a closely related key, usually the dominant (the mediant in minor); the second (C) may be in a more distant key, such as the tonic minor. In a <b>sonata-rondo</b> the second episode is a development and the B episode returns in the tonic, like the secondary theme of a sonata. Rondo has a recognisable <b>character</b>: quick, duple, light, often staccato.</p>
<div class="fbar"><span class="a" style="--w:1">A</span><span class="b" style="--w:1">B</span><span class="a" style="--w:1">A</span><span class="c" style="--w:1">C</span><span class="a" style="--w:1">A</span><span class="b" style="--w:1">B</span><span class="a" style="--w:1">A</span></div>
<h3>The movements of a Classical multi-movement work</h3>
<ol><li>First movement: fast, in sonata form.</li><li>Second movement: slow; ternary, theme and variations, or sonatina form.</li><li>Third movement: minuet and trio (later scherzo and trio).</li><li>Fourth movement: fast; rondo, sonata or sonata-rondo.</li></ol>
<h3>More about sonata form</h3>
<ul><li><b>Two-reprise.</b> In a Classical sonata, repeat signs make the movement a two-reprise form: the exposition is repeated, then the development and recapitulation are repeated together as one unit. Douglass Green notes that sonata form grew out of rounded and balanced binary forms: the recapitulation presents the themes of the exposition (PT, ST, CT) transposed to the tonic.</li>
<li><b>Sonatina form</b> is sonata form without a development (not just a small or easy sonata). It occurs in slow movements and overtures: the “Miniature Overture” of Tchaikovsky’s <i>Nutcracker</i> is a familiar example.</li>
<li><b>Sonata principle.</b> Charles Rosen explains that the exposition polarizes the tonic against the dominant: the material outside the tonic (the second group) is a large-scale <i>dissonance</i> that must be resolved <b>as a whole</b>, which is why the second theme returns in the tonic in the recapitulation; a plain return to the tonic key would not resolve it.</li>
<li><b>Monothematic sonata.</b> Haydn liked to restate the primary theme in the dominant where the secondary theme would normally be, to show that the tonal plan matters as much as the themes.</li>
<li>Pieces may have <b>several secondary themes</b> (ST1, ST2), a development with <b>new material</b> or no closing theme.</li>
<li><b>Cadences and textures mark the form.</b> Listen for them: the transition often has a livelier accompaniment than the themes and ends on a half cadence followed by a rest before the ST (Haydn’s Piano Sonata Hob. XVI:35, Mozart’s K. 284).</li></ul>
<h3>Structural functions: examples</h3>
<ul><li><b>Expository</b>: the secondary theme of Mozart’s Piano Sonata K. 333 (a parallel double period closed by a perfect authentic cadence).</li>
<li><b>Transitional</b>: moves between tonal centres, with tonicizations and an accidental that signals the new key. It is shorter than a development.</li>
<li><b>Developmental</b>: sequences, fragments and several keys, often irregular phrase lengths and elisions to keep the listener off balance; it is longer than a transition and has more modulations.</li>
<li><b>Terminative</b>: emphatic alternation of tonic and dominant, as in the closing theme of Mozart’s Symphony No. 41 (first movement) and the end of the finale of Beethoven’s “Moonlight” Sonata.</li></ul>
<h3>A seven-part rondo: Beethoven’s Pathétique, last movement</h3>
<table class="htab"><tr><th>A</th><td>Refrain in C minor</td></tr><tr><th>transition</th><td>short and sequential, leading to the mediant</td></tr><tr><th>B</th><td>First episode in E♭ major (III): establishes a different key; it ends with a parallel period</td></tr><tr><th>retransition</th><td>half cadence on G</td></tr><tr><th>A</th><td>Refrain in C minor</td></tr><tr><th>C</th><td>Second episode in A♭ major (VI)</td></tr><tr><th>retransition</th><td>half cadence on G, developing the last motives of C by sequence</td></tr><tr><th>A + B</th><td>A short refrain, then the first episode again, now in <b>C major</b> (the tonic): the sonata principle</td></tr><tr><th>A + coda</th><td>The last refrain in C minor and a coda</td></tr></table>
<p>In the standard plan the first episode is in V (or III in minor), the second more freely (tonic minor, or vi/VI). A <b>retransition</b> is a transition that returns to material already heard. In a <b>sonata rondo</b> the C episode is replaced by a development: A – B – A – Dev. – A – B – A.</p>
<h3>Rondo character</h3>
<p>A <b>rondo character</b> piece has a quick tempo, a duple meter (simple, such as 2/4 or 2/2, or compound, such as 6/8) and a light, often staccato manner. It was the favourite for the finale of a Classical sonata, quartet or symphony (Haydn’s Symphony No. 104 and quartet Op. 33 No. 2; Mozart’s Symphonies Nos. 36 and 39; the Chevalier de Saint-Georges’s Violin Concerto No. 9), but not every rondo has this character, and a piece in rondo character need not be a rondo.</p>`,
  figs: {},
  quiz: [
    bank([['What is sonatina form?', 'Sonata form without a development', ['A very short sonata', 'A sonata for beginners only', 'A sonata with three themes'], 'It appears in slow movements and overtures.'],
      ['What does the sonata principle require?', 'Material first heard away from the tonic returns in the tonic', ['The first theme repeats in the dominant', 'The development is always in minor', 'The coda is in the dominant'], 'The “dissonance” of the second key is resolved as a whole.'],
      ['Which key is usually used for the first episode of a rondo in major?', 'The dominant', ['The tonic minor', 'The subdominant', 'The Neapolitan'], 'In minor the first episode is usually in the mediant.'],
      ['What is the retransition in a rondo?', 'A transition that returns to material already heard', ['The coda', 'The first episode', 'A change of tempo'], 'It leads back to the refrain.'],
      ['In Beethoven’s Pathétique finale, why is the first episode in C major near the end important?', 'It restates the episode in the tonic (sonata principle)', ['It is a modulation to the dominant', 'It is the coda', 'It is a new theme'], 'The B section first appeared in E♭ major.'],
      ['How do cadences help in sonata form?', 'They mark the end of sections; the transition often ends on a half cadence and a rest', ['They are not used', 'They always occur on V', 'They only occur in the coda'], 'A pause before the ST is typical of Haydn and Mozart.']]),
    () => { const [q, a, w, why] = pick([['In a sonata-form exposition in a major key, where is the secondary theme?', 'In the dominant', ['In the tonic', 'In the subdominant', 'In the parallel minor'], 'The key change is what drives the form.'],
      ['In a sonata-form exposition in a minor key, where is the secondary theme usually?', 'In the relative major', ['In the tonic minor', 'In the dominant minor', 'In the Neapolitan'], 'The relative major is a close, bright contrast.'],
      ['In the recapitulation, where is the secondary theme?', 'In the tonic', ['In the dominant', 'In the relative key', 'It does not return'], 'This is the sonata principle.'],
      ['What section follows the exposition?', 'The development', ['The recapitulation', 'The coda', 'The trio'], 'It breaks up the themes and modulates.'],
      ['Which section usually ends the exposition?', 'The closing theme', ['The transition', 'The development', 'The primary theme'], 'It affirms the new key.']]); return ask(q, a, w, why); },
    bank([['Which structural function is typical of the primary and secondary themes?', 'Expository', ['Developmental', 'Terminative', 'Transitional'], 'They are stable and clearly phrased.'],
      ['Which function modulates through many keys with sequences and fragments?', 'Developmental', ['Expository', 'Terminative', 'Transitional'], 'The development section is the main example.'],
      ['Which function is a closing theme?', 'Terminative', ['Expository', 'Developmental', 'Transitional'], 'It hammers home tonic and dominant.'],
      ['What is a rondo?', 'A form with a returning refrain between contrasting episodes', ['A form with two sections only', 'A fugue for four voices', 'A slow introduction'], 'ABACA or ABACABA.'],
      ['What is the usual form of the fourth movement of a Classical symphony?', 'Rondo or sonata-type', ['Minuet and trio', 'Theme and variations only', 'Fugue'], 'A fast, lively finale.'],
      ['What is the usual third movement?', 'Minuet and trio', ['Sonata form', 'Rondo', 'A cadenza'], 'It is in ternary form.'],
      ['What is a sonatina form?', 'Sonata form without a development', ['A very long sonata', 'A rondo', 'A binary dance'], 'Exposition and recapitulation only.'],
      ['What is the “sonata principle”?', 'Material first heard away from the tonic returns in the tonic', ['The first theme is always loud', 'The development is in the tonic', 'The coda has no cadence'], 'It resolves the large-scale tension.']]),
  ],
  play: [
    progEx('Exposition key plan in {key}: tonic chord, then the dominant chord', ['I', 'V'], () => pick(['C', 'G', 'F']), 'major', 'The primary theme is in I; the secondary theme arrives in the key of V.'),
    progEx('Retransition and recapitulation in {key}: V⁷ – I', ['V7', 'I'], () => pick(['C', 'G', 'F']), 'major', 'The development ends on the dominant; the primary theme returns on the tonic.'),
    progEx('Sonata key plan in a minor key {key}: i, then III (the relative major)', ['i', 'III'], () => pick(['A', 'E', 'D']), 'minor'),
  ]});

CH.push({id: 'fugue', title: 'Invention and fugue', blurb: 'Subject, answer, countersubject, episodes; the invention exposition; analyzing a fugue',
  body: `<p>A texture made of several independent melodic lines is called <b>contrapuntal</b> (or <b>polyphonic</b>), in contrast to <b>homophonic</b> melody-and-accompaniment texture. {{ch:counterpoint}} began with species; these two forms are its masterpieces.</p>
<h3>The two-part invention</h3>
<p>J. S. Bach’s <b>Two-Part Inventions</b> were meant both as keyboard pieces and as models for composing. An <b>invention exposition</b> in the style of the Inventions in C major and E minor takes a short theme and states it in four bars: bar 1 in the tonic (right hand), bar 2 the same an <b>octave lower</b> in the left hand, bar 3 a <b>fifth higher</b> (on the dominant), bar 4 the same an octave lower. The harmony runs <b>I – I – V – V – I</b>, and the exposition ends on a tenth: the tonic in the bass and the 3rd in the top voice. Each time the theme is stated, the other voice adds <b>counterpoint</b> that outlines the harmony (not species counterpoint), and the theme’s shape may need a small change to land on V and return to I.</p>
<h3>The fugue</h3>
<p>A <b>fugue</b> is a contrapuntal piece built from sections called <b>expositions</b> (full statements of the subject) and <b>episodes</b> (passages without a full subject).</p>
<ul><li>The <b>subject</b> is the main melodic idea, stated in turn by each voice. The first voice states it in the tonic.</li>
<li>The second voice enters with the <b>answer</b>, the subject in the key of the <b>dominant</b>. A <b>real answer</b> is an exact transposition; a <b>tonal answer</b> alters some intervals (often changing a leap of a fifth into a fourth) so that the music stays in the key and can return to the tonic.</li>
<li>A <b>countersubject</b> is counterpoint that regularly accompanies the subject each time it returns.</li>
<li>A <b>bridge</b> is a short modulating link inside the first exposition. An <b>episode</b> develops material by <b>fragmentation</b>, using the <b>head</b> (beginning) or <b>tail</b> (end) of the subject, often in sequence.</li>
<li>Later expositions (middle entries) state the subject in other keys. Entries may <b>overlap</b> in <b>stretto</b>. A fugue ends with a final statement and a cadence.</li></ul>
{{fig:fsub|A fugue subject in C (tonic), then its real answer in G (dominant): the same melody a fifth higher.}}
<div class="fbar"><span class="a" style="--w:2">Exposition 1 · S A S A</span><span class="i" style="--w:1">Episode 1</span><span class="b" style="--w:2">Exposition 2</span><span class="i" style="--w:1">Episode 2</span><span class="b" style="--w:2">Exposition 3</span><span class="c" style="--w:2">Final entries · cadence</span></div>
<p>To analyze a fugue: find the first exposition and name each entry (subject, answer, countersubject), note the keys of later expositions, and mark the episodes and the motives they develop.</p>`,
  figs: {fsub: {key: 'C', mode: 'major', clef: 'treble', bpm: 90, events: FUGUE_S.map((n, i) => ({notes: [n], d: 'q', sym: i === 0 ? 'subject (tonic)' : undefined})).concat(FUGUE_A.map((n, i) => ({notes: [n], d: 'q', sym: i === 0 ? 'real answer (dominant)' : undefined})))}},
  quiz: [
    bank([['What is a fugue subject?', 'The main melodic idea, stated in turn by each voice', ['The last chord', 'A kind of cadence', 'A chord progression'], 'The first voice states it in the tonic.'],
      ['In what key is the answer?', 'The dominant', ['The subdominant', 'The relative minor', 'The tonic'], 'The second voice enters a fifth above (or a fourth below).'],
      ['What is a real answer?', 'An exact transposition of the subject', ['A reversal of the subject', 'A shorter subject', 'A new theme'], 'A tonal answer changes some intervals.'],
      ['What is a tonal answer?', 'An answer that alters some intervals to stay in the key', ['An answer in the tonic', 'A silent entry', 'An answer in another instrument'], 'It often turns a leap of a fifth into a fourth.'],
      ['What is a countersubject?', 'Counterpoint that regularly accompanies the subject', ['A very high subject', 'A cadence', 'A second fugue'], 'It returns with each statement of the subject.'],
      ['What is an episode?', 'A passage without a full statement of the subject', ['The first entry', 'The final cadence', 'A pedal note'], 'It develops fragments of the subject.'],
      ['What is stretto?', 'Entries of the subject that overlap', ['A very slow tempo', 'A cadence on V', 'A held bass note'], 'The next voice enters before the subject has finished.'],
      ['What is the harmonic plan of an invention exposition in the style of Bach’s C major Invention?', 'I – I – V – V – I', ['I – IV – V – I', 'ii – V – I', 'i – iv – V – i'], 'The theme is stated on I and then on V, with counterpoint in between.'],
      ['What is the difference between contrapuntal and homophonic texture?', 'Contrapuntal has independent lines; homophonic has a melody with accompaniment', ['They are the same', 'Homophonic has more voices', 'Contrapuntal has no rhythm'], 'A fugue is contrapuntal.']]),
  ],
  play: [noteSteps('Play the fugue subject (in C)', 'One note at a time: C G A G F E D C.', ['C', 'G', 'A', 'G', 'F', 'E', 'D', 'C']),
    noteSteps('Play the real answer (in G)', 'The same melody a fifth higher: G D E D C B A G.', ['G', 'D', 'E', 'D', 'C', 'B', 'A', 'G']),
    progEx('Harmony of an invention exposition in {key}: I – I – V – V – I', ['I', 'I', 'V', 'V', 'I'], () => pick(['C', 'G', 'F']), 'major')]});

/* ================= Beyond tonality: jazz, impressionism, set theory, serialism, minimalism ================= */
const JZ = {maj7: ['maj7', 'major seventh (Δ7)'], min7: ['m7', 'minor seventh'], dom7: ['7', 'dominant seventh'], hdim7: ['m7♭5', 'half-diminished (m7♭5)'], dim7: ['°7', 'fully diminished seventh'], dom9: ['9', 'dominant ninth'], maj9: ['maj9', 'major ninth'], min9: ['m9', 'minor ninth'], dom7b9: ['7♭9', 'dominant seventh flat nine'], dom7s9: ['7♯9', 'dominant seventh sharp nine']};
const jzName = (r, q) => pn(r) + JZ[q][0];
const SCALE_FOR = {maj7: 'Ionian or Lydian', min7: 'Dorian', dom7: 'Mixolydian', hdim7: 'Locrian', maj9: 'Ionian or Lydian', min9: 'Dorian', dom9: 'Mixolydian'};
const rand12 = () => Math.floor(Math.random() * 12);
CH.push({id: 'jazz', title: 'Introduction to jazz harmony', blurb: 'Seventh, ninth and altered chord symbols, guide tones, ii–V–I, turnarounds, tritone substitution, scales for improvising',
  body: `<p>Jazz harmony starts where the earlier chapters stopped: chords of four, five and more notes, written as <b>lead-sheet symbols</b> that leave the voicing to the player.</p>
<h3>Chord symbols</h3>
<table class="htab"><tr><th>maj7 or Δ7</th><td>major triad with a major 7th: Cmaj7 = C–E–G–B</td></tr>
<tr><th>m7 (or –7)</th><td>minor seventh: Cm7 = C–E♭–G–B♭</td></tr>
<tr><th>7</th><td>dominant seventh: C7 = C–E–G–B♭</td></tr>
<tr><th>m7♭5 or ø7</th><td>half-diminished: C–E♭–G♭–B♭</td></tr>
<tr><th>°7</th><td>fully diminished seventh: C–E♭–G♭–B♭♭ (= A)</td></tr>
<tr><th>9, 11, 13</th><td>the 7th is included: C9 = C–E–G–B♭–D. The 9th is the 2nd an octave up, from the major scale unless altered.</td></tr>
<tr><th>alterations</th><td>♭5, ♯5, ♭9, ♯9, ♯11, ♭13: C7♭9 has D♭ as the ninth. The root, 3rd and 7th of a dominant stay as they are.</td></tr>
<tr><th>6, 6/9, add9</th><td>C6 has a 6th (A) and no 7th; C add9 has a 9th but no 7th</td></tr>
<tr><th>sus</th><td>the 4th replaces the 3rd: C7sus = C–F–G–B♭</td></tr></table>
<p>Dominant sevenths are usually <b>altered</b> (♭9, ♯9, ♯5 or ♭5) when they have dominant function, that is, when they resolve down a fifth, and left plain when they are tonic chords, as in the first bar of a blues.</p>
{{fig:iivi|ii – V – I with extended chords in C: Dm9, G7♭9, Cmaj9.}}
<h3>Guide tones</h3>
<p>The <b>3rd and 7th</b> of a chord are its <b>guide tones</b>: they define the quality. In a circle-of-fifths chain such as ii – V – I, the guide tones move by <b>step</b> (or stay put), so one line of 3rds and 7ths links the chords smoothly.</p>
{{fig:guide|Guide tones in ii – V – I: Dm7 (F, C), G7 (F, B), Cmaj7 (E, B). Each note moves by a step or stays.}}
<h3>Standard progressions</h3>
<ul><li><b>ii – V – I</b>: the core of jazz harmony: Dm7 – G7 – Cmaj7 in C.</li>
<li><b>Turnaround</b>: <b>iii – vi – ii – V</b> (or I – vi – ii – V) fills the last bars of a tune with motion that leads back to the I at the top of the next chorus. Played as all dominant sevenths it is III⁷ – VI⁷ – II⁷ – V⁷ (E⁷ – A⁷ – D⁷ – G⁷ in C), a chain of secondary dominants.</li>
<li><b>Tritone substitution</b>: a dominant seventh may be replaced by the dominant seventh a tritone away, because the two share the same guide tones (3rd and 7th swap roles). So D♭7 can stand in for G7: the chain becomes Dm7 – D♭7 – Cmaj7 with a chromatic bass.</li></ul>
<h3>Scales for improvising</h3>
<p>The <b>blues scale</b> is the minor pentatonic with an added ♭5: 1 – ♭3 – 4 – ♭5 – 5 – ♭7. The ♭3 and ♭5 are “blue notes”: they are not chord tones of a major triad or a dominant seventh. The <b>bebop scale</b> (dominant form) is the Mixolydian scale with an added passing note between ♭7 and the octave; played in descending eighth notes from a chord tone it puts the chord tones on the beats.</p>
{{fig:blues|The C blues scale.}}
{{fig:bebop|The C bebop dominant scale, descending: the added B natural is a chromatic passing note.}}
<p>To choose a scale for a chord, write its tones and fill the gaps with the notes that avoid augmented 2nds. Common matches: <b>maj7</b> – Ionian or Lydian; <b>m7</b> – Dorian; <b>7</b> – Mixolydian; <b>m7♭5</b> – Locrian. Always check the key of the tune: a vi7 chord belongs to its key’s Aeolian, so Dorian would clash.</p>
<h3>Reading chord symbols: the rules</h3>
<ul><li><b>Numbers include everything below.</b> A 9, 11 or 13 assumes the 7th (and the notes between): C9 = C–E–G–B♭–D; the full C13 would be C–E–G–B♭–D–F–A, but players leave out the F (the 11th), which clashes with the major third.</li>
<li><b>“add”</b> means the 7th is not there: C add9 has a 9th but no 7th (in pop it is sometimes written C2). A chord with both a 6th and a 9th and no 7th is a <b>6/9</b> chord (C6/9 = C–E–G–A–D; Cm6/9 has E♭).</li>
<li><b>maj7 / Δ7</b> means the <i>7th</i> is major, not the 9th or 11th; “m” or “–” means a minor third; a minus or plus in front of a number (♭9 and –9, ♯9 and +9) works like a flat or sharp. C+7 is an augmented triad with a minor seventh.</li>
<li><b>6 or 13?</b> Call the sixth “6” only if there is no 7th; if there is a 7th, it is a “13”.</li>
<li><b>sus or 11?</b> Call the fourth “sus” only when the third is missing (C7sus = C–F–G–B♭); with the third present it is an “11”.</li>
<li><b>♭5 or ♯11?</b> If the chord has a normal 5th, the raised fourth is a ♯11 (C–E–G–B♭–F♯). Without the 5th, call it ♭5.</li>
<li>Jazz adds one more chord to the five sevenths of earlier chapters: the <b>minor–major seventh</b> m(maj7), a minor triad with a major 7th (often with a 9th).</li></ul>
<h3>Altered dominant chords</h3>
<p>A dominant seventh is called <b>altered</b> when the 5th, the 9th or both are raised or lowered; the root, 3rd and 7th stay. “G7alt” is a vague label that means G7 with ♭5/♯5 and ♭9/♯9. For ease of reading, an altered note is often <b>respelled</b> so its accidental agrees with the 7th: a ♯9 is written as a ♭10 (so C7♯9 contains both E and E♭), and a ♯5 can be written as ♭13 (but ♭13 implies a natural 5th). Dominants usually carry alterations when they <b>resolve down a fifth</b> (V⁷ to I) and are left plain when they act as a tonic (the first chord of a blues).</p>
<h3>Writing and analyzing a chord symbol</h3>
<p><b>To write</b> a chord from a symbol, first list all the major-scale notes up to the 13th (1 3 5 7 9 11 13), then change them as the symbol says. Dm△11: Dm (D–F–A), △ means a <i>major seventh</i> (C♯), then the regular 9th (E) and 11th (G). Not an “11th that is major.”</p>
<p><b>To analyze</b>, write out the “all-major” chord for comparison and determine (1) the quality of the 7th chord, (2) the upper structure (9, 11, 13), (3) any alterations and (4) any enharmonic respellings. A chord F–B♭–E♭–G♭–D with no third and no fifth is F13sus(♭9): the B♭ is the “sus” (the fourth), not an 11th, because there is no third.</p>
<h3>Five-note voicings</h3>
<ul><li><b>Spread voicings</b>: root, 3rd and 7th (or root, 7th, 3rd) are the lowest three notes; the other chord members sit above, often a fourth or fifth apart.</li>
<li><b>Close voicings</b>: the bass in the left hand, and four notes close together in the right, usually with the 7th or 3rd lowest.</li>
<li>For sus chords voice the fourth as you would the third; for 6th chords voice the 6th as you would the 7th. Omit the 5th when you need to keep five parts. A tritone substitute has the same guide tones, so its voicing is identical to the original’s, apart from the root.</li></ul>
<h3>The ii – V – I in minor</h3>
<p>In major the ii – V – I is Dm9 – G9(13) – Cmaj9; in minor it is <b>Dm7♭5 – G7alt – Cm6</b>: the half-diminished ii, an altered dominant and a minor tonic with a 6th. The same turnarounds (iii – vi – ii – V and I – vi – ii – V) apply. Tunes built on the ii – V – I: “Autumn Leaves”, “What Is This Thing Called Love”, “Tune-Up”, “Lady Bird”.</p>
{{fig:iivimin|ii – V – I in C minor: Dø7, G7♭9 and Cm6, with smooth guide-tone motion.}}
<h3>Chord-scale relationships</h3>
<p>To find a scale for any chord: (1) write the chord tones (with extensions and alterations); (2) put them in a scale within one octave; (3) fill the gaps, avoiding augmented seconds and consecutive half steps; (4) name the result. A G△7(♯11) gives G Lydian. When a chord has a minor third in its spacing, it can be filled by half then whole step or by whole then half step, so some chords have two scales.</p>
<table class="htab"><tr><th>maj7</th><td>Ionian (major) or Lydian</td></tr><tr><th>m7</th><td>Dorian or Aeolian (natural minor)</td></tr><tr><th>ø7 (m7♭5)</th><td>Locrian, or Locrian with ♮2</td></tr><tr><th>7</th><td>Mixolydian, or Lydian-dominant (♯4)</td></tr><tr><th>7alt (♭9/♯9, ♭5/♯5)</th><td>Altered scale or the diminished (half–whole) scale</td></tr><tr><th>m(maj7)</th><td>Melodic minor (ascending)</td></tr></table>
<p>Always check the chord against the key of the tune: in Kern’s “All the Things You Are”, the opening Fm7 is vi7 in A♭ major, so F Aeolian (not Dorian) is correct: the D natural of F Dorian would clash with the D♭ of the key.</p>
<h3>Harmonizing the bebop scale</h3>
<p>Mark Levine’s method harmonizes the eight-note bebop scale (1 2 3 4 5 ♯5 6 7 8) in four parts. Every chord except the tonic is a vii°⁷ in some inversion: the scale is “passing” through diminished chords between tonic chords. Count Basie’s band used a similar idea when harmonizing a simple scale without the diminished sevenths.</p>`,
  figs: {
    iivimin: block('C', 'minor', [['D3 C4 F4 Ab4', 'Dø7'], ['G2 F3 B3 Ab4', 'G7♭9'], ['C3 Eb4 G4 A4', 'Cm6']], {bpm: 60, d: 'h'}),
    iivi: {key: 'C', mode: 'major', clef: 'treble', bpm: 56, events: [['D', 'min9', 'Dm9'], ['G', 'dom7b9', 'G7♭9'], ['C', 'maj9', 'Cmaj9']].map(([r, q, l]) => ({notes: chordFromRoot(R(r), q), d: 'w', sym: l}))},
    guide: {key: 'C', mode: 'major', clef: 'treble', bpm: 60, events: [[['F4', 'C5'], 'Dm7: 3rd, 7th'], [['F4', 'B4'], 'G7: 7th, 3rd'], [['E4', 'B4'], 'Cmaj7: 3rd, 7th']].map(([n, l]) => ({notes: n, d: 'h', sym: l}))},
    blues: {key: 'C', mode: 'major', clef: 'treble', bpm: 100, events: ['C4', 'Eb4', 'F4', 'Gb4', 'G4', 'Bb4', 'C5'].map(n => ({notes: [n], d: 'q'})).concat([{rest: true, notes: [], d: 'q'}])},
    bebop: {key: 'C', mode: 'major', clef: 'treble', bpm: 110, events: ['C5', 'B4', 'Bb4', 'A4', 'G4', 'F4', 'E4', 'D4'].map((n, i) => ({notes: [n], d: 'e', sym: i === 1 ? 'passing' : undefined}))},
  },
  quiz: [
    () => { const [ch, sc] = pick([['maj7', 'Ionian or Lydian'], ['m7', 'Dorian or Aeolian'], ['ø7', 'Locrian'], ['7', 'Mixolydian'], ['7alt', 'Altered scale']]); return ask(`Which scale is usually played over a ${ch} chord?`, sc, ['Ionian or Lydian', 'Dorian or Aeolian', 'Locrian', 'Mixolydian', 'Altered scale'].filter(x => x !== sc).slice(0, 4), 'Fill in the gaps of the chord tones, avoiding augmented seconds.'); },
    bank([['When is the fourth of a chord called “sus”?', 'When the third is missing', ['When there is a seventh', 'When the chord is minor', 'Always'], 'With the third present it is an 11th.'],
      ['When do you label the sixth a 13th?', 'When the chord has a 7th', ['When the chord is minor', 'Never', 'When there is no fifth'], 'Without a 7th it is a “6”.'],
      ['How is a ♯9 often respelled?', 'As a ♭10 (so it agrees with the ♭7)', ['As a ♯2', 'As a 9th', 'As an 11th'], 'Accidentals that agree are easier to read.'],
      ['What does “add9” mean?', 'A 9th is added but there is no 7th', ['The chord has all notes up to the 9th', 'The chord has two 9ths', 'The 7th is major'], 'In pop it is sometimes written as 2.'],
      ['What is the usual ii – V – I in a minor key?', 'Dm7♭5 – G7alt – Cm6 (in C minor)', ['Dm9 – G9(13) – Cmaj9', 'Dm – G – C', 'C – F – G'], 'ii is half-diminished and V is altered.'],
      ['What is a spread voicing?', 'Root, 3rd and 7th lowest, other notes above', ['All notes in the right hand', 'Only two notes', 'A chord in four octaves'], 'The close voicing keeps four notes together above the bass.'],
      ['What kind of chord is on every non-tonic note when harmonizing the bebop scale?', 'A fully diminished seventh in some inversion', ['A major triad', 'A suspended chord', 'A dominant ninth'], 'Between tonic chords the scale passes through diminished sevenths.']]),
    () => { const r = pick(['C', 'D', 'E', 'F', 'G', 'A', 'Bb', 'Eb']), q = pick(Object.keys(JZ)), c = chordFromRoot(R(r), q), names = x => x.map(n => nm(n)).join(' – ');
      return ask(`Which notes make ${jzName(r, q)}?`, names(c), Object.keys(JZ).filter(x => x !== q).slice(0, 5).map(x => names(chordFromRoot(R(r), x))), `${JZ[q][1]}: built from the root with ${q.includes('9') ? 'a ninth added' : 'its 3rd, 5th and 7th'}.`); },
    () => { const q = pick(Object.keys(SCALE_FOR)); const r = pick(['C', 'G', 'D', 'F']); return ask(`Which scale is the usual match for ${jzName(r, q)}?`, SCALE_FOR[q], ['Ionian or Lydian', 'Dorian', 'Mixolydian', 'Locrian', 'Phrygian'], 'Match the chord to the mode that fits its tones.'); },
    () => { const r = pick(['C', 'F', 'G', 'D', 'Bb']), q = pick(['dom7', 'maj7', 'min7']), c = chordFromRoot(R(r), q); return ask(`What are the guide tones (3rd and 7th) of ${jzName(r, q)}?`, `${nm(c[1])} and ${nm(c[3])}`, [`${nm(c[0])} and ${nm(c[2])}`, `${nm(c[2])} and ${nm(c[3])}`, `${nm(c[0])} and ${nm(c[3])}`], 'The 3rd and 7th define the quality of the chord.'); },
    bank([['What are guide tones?', 'The 3rd and 7th of a chord', ['The root and 5th', 'The 9th and 11th', 'The bass and the melody'], 'They move by step in a circle-of-fifths progression.'],
      ['What is a tritone substitution?', 'Replacing a dominant seventh with the dominant seventh a tritone away', ['Replacing V with IV', 'Adding a 9th', 'Playing a chord in the left hand'], 'They share the same 3rd and 7th.'],
      ['Which chord is substituted for G7 by tritone substitution?', 'D♭7', ['F7', 'A7', 'E♭7'], 'A tritone away from G.'],
      ['What is the turnaround iii – vi – ii – V used for?', 'To lead back to I at the top of the next chorus', ['To end the piece for ever', 'To modulate to the dominant', 'To start a bridge'], 'It replaces a static I in the last bars.'],
      ['Which notes are the “blue notes” of the blues scale?', '♭3 and ♭5', ['2 and 6', '♭2 and 7', '4 and 7'], 'They are not chord tones of a major triad or dominant seventh.'],
      ['The bebop dominant scale is the Mixolydian scale with…', 'An added passing note between ♭7 and the octave', ['A raised 4th', 'A lowered 2nd', 'A missing 5th'], 'It puts chord tones on the beats when played in eighth notes.'],
      ['What does “9” in a chord symbol such as C9 tell you?', 'The 7th is also present', ['There is no 7th', 'The chord has nine notes', 'The chord is in ninth position'], 'C9 = C–E–G–B♭–D.'],
      ['In C7sus, which note replaces the 3rd?', 'F (the 4th)', ['D (the 2nd)', 'A (the 6th)', 'B (the 7th)'], 'C7sus = C–F–G–B♭.']]),
  ],
  play: [
    () => { const r = pick(['C', 'G', 'F', 'D']), c = chordFromRoot(R(r), 'dom7'), sh = [c[0], c[1], c[3]]; return {title: `Shell voicing of ${pn(r)}7: root, 3rd, 7th`, help: `Play ${sh.map(n => nm(n)).join(', ')} together.`, steps: [{label: pn(r) + '7', pcs: pcsOf(sh), names: sh.map(n => nm(n)), bass: ((c[0].midi % 12) + 12) % 12}]}; },
    () => { const k = pick(['C', 'G', 'F']), s = ['ii7', 'V7', 'IM7'].map(x => rn(x, k, 'major')); return {title: `Guide tones of ii – V – I in ${pn(k)}`, help: 'Play the 3rd and 7th of each chord together. Each note moves by step or stays.', steps: s.map((c, i) => { const g = [c.notes[1], c.notes[3]]; return {label: ['ii⁷', 'V⁷', 'Imaj⁷'][i], pcs: pcsOf(g), names: g.map(n => nm(n))}; })}; },
    progEx('Play ii⁷ – V⁷ – Imaj⁷ in {key}', ['ii7', 'V7', 'IM7'], () => pick(['C', 'G', 'F', 'Bb']), 'major'),
  ]});

const MODES = [['D', 'dorian', 'Dorian'], ['E', 'phrygian', 'Phrygian'], ['F', 'lydian', 'Lydian'], ['G', 'mixolydian', 'Mixolydian'], ['A', 'aeolian', 'Aeolian'], ['B', 'locrian', 'Locrian'], ['C', 'ionian', 'Ionian']];
const modeLine = (r, m) => ({key: 'C', mode: 'major', clef: 'treble', bpm: 100, events: scale(r + '4', m, 8).map(n => ({notes: [n], d: 'q'}))});
const planing = [0, 1, 2, 3].map(k => chordFromRoot(above(R('C'), k, 2 * k), 'major'));
CH.push({id: 'impressionism', title: 'Impressionism and extended tonality', blurb: 'Modes, extended chords, planing, pandiatonicism, quartal, quintal and secundal harmony, polychords',
  body: `<p>Around 1900 composers such as <b>Debussy</b> and <b>Ravel</b> began to loosen the rules of functional harmony. Three of their favourite techniques are modes, upper extensions and parallel chords.</p>
<h3>1. Modes</h3>
<p>Instead of the major and minor scales they used the old <b>church modes</b>. Each is a scale on the white keys, starting on a different note:</p>
<table class="htab"><tr><th>Ionian</th><td>C D E F G A B: the major scale</td></tr><tr><th>Dorian</th><td>D to D: minor with a raised 6th</td></tr><tr><th>Phrygian</th><td>E to E: minor with a lowered 2nd</td></tr><tr><th>Lydian</th><td>F to F: major with a raised 4th</td></tr><tr><th>Mixolydian</th><td>G to G: major with a lowered 7th</td></tr><tr><th>Aeolian</th><td>A to A: the natural minor scale</td></tr><tr><th>Locrian</th><td>B to B: minor with a lowered 2nd and 5th (rarely a tonic)</td></tr></table>
{{fig:dor|D Dorian.}}
{{fig:phr|E Phrygian.}}
{{fig:lyd|F Lydian.}}
{{fig:mix|G Mixolydian.}}
<p>Each mode can start on any note: C Mixolydian is C D E F G A B♭ (a major scale with ♭7). Chords built within a mode are different from major and minor: in Phrygian, the seventh chord on the 5th degree is half-diminished.</p>
<h3>2. Upper extensions</h3>
<p>Chords stack <b>9ths, 11ths and 13ths</b> on a seventh chord, sometimes with altered notes, as in jazz ({{ch:jazz}}). They are used for colour, not for tension that must resolve.</p>
<h3>3. Parallelism (planing)</h3>
<p>Instead of avoiding parallel fifths and octaves, Debussy and Ravel took a chord shape and moved <b>every voice in parallel</b>: triads, seventh chords or ninths sliding up and down. The chord becomes a colour, not a function.</p>
{{fig:plane|Planing: the same major triad moving in parallel, here by whole steps (C, D, E, F♯).}}
<h3>Pandiatonicism</h3>
<p><b>Pandiatonicism</b> uses all the notes of a diatonic scale freely, in non-functional ways: V need not go to I and the leading tone need not rise. It sounds like a wash of notes from a major scale, as in some music of Stravinsky and Copland.</p>
<h3>Quartal, quintal and secundal harmony</h3>
<p>Instead of stacking <b>thirds</b> (<b>tertian</b> harmony), composers after 1900 stack <b>fourths</b> (<b>quartal</b>), <b>fifths</b> (<b>quintal</b>) or <b>seconds</b> (<b>secundal</b>).</p>
{{fig:stack|On C: tertian (thirds), quartal (fourths), quintal (fifths) and secundal (seconds) chords.}}
<h3>Polychords</h3>
<p>A <b>polychord</b> is two (or more) chords sounding together, usually two triads: for example D major under C major. In writing, the chords are separated by a horizontal line (not a slash, which means a bass note). The best-known polychord is the “Rite of Spring” chord, an E♭ seventh chord over an F♭ major triad.</p>
{{fig:poly|A polychord: D major below C major.}}
<h3>Whole-tone and octatonic scales</h3>
<p>Two symmetrical scales were favoured by Debussy and later composers.</p>
<ul><li>The <b>whole-tone scale</b> has six notes, every one a whole step from the next: C D E F♯ G♯ B♭. With no half steps and no perfect fifths above the tonic, it has no leading tone and no pull toward a tonic: it floats. Only <b>two</b> different whole-tone scales exist.</li>
<li>The <b>octatonic scale</b> (also called the diminished scale) has eight notes alternating whole and half steps (or half and whole): C D E♭ F F♯ G♯ A B. It contains many minor thirds and tritones, which is why it fits fully diminished seventh chords and was popular with Stravinsky, Bartók and in jazz. Only <b>three</b> different octatonic collections exist.</li></ul>
{{fig:wt|The whole-tone scale on C.}}
{{fig:oct|The octatonic (whole–half) scale on C.}}`,
  figs: {
    wt: line('C', 'major', ['C4', 'D4', 'E4', 'F#4', 'G#4', 'Bb4', 'C5'], {bpm: 100}),
    oct: line('C', 'major', ['C4', 'D4', 'Eb4', 'F4', 'F#4', 'G#4', 'A4', 'B4', 'C5'], {bpm: 100}),
    dor: modeLine('D', 'dorian'), phr: modeLine('E', 'phrygian'), lyd: modeLine('F', 'lydian'), mix: modeLine('G', 'mixolydian'),
    plane: {key: 'C', mode: 'major', clef: 'treble', bpm: 70, events: planing.map((c, i) => ({notes: c, d: 'h', sym: symOf({root: c[0], quality: 'major'})}))},
    stack: {key: 'C', mode: 'major', clef: 'treble', bpm: 56, events: [[['C4', 'E4', 'G4', 'B4'], 'thirds'], [['C4', 'F4', 'Bb4', 'Eb5'], 'fourths'], [['C4', 'G4', 'D5', 'A5'], 'fifths'], [['C4', 'D4', 'E4', 'F4'], 'seconds']].map(([n, l]) => ({notes: n, d: 'w', sym: l}))},
    poly: block('C', 'major', [['D3 F#3 A3 C4 E4 G4', 'D below C', 'C over D', 'w']], {bpm: 56}),
  },
  quiz: [
    bank([['How many different notes are there in a whole-tone scale (before the octave)?', 'Six', ['Five', 'Seven', 'Eight'], 'Every note is a whole step from the next.'],
      ['Why does a whole-tone scale sound without a clear tonic?', 'It has no half steps and so no leading tone', ['It has too many sharps', 'It is always very quiet', 'It uses only minor chords'], 'There is nothing that pulls to a tonic.'],
      ['What pattern does the octatonic scale follow?', 'Alternating whole steps and half steps', ['Only whole steps', 'Only half steps', 'Three whole steps then a half step'], 'It has eight different notes.'],
      ['How many different whole-tone scales exist?', 'Two', ['Six', 'Twelve', 'One'], 'C–D–E–F♯–G♯–B♭ and C♯–D♯–F–G–A–B.']]),
    () => { const [r, m, name] = pick(MODES); return ask(`What mode is the white-key scale that begins on ${r}?`, name, MODES.map(x => x[2]), `${name} starts on ${r} when played on the white keys.`); },
    () => { const [q, a, w] = pick([['Which mode is a major scale with a raised 4th?', 'Lydian', ['Dorian', 'Phrygian', 'Mixolydian']], ['Which mode is a major scale with a lowered 7th?', 'Mixolydian', ['Lydian', 'Dorian', 'Ionian']], ['Which mode is a minor scale with a raised 6th?', 'Dorian', ['Phrygian', 'Aeolian', 'Locrian']], ['Which mode is a minor scale with a lowered 2nd?', 'Phrygian', ['Dorian', 'Aeolian', 'Lydian']], ['Which mode equals the natural minor scale?', 'Aeolian', ['Dorian', 'Phrygian', 'Locrian']], ['Which mode equals the major scale?', 'Ionian', ['Lydian', 'Mixolydian', 'Dorian']]]); return ask(q, a, w, 'Compare the notes with the major scale.'); },
    () => { const r = pick(['C', 'D', 'E', 'F', 'G', 'A']), kind = pick([['quartal', [3, 5]], ['quintal', [4, 7]]]), st = kind[1], stack = n => { const x = [R(r)]; for (let i = 0; i < 2; i++) x.push(above(x[i], n[0], n[1])); return x; }, names = x => x.map(n => nm(n)).join(' – ');
      const other = kind[0] === 'quartal' ? [4, 7] : [3, 5];
      return ask(`Stack three notes in ${kind[0] === 'quartal' ? 'perfect fourths' : 'perfect fifths'} from ${pn(r)}: which notes make the ${kind[0]} chord?`, names(stack(st)), [names(stack([2, 4])), names(stack([1, 2])), names(stack(other))], 'Each new note is a perfect ' + (kind[0] === 'quartal' ? 'fourth' : 'fifth') + ' above the one before.'); },
    bank([['What is planing (parallelism)?', 'Moving a whole chord shape up or down in parallel', ['Playing very quietly', 'Using only the white keys', 'Doubling the melody'], 'It treats a chord as a colour.'],
      ['What is pandiatonicism?', 'Free use of all diatonic notes without functional progressions', ['Use of all twelve notes', 'Use of only triads', 'Strict counterpoint'], 'V does not have to go to I.'],
      ['What is quartal harmony?', 'Chords stacked in fourths', ['Chords stacked in thirds', 'Chords of four notes', 'Chords in four keys'], 'Tertian harmony is stacked in thirds.'],
      ['What is a polychord?', 'Two or more chords sounding together', ['A very large chord', 'A chord of five notes only', 'A chord with no root'], 'For example, D major under C major.'],
      ['How is a polychord written?', 'With a horizontal line between the chords', ['With a slash', 'With a plus sign', 'With a flat'], 'The slash is for a bass note.'],
      ['Which composers are most associated with musical impressionism?', 'Debussy and Ravel', ['Bach and Handel', 'Haydn and Mozart', 'Verdi and Puccini'], 'They used modes, extended chords and parallelism.']]),
  ],
  play: [
    noteSteps('Play the whole-tone scale on C', 'Six notes a whole step apart: C D E F♯ G♯ B♭.', ['C', 'D', 'E', 'F#', 'G#', 'Bb']),
    () => { const [r, m, name] = pick(MODES.slice(0, 5)), s = scale(r + '4', m, 8); return {title: `Play the ${name} mode on ${r}`, help: 'The white keys from the starting note up to the octave.', steps: s.map(n => ({label: nm(n), pcs: [((n.midi % 12) + 12) % 12], names: [nm(n)]}))}; },
    () => { const r = pick(['C', 'D', 'E', 'G']), roots = [0, 1, 2, 3].map(k => above(R(r), k, 2 * k)), cs = roots.map(x => chordFromRoot(x, 'major')); return {title: `Planing: the ${pn(r)} major triad moving up by whole steps`, help: 'Keep the same hand shape and slide it.', steps: cs.map((c, i) => ({label: pn(nm(roots[i])), pcs: pcsOf(c), names: c.map(n => nm(n))}))}; },
    () => { const r = pick(['C', 'D', 'G']), a = R(r), notes = [a, above(a, 3, 5), above(above(a, 3, 5), 3, 5)]; return {title: `A quartal chord on ${pn(r)}`, help: 'Three notes, each a perfect fourth above the one before.', steps: [{label: pn(r) + ' quartal', pcs: pcsOf(notes), names: notes.map(n => nm(n)), bass: ((a.midi % 12) + 12) % 12}]}; },
  ]});

/* ----- pitch-class set theory ----- */
const mod12 = n => ((n % 12) + 12) % 12;
const PCN = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
const spanLess = (a, b) => { for (let k = a.length - 1; k >= 1; k--) { const x = a[k] - a[0], y = b[k] - b[0]; if (x !== y) return x < y; } return mod12(a[0]) < mod12(b[0]); };
function normalForm(set) {
  const s = [...new Set(set.map(mod12))].sort((a, b) => a - b); if (s.length < 2) return s;
  let best = null;
  for (let i = 0; i < s.length; i++) { const rot = [...s.slice(i), ...s.slice(0, i).map(x => x + 12)]; if (!best || spanLess(rot, best)) best = rot; }
  return best.map(mod12);
}
const toZero = nf => nf.map(x => mod12(x - nf[0]));
function primeForm(set) { const nf = normalForm(set), p = toZero(nf), nfi = normalForm(set.map(x => mod12(-x))), q = toZero(nfi); for (let i = 0; i < p.length; i++) if (p[i] !== q[i]) return p[i] < q[i] ? p : q; return p; }
const intervalVector = set => { const s = [...new Set(set.map(mod12))], v = [0, 0, 0, 0, 0, 0]; for (let i = 0; i < s.length; i++) for (let j = i + 1; j < s.length; j++) { const d = mod12(s[j] - s[i]); v[Math.min(d, 12 - d) - 1]++; } return v; };
const showSet = s => `[${s.map(x => x === 10 ? 'T' : x === 11 ? 'E' : x).join(', ')}]`;
const showPrime = s => `(${s.map(x => x === 10 ? 'T' : x === 11 ? 'E' : x).join('')})`;
const sortedSet = s => [...s].sort((a, b) => a - b);
const SETS = [[0, 1, 4], [0, 1, 5], [0, 1, 6], [0, 2, 5], [0, 2, 6], [0, 2, 7], [0, 3, 7], [0, 1, 2], [0, 1, 4, 7], [0, 2, 5, 8], [0, 1, 3, 7], [0, 3, 6, 9], [0, 1, 2, 5], [0, 2, 4, 7]];
const randSet = () => { const base = pick(SETS), n = Math.floor(Math.random() * 12), inv = Math.random() < 0.5; return shuffle(base.map(x => mod12((inv ? -x : x) + n))); };
const pcSetNote = s => s.map(x => PCN[x]).join(' ');
CH.push({id: 'settheory', title: 'Pitch-class set theory', blurb: 'Pitch classes, normal form, prime form, interval vector, transposition and inversion: tools for atonal music',
  body: `<p><b>Atonal</b> music (around 1908 onward, in the expressionism of Schoenberg, Berg and Webern) avoids traditional chords and scales. Its building blocks are <b>intervals</b>, and a method called <b>pitch-class set theory</b>, set out by Allen Forte in 1973, lets us compare its chords and motives. (This chapter follows the Rahn–Straus approach.)</p>
<h3>Pitch classes and integers</h3>
<p>Each pitch is replaced by a number from 0 to 11. We assume <b>octave equivalence</b> (all Cs are one <b>pitch class</b>) and <b>enharmonic equivalence</b> (C♯ and D♭ are the same). C = 0.</p>
<table class="htab"><tr><td>C = 0</td><td>C♯ / D♭ = 1</td><td>D = 2</td><td>D♯ / E♭ = 3</td><td>E = 4</td><td>F = 5</td></tr>
<tr><td>F♯ / G♭ = 6</td><td>G = 7</td><td>G♯ / A♭ = 8</td><td>A = 9</td><td>A♯ / B♭ = T (10)</td><td>B = E (11)</td></tr></table>
<p>Arithmetic is <b>modulo 12</b>, like a clock: the interval from 11 to 2 is 3 semitones. An <b>interval class</b> (ic) is the shortest distance between two pitch classes, from 1 to 6 (so a minor 6th, 8 semitones, is ic 4, the same as a major 3rd).</p>
<h3>Sets, normal form and prime form</h3>
<p>A group of pitch classes is a <b>set</b>. Its <b>normal form</b> is the most compact ordering, written [a, b, c…]:</p>
<ol><li>Put the pitch classes in ascending order, drop duplicates.</li><li>Rotate through every ordering as an ascending “scale”, and choose the one that spans the smallest interval from first to last.</li><li>Tie: choose the one with the smaller interval from first to second-to-last (and so on inwards), and finally the one beginning on the smaller number.</li></ol>
<p>The <b>prime form</b> is the “most essential” form: transpose the normal form to start on 0, also invert it and do the same, and pick the more compact of the two (compare from the left). It is written with round brackets and no commas: C major and C minor triads share the prime form (037), the dominant seventh and the half-diminished seventh share (0258). Different sets with the same prime form are of the same <b>set class</b>: they sound related.</p>
<p>The <b>interval vector</b> has six digits, counting how many times each interval class 1 to 6 occurs between all pairs of notes. A major or minor triad has <b>001110</b>; a dominant seventh has <b>012111</b>.</p>
<h3>Transposition and inversion</h3>
<p><b>T<sub>n</sub></b> transposes every pitch class up by n (mod 12). <b>T<sub>n</sub>I</b> inverts the set around C (each x becomes −x, so E = 4 becomes A♭ = 8) and then transposes by n. To find n for two sets related by inversion, write the second set backwards under the first and add the pairs: each sum is n.</p>
<p>Try it with the quiz: all the questions are generated from the same rules.</p>
<h3>Why use integers?</h3>
<p>Interval names carry tonal meaning: an augmented fifth and a minor sixth sound the same (eight semitones) but, in tonal music, one leans upward and the other downward. Atonal music has no such tendencies, so Forte replaced note names by <b>integers</b> and interval names by <b>counts of semitones</b>. This assumes enharmonic equivalence (D, C♯♯ and E♭♭ are all 2) and octave equivalence (any C is pitch class 0). We analyze <b>sets of pitch classes</b>.</p>
<h3>An example from Webern</h3>
<p>The opening chords of Webern’s Five Movements for String Quartet, No. 3, are E♭–B–D (3, 11, 2) and, similarly, a second chord built the same way. In the first chord the interval from 3 to 11 is 8 semitones and from 11 to 2 is 3 (mod 12). Its <b>normal form</b> is [11, 2, 3] and its <b>prime form</b> is (014). A later chord G♯–C–A (8, 0, 9) looks different (a diminished fourth under a major sixth), but its normal form [8, 9, 0] also reduces to prime form (014): the chords belong to the same <b>set class</b>. Prime form reveals similarities that are not apparent on the surface.</p>
{{fig:s014|Three sets with prime form (014): [11, 2, 3] (B–D–E♭), [8, 9, 0] (G♯–A–C) and the prime form itself (C–C♯–E).}}
<h3>Segmentation</h3>
<p><b>Segmentation</b> means deciding which notes to group. Usually the music tells you (notes sounding as a chord, or notes in one melodic line), but an analyst may try other groupings to find hidden relationships. When Webern’s cello C♯ is added to the first two chords, the sets no longer share a prime form: you only know by trying.</p>
<h3>Interval vectors in detail</h3>
<p>To compute the vector: put the set in normal form, measure from the first note to each of the others, then from the second to each higher note, and so on; tally each <b>interval class</b> (1 to 6). The vector always has six digits, with 0 for a missing class. A half-diminished seventh chord has the vector <b>012011</b>: no ic1, one ic2 (the minor seventh), two ic3 (minor thirds), no ic4, one ic5 and one ic6 (tritone). A fully diminished seventh has <b>004002</b>.</p>
<h3>Forte numbers and set classes</h3>
<p>Forte catalogued every set class of 3 to 9 notes and gave each a label such as <b>3–1</b> or <b>4–Z29</b>: the first number counts the notes and the second is its place in the list. A <b>Z</b> (“zygotic”, twinned) marks sets with <b>different prime forms but the same interval vector</b>: 4–Z29 and 4–Z15 both have 111111. A set and its <b>complement</b> (the other notes of the chromatic scale) are listed together. Of the 208 set classes, only 6 differ in prime form between the Forte and Rahn methods; this course uses Rahn’s.</p>
<h3>Worked inversion</h3>
<p>To apply T₇I to [2, 4, 5] (D, E, F): invert around C (T₀I): 2 → 10, 4 → 8, 5 → 7, giving [7, 8, 10] in ascending order; then transpose up 7: [2, 3, 5] (D, E♭, F). The sets [2, 4, 5] and [2, 3, 5] are related by T₇I. In Straus’s notation T<sub>n</sub>I is just I<sub>n</sub>.</p>`,
  figs: {
    s014: {key: 'C', mode: 'major', clef: 'treble', bpm: 56, events: [[['B3', 'D4', 'Eb4'], '[11, 2, 3]'], [['G#3', 'A3', 'C4'], '[8, 9, 0]'], [['C4', 'C#4', 'E4'], '(014)']].map(([n, l]) => ({notes: n, d: 'h', sym: l}))},},
  quiz: [
    bank([['What is the interval vector of a half-diminished seventh chord?', '012011', ['001110', '004002', '012111'], 'It has two minor thirds (ic3), one ic2, one ic5 and a tritone.'],
      ['What is the interval vector of a fully diminished seventh chord?', '004002', ['012011', '001110', '111111'], 'Four minor thirds (ic3) and two tritones (ic6).'],
      ['What does the Z in a Forte number such as 4–Z29 mean?', 'The set has the same interval vector as another with a different prime form', ['The set is zero-based', 'The set is a complement', 'The set has no tritone'], '4–Z29 and 4–Z15 both have 111111.'],
      ['What is segmentation?', 'Deciding which notes to group together for analysis', ['Splitting a row into four forms', 'Transposing a set', 'Inverting a chord'], 'Usually the music suggests it, but analysts may try others.'],
      ['How many digits does an interval vector have?', 'Six', ['Twelve', 'Seven', 'Four'], 'One for each interval class from 1 to 6.'],
      ['Why does atonal analysis use integers instead of note names?', 'To remove the tonal meaning of interval names and spellings', ['Because integers are shorter', 'Because pitch classes are random', 'To avoid octaves'], 'An augmented fifth and a minor sixth are the same 8 semitones.'],
      ['What is the complement of a set?', 'The remaining notes of the chromatic scale', ['The inversion of the set', 'The same set a fifth higher', 'A set with the same vector'], 'A set and its complement together make all twelve pitch classes.']]),
    () => { const x = rand12(); return ask(`What is the pitch-class integer of ${PCN[x]}?`, String(x === 10 ? 'T (10)' : x === 11 ? 'E (11)' : x), shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'T (10)', 'E (11)'].filter(y => String(y) !== String(x === 10 ? 'T (10)' : x === 11 ? 'E (11)' : x))).map(String), 'C = 0, and each half step adds one.'); },
    () => { const s = randSet(), p = primeForm(s), others = SETS.filter(t => primeForm(t).join() !== p.join()).map(t => showPrime(primeForm(t))); return ask(`What is the prime form of ${showSet(sortedSet(s.map(mod12)))} (${pcSetNote(sortedSet(s))})?`, showPrime(p), others, 'Find the normal form, transpose it to 0, compare with its inversion and pick the more compact.'); },
    () => { const s = randSet(), v = intervalVector(s), others = SETS.filter(t => intervalVector(t).join() !== v.join()).map(t => intervalVector(t).join('')); return ask(`What is the interval vector of the set ${showSet(sortedSet(s.map(mod12)))}?`, v.join(''), others, 'Count the interval classes between all pairs of notes.'); },
    () => { const s = sortedSet(randSet().map(mod12)), n = 1 + Math.floor(Math.random() * 11), ans = sortedSet(s.map(x => mod12(x + n))); return ask(`Transpose ${showSet(s)} by T${n}.`, showSet(ans), [showSet(sortedSet(s.map(x => mod12(x + n + 1)))), showSet(sortedSet(s.map(x => mod12(x - n)))), showSet(sortedSet(s.map(x => mod12(x + n - 1))))], 'Add n to every pitch class, mod 12.'); },
    () => { const s = sortedSet(randSet().map(mod12)), n = Math.floor(Math.random() * 12), ans = sortedSet(s.map(x => mod12(n - x))), seen = new Set([showSet(ans)]), wrongs = []; for (let k = 1; wrongs.length < 3 && k < 24; k++) { const w = showSet(sortedSet(s.map(x => mod12((k % 2 ? n + k : n - k) - x)))); if (!seen.has(w)) { seen.add(w); wrongs.push(w); } } return ask(`Invert ${showSet(s)} by T${n}I.`, showSet(ans), wrongs, 'Subtract each pitch class from n (mod 12).'); },
    () => { const s = randSet(), nf = normalForm(s), rots = nf.map((_, k) => showSet([...nf.slice(k), ...nf.slice(0, k)])); return ask(`What is the normal form of the set {${sortedSet(s.map(mod12)).join(', ')}}?`, showSet(nf), rots.filter(x => x !== showSet(nf)).concat([showSet(sortedSet(s.map(mod12)))]), 'Choose the most compact rotation, measured from the first to the last note.'); },
    bank([['What does octave equivalence mean in set theory?', 'All octaves of a note are one pitch class', ['Octaves are forbidden', 'C is 12', 'There are only 7 notes'], 'C in every register is pitch class 0.'],
      ['What is the largest interval class?', '6 (the tritone)', ['7', '5', '12'], 'Any larger interval inverts to a smaller one.'],
      ['Which prime form do major and minor triads share?', '(037)', ['(047)', '(036)', '(0158)'], 'They are inversions of each other.'],
      ['How many digits does an interval vector have?', 'Six', ['Seven', 'Twelve', 'Three'], 'One for each interval class, 1 to 6.'],
      ['What does T₅ do to a set?', 'Transposes every pitch class up 5 semitones', ['Inverts it around 5', 'Keeps only 5 notes', 'Reverses it'], 'Add 5 (mod 12).'],
      ['Who published the set-class lists in 1973?', 'Allen Forte', ['Arnold Schoenberg', 'Claude Debussy', 'J. S. Bach'], 'The Structure of Atonal Music.']]),
  ]});

const ROW = [0, 4, 7, 11, 2, 5, 9, 1, 3, 6, 8, 10];
const rowP = n => ROW.map(x => mod12(x + n)), rowI = n => ROW.map(x => mod12(n - x));
const rowR = n => rowP(n).slice().reverse(), rowRI = n => rowI(n).slice().reverse();     // R and RI are labelled by their last note, the first note of the P or I they reverse
const rowForm = (kind, n) => ({P: rowP, I: rowI, R: rowR, RI: rowRI})[kind](n);
const rowNames = r => r.map(x => PCN[x]).join(' ');
const matrixHtml = () => { let h = '<div class="mscroll"><table class="mtx"><tr><th></th>' + ROW.map((_, j) => `<th>P${rowP(0)[j]}</th>`).join('') + '</tr>'; for (let i = 0; i < 12; i++) { h += `<tr><th>I${rowI(0)[i]}</th>`; for (let j = 0; j < 12; j++) h += `<td>${PCN[mod12(rowI(0)[i] + ROW[j])].replace(/\/.*/, '')}</td>`; h += '</tr>'; } return h + '</table></div>'; };
CH.push({id: 'serialism', title: 'Serialism and the twelve-tone method', blurb: 'The row, its four forms, transposition labels, the twelve-tone matrix',
  body: `<p><b>Twelve-tone technique</b> (Schoenberg, Webern, Berg) builds a piece from a fixed ordering of all twelve pitch classes: the <b>series</b> or <b>row</b>. Its premises:</p>
<ol><li>All twelve notes of the chromatic scale must occur in the row.</li><li>No note is repeated in the row until the other eleven have appeared (apart from immediate repetition or trills and tremolos).</li><li>The row may be used in its four forms and in any transposition, so every note of the piece comes from the row.</li></ol>
<h3>The four row forms</h3>
<table class="htab"><tr><th>Prime (P)</th><td>the original row</td></tr><tr><th>Retrograde (R)</th><td>the prime backwards</td></tr><tr><th>Inversion (I)</th><td>every interval of the prime turned upside down</td></tr><tr><th>Retrograde inversion (RI)</th><td>the inversion backwards</td></tr></table>
<p>Each form can start on any of the twelve pitch classes. <b>P</b> and <b>I</b> are labelled by their <b>first</b> note (P3 starts on E♭, I2 on D); <b>R</b> and <b>RI</b> are labelled by their <b>last</b> note (R1 ends on C♯). This gives 4 × 12 = <b>48 row forms</b>.</p>
<p>The row used in this chapter is P0: <b>${rowNames(ROW)}</b> (0 = C).</p>
<h3>The twelve-tone matrix</h3>
<p>A <b>matrix</b> shows all 48 forms in a 12 × 12 grid. Write P0 across the top, its inversion down the left, and fill each row with the transposition that starts on the left-hand note. Read the rows left to right for P, right to left for R; read the columns top to bottom for I and bottom to top for RI.</p>
${matrixHtml()}
<h3>Rows in the music</h3>
<p>Composers do not always state a row plainly: successive rows may <b>overlap</b> (the last note of one is the first of the next), a row may be split into groups of notes (<i>tetrachords</i>) and presented in counterpoint or as chords, or two forms may be stated at once in a melody-with-accompaniment texture. Music that keeps a series in order and uses its inversion and retrograde without being strictly twelve-tone is also called <b>serial</b>: Stravinsky’s late works use shorter series, sometimes with repeated notes.</p>
<h3>The four premises</h3>
<ol><li>All twelve notes of the chromatic scale must appear in the row.</li>
<li>No note is repeated until the other eleven have sounded (apart from immediate repetition, trills and tremolos).</li>
<li>The row can be inverted and retrograded, and the inversion can be retrograded.</li>
<li>The <b>order</b> of the notes in a row is fixed and is never reshuffled.</li></ol>
<p>Every note of a twelve-tone piece belongs to the row or one of its forms, which gives the piece unity; the row is also a store of intervals, so twelve-tone technique grows out of the atonal emphasis on interval rather than chord or scale. The retrograde inversion might be better named “inversion retrograded”: it means the inversion played backwards, not the retrograde inverted.</p>
<h3>Recognizing row forms in a score</h3>
<p>Look at the first intervals of a passage, find the one row form that begins that way, then check the transposition level: for P and I forms it is the <b>first</b> note, for R and RI forms the <b>last</b> (12th) note. A passage that begins with a rising minor third and a falling major second can only be a retrograde (of the row in the example); if its 12th note is A♭, it is R8. In the same example row, a form beginning with a falling minor second and a falling fourth is an inversion (I11), and one beginning with a rising minor second and a rising fourth is a prime (P1).</p>
<h3>Writing a row form</h3>
<ol><li>Write all four forms from the prime: P, R, I, RI (all on 0).</li><li>Transpose the one you want: P and I begin on the pitch integer, R and RI <b>end</b> on it.</li></ol>
<p>Example, given P0: to write I9, transpose I0 up 9 semitones so that it begins on A. To write RI5, transpose RI0 up 5 semitones so that it ends on F.</p>
<h3>How a row appears in music</h3>
<ul><li><b>Overlap:</b> the last note of one row statement is also the first of the next.</li>
<li><b>Contrapuntal or harmonic presentation:</b> the row is divided into three tetrachords and presented as lines or as chords.</li>
<li><b>Melody and accompaniment:</b> one row form carries the melody (P0) while another (R0) accompanies.</li></ul>
<p>When you analyze, first look for a clear, plain statement of the row somewhere in the piece, then use it to analyze the harmonies.</p>
<h3>Serialism that is not twelve-tone</h3>
<p>Stravinsky’s Septet (1953) uses a 16-note series, not a twelve-tone row, with inversion, retrograde and retrograde inversion. Eight pitch classes occur in it: B, A, G, F♯ and G♯ are repeated (A, G and G♯ three times each), and the set in normal form could even suggest E or A as a tonal centre. So the piece is serial without being strictly twelve-tone.</p>`,
  figs: {},
  quiz: [
    bank([['Which note labels an R or RI row form?', 'Its last note', ['Its first note', 'Its middle note', 'The tonic'], 'R1 ends on C♯; RI7 ends on G.'],
      ['Which note labels a P or I row form?', 'Its first note', ['Its last note', 'Its highest note', 'The tonic'], 'P3 begins on E♭; I2 begins on D.'],
      ['What is “overlap” in twelve-tone music?', 'The last note of one row is also the first of the next', ['Two rows sound at once', 'The row is played twice', 'A tremolo'], 'It links successive rows.'],
      ['Is Stravinsky’s Septet strictly twelve-tone?', 'No, it uses a 16-note series with repeated notes', ['Yes', 'It uses no series at all', 'It uses a 24-note row'], 'It is serial but not twelve-tone.'],
      ['In the retrograde inversion, what is reversed?', 'The inversion, played backwards', ['The prime inverted', 'Only the first six notes', 'Only the rhythm'], 'RI is “inversion retrograded”.']]),
    () => { const kind = pick(['P', 'I', 'R', 'RI']), n = Math.floor(Math.random() * 12), r = rowForm(kind, n); return ask(`The row form ${kind}${n} of the row ${rowNames(ROW)} begins with which notes?`, rowNames(r.slice(0, 4)), [rowNames(rowForm(kind, mod12(n + 1)).slice(0, 4)), rowNames(rowForm(kind === 'P' ? 'I' : 'P', n).slice(0, 4)), rowNames(rowForm(kind === 'R' ? 'RI' : 'R', n).slice(0, 4))], 'Work it out from the prime: P adds n, I subtracts from n, R and RI are read backwards and labelled by their last note.'); },
    () => { const kind = pick(['P', 'I', 'R', 'RI']), n = Math.floor(Math.random() * 12), r = rowForm(kind, n), label = `${kind}${n}`, labels = []; while (labels.length < 4) { const k = pick(['P', 'I', 'R', 'RI']), m = Math.floor(Math.random() * 12), l = `${k}${m}`; if (!labels.includes(l) && l !== label && rowForm(k, m).slice(0, 6).join() !== r.slice(0, 6).join()) labels.push(l); }
      return ask(`Which row form begins ${r.slice(0, 6).map(x => PCN[x]).join(' ')}?`, label, labels, 'Compare the first intervals with the prime: P keeps them, I mirrors them, R and RI start with the end of P or I.'); },
    () => { const k = Math.floor(Math.random() * 12), kind = pick(['P', 'I']), i = 1 + Math.floor(Math.random() * 6), r = rowForm(kind, k); return ask(`What is note ${i + 1} of ${kind}${k}?`, PCN[r[i]], shuffle(PCN.filter(x => x !== PCN[r[i]])).slice(0, 3), 'Use the pitch-class integers of the prime row.'); },
    bank([['How many different row forms does a twelve-tone row give?', '48', ['12', '24', '4'], '4 forms × 12 transpositions.'],
      ['How is a retrograde (R) form labelled?', 'By its last note', ['By its first note', 'By its length', 'By its tempo'], 'P and I are labelled by their first note.'],
      ['What is the inversion of a row?', 'The row with every interval turned upside down', ['The row backwards', 'The row transposed up', 'The row in a new order'], 'The retrograde is the backwards one.'],
      ['What does a twelve-tone matrix show?', 'All 48 row forms in a 12 × 12 grid', ['The key signature', 'The chords of a piece', 'The tempo changes'], 'P along the rows, I down the columns.'],
      ['What is the rule about repeating notes in a row?', 'No note repeats until the other eleven have sounded', ['Every note must repeat twice', 'Only C may repeat', 'Notes can repeat freely'], 'Exceptions: immediate repeats, trills, tremolos.'],
      ['What are overlapping rows?', 'The last note of one row is the first of the next', ['Two rows with different notes', 'Rows in different octaves', 'Rows played backwards'], 'It saves one note and links the statements.']]),
  ],
  play: [
    () => ({title: 'The first six notes of the prime row P0', help: `P0 = ${rowNames(ROW)}. Play the first six notes one after another, in any octave.`, steps: ROW.slice(0, 6).map(x => ({label: PCN[x], pcs: [x], names: [PCN[x]]}))}),
    () => ({title: 'The first six notes of the inversion I0', help: `I0 = ${rowNames(rowI(0))}. Every interval of P0 is turned upside down.`, steps: rowI(0).slice(0, 6).map(x => ({label: PCN[x], pcs: [x], names: [PCN[x]]}))}),
    () => ({title: 'The first six notes of the retrograde R0', help: `R0 = ${rowNames(rowR(0))}: P form ending on C, backwards.`, steps: rowR(0).slice(0, 6).map(x => ({label: PCN[x], pcs: [x], names: [PCN[x]]}))}),
  ]});

window.Harmony.api.setTheory = {normalForm, primeForm, intervalVector, rowForm};
const PAT5 = ['C4', 'D4', 'E4', 'G4', 'A4'];
const bars58 = bars => ({key: 'C', mode: 'major', clef: 'treble', ts: [5, 8], bpm: 120, fs: 10, events: bars.flatMap(b => b.notes.map((n, i) => n === 'r' ? {rest: true, notes: [], d: 'e'} : {notes: [n], d: 'e', sym: i === 0 ? b.label : undefined}))});
const rotate = (a, k) => [...a.slice(k % a.length), ...a.slice(0, k % a.length)];
CH.push({id: 'minimalism', title: 'Minimalism', blurb: 'Additive process and phase shifting: repetition that slowly changes',
  body: `<p><b>Minimalism</b> (La Monte Young, Terry Riley, Steve Reich, Philip Glass) builds music from very simple materials repeated, with gradual, audible change. Two techniques are enough to hear how it works.</p>
<h3>Additive process</h3>
<p>In an <b>additive</b> process, a short pattern is repeated and a note is <b>added</b> to it each time, or notes are removed one by one. Early works by Philip Glass use it: the pattern grows from two notes to five, then shrinks again. Chords of a cadence can also be lengthened by adding notes.</p>
{{fig:additive|Additive process on C D E G A in 5/8: the pattern grows by one note each time.}}
<h3>Phase shifting</h3>
<p>Steve Reich discovered <b>phase shifting</b> with tape loops of slightly different lengths: the same idea plays on two machines and slowly drifts out of phase, then back into it. In live music, two players repeat the same pattern and one gradually speeds up (as in <i>Piano Phase</i>) or changes to the next <b>rotation</b> at the start of a bar (as in <i>Clapping Music</i>). A <b>rotation</b> moves the pattern one note to the left each time, the first note going to the end.</p>
{{fig:rotation|Rotations of a five-note pattern: each bar starts one note later.}}
<p>The same device appears in Stravinsky’s music: rotating a pattern is an old idea, minimalism makes it audible.</p>
<h3>More about additive minimalism</h3>
<p>The four names usually linked with minimalism are La Monte Young, Terry Riley, Steve Reich and Philip Glass; the style rose in the 1960s. Glass’s version of additive process at the start of <i>Two Pages</i> (1969) repeats the pattern and <b>subtracts the final note</b> from the repetition: a pattern A is followed by A + B, then A + B + C, then A + B + C + D, and so on, each step adding to the previous repeat. His <i>Music in Fifths</i> (1969) shows additive process very plainly on its own, though it is only one of dozens of steps in the piece. In <i>Einstein on the Beach</i> (the “Train” scene) each chord of a five-chord cadential progression is gradually lengthened by adding subdivisions to it.</p>
<h3>More about phase shifting</h3>
<p>Reich noticed phase shifting in his tape pieces <i>It’s Gonna Rain</i> (1965) and <i>Come Out</i> (1966): two tape loops of the same idea but slightly different lengths drift out of phase, then slowly back into phase. He then made the process live in <i>Piano Phase</i> (1967), <i>Violin Phase</i> (1967) and <i>Clapping Music</i> (1972). The basic pattern of <i>Piano Phase</i> has twelve notes; as one player speeds up slightly, the pattern in the other part “rotates” step by step: the second note begins the pattern on the second line, the third note on the third line, and so on, until the first note begins it again and the process is complete.</p>
<p>In <i>Clapping Music</i> one player keeps the twelve-beat pattern while the other moves it one beat to the left at regular intervals: after twelve shifts the two parts are together again.</p>`,
  figs: {
    additive: bars58([{label: 'pattern', notes: ['C4', 'D4', 'r', 'r', 'r']}, {label: 'add a note', notes: ['C4', 'D4', 'E4', 'r', 'r']}, {label: 'add a note', notes: ['C4', 'D4', 'E4', 'G4', 'r']}, {label: 'complete', notes: ['C4', 'D4', 'E4', 'G4', 'A4']}]),
    rotation: bars58([0, 1, 2, 3, 4].map(k => ({label: k ? `rotation ${k}` : 'pattern', notes: rotate(PAT5, k)}))),
  },
  quiz: [
    bank([['What does Glass do in the additive process of Two Pages?', 'Repeats the pattern, adding notes and dropping the last note of the repeat', ['Plays it backwards', 'Doubles every duration', 'Changes the key each time'], 'A, A + B, A + B + C, and so on.'],
      ['Which Reich pieces were made with tape loops?', 'It’s Gonna Rain and Come Out', ['Piano Phase and Violin Phase', 'Clapping Music', 'Einstein on the Beach'], 'Live phasing came later.'],
      ['How does a phased pattern come back together?', 'By rotating step by step until the first note starts it again', ['By changing key', 'By stopping the music', 'By speeding up the tempo'], 'This is a rotation of the pattern.'],
      ['What happens to each chord of the cadence in Einstein on the Beach?', 'It is gradually lengthened by adding subdivisions', ['It is transposed', 'It is inverted', 'It is played softer'], 'It is an additive process.']]),
    () => { const k = 1 + Math.floor(Math.random() * 4), r = rotate(PAT5, k), names = x => x.map(n => nm(parse(n))).join(' '); return ask(`What is rotation ${k} of the pattern ${names(PAT5)}?`, names(r), [1, 2, 3, 4].filter(x => x !== k).map(x => names(rotate(PAT5, x))), 'Move the first note to the end, once for each rotation.'); },
    bank([['What is an additive process?', 'A pattern that grows by one note each repetition', ['A very loud passage', 'A pattern that never changes', 'A chord progression'], 'It can also shrink by removing notes.'],
      ['What is phase shifting?', 'Two copies of a pattern drifting out of step and back', ['Changing key', 'Doubling the tempo', 'A change of instrument'], 'Steve Reich discovered it with tape loops.'],
      ['What is a rotation of a pattern?', 'The first note moved to the end, shifting the pattern', ['The pattern turned upside down', 'The pattern played backwards', 'The pattern doubled'], 'Each rotation starts one note later.'],
      ['Which composer wrote Piano Phase and Clapping Music?', 'Steve Reich', ['Philip Glass', 'Claude Debussy', 'Arnold Schoenberg'], 'Both use phase shifting.'],
      ['Which technique is associated with early Philip Glass?', 'Additive process', ['Twelve-tone rows', 'Planing', 'Pandiatonicism'], 'Patterns grow and shrink note by note.']]),
  ],
  play: [
    () => ({title: 'Play the five-note pattern C D E G A', help: 'One note at a time.', steps: PAT5.map(n => ({label: nm(parse(n)), pcs: [parse(n).midi % 12], names: [nm(parse(n))]}))}),
    () => { const k = 1 + Math.floor(Math.random() * 4), r = rotate(PAT5, k); return {title: `Play rotation ${k} of the pattern`, help: `Start on ${nm(parse(r[0]))}: ${r.map(n => nm(parse(n))).join(' ')}.`, steps: r.map(n => ({label: nm(parse(n)), pcs: [parse(n).midi % 12], names: [nm(parse(n))]}))}; },
    () => { const k = pick([2, 3]), a = PAT5.slice(0, k + 1); return {title: `Additive process: build the pattern up to ${k + 1} notes`, help: 'Play the notes in order.', steps: a.map(n => ({label: nm(parse(n)), pcs: [parse(n).midi % 12], names: [nm(parse(n))]}))}; },
  ]});


/* ================= Creating contrast between sections ================= */
CH.push({id: 'contrast', title: 'Creating contrast between sections', blurb: 'The elements of music and how composers make verse and chorus, A and B, different',
  body: `<p>Songs and pieces are made of <b>sections</b>, and sections need to feel different. The difference is called <b>contrast</b>, and a composer creates it by changing one or more of the <b>elements of music</b>.</p>
<h3>The elements of music</h3>
<table class="htab"><tr><th>Melody</th><td>Higher or lower <b>register</b>, wider or narrower <b>range</b>, stepwise or leaping, new motives.</td></tr>
<tr><th>Harmony</th><td>New chords or a new key; a faster or slower <b>harmonic rhythm</b>; a change from major to minor.</td></tr>
<tr><th>Rhythm</th><td>A busier or sparser rhythm, a new pattern, syncopation or a change of meter or tempo.</td></tr>
<tr><th>Texture and timbre</th><td>More or fewer instruments or voices; doubling in octaves; a change from block chords to arpeggios ({{ch:textures}}); a new instrumental colour.</td></tr>
<tr><th>Dynamics</th><td>Quiet to loud (or the reverse), crescendos and decrescendos.</td></tr></table>
<h3>Contrast in practice</h3>
<p>In popular music the chorus is usually the most intense section. Compared with the verse it is often <b>higher</b>, <b>louder</b>, <b>thicker</b> (more instruments and doubled lines) and has a <b>stronger harmonic rhythm</b> and a more memorable melody. A <b>bridge</b> (or B section) normally contrasts in harmony: it avoids the home tonic, or starts on a different chord, to build tension before the return.</p>
{{fig:verse|Verse: the chords I – V – vi – IV in a low, thin texture.}}
{{fig:chorus|Chorus: the same chords, higher and thicker. Nothing in the harmony has changed, yet the section sounds bigger.}}
<p>Contrast does not need a new tune: changing only the <b>register</b>, the <b>dynamics</b> and the <b>texture</b> is enough. Classical composers also use contrast for form: the B section of a ternary piece ({{ch:binaryternary}}) is often in a new key and has new material, and the development of a sonata ({{ch:sonatarondo}}) contrasts with the exposition in key and tension.</p>
<h3>How to analyze it</h3>
<ol><li>Divide the song into sections and name them (verse, chorus, bridge…).</li>
<li>For each section note: register and range, dynamics, instruments, texture, harmonic rhythm, and rhythm of the melody.</li>
<li>Compare neighbouring sections and say <b>which elements changed</b> and in which direction.</li></ol>`,
  figs: {
    verse: block('C', 'major', [['C3 G3 E4', 'I'], ['G2 D3 B3', 'V'], ['A2 E3 C4', 'vi'], ['F2 C3 A3', 'IV']], {bpm: 60, d: 'h'}),
    chorus: block('C', 'major', [['C3 C4 E4 G4 C5', 'I'], ['G2 G3 B3 D4 G4', 'V'], ['A2 A3 C4 E4 A4', 'vi'], ['F2 F3 A3 C4 F4', 'IV']], {bpm: 60, d: 'h'}),
  },
  quiz: [
    () => { const [d, a] = pick([['the chorus is louder', 'Dynamics'], ['the chorus is higher in pitch', 'Melody (register)'], ['the chorus has more instruments', 'Texture and timbre'], ['the chorus has faster chord changes', 'Harmony (harmonic rhythm)'], ['the chorus has a busier rhythm', 'Rhythm']]); return ask(`Which element of music creates the contrast when ${d}?`, a, ['Dynamics', 'Melody (register)', 'Texture and timbre', 'Harmony (harmonic rhythm)', 'Rhythm'].filter(x => x !== a).slice(0, 4), 'Name what changed between the two sections.'); },
    bank([['What is contrast?', 'A difference between two sections made by changing elements of music', ['The repetition of a section', 'A very loud ending', 'A change of notation'], 'Composers can change melody, harmony, rhythm, texture or dynamics.'],
      ['Which is usually the most intense section of a pop song?', 'The chorus', ['The verse', 'The intro', 'The pickup'], 'It is higher, louder and thicker.'],
      ['How does a bridge usually contrast with the verse and chorus?', 'Through new harmony, often avoiding the home tonic', ['By using only one chord', 'By stopping the beat', 'By going to the next octave only'], 'It builds tension before the return.'],
      ['Can two sections contrast with the same chords?', 'Yes, by changing register, texture and dynamics', ['No, the chords must change', 'Only in minor keys', 'Only with a key change'], 'The verse and chorus figures above use the same four chords.'],
      ['What is harmonic rhythm?', 'How often the chords change', ['The beat of the drums', 'The rhythm of the melody', 'The speed of the tempo'], 'A faster harmonic rhythm often raises the energy.'],
      ['Which is a change of texture?', 'Block chords change to arpeggios', ['A louder dynamic', 'A new key', 'A faster tempo'], 'Texture is how the layers are arranged.']]),
  ],
  play: [
    progEx('Play the verse chords in {key}: I – V – vi – IV', ['I', 'V', 'vi', 'IV'], () => pick(['C', 'G', 'F', 'D']), 'major', 'Play low and softly, as in a verse.'),
    progEx('Play the chorus chords in {key} an octave higher: I – V – vi – IV', ['I', 'V', 'vi', 'IV'], () => pick(['C', 'G', 'F', 'D']), 'major', 'Play higher and fuller: double the notes in octaves.'),
  ]});

/* order and parts of the course */
const PARTS = [
  ['Foundations', ['notation', 'rhythm', 'scales', 'intervals']],
  ['Chords and progressions', ['triads', 'triadsinkey', 'inversions', 'sevenths', 'cadences', 'progressions', 'popharmony']],
  ['Melody, phrase and texture', ['nonchord', 'melody', 'phrases', 'textures', 'contrast']],
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
