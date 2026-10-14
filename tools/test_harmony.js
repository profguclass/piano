/* Developer check for the Harmony tutorial, run inside the page (see tools/README or the test notes):
   fetch('tools/test_harmony.js').then(r => r.text()).then(eval). It validates every four-part example (chord tones, voice leading, spacing),
   draws every figure, and runs every quiz and exercise generator many times. */
(async () => {
  await loadHarmony();
  const H = Harmony.api, out = {problems: [], figures: 0, satb: 0, questions: 0, exercises: 0};
  const SUPR = [['maj⁷', 'M7'], ['⁶₅', '65'], ['⁶₄', '64'], ['⁴₃', '43'], ['⁴₂', '42'], ['⁷', '7'], ['⁶', '6']];
  const unfmt = s => SUPR.reduce((a, [f, t]) => a.split(f).join(t), s);
  const chapters = Harmony._chapters();
  for (const c of chapters) {
    for (const [id, f] of Object.entries(c.figs)) {
      out.figures++;
      try { H.figureXml({id, ...f}); } catch (e) { out.problems.push(`${c.id}/${id}: ${e.message}`); continue; }
            if (f.cp) {                                           // strict-counterpoint rules, written out independently of the example search
        const P = n => H.parse(n.replace('~', '')).midi, cf = f.cp.cf.map(P), CONS = [0, 3, 4, 7, 8, 9], PERF = [0, 7];
        const iv = (a, b) => (((a - b) % 12) + 12) % 12, tag = m => `${c.id}/${id}: ${m}`;
        const per = f.cp.species === 1 ? 1 : f.cp.species === 2 ? 2 : f.cp.species === 3 ? 4 : 2;
        // flat list of {midi, bar, pos, rest}
        const notes = []; f.cp.bars.forEach((b, bi) => b.forEach((n, k) => notes.push({n, bar: bi, pos: k, midi: n === 'r' ? null : P(n), tie: n.endsWith('~')})));
        const real = notes.filter(x => x.midi !== null), last = real[real.length - 1];
        if (iv(real[real.length - 1].midi, cf[cf.length - 1]) !== 0) out.problems.push(tag('must end on the octave or unison'));
        if (f.cp.species !== 4 && !PERF.includes(iv(real[0].midi, cf[0]))) out.problems.push(tag('must begin on a perfect consonance'));
        const pen = real[real.length - 2]; if (iv(pen.midi, cf[cf.length - 2]) !== 9 || last.midi - pen.midi !== 1) out.problems.push(tag('penultimate note must be the major 6th, a step below the final note'));
        const top = Math.max(...real.map(x => x.midi)); if (real.filter((x, i) => x.midi === top && !(real[i - 1] && real[i - 1].tie && real[i - 1].midi === x.midi)).length !== 1) out.problems.push(tag('the high point is not unique'));
        const isStrong = x => f.cp.species === 1 || x.pos === 0 || (f.cp.species === 3 && x.pos === 2);
        real.forEach((x, i) => {
          const c0 = cf[x.bar], cons = CONS.includes(iv(x.midi, c0)), prev = real[i - 1], next = real[i + 1];
          if (f.cp.species === 4) {
            const tied = prev && prev.tie && prev.midi === x.midi && prev.bar === x.bar - 1;       // the second half of a tie
            if (tied && !cons) { if (![10, 11, 5, 2, 1].includes(iv(x.midi, c0))) out.problems.push(tag(`bar ${x.bar + 1}: dissonant tie must be a 7th, 4th or 2nd`)); if (!next || next.bar !== x.bar || prev.midi - next.midi < 1 || prev.midi - next.midi > 2) out.problems.push(tag(`bar ${x.bar + 1}: the suspension does not resolve down by step`)); }
            else if (!tied && !cons) out.problems.push(tag(`bar ${x.bar + 1}: dissonance on the weak beat`));
          } else if (isStrong(x) || f.cp.species === 1) { if (!cons) out.problems.push(tag(`bar ${x.bar + 1}: dissonance on a strong beat`)); }
          else if (!cons) { const passing = prev && next && Math.abs(x.midi - prev.midi) <= 2 && Math.abs(next.midi - x.midi) <= 2 && (x.midi - prev.midi) * (next.midi - x.midi) > 0; if (!passing) out.problems.push(tag(`bar ${x.bar + 1}: a weak-beat dissonance must be a passing tone`)); }
          if (prev && f.cp.species !== 4) {                                                       // parallel 5ths/8ves between consecutive notes
            const a = iv(prev.midi, cf[prev.bar]), b = iv(x.midi, c0), moved = prev.midi !== x.midi || cf[prev.bar] !== c0;
            if (moved && a === b && PERF.includes(a) && (prev.bar !== x.bar)) out.problems.push(tag(`bar ${x.bar + 1}: parallel perfect intervals`));
          }
          if (prev && Math.abs(x.midi - prev.midi) === 6) out.problems.push(tag(`bar ${x.bar + 1}: tritone leap`));
          if (prev && Math.abs(x.midi - prev.midi) > 9) out.problems.push(tag(`bar ${x.bar + 1}: leap larger than a 6th`));
        });
        if (f.cp.species === 1) for (let i = 1; i < real.length; i++) { const a = iv(real[i - 1].midi, cf[i - 1]), b = iv(real[i].midi, cf[i]), up = (real[i].midi - real[i - 1].midi) * (cf[i] - cf[i - 1]) > 0; if (PERF.includes(b) && up && i < real.length - 1) out.problems.push(tag(`bar ${i + 1}: perfect interval reached by similar motion`)); if (PERF.includes(a) && a === b && i > 0) out.problems.push(tag(`bar ${i + 1}: parallel perfect intervals`)); }
      }
      if (!f.satb) continue;
      out.satb++;
      const evs = f.events.map(e => H.sortN(e.notes.map(n => typeof n === 'string' ? H.parse(n) : n)));
      evs.forEach((v, i) => {
        const label = unfmt(f.events[i].rn || '');
        if (v.length !== 4) out.problems.push(`${c.id}/${id} chord ${i + 1}: needs four voices`);
        if (v[3].midi - v[2].midi > 12 || v[2].midi - v[1].midi > 12) out.problems.push(`${c.id}/${id} chord ${i + 1}: spacing wider than an octave`);
        if (!(v[0].midi < v[1].midi && v[1].midi <= v[2].midi && v[2].midi < v[3].midi) && !f.bad) out.problems.push(`${c.id}/${id} chord ${i + 1}: voices cross or double at a unison`);
        if (H.ROMAN.test(label)) {
          const ch = H.rn(label, f.key, f.mode), want = H.pcsOf(ch.notes), have = H.pcsOf(v);
          const extra = have.filter(p => !want.includes(p)), missing = want.filter(p => !have.includes(p));
          const rootPc = ((ch.root.midi % 12) + 12) % 12, fifthPc = (rootPc + 7) % 12;
          if (extra.length) out.problems.push(`${c.id}/${id} chord ${i + 1} (${label}): notes outside the chord`);
          if (missing.length && !(missing.length === 1 && (label.includes('7') || ch.notes.length === 4 || (f.incomplete && missing[0] === fifthPc)))) out.problems.push(`${c.id}/${id} chord ${i + 1} (${label}): missing ${missing}`);
          if (missing.length === 1 && !ch.notes.length < 4 && missing[0] !== fifthPc && ch.notes.length === 3) out.problems.push(`${c.id}/${id} chord ${i + 1} (${label}): third or root missing`);
        }
      });
      if (!f.bad) for (let i = 1; i < evs.length; i++) for (let a = 0; a < 4; a++) for (let b = a + 1; b < 4; b++) {
        const p = ((evs[i - 1][b].midi - evs[i - 1][a].midi) % 12 + 12) % 12, q = ((evs[i][b].midi - evs[i][a].midi) % 12 + 12) % 12;
        const moved = evs[i][a].midi !== evs[i - 1][a].midi && evs[i][b].midi !== evs[i - 1][b].midi;
        if (moved && p === q && (p === 7 || p === 0)) out.problems.push(`${c.id}/${id} chords ${i}-${i + 1}: parallel ${p === 7 ? 'fifths' : 'octaves'} between voices ${a} and ${b}`);
      }
    }
    for (const g of c.quiz) for (let k = 0; k < 120; k++) {
      try {
        const q = g(); out.questions++;
        if (!q.answers || q.answers.length < 3) out.problems.push(`${c.id}: question with few answers: ${q.text}`);
        if (!q.answers.some(a => String(a[0]) === String(q.answer))) out.problems.push(`${c.id}: answer missing: ${q.text}`);
        if (q.fig) H.figureXml(q.fig);
      } catch (e) { out.problems.push(`${c.id} quiz: ${e.message}`); break; }
    }
    for (const g of c.play) for (let k = 0; k < 60; k++) {
      try { const e = g(); out.exercises++; if (!e.steps.length || e.steps.some(s => !s.pcs.length)) out.problems.push(`${c.id}: empty exercise ${e.title}`); } catch (e) { out.problems.push(`${c.id} play: ${e.message}`); break; }
    }
  }
  // draw every figure for real
  const box = document.createElement('div'); box.style.cssText = 'position:fixed;left:0;top:0;width:800px;opacity:0;pointer-events:none'; document.body.append(box);
  let drawn = 0;
  for (const c of chapters) for (const [id, f] of Object.entries(c.figs)) {
    try { const el = document.createElement('div'); box.append(el); const o = new opensheetmusicdisplay.OpenSheetMusicDisplay(el, {autoResize: false, drawTitle: false, backend: 'svg'}); await o.load(H.figureXml({id, ...f})); o.render(); if (el.querySelector('svg')) drawn++; else out.problems.push(`${c.id}/${id}: nothing drawn`); } catch (e) { out.problems.push(`${c.id}/${id} draw: ${e.message}`); }
  }
  box.remove(); out.drawn = drawn; out.chapters = chapters.length;
  return out;
})()
