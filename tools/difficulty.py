"""Estimate how hard each lesson score is, from the notes themselves, to check that pieces sit in a sensible level.

Run:  python tools/difficulty.py            (prints every piece, sorted by estimated difficulty, with its level)
      python tools/difficulty.py --levels   (average estimate per level)

The estimate (0-100) is a rough guide, built from: how many notes per second are played at the target tempo, whether both
hands play different things at once, the key signature and chromatic notes, the stretch and range, chords, short note values,
unusual or changing time signatures and the length of the piece. It cannot see musical difficulty (expression, voicing), so
the course's levels are decided by looking at the estimate together with the piece itself.
"""
import json, math, os, sys
import xml.etree.ElementTree as ET

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'lessons')
M = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
MAJOR = {0, 2, 4, 5, 7, 9, 11}


def metrics(path, bpm):
    return metrics_xml(open(path, encoding='utf-8').read(), bpm)


def metrics_xml(xml, bpm):
    r = ET.fromstring(xml)
    part = r.find('part'); ms = part.findall('measure')
    div, num, den, fifths = 1, 4, 4, 0
    onsets = {0: {}, 1: {}}                    # staff -> {time in quarters: [midi...]}
    timesigs, t0, shortest, total_notes, chrom, tuplets = set(), 0.0, 9, 0, 0, 0
    bar_starts = []
    for m in ms:
        a = m.find('attributes')
        if a is not None:
            if a.find('divisions') is not None: div = int(a.findtext('divisions'))
            if a.find('key') is not None: fifths = int(a.findtext('key/fifths'))
            if a.find('time') is not None: num, den = int(a.findtext('time/beats')), int(a.findtext('time/beat-type')); timesigs.add((num, den))
        t, mstart = 0, t0
        bar_len = num * 4 / den
        scale = {(p + 7 * fifths) % 12 for p in MAJOR}
        minor = {(x + 9 + 7 * fifths) % 12 for x in (0, 2, 3, 5, 7, 8, 10, 11)}   # the relative minor, with raised sixth and seventh
        known = scale | minor
        for el in list(m):
            if el.tag == 'note':
                d = int(el.findtext('duration') or 0) / div
                chord = el.find('chord') is not None
                st = int(el.findtext('staff') or 1) - 1
                if el.find('pitch') is not None and el.find('grace') is None:
                    p = el.find('pitch'); midi = (int(p.findtext('octave')) + 1) * 12 + M[p.findtext('step')] + int(p.findtext('alter') or 0)
                    at = tcur if chord else t
                    onsets[min(st, 1)].setdefault(round(mstart + at, 4), []).append(midi)
                    total_notes += 1
                    if midi % 12 not in known: chrom += 1
                    if d and d < 0.5: shortest = min(shortest, d)
                    if el.find('time-modification') is not None: tuplets += 1
                if not chord: tcur = t; t += d
            elif el.tag == 'backup': t -= int(el.findtext('duration')) / div
            elif el.tag == 'forward': t += int(el.findtext('duration')) / div
        t0 += max(bar_len, t) if t > 0 else bar_len
    times = sorted(set(onsets[0]) | set(onsets[1]))
    total_q = max(t0, 1)
    both = sum(1 for x in times if x in onsets[0] and x in onsets[1])
    hands_used = sum(1 for h in (0, 1) if onsets[h])
    # "independence": both hands play, and their rhythms differ (they do not just move together)
    ind = 0.0
    if hands_used == 2:
        r0, r1 = set(onsets[0]), set(onsets[1])
        ind = len(r0 ^ r1) / max(1, len(r0 | r1))
    spans = []
    for h in (0, 1):
        for x in onsets[h].values():
            if len(x) > 1: spans.append(max(x) - min(x))
    allp = [p for h in (0, 1) for x in onsets[h].values() for p in x]
    # leaps in the top line of each hand
    leaps = []
    for h in (0, 1):
        prev = None
        for x in sorted(onsets[h]):
            top = max(onsets[h][x])
            if prev is not None: leaps.append(abs(top - prev))
            prev = top
    big = sum(1 for l in leaps if l > 7) / max(1, len(leaps))
    dens = len(times) / total_q * bpm / 60                       # onsets per second at the target tempo
    return dict(bars=len(ms), notes=total_notes, dens=dens, ind=ind, hands=hands_used, acc=abs(fifths), chrom=chrom / max(1, total_notes),
                span=max(spans or [0]), rng=(max(allp) - min(allp)) if allp else 0, chord=max([len(x) for h in (0, 1) for x in onsets[h].values()] or [1]),
                short=shortest, tup=tuplets / max(1, total_notes), ts=sorted(timesigs), big=big)


def score(m):
    s = 3.2 * min(m['dens'], 9) + 12 * m['ind'] + 1.8 * m['acc'] + 28 * min(m['chrom'], .25) + 0.6 * max(0, m['span'] - 9) + 0.12 * m['rng']
    s += 1.5 * max(0, m['chord'] - 2) + 0.16 * min(m['bars'], 90) + (5 if m['short'] <= 0.25 else 2 if m['short'] <= 0.34 else 0) + 25 * m['tup']
    s += 4 * (any(n in (5, 7, 9, 12) or d == 8 and n % 3 == 0 and n > 3 for n, d in m['ts']) or len(m['ts']) > 1)
    s += 14 * m['big']
    return round(s, 1)


def run(only_pieces=True):
    c = json.load(open(os.path.join(ROOT, 'lessons.json'), encoding='utf-8'))
    out = []
    for L in c['lessons']:
        if not L.get('file') or (only_pieces and L['kind'] != 'piece'): continue
        m = metrics(os.path.join(ROOT, L['file']), L['bpm'])
        out.append((L, m, score(m)))
    return c, out


if __name__ == '__main__':
    c, rows = run()
    if '--levels' in sys.argv:
        for i, lv in enumerate(c['levels']):
            xs = [s for L, m, s in rows if L['level'] == i]
            if xs: print(f'{lv:14} n={len(xs):3} mean={sum(xs) / len(xs):5.1f} min={min(xs):5.1f} max={max(xs):5.1f}')
    else:
        for L, m, s in sorted(rows, key=lambda r: r[2]):
            print(f"{s:5.1f}  L{L['level']}  {L['id']:28} {L['title'][:44]:44} bars={m['bars']:3} dens={m['dens']:4.1f} ind={m['ind']:.2f} key={m['acc']} chr={m['chrom']:.2f} span={m['span']:2} chord={m['chord']} short={m['short']:.2f}")
