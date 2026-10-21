"""omr.py: read the notation of the Music Theory book (Maestro-font vector glyphs + rendered pixels) into a simple structure.
Glyphs give exact identity and position; pixels give staff lines, bar lines, stems and beams."""
import fitz, numpy as np, math, collections, re

Z = 4                      # render zoom for pixel analysis
HEAD = {'œ': 'q', '˙': 'h', 'w': 'w'}          # note heads
REST = {'‰': 'q', 'Œ': 'e', 'Ó': 'h', '∑': 'w', '≈': 's'}   # rests (to be verified)
ACC = {'#': 1, 'b': -1, 'n': 0, '×': 2}


class Page:
    def __init__(self, doc, pno):
        self.doc, self.pno = doc, pno
        self.page = doc[pno]
        pm = self.page.get_pixmap(dpi=72 * Z)
        a = np.frombuffer(pm.samples, dtype=np.uint8).reshape(pm.height, pm.width, pm.n)[:, :, 0]
        self.dark = a < 150
        self.H, self.W = self.dark.shape
        self.glyphs, self.lyrics, self.texts, self.tchars = [], [], [], []
        raw = self.page.get_text('rawdict')
        for b in raw['blocks']:
            for l in b.get('lines', []):
                for s in l['spans']:
                    f = s['font']
                    if f == 'Maestro':
                        for c in s['chars']:
                            if c['c'] == ' ': continue
                            if s['size'] < 14 and c['c'] in ('b', '#', 'n'):      # a flat or sharp inside a chord symbol
                                self.tchars.append(dict(c={'b': '♭', '#': '♯', 'n': '♮'}[c['c']], x=c['origin'][0], y=s['origin'][1] + 1.6, size=9, f='Maestro-sym'))
                                continue
                            self.glyphs.append(dict(c=c['c'], x=c['origin'][0], y=c['origin'][1], size=s['size']))
                    elif f.startswith('FinaleLyrics'):
                        t = ''.join(c['c'] for c in s['chars'])
                        self.lyrics.append(dict(t=t, x=s['bbox'][0], x1=s['bbox'][2], y=s['origin'][1]))
                    else:
                        if f.startswith('TimesNewRoman') or f.startswith('MaestroTimes') or f.startswith('FinaleNumerics'):
                            for c in s['chars']:
                                self.tchars.append(dict(c=c['c'], x=c['origin'][0], y=c['origin'][1], size=s['size'], f=f))
                        t = ''.join(c['c'] for c in s['chars'])
                        if t.strip():
                            self.texts.append(dict(t=t, x=s['bbox'][0], x1=s['bbox'][2], y=s['origin'][1], f=f, size=s['size'], y0=s['bbox'][1], y1=s['bbox'][3]))

    # ---- staves from pixels ----
    def staves(self):
        d = self.dark
        W = self.W
        run = np.zeros(self.H, int)
        for y in range(self.H):
            row = d[y]
            # longest horizontal run
            idx = np.flatnonzero(np.diff(np.concatenate(([0], row.astype(np.int8), [0]))))
            if len(idx) >= 2:
                lens = idx[1::2] - idx[0::2]
                run[y] = lens.max()
        cand = np.where(run > 0.2 * W)[0]
        groups = []
        for y in cand:
            if groups and y - groups[-1][-1] <= 2: groups[-1].append(y)
            else: groups.append([y])
        ys = [np.mean(g) for g in groups]
        out = []
        i = 0
        while i <= len(ys) - 5:
            g = ys[i:i + 5]
            sp = (g[4] - g[0]) / 4
            if 2.5 * Z < sp < 7.5 * Z and all(abs((g[k + 1] - g[k]) - sp) < 0.12 * sp for k in range(4)):
                # x extent
                row = d[int(round(g[2]))]
                xs = np.flatnonzero(row)
                out.append(dict(top=g[0] / Z, bottom=g[4] / Z, sp=sp / Z, x0=xs.min() / Z, x1=xs.max() / Z))
                i += 5
            else:
                i += 1
        # a copy without the staff lines, for beams
        c = d.copy()
        t = max(2, int(0.35 * Z))
        for st in out:
            for k in range(5):
                y = int(round((st['top'] + k * st['sp']) * Z))
                for yy in range(y - 2, y + 3):
                    if 0 <= yy < self.H:
                        up = d[max(yy - t - 2, 0)]; dn = d[min(yy + t + 2, self.H - 1)]
                        c[yy] = d[yy] & (up | dn)
        self.clean = c
        return out


def stem_info(page, hx, hy, sp, w):
    """look for a stem next to the head whose origin is (hx, hy): returns ('up'|'down'|None, tip_y, stem_x)"""
    d = page.dark
    best = None
    for side, sx in (('up', hx + w - 0.3), ('down', hx + 0.3)):
        for dx in (-0.4, -0.2, 0, 0.2, 0.4):
            X = int(round((sx + dx) * Z))
            if X < 0 or X >= page.W: continue
            y0 = int(round(hy * Z))
            col = d[:, X]
            if side == 'up':
                y = y0 - int(0.5 * sp * Z)
                n = 0
                while y > 0 and col[y]: y -= 1; n += 1
                length = n
                tip = y / Z
            else:
                y = y0 + int(0.5 * sp * Z)
                n = 0
                while y < page.H - 1 and col[y]: y += 1; n += 1
                length = n
                tip = y / Z
            if length > 1.9 * sp * Z and (best is None or length > best[0]):
                best = (length, side, tip, sx + dx)
    return (best[1], best[2], best[3]) if best else (None, None, None)


CLEF = {'&': ('treble', 30), '?': ('bass', 18)}      # diatonic index of the bottom line (C0 = 0): E4 = 30, G2 = 18


def beam_levels(page, stem_x, tip_y, direction, sp):
    """count beam bars beside a stem near its tip (sampled 0.9 and 1.3 staff spaces to either side)"""
    d = page.clean
    best = 0
    for off in (-1.3, -0.9, 0.9, 1.3):
        X = int(round((stem_x + off * sp) * Z))
        if X < 0 or X >= page.W: continue
        if direction == 'up': ya, yb = int(tip_y * Z - 0.15 * sp * Z), int(tip_y * Z + 2.2 * sp * Z)
        else: ya, yb = int(tip_y * Z - 2.2 * sp * Z), int(tip_y * Z + 0.15 * sp * Z)
        col = d[max(ya, 0):yb, X]
        runs = 0; prev = False
        for v in col:
            if v and not prev: runs += 1
            prev = bool(v)
        best = max(best, runs)
    return best


def read_staff(page, st, k):
    """returns dict(clef, key, time, items) for one staff; items = heads, rests, accidentals, dots in x order"""
    sp = st['sp']
    clef = None
    for g in page.glyphs:
        if g['c'] in CLEF and st['top'] - 2 * sp < g['y'] < st['bottom'] + 2 * sp and st['x0'] - 2 < g['x'] < st['x0'] + 14:
            clef = g
    if not clef: return None
    cname, d0 = CLEF[clef['c']]
    def pos(y): return (st['bottom'] - y) / (sp / 2)          # half-spaces above the bottom line
    return dict(clef=cname, d0=d0, sp=sp, st=st, clefx=clef['x'])
