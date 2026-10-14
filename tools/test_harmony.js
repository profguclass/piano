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
