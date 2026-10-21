"""omr3.py: pages -> figures -> measures -> MusicXML"""
import sys, re, math, collections, json
sys.path.insert(0, '.')
import numpy as np, fitz
import omr, omr2
from omr import Page, Z, CLEF
from omr2 import HEAD, REST, ACC, DUR, STEPS, SHARPS

FLATS = ['B', 'E', 'A', 'D', 'G', 'C', 'F']
DIV = 16


def key_alter(fifths):
    alt = {}
    if fifths > 0:
        for l in SHARPS[:fifths]: alt[l] = 1
    elif fifths < 0:
        for l in FLATS[:-fifths]: alt[l] = -1
    return alt


def read_page(page):
    sts = page.staves()
    clefs = []
    for s in sts:
        c = None
        for g in page.glyphs:
            if g['c'] in CLEF and s['top'] - 2 * s['sp'] < g['y'] < s['bottom'] + 2 * s['sp'] and s['x0'] - 3 < g['x'] < s['x0'] + 14:
                c = g
        clefs.append(c)
    res = []
    for i, (s, c) in enumerate(zip(sts, clefs)):
        if not c: continue
        mid = lambda j: (sts[j]['top'] + sts[j]['bottom']) / 2
        gl = []
        for g in page.glyphs:
            if not (s['x0'] - 1 < g['x'] < s['x1'] + 2): continue
            near = min(range(len(sts)), key=lambda j: abs(g['y'] - mid(j)))
            if near == i and s['top'] - 7 * s['sp'] < g['y'] < s['bottom'] + 7 * s['sp']: gl.append(g)
        S = omr2.parse_staff(page, s, c, gl)
        S['index'] = i
        chords, rests, accs = omr2.chords_of(page, S)
        S['chords'], S['rests'], S['accs'] = chords, rests, accs
        # drop bar lines that are really stems
        sx = [ch['sx'] for ch in chords if ch['sx'] is not None]
        S['bars'] = [b for b in S['bars'] if not any(abs(b - x) < 0.5 for x in sx)]
        mark_ties(page, S)
        res.append(S)
    return res


def mark_ties(page, S):
    """a tie is an arc between two heads of the same pitch: look for dark pixels along a band above or below them"""
    sp = S['sp']; d = page.clean
    allc = sorted(S['chords'], key=lambda c: c['x'])
    w = 1.3 * sp
    for i, c1 in enumerate(allc):
        for it in c1['items']:
            p1 = (round(S['pos'](it['y'])))
            best = None
            for c2 in allc[i + 1:i + 6]:
                if c2['x'] - c1['x'] < 1.5 * sp: continue
                for jt in c2['items']:
                    if round(S['pos'](jt['y'])) == p1:
                        best = jt; break
                if best: break
            if not best: continue
            x0 = it['x'] + w; x1 = best['x']
            if x1 - x0 < 0.6 * sp: continue
            for sgn in (1, -1):
                ya = int((it['y'] + sgn * 0.45 * sp) * Z); yb = int((it['y'] + sgn * 1.8 * sp) * Z)
                lo, hi = min(ya, yb), max(ya, yb)
                cols = 0; tot = 0
                for X in range(int(x0 * Z), int(x1 * Z)):
                    tot += 1
                    if d[lo:hi, X].any(): cols += 1
                if tot and cols / tot > 0.8:
                    it['tie_start'] = True; best['tie_stop'] = True; break


def measures_of(S):
    """split the staff's chords and rests into measures; returns list of dict(voices={v: [events]})"""
    st = S['st']; sp = S['sp']
    bars = sorted(set(round(b, 1) for b in S['bars']))
    # merge bars closer than 3 sp (double bars)
    merged = []
    for b in bars:
        if merged and b - merged[-1] < 3 * sp: merged[-1] = b
        else: merged.append(b)
    first_bar_x = S['firstx'] - 2
    edges = [first_bar_x] + [b for b in merged if b > first_bar_x + 2 * sp]
    if edges[-1] < st['x1'] - 8: edges.append(st['x1'] + 1)
    meas = []
    for a, b in zip(edges, edges[1:]):
        ch = [c for c in S['chords'] if a <= c['x'] + 0.1 < b]
        rs = [r for r in S['rests'] if a <= r['x'] + 0.1 < b]
        accs = [x for x in S['accs'] if a <= x['x'] < b]
        if not ch and not rs: continue
        meas.append(dict(a=a, b=b, chords=ch, rests=rs, accs=accs))
    return meas


def pitch_name(S, y):
    d = S['d0'] + int(round(S['pos'](y)))
    return d // 7, STEPS[d % 7]


def build_events(S, m, fifths):
    sp = S['sp']
    kalt = key_alter(fifths)
    chords = sorted(m['chords'], key=lambda c: c['x'])
    # voices
    poly = False
    for i, c in enumerate(chords):
        for c2 in chords[i + 1:]:
            if abs(c['x'] - c2['x']) < 0.9 * sp and c['stem'] and c2['stem'] and c['stem'] != c2['stem']: poly = True
    mid = (S['st']['top'] + S['st']['bottom']) / 2
    evs = []
    seen = {}
    allh = []
    for c in chords:
        for it in c['items']: allh.append((c, it))
    # accidentals
    accmap = {}
    for a in sorted(m['accs'], key=lambda g: g['x']):
        best = None
        for c, it in allh:
            dx = it['x'] - a['x']
            if 0.2 * sp < dx < 3.2 * sp and abs(it['y'] - a['y']) < 0.8 * sp:
                if best is None or dx < best[0]: best = (dx, id(it))
        if best: accmap[best[1]] = ACC[a['c']]
    for c in chords:
        v = 1 if (not poly or c['stem'] != 'down') else 2
        notes = []
        for it in sorted(c['items'], key=lambda t: -t['y']):
            octv, step = pitch_name(S, it['y'])
            key = (octv, step)
            if id(it) in accmap: seen[key] = accmap[id(it)]
            alter = seen.get(key, kalt.get(step, 0))
            notes.append((step, alter, octv, bool(it.get('tie_start')), bool(it.get('tie_stop'))))
        evs.append(dict(x=c['x'], voice=v, dur=c['dur'], notes=notes, stem=c['stem']))
    for r in m['rests']:
        base = REST[r['c']]
        if poly: v = 1 if r['y'] < mid else 2
        else: v = 1
        evs.append(dict(x=r['x'], voice=v, dur=None if base == 'w' else DUR[base], notes=[], rest=base, stem=None))
    return evs, poly


def to_figure_parts(sections):
    pass
