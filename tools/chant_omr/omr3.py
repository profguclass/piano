"""Reads one page of goodchild.pdf into chant staves: per staff the clef position and an ordered list of events
(notes by staff position, dots, flats, bars)."""
import numpy as np, fitz, os
from scipy import ndimage as ndi
from scipy.signal import fftconvolve
import omr

HERE = os.path.dirname(os.path.abspath(__file__))
doc = fitz.open(omr.PDF)
_gray = {}


def gray(i):
    if i not in _gray: _gray[i] = omr.page_gray(doc, i)
    return _gray[i]


def _flat_template():
    g = gray(46); t = (g[317:364, 534:556] < 140)
    return t


FLAT = _flat_template()


def find_flats(sub, sp):
    scale = sp / 35.3
    t = FLAT
    if abs(scale - 1) > 0.05:
        from PIL import Image
        im = Image.fromarray((t * 255).astype(np.uint8)).resize((max(4, int(t.shape[1] * scale)), max(8, int(t.shape[0] * scale))))
        t = np.asarray(im) > 127
    tf = t.astype(float); area = tf.sum()
    hole = np.ones_like(tf)                        # the template's bounding box
    f = sub.astype(float)
    hit = fftconvolve(f, tf[::-1, ::-1], mode='same')
    box = fftconvolve(f, hole[::-1, ::-1], mode='same')
    score = (hit - 0.6 * (box - hit)) / area
    pk = score > 0.62
    lab, n = ndi.label(pk)
    out = []
    for sl in ndi.find_objects(lab):
        yc = (sl[0].start + sl[0].stop) / 2; xc = (sl[1].start + sl[1].stop) / 2
        out.append((xc, yc))
    return out


def staff_events(g, s):
    H, W = g.shape
    bw = g < 140
    sp = float(np.mean(np.diff(s)))
    ya, yb = int(max(0, s[0] - 3.2 * sp)), int(min(H, s[-1] + 3.2 * sp))
    sub = bw[ya:yb]
    ys = [y - ya for y in s]
    yb3 = ys[3]
    k = max(5, int(sp * 0.34))
    core = ndi.binary_opening(sub, structure=np.ones((k, k), bool))
    lab, n = ndi.label(core)
    heads = []
    for i, sl in enumerate(ndi.find_objects(lab)):
        h, w = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
        yc = (sl[0].start + sl[0].stop) / 2; xc = (sl[1].start + sl[1].stop) / 2
        big = w > 0.9 * sp or h > 0.95 * sp
        if w > 1.6 * sp or h > 2.4 * sp: continue                  # lettering, not music
        pos = (yb3 - yc) / (sp / 2)
        top = (yb3 - sl[0].start - 0.27 * sp) / (sp / 2); bot = (yb3 - sl[0].stop + 0.27 * sp) / (sp / 2)
        if not -3.2 < pos < 9.8: continue
        if pos < -1.2 and (w < 16 or h < 16): continue            # an asterisk or a mark in the lyrics
        heads.append(dict(x=xc, pos=pos, big=big, w=w, h=h, top=top, bot=bot, x1=sl[1].stop))
    heads.sort(key=lambda d: d['x'])
    # dots: small round marks just to the right of a head
    lab2, n2 = ndi.label(sub)
    dots = []
    for i, sl in enumerate(ndi.find_objects(lab2)):
        h, w = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
        if 5 <= h <= 0.4 * sp and 5 <= w <= 0.4 * sp and abs(h - w) <= 4:
            area = (lab2[sl] == i + 1).sum()
            if area > 0.55 * w * h: dots.append(((sl[1].start + sl[1].stop) / 2, (sl[0].start + sl[0].stop) / 2))
    # bars: tall thin strokes away from any head
    vert = ndi.binary_opening(sub, structure=np.ones((int(0.8 * sp), 1), bool))
    lab3, n3 = ndi.label(vert)
    bars = []
    for sl in ndi.find_objects(lab3):
        h, w = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
        xc = (sl[1].start + sl[1].stop) / 2
        if w <= 9 and not any(abs(xc - d['x']) < 0.75 * sp for d in heads):
            bars.append((xc, h / sp))
    flats = find_flats(sub, sp)
    return dict(sp=sp, heads=heads, dots=dots, bars=bars, flats=flats, ys=ys, yb3=yb3)


def tokens(ev, clef_override=None):
    """-> (clef_pos, tokens). Tokens: ('n', pos, dotted, flat_here) and ('bar', kind), in reading order; key_flat True if the staff opens with a flat."""
    sp, heads = ev['sp'], ev['heads']
    clef, start = None, 0
    if heads and heads[0]['x'] < 340 and heads[0]['h'] > 0.5 * sp:
        c = [h for h in heads if h['x'] < heads[0]['x'] + 0.9 * sp]
        clef = round(float(np.mean([h['pos'] for h in c])) * 2) / 2; start = len(c)
        if len(c) == 3: clef -= 3                              # the Fa clef: fa is three steps above do
    if clef_override is not None: clef = clef_override
    heads = heads[start:]
    xmin = heads[0]['x'] if heads else 1e9
    items = [('h', h['x'], h) for h in heads] + [('bar', xb, hb) for xb, hb in ev['bars'] if xb > 280]
    items.sort(key=lambda t: t[1])
    cols = []; cur = None
    for kind, x, d in items:
        if kind == 'bar': cols.append(('bar', x, d)); cur = None; continue
        if cur is not None and abs(x - cur['x']) <= 0.2 * sp: cur['hs'].append(d)
        else:
            cur = dict(x=x, hs=[d]); cols.append(('col', x, cur))
    yb3 = ev['yb3']
    flats = [(x, y) for x, y in ev['flats'] if x > 200]
    key_flat = bool(flats) and flats[0][0] < xmin - 0.3 * sp and min(f[0] for f in flats) < 420 and (xmin - flats[0][0]) < 3.2 * sp and len([1 for k, x, c in cols if k == 'col' and x < flats[0][0]]) == 0 and flats[0][0] < 320
    out = []
    for kind, x, c in cols:
        if kind == 'bar':
            out.append(('bar', 'full' if c >= 3.4 else 'half' if c >= 1.8 else 'quarter', x)); continue
        hs = sorted(c['hs'], key=lambda h: h['pos'])
        pl = []
        for h in hs:
            if h['big'] and (h['top'] - h['bot']) > 1.9: pl += [round(h['top']), round(h['bot'])]
            else: pl.append(round(h['pos']))
        flat_here = any(0.15 * sp < c['x'] - fx < 2.4 * sp for fx, fy in flats if not (key_flat and fx == flats[0][0]))
        x1 = max(h['x1'] for h in hs); lastpos = pl[-1]
        dotted = any(0.2 * sp < dx - x1 < 1.7 * sp and abs((yb3 - dy) / (sp / 2) - lastpos) < 1.0 for dx, dy in ev['dots'])
        for j, p in enumerate(pl):
            out.append(('n', p, dotted and j == len(pl) - 1, flat_here, c['x']))
    return clef, key_flat, out


def to_tokens(page, staves, clef_default=None, do_shift=0, key_flat_all=False):
    """Staves of one page -> (list of token strings 'Bb4e'..., bars). Returns the MusicXML-style token lists per staff."""
    g = gray(page)
    st = omr.find_staves(g < 140)
    res = []
    for si in staves:
        ev = staff_events(g, st[si])
        clef, kf, toks = tokens(ev)
        res.append((si, clef if clef is not None else clef_default, kf, toks))
    return res
