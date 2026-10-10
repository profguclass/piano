"""Reads one page of goodchild.pdf into chant staves: per staff the clef position and an ordered list of events
(notes by staff position, dots, flats, bars)."""
import numpy as np, fitz, os
from scipy import ndimage as ndi
from scipy.signal import fftconvolve
import omr
RESIDUAL = True        # also look for small squares (liquescent notes) next to the full ones

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
    e = max(5, int(sp * 0.4))
    for i, sl in enumerate(ndi.find_objects(lab)):
        h, w = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
        yc = (sl[0].start + sl[0].stop) / 2; xc = (sl[1].start + sl[1].stop) / 2
        if w > 1.6 * sp or h > 2.4 * sp: continue                  # lettering, not music
        pos = (yb3 - yc) / (sp / 2)
        if not -3.2 < pos < 9.8: continue
        if pos < -1.2 and (w < 16 or h < 16): continue            # an asterisk or a mark in the lyrics
        P = lambda y: (yb3 - y) / (sp / 2)
        if w <= 0.75 * sp and h <= 0.8 * sp:                       # one square
            heads.append(dict(x=xc, pos=pos, big=False, w=w, h=h, x1=sl[1].stop)); continue
        diag = False
        # several squares fused (a clivis, a podatus whose squares touch, a porrectus): split by erosion
        blob = (lab[sl] == i + 1)
        er = ndi.binary_erosion(blob, structure=np.ones((e, e), bool))
        l2, n2 = ndi.label(er)
        cores = []
        for q in range(1, n2 + 1):
            ys, xs = np.nonzero(l2 == q)
            cores.append((xs.mean() + sl[1].start, ys.mean() + sl[0].start))
        top_y, bot_y = sl[0].start + 0.27 * sp, sl[0].stop - 0.27 * sp
        notes = []
        if len(cores) >= 2:
            notes = cores
        elif len(cores) == 1:
            cx, cy = cores[0]
            notes = [cores[0]]
            if w > 0.95 * sp and cy - top_y > 0.6 * sp: notes = [(sl[1].start + 0.27 * sp, top_y), cores[0]]   # porrectus: the stroke starts high on the left
        else:
            notes = [(sl[1].start + 0.27 * sp, top_y), (sl[1].stop - 0.27 * sp, bot_y)]
        if len(cores) >= 2 or (len(cores) == 1 and not (w > 0.95 * sp and cores[0][1] - top_y > 0.6 * sp)):
            # a small square (a liquescent note) left over beside the full squares
            res = blob.copy(); half = int(0.3 * sp) + 1
            for nx, ny in notes:
                cx, cy = int(nx - sl[1].start), int(ny - sl[0].start)
                res[max(0, cy - half):cy + half + 1, max(0, cx - half):cx + half + 1] = False
            res = ndi.binary_opening(res, structure=np.ones((7, 7), bool))
            l3, n3 = ndi.label(res)
            for q in range(1, n3 + 1):
                ys, xs = np.nonzero(l3 == q)
                if len(ys) >= 55: notes.append((xs.mean() + sl[1].start, ys.mean() + sl[0].start))
        notes.sort(key=lambda t: (round(t[0] / (0.2 * sp)), -t[1]) if False else t[0])
        # squares in one column (same x) are sung from the bottom up
        col = sorted(notes, key=lambda t: (t[0] // (0.25 * sp), -t[1]))
        for nx, ny in col:
            heads.append(dict(x=nx, pos=P(ny), big=False, w=17, h=19, x1=sl[1].stop))
    # small squares (liquescent notes) are too small for the main opening: look for solid spots the heads do not explain
    small = ndi.binary_opening(sub, structure=np.ones((7, 7), bool)) if RESIDUAL else np.zeros_like(sub)
    covered = ndi.binary_dilation(core, structure=np.ones((11, 11), bool))
    l4, n4 = ndi.label(small & ~covered)
    xfirst = min([h['x'] for h in heads] or [0]) - 0.5 * sp
    r0 = int(round(ys[0])); cols_ = np.nonzero(sub[max(0, r0 - 2):r0 + 3].any(axis=0))[0]
    xlast = (float(cols_.max()) if len(cols_) else float(sub.shape[1])) - 1.5 * sp          # beyond this is the custos at the end of the line
    flat_pts = find_flats(sub, sp)
    dot_pts = []
    lab_d, n_d = ndi.label(sub)
    for i, sl in enumerate(ndi.find_objects(lab_d)):
        hh, ww = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
        if 5 <= hh <= 0.4 * sp and 5 <= ww <= 0.4 * sp and abs(hh - ww) <= 4: dot_pts.append(((sl[1].start + sl[1].stop) / 2, (sl[0].start + sl[0].stop) / 2))
    for i, sl in enumerate(ndi.find_objects(l4)):
        hh, ww = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
        if not (8 <= hh <= 0.6 * sp and 8 <= ww <= 0.6 * sp): continue
        cx, cy = (sl[1].start + sl[1].stop) / 2, (sl[0].start + sl[0].stop) / 2
        if any(abs(cx - dx) < 9 and abs(cy - dy) < 9 for dx, dy in dot_pts): continue
        if any(abs(cx - fx) < 0.6 * sp and abs(cy - fy) < 0.9 * sp for fx, fy in flat_pts): continue          # the bowl of a flat
        p = (yb3 - cy) / (sp / 2)
        if not -1.6 < p < 9.5 or cx < xfirst or cx > xlast: continue
        heads.append(dict(x=cx, pos=p, big=False, w=ww, h=hh, x1=sl[1].stop))
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


def tokens(ev, clef_override=None, xmax=340):
    """-> (clef_pos, tokens). Tokens: ('n', pos, dotted, flat_here) and ('bar', kind), in reading order; key_flat True if the staff opens with a flat."""
    sp, heads = ev['sp'], ev['heads']
    clef, start = None, 0
    if heads and heads[0]['x'] < xmax and heads[0]['h'] > 0.5 * sp:
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
