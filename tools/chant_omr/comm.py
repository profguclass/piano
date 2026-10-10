"""Reads the Communion antiphons of tools/sources/gregorian/communio/*.pdf (vector PDFs with a neume font) into MusicXML:
the antiphon only (the staves above the first psalm verse). Run: python tools/chant_omr/comm.py"""
import os, re, sys, glob
import numpy as np, fitz
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import omr, omr3, build

SRC = os.path.join(HERE, '..', 'sources', 'gregorian', 'communio')
OUT = os.path.join(HERE, '..', '..', 'personal', 'gregorian', 'communio')
SCALE = 4.4


def render(page, clip):
    pix = page.get_pixmap(matrix=fitz.Matrix(SCALE, SCALE), clip=clip, colorspace=fitz.csGRAY)
    return np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w)


def antiphon(path):
    d = fitz.open(path); p = d[0]
    if p.rect.width < p.rect.height: p.set_rotation((p.rotation + 90) % 360)      # a few files are stored sideways
    W, H = p.rect.width, p.rect.height
    rot = p.rotation_matrix
    words = [(fitz.Rect(w[:4]) * rot, w[4], w[5], w[6]) for w in p.get_text('words')]
    colw = W * 0.5
    left = [w for w in words if w[0].x0 < colw]
    g = render(p, fitz.Rect(0, 0, colw, H))
    allst = omr.find_staves(g < 140)
    y_first = allst[0][0] / SCALE if allst else 0
    y_verse = H                                              # the antiphon ends where the psalm verses begin ("V." or the number 1.)
    for r, t, *_ in sorted(left, key=lambda w: w[0].y0):
        if r.y0 > y_first + 20 and re.fullmatch(r'(℣|V|1)\.', t): y_verse = r.y0 - 2; break
    top = min((w for w in left if w[0].y0 > 20), key=lambda w: w[0].y0, default=None)
    heading = ''
    if top:
        row = sorted([w for w in left if abs(w[0].y0 - top[0].y0) < 6], key=lambda w: w[0].x0)
        heading = ' '.join(w[1] for w in row)
    st = [s for s in allst if s[0] < y_verse * SCALE]
    return heading, g, st


def roman_title(t):
    return ' '.join(w if re.fullmatch(r'[IVXLCDM]+', w) else w.capitalize() for w in t.split())


def drop_dropcap(ev):
    """The big initial letter beside the first staff leaves marks left of the clef: drop everything left of the first clef (two squares one above the other)."""
    hs = ev['heads']
    for i, h in enumerate(hs):
        for j in range(i + 1, min(i + 3, len(hs))):
            k = hs[j]
            if abs(k['x'] - h['x']) < 6 and 1.6 < abs(k['pos'] - h['pos']) < 2.4 and h['x'] < 600 and min(h['pos'], k['pos']) > 0.5 and max(h['pos'], k['pos']) < 8.5:
                x0 = h['x']; lo, hi = min(h['pos'], k['pos']) - 0.5, max(h['pos'], k['pos']) + 0.5
                lone = [q for q in hs if x0 - 0.9 * ev['sp'] < q['x'] < x0 - 0.3 * ev['sp'] and lo < q['pos'] < hi]      # the Fa clef has a third square on its left
                if lone: x0 = min(q['x'] for q in lone)
                ev['heads'] = [q for q in hs if q['x'] >= x0 - 4]; return ev
    return ev


def run(path, n):
    heading, g, st = antiphon(path)
    if not st: raise RuntimeError('no staves')
    seq = []; last = None
    for s in st:
        ev = drop_dropcap(omr3.staff_events(g, s))
        clef, kf, toks = omr3.tokens(ev, xmax=520)
        if clef is None: clef = last
        if clef is None: raise RuntimeError('no clef')
        last = clef; seq.append((clef, kf, toks))
    slug = os.path.splitext(os.path.basename(path))[0]
    feast = roman_title(heading)
    title = f"Communion: {slug.capitalize()} ({feast})" if feast else f'Communion: {slug.capitalize()}'
    xml, bars = build.build(title, None, bpm=66, composer='Gregorian chant (Communion antiphon)', seq=seq)
    fn = f'{n:03d}-{slug}.musicxml'
    open(os.path.join(OUT, fn), 'w', encoding='utf-8').write(xml)
    return fn, title, len(st), sum(1 for t in bars.replace('|', ' ').split() if not t.startswith('r'))


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    skip = {'index-communio', 'index_communio_1962', 'tones'}
    files = [f for f in sorted(glob.glob(os.path.join(SRC, '*.pdf'))) if os.path.splitext(os.path.basename(f))[0] not in skip]
    only = sys.argv[1:]
    n = 0
    for f in files:
        if only and os.path.splitext(os.path.basename(f))[0] not in only: continue
        n += 1
        try: print(run(f, n))
        except BaseException as e: print((os.path.basename(f), 'ERR', repr(e)[:90]))
