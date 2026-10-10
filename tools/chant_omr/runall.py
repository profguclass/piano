"""Reads the Solesmes square notation of tools/sources/gregorian/goodchild.pdf (a private, in-copyright book) and writes one MusicXML file per chant
to personal/gregorian/ (git-ignored). Run: python tools/chant_omr/runall.py. overlay.py draws what was read on a page, to check it by eye."""
import os, sys, json
import chants, omr3, omr, build
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'personal', 'gregorian')
os.makedirs(OUT, exist_ok=True)
mk = chants.markers()
counts = {}
for pg in range(30, 141):
    counts[pg] = len(omr.find_staves(omr3.gray(pg) < 140))
allst = [(pg, si) for pg in range(30, 141) for si in range(counts[pg])]
pos = {s: i for i, s in enumerate(allst)}
res = []
for k, (pg, si, title, slug) in enumerate(mk[:-1]):
    a = pos[(pg, si)]; npg, nsi = mk[k + 1][0], mk[k + 1][1]
    b = pos.get((npg, nsi), len(allst))
    if title is None: continue
    sel = allst[a:b]
    spec = []
    for p, s in sel:
        if spec and spec[-1][0] == p: spec[-1][1].append(s)
        else: spec.append((p, [s], {'clef': 6} if (p, s) == (95, 0) else {}))
    try:
        xml, bars = build.build(title, spec, bpm=66, composer='Gregorian chant (Goodchild, Gregorian Chant for Church and School, 1944)')
        n = len(res) + 1
        fn = f'{n:03d}-{slug}.musicxml'
        open(os.path.join(OUT, fn), 'w', encoding='utf-8').write(xml)
        res.append((fn, title, len(sel), bars.count('|') + 1, sum(1 for t in bars.replace('|', ' ').split() if not t.startswith('r'))))
    except BaseException as e:
        res.append((slug, title, len(sel), 'ERR', repr(e)[:100]))
for r in res: print(r)
