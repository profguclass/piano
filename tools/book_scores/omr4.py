"""omr4.py: figures -> MusicXML with bar-sum checks"""
import sys, re, math, collections, json, itertools
sys.path.insert(0, '.')
import numpy as np, fitz
import omr, omr2, omr3
from omr import Page, Z, CLEF
from omr2 import HEAD, REST, ACC, DUR, STEPS

DIV = 48          # divisions per quarter (handles triplets and 16ths)


def solve_voice(evs, target, allow_short, triplets):
    """choose durations (in quarter notes) for the events of one voice so the bar adds up"""
    base = [e['dur'] for e in evs]
    if any(b is None for b in base):                  # whole-bar rest
        return [target if b is None else b for b in base], True
    tot = sum(base)
    if abs(tot - target) < 1e-6 or (allow_short and tot < target):
        return base, True
    opts = []
    for b in base:
        o = {b}
        for f in (0.5, 2.0):
            o.add(b * f)
        for dot in (1.5, 1 / 1.5):
            o.add(b * dot)
        if triplets:
            o.add(b * 2 / 3); o.add(b / 3 * 2)
        o = sorted(x for x in o if 0.0625 <= x <= 4.5)
        opts.append(o)
    U = 12
    tgt = int(round(target * U))
    dp = {0: (0, [])}
    for b, o in zip(base, opts):
        nd = {}
        for sm, (cost, path) in dp.items():
            for x in o:
                u = int(round(x * U))
                if u <= 0 or sm + u > tgt: continue
                c = cost + (0 if abs(x - b) < 1e-6 else 1)
                if sm + u not in nd or c < nd[sm + u][0]: nd[sm + u] = (c, path + [x])
        dp = nd
        if not dp: return base, False
    if tgt in dp: return dp[tgt][1], True
    return base, False


def figure_of(page, S_list):
    caps = []
    for t in page.texts:
        m = re.match(r'(Figure|Table) (\d+\.\d+\.\d+)', t['t'])
        if m: caps.append((t['y'], m.group(1) + ' ' + m.group(2), t['t']))
    return sorted(caps)


def group_systems(S_list):
    """consecutive staves whose bar lines coincide form a system"""
    systems = []
    for S in S_list:
        bx = [b for b in S['bars']]
        if systems:
            prev = systems[-1][-1]
            pb = prev['bars']
            common = len([b for b in bx if any(abs(b - c) < 0.8 for c in pb)])
            near = (S['st']['top'] - prev['st']['bottom']) < 14 * S['sp']
            if near and common >= max(1, min(len(bx), len(pb)) * 0.6):
                systems[-1].append(S); continue
        systems.append([S])
    return systems


def xml_escape(s): return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def note_xml(n, dur_div, voice, chord, staff_i, tie=None, typ=None):
    step, alter, octv = n
    x = '<note>' + ('<chord/>' if chord else '')
    x += '<pitch><step>%s</step>' % step + ('<alter>%d</alter>' % alter if alter else '') + '<octave>%d</octave></pitch>' % octv
    x += '<duration>%d</duration><voice>%d</voice>' % (dur_div, voice)
    if typ: x += '<type>%s</type>' % typ
    return x + '</note>'


TYPES = [(4.0, 'whole'), (2.0, 'half'), (1.0, 'quarter'), (0.5, 'eighth'), (0.25, '16th'), (0.125, '32nd')]


def type_of(d):
    for v, t in TYPES:
        if abs(d - v) < 1e-6: return t, 0
        if abs(d - v * 1.5) < 1e-6: return t, 1
        if abs(d - v * 1.75) < 1e-6: return t, 2
    return None, 0


def figure_xml(title, systems, time_default=(4, 4)):
    """systems: list of lists of staff dicts (read_page output). Returns (xml, report)"""
    nstaff = max(len(s) for s in systems)
    parts = [[] for _ in range(nstaff)]
    report = dict(measures=0, ok=0, bad=0, notes=0)
    time = None
    fifths0 = None
    for si, sysm in enumerate(systems):
        for k, S in enumerate(sysm):
            if S['time']: time = S['time']
        for k in range(nstaff):
            if k >= len(sysm): continue
            S = sysm[k]
            ms = omr3.measures_of(S)
            tsig = S['time'] or time or time_default
            target = tsig[0] * 4 / tsig[1]
            for mi, m in enumerate(ms):
                evs, poly = omr3.build_events(S, m, S['fifths'])
                voices = collections.defaultdict(list)
                for e in sorted(evs, key=lambda e: e['x']): voices[e['voice']].append(e)
                first = (si == 0 and mi == 0)
                last = (mi == len(ms) - 1)
                trip = any(g['c'] == '3' and g['size'] < 14 for g in m['chords'][0:0])
                res = {}
                okm = True
                for v, ee in voices.items():
                    durs, ok = solve_voice(ee, target, first or last, True)
                    for e, dd in zip(ee, durs): e['dur'] = dd
                    okm = okm and ok
                parts[k].append(dict(S=S, m=m, voices=dict(voices), ok=okm, target=target, first=(si == 0 and mi == 0), fifths=S['fifths'], tsig=tsig, sysfirst=(mi == 0), clef=S['cname']))
                report['measures'] += 1
                report['ok' if okm else 'bad'] += 1
                report['notes'] += len(evs)
    # write
    out = ['<?xml version="1.0" encoding="UTF-8"?>\n<score-partwise version="3.1"><work><work-title>%s</work-title></work><part-list>' % xml_escape(title)]
    for k in range(nstaff): out.append('<score-part id="P%d"><part-name>%s</part-name></score-part>' % (k + 1, 'Staff %d' % (k + 1)))
    out.append('</part-list>')
    for k in range(nstaff):
        out.append('<part id="P%d">' % (k + 1))
        prev_key = prev_time = prev_clef = None
        for i, pm in enumerate(parts[k]):
            out.append('<measure number="%d">' % (i + 1))
            attrs = ''
            if i == 0 or pm['fifths'] != prev_key or pm['tsig'] != prev_time or pm['clef'] != prev_clef:
                attrs = '<attributes><divisions>%d</divisions>' % DIV
                if i == 0 or pm['fifths'] != prev_key: attrs += '<key><fifths>%d</fifths></key>' % pm['fifths']
                if i == 0 or pm['tsig'] != prev_time: attrs += '<time><beats>%d</beats><beat-type>%d</beat-type></time>' % pm['tsig']
                if i == 0 or pm['clef'] != prev_clef:
                    attrs += '<clef><sign>%s</sign><line>%d</line></clef>' % (('G', 2) if pm['clef'] == 'treble' else ('F', 4))
                attrs += '</attributes>'
            prev_key, prev_time, prev_clef = pm['fifths'], pm['tsig'], pm['clef']
            out.append(attrs)
            vlist = sorted(pm['voices'])
            for vi, v in enumerate(vlist):
                ee = pm['voices'][v]
                if vi > 0:
                    total = sum(int(round(e['dur'] * DIV)) for e in pm['voices'][vlist[vi - 1]])
                    out.append('<backup><duration>%d</duration></backup>' % total)
                for e in ee:
                    dd = int(round(e['dur'] * DIV))
                    if e['notes']:
                        for j, n in enumerate(e['notes']):
                            out.append(note_xml(n, dd, v, j > 0, k))
                    else:
                        out.append('<note><rest/><duration>%d</duration><voice>%d</voice></note>' % (dd, v))
            out.append('</measure>')
        out.append('</part>')
    out.append('</score-partwise>')
    return ''.join(out), report
