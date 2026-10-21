import sys, re, math, collections
sys.path.insert(0, '.')
import numpy as np, fitz
from omr import Page, Z, CLEF, stem_info, beam_levels

HEAD = {'œ': 'q', '˙': 'h', 'w': 'w'}
REST = {'‰': 'q', 'Œ': 'e', 'Ó': 'h', '∑': 'w', '≈': 's'}
ACC = {'#': 1, 'b': -1, 'n': 0, '×': 2}
DUR = {'w': 4.0, 'h': 2.0, 'q': 1.0, 'e': 0.5, 's': 0.25, 't': 0.125}
STEPS = 'CDEFGAB'
SHARPS = ['F', 'C', 'G', 'D', 'A', 'E', 'B']


def barlines(page, st):
    d = page.dark
    y0, y1 = int((st['top'] + 0.4) * Z), int((st['bottom'] - 0.4) * Z)
    cols = np.flatnonzero(d[y0:y1, :].all(axis=0))
    xs = []
    for c in cols:
        if xs and c - xs[-1][-1] <= 1: xs[-1].append(c)
        else: xs.append([c])
    out = []
    for g in xs:
        x = np.mean(g) / Z
        if st['x0'] + 5 < x < st['x1'] + 2: out.append(round(x, 2))
    return out


def head_width(sp): return 1.3 * sp


def pitch_of(pos, d0):
    d = d0 + int(round(pos))
    return d // 7, STEPS[d % 7]


def parse_staff(page, st, clef, glyphs):
    sp = st['sp']
    cname, d0 = CLEF[clef['c']]
    mid = (st['top'] + st['bottom']) / 2
    pos = lambda y: (st['bottom'] - y) / (sp / 2)
    # header: key and time signature between clef and first note/rest
    firstx = min([g['x'] for g in glyphs if g['c'] in HEAD or g['c'] in REST] or [1e9])
    hdr = [g for g in glyphs if g['x'] > clef['x'] + 3 and g['x'] < firstx - 1.0 * sp]
    keyacc = [g for g in hdr if g['c'] in ('#', 'b')]
    timeg = [g for g in hdr if g['c'].isdigit() or g['c'] in ('c', 'C')]
    fifths = 0
    if keyacc:
        fifths = len([g for g in keyacc if g['c'] == '#']) - len([g for g in keyacc if g['c'] == 'b'])
    time = None
    if timeg:
        if any(g['c'] in ('c', 'C') for g in timeg):
            time = (4, 4) if any(g['c'] == 'c' for g in timeg) else (2, 2)
        else:
            tg = sorted(timeg, key=lambda g: g['y'])
            ups = [g for g in tg if g['y'] < mid]
            lows = [g for g in tg if g['y'] >= mid]
            num = int(''.join(g['c'] for g in sorted(ups, key=lambda g: g['x'])) or 0) if ups else 0
            den = int(''.join(g['c'] for g in sorted(lows, key=lambda g: g['x'])) or 0) if lows else 0
            if num and den: time = (num, den)
    body = [g for g in glyphs if g not in hdr and g['x'] > clef['x'] + 3 and g['c'] not in CLEF]
    bars = barlines(page, st)
    return dict(cname=cname, d0=d0, fifths=fifths, time=time, body=body, bars=bars, st=st, pos=pos, sp=sp, firstx=firstx)


def chords_of(page, S):
    """group heads into chords (by stem), return list of dict(x, heads=[(y,pos)], dur, stem, rest)"""
    sp = S['sp']
    body = S['body']
    heads = [g for g in body if g['c'] in HEAD]
    rests = [g for g in body if g['c'] in REST]
    accs = [g for g in body if g['c'] in ACC]
    dots = [g for g in body if g['c'] == '.']
    flags = [g for g in body if g['c'] in ('J', 'j')]
    w = head_width(sp)
    items = []
    for h in heads:
        sd, tip, sx = stem_info(page, h['x'], h['y'], sp, w) if h['c'] != 'w' else (None, None, None)
        items.append(dict(g=h, kind=HEAD[h['c']], stem=sd, tip=tip, sx=sx, x=h['x'], y=h['y']))
    # chord grouping: same stem column, or (stemless) same x
    items.sort(key=lambda it: (it['x'], it['y']))
    chords = []
    for it in items:
        placed = False
        for ch in chords:
            same = (it['sx'] is not None and ch['sx'] is not None and abs(it['sx'] - ch['sx']) < 0.35 and it['stem'] == ch['stem'])
            if it['stem'] is None and ch['stem'] is None and abs(it['x'] - ch['x']) < 0.4 * sp and it['kind'] == ch['kind']: same = True
            if same:
                ch['items'].append(it); placed = True; break
        if not placed:
            chords.append(dict(items=[it], sx=it['sx'], stem=it['stem'], tip=it['tip'], x=it['x'], kind=it['kind']))
    # attach stemless heads that sit on another chord's stem (same x, between head and tip)
    loose = [c for c in chords if c['stem'] is None and c['kind'] != 'w']
    for lc in loose:
        it = lc['items'][0]
        for ch in chords:
            if ch is lc or ch['stem'] is None: continue
            hx = min(i2['x'] for i2 in ch['items'])
            ys = [i2['y'] for i2 in ch['items']]
            lo, hi = (min(ys) , ch['tip']) if ch['stem'] == 'down' else (ch['tip'], max(ys))
            lo, hi = min(lo, hi), max(lo, hi)
            if abs(hx - it['x']) < 0.5 * sp and lo - 0.3 * sp <= it['y'] <= hi + 0.3 * sp and it['kind'] == ch['kind']:
                ch['items'].append(it); lc['items'] = []; break
    chords = [c for c in chords if c['items']]
    for ch in chords:
        ch['x'] = min(it['x'] for it in ch['items'])
        # stem tip: the far end among heads
        ys = [it['y'] for it in ch['items']]
        if ch['stem'] == 'up': ch['tip'] = min(it['tip'] for it in ch['items'])
        elif ch['stem'] == 'down': ch['tip'] = max(it['tip'] for it in ch['items'])
        # flags / beams
        nfl = 0
        if ch['stem']:
            for f in flags:
                if abs(f['x'] - (ch['sx'] if ch['stem'] == 'up' else ch['sx'])) < 1.2 * sp + 0.0 and abs(f['y'] - ch['tip']) < 2.2 * sp:
                    nfl = 1
            if not nfl and ch['kind'] == 'q':
                nb = beam_levels(page, ch['sx'], ch['tip'], ch['stem'], sp)
                nfl = nb
        ch['flags'] = nfl
        base = ch['kind']
        if base == 'q' and nfl >= 1: base = {1: 'e', 2: 's', 3: 't'}.get(nfl, 't')
        ch['base'] = base
        # dots
        nd = 0
        for dgl in dots:
            for it in ch['items']:
                if 0.7 * sp < dgl['x'] - it['x'] < 2.6 * sp and abs(dgl['y'] - it['y']) < 1.3 * sp:
                    nd = max(nd, 1)
        # second dot
        if nd:
            for dgl in dots:
                for it in ch['items']:
                    if 2.6 * sp < dgl['x'] - it['x'] < 3.8 * sp and abs(dgl['y'] - it['y']) < 1.3 * sp: nd = 2
        ch['ndots'] = nd
        ch['dur'] = DUR[base] * (1.5 if nd == 1 else 1.75 if nd == 2 else 1)
    return chords, rests, accs
