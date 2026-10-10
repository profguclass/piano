import sys, os, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
import omr3
from make_lessons import score

NAMES = 'CDEFGAB'


def pitch(dia, flat):
    n = NAMES[dia % 7]; o = dia // 7
    return f"{n}{'b' if flat and n == 'B' else ''}{o}"


def chant_tokens(spec, shift=0):
    """spec: list of (page, [staves], {clef:..})"""
    toks = []; all_dia = []
    seq = []; last = None
    for page, staves, opt in spec:
        for si, clef, kf, t in omr3.to_tokens(page, staves, clef_default=opt.get('clef')):
            if clef is None: clef = last
            if clef is None: raise SystemExit(f'no clef on page {page} staff {si}')
            last = clef
            seq.append((clef, kf, t))
    return seq


def build(title, spec, bpm=60, composer='Gregorian chant', shift=None, perbar=8):
    seq = chant_tokens(spec)
    notes = []                                  # (dia, dotted, flat, bar_after)
    for clef, kf, t in seq:
        flat_on = kf
        for a in t:
            if a[0] == 'bar':
                if a[1] != 'quarter' and notes: notes.append(('brk',))
                continue
            _, pos, dotted, fl, x = a
            dia = 35 + int(round(pos - clef))
            if fl: flat_on = True
            isb = (dia % 7) == 6
            notes.append((dia, dotted, kf or (flat_on and isb), None))
        notes.append(('brk',))
    ds = [n[0] for n in notes if n[0] != 'brk']
    if shift is None:
        shift = 7 if min(ds) < 26 else -7 if max(ds) > 41 else 0
        if shift == 7 and max(ds) + 7 > 43: shift = 0
    bars, cur, used = [], [], 0
    def flush():
        nonlocal cur, used
        if cur:
            left = perbar - used
            for u, name in ((4, 'rh'), (2, 'rq'), (1, 're')):
                while left >= u: cur.append(name); left -= u
            bars.append(' '.join(cur)); cur = []; used = 0
    for n in notes:
        if n[0] == 'brk':
            flush(); continue
        dia, dotted, fl, _ = n
        d = 2 if dotted else 1
        if used + d > perbar: flush()
        cur.append(pitch(dia + shift, fl) + ('q' if dotted else 'e')); used += d
        if used == perbar: flush()
    flush()
    bars = [b.replace('rr', 're') if False else b for b in bars]
    # rests: fix tokens like 'rh','rq','re','rq.'
    out = []
    for b in bars:
        toks = [t if not t.startswith('r') or t in ('rh', 'rq', 're', 'rq.') else 're' for t in b.split()]
        out.append(' '.join(toks))
    return score(title, ' | '.join(out), '', bpm, time=(4, 4), composer=composer), ' | '.join(out)


if __name__ == '__main__':
    xml, s = build('Ave Maria', [(46, [0, 1, 2, 3, 4], {})])
    print(s)
    pass
