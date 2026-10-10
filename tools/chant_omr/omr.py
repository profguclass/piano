"""Reads Solesmes square notation from the scanned pages of goodchild.pdf: finds the four-line staves and the noteheads and
reports each notehead's staff position (0 = bottom line, 1 = first space, 2 = second line ...)."""
import sys, json
import numpy as np, fitz
from scipy import ndimage as ndi
from PIL import Image, ImageDraw

import os
HERE = os.path.dirname(os.path.abspath(__file__))
PDF = os.path.join(HERE, '..', 'sources', 'gregorian', 'goodchild.pdf')


def page_gray(doc, i):
    p = doc[i]
    xref = p.get_images(full=True)[0][0]
    pix = fitz.Pixmap(doc, xref)
    if pix.n > 1: pix = fitz.Pixmap(fitz.csGRAY, pix)
    return np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w)


def _staves_at(bw, frac):
    H, W = bw.shape
    rows = bw.sum(axis=1)
    cand = np.where(rows > frac * W)[0]
    lines = []
    for r in cand:
        if lines and r - lines[-1][-1] <= 2: lines[-1].append(r)
        else: lines.append([r])
    ys = [np.mean(l) for l in lines]
    staves, i = [], 0
    while i + 3 < len(ys):
        g = ys[i:i + 4]; d = np.diff(g)
        if d.max() < 1.18 * d.min() + 2 and 28 < d.mean() < 46:
            staves.append(g); i += 4
        else: i += 1
    return staves


def find_staves(bw):
    """Rows crossed by long dark runs are staff lines; four evenly spaced lines make a staff."""
    st = _staves_at(bw, 0.3)
    for frac in (0.2, 0.12):
        for s in _staves_at(bw, frac):
            if all(abs(s[0] - t[0]) > 150 for t in st) and 150 < s[0] < 2300: st.append(s)
    st = [s for s in st if 98 < s[3] - s[0] < 116]
    st.sort(key=lambda s: s[0])
    return st


def strip_lines(bw, ys, half=3, probe=6):
    """Erase staff lines where nothing dark lies above and below them (so notes sitting on a line stay whole)."""
    out = bw.copy()
    for y in ys:
        y0, y1 = int(round(y)) - half, int(round(y)) + half + 1
        above, below = bw[y0 - probe], bw[y1 + probe - 1]
        keep = above & below
        band = out[y0:y1]
        band[:, ~keep] = False
    return out


def analyse(gray, staff, x0=0, x1=None):
    H, W = gray.shape
    bw = gray < 140
    sp = float(np.mean(np.diff(staff)))
    top, bot = staff[0] - 3.2 * sp, staff[-1] + 3.2 * sp
    ya, yb = int(max(0, top)), int(min(H, bot))
    sub = bw[ya:yb, x0:x1 or W]
    ys = [y - ya for y in staff]
    clean = sub
    k = max(5, int(sp * 0.34))
    core = ndi.binary_opening(clean, structure=np.ones((k, k), bool))
    lab, n = ndi.label(core)
    objs = ndi.find_objects(lab)
    notes = []
    for i, sl in enumerate(objs):
        h, w = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
        yc = (sl[0].start + sl[0].stop) / 2; xc = (sl[1].start + sl[1].stop) / 2 + (x0)
        pos = (ys[3] - yc) / (sp / 2)
        notes.append(dict(x=round(xc), pos=round(pos, 2), w=w, h=h))
    notes.sort(key=lambda n: n['x'])
    return notes, sp, clean


if __name__ == '__main__':
    doc = fitz.open(PDF)
    pg = int(sys.argv[1])
    g = page_gray(doc, pg)
    bw = g < 140
    st = find_staves(bw)
    print('staves', len(st), [round(s[0]) for s in st])
    for si, s in enumerate(st):
        notes, sp, _ = analyse(g, s)
        print(si, 'sp', round(sp, 1), [(n['x'], n['pos'], n['w'], n['h']) for n in notes][:70])


def columns(notes, gap=10):
    cols = []
    for n in sorted(notes, key=lambda n: n['x']):
        if cols and abs(n['x'] - cols[-1]['x']) <= gap:
            cols[-1]['pos'].append(n['pos']); cols[-1]['big'] |= (n['w'] > 26 or n['h'] > 28)
        else: cols.append({'x': n['x'], 'pos': [n['pos']], 'big': n['w'] > 26 or n['h'] > 28})
    for c in cols: c['pos'] = sorted(c['pos'])
    return cols
