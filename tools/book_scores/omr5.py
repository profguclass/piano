"""omr5.py: figure -> MusicXML with lyrics, labels, ties and triplets"""
import sys, re, collections
sys.path.insert(0, '.')
import omr, omr2, omr3
from omr4 import solve_voice, group_systems, DIV

TYPES = [(4.0, 'whole'), (2.0, 'half'), (1.0, 'quarter'), (0.5, 'eighth'), (0.25, '16th'), (0.125, '32nd')]


def xml_escape(s): return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def type_of(d):
    for v, t in TYPES:
        if abs(d - v) < 1e-6: return t, 0, False
        if abs(d - v * 1.5) < 1e-6: return t, 1, False
        if abs(d - v * 1.75) < 1e-6: return t, 2, False
        if abs(d * 1.5 - v) < 1e-6: return t, 0, True
    return None, 0, False


def note_xml(n, dur, voice, chord, trip=None):
    step, alter, octv = n[0], n[1], n[2]
    ts, te = (n[3], n[4]) if len(n) > 4 else (False, False)
    typ, dots, tr = type_of(dur)
    x = '<note>' + ('<chord/>' if chord else '')
    x += '<pitch><step>%s</step>' % step + ('<alter>%d</alter>' % alter if alter else '') + '<octave>%d</octave></pitch>' % octv
    x += '<duration>%d</duration>' % int(round(dur * DIV))
    if te: x += '<tie type="stop"/>'
    if ts: x += '<tie type="start"/>'
    x += '<voice>%d</voice>' % voice
    if typ: x += '<type>%s</type>' % typ + '<dot/>' * dots
    if tr: x += '<time-modification><actual-notes>3</actual-notes><normal-notes>2</normal-notes></time-modification>'
    nt = ''
    if te: nt += '<tied type="stop"/>'
    if ts: nt += '<tied type="start"/>'
    if trip == 'start': nt += '<tuplet type="start" bracket="no"/>'
    if trip == 'stop': nt += '<tuplet type="stop"/>'
    if nt: x += '<notations>' + nt + '</notations>'
    return x + '</note>'


def rest_xml(dur, voice):
    typ, dots, tr = type_of(dur)
    x = '<note><rest/><duration>%d</duration><voice>%d</voice>' % (int(round(dur * DIV)), voice)
    if typ: x += '<type>%s</type>' % typ + '<dot/>' * dots
    if tr: x += '<time-modification><actual-notes>3</actual-notes><normal-notes>2</normal-notes></time-modification>'
    return x + '</note>'


def words_xml(text, place):
    return '<direction placement="%s"><direction-type><words font-size="9">%s</words></direction-type></direction>' % (place, xml_escape(text))


def lyric_xml(text, syl):
    return '<lyric><syllabic>%s</syllabic><text>%s</text></lyric>' % (syl, xml_escape(text))


def label_tokens(page):
    rows = []
    for c in sorted(page.tchars, key=lambda c: c['y']):
        for r in rows:
            if abs(r['y'] - c['y']) < 4.5:
                r['cs'].append(c); break
        else:
            rows.append(dict(y=c['y'], cs=[c]))
    toks = []
    for r in rows:
        cs = sorted(r['cs'], key=lambda c: c['x'])
        cur = []; txt = []; last = None
        def flush():
            t = ''.join(txt).strip()
            if cur and t and t not in ('(', ')', '(   )'): toks.append((cur[0]['x'], r['y'], t))
        for c in cs:
            ch = c['c']
            if c['f'].startswith('MaestroTimes'):
                if ch == '\xaf': ch = '♭'
                elif ch in ('≤', ''): continue
                elif ch == '#': ch = '♯'
            if c['f'].startswith('FinaleNumerics'): ch = 'ø' if ch == 'J' else ''
            thr = 4.5 if (last is not None and last.get('m') in ('♭', '♯')) else 0.62 * max(c['size'], 6) + 3.5
            split = ch == ' ' or (last is not None and c['x'] - last['x'] > thr and ch not in ('♭', '♯'))
            if split:
                flush(); cur = []; txt = []
                if ch == ' ':
                    last = c; continue
            if not cur: cur = [c]
            c['m'] = ch
            txt.append(ch); last = c
        flush()
    return toks


def collect_labels(page, systems):
    toks = label_tokens(page)
    out = []
    for si, sysm in enumerate(systems):
        top = sysm[0]['st']['top']; sp = sysm[0]['sp']; bot = sysm[-1]['st']['bottom']
        for x, y, t in toks:
            if top - 8 * sp < y < top + 0.3 * sp: out.append(dict(si=si, k=0, x=x, text=t, place='above'))
            elif bot + 0.5 * sp < y < bot + 7.5 * sp: out.append(dict(si=si, k=len(sysm) - 1, x=x, text=t, place='below'))
    return out


def collect_lyrics(page, systems):
    out = []
    words = sorted(page.lyrics, key=lambda l: (round(l['y']), l['x']))
    for si, sysm in enumerate(systems):
        for k, S in enumerate(sysm):
            bot = S['st']['bottom']; sp = S['sp']
            nxt = sysm[k + 1]['st']['top'] if k + 1 < len(sysm) else bot + 14 * sp
            row = sorted([w for w in words if bot + 0.8 * sp < w['y'] < min(bot + 7 * sp, nxt) and w['t'].strip()], key=lambda w: w['x'])
            for i, w in enumerate(row):
                t = w['t'].strip()
                if t in ('-', '–', '_', '—'): continue
                nextw = row[i + 1]['t'].strip() if i + 1 < len(row) else ''
                prevw = row[i - 1]['t'].strip() if i > 0 else ''
                hn = nextw in ('-', '–'); hp = prevw in ('-', '–')
                syl = 'middle' if hp and hn else 'begin' if hn else 'end' if hp else 'single'
                out.append(dict(si=si, k=k, x=w['x'], text=t, syl=syl))
    return out



def seg_measure(S, a, b):
    ch = [c for c in S['chords'] if a <= c['x'] + 0.1 < b]
    rs = [r for r in S['rests'] if a <= r['x'] + 0.1 < b]
    accs = [x for x in S['accs'] if a <= x['x'] < b]
    return dict(a=a, b=b, chords=ch, rests=rs, accs=accs)


def seg_ok(S, m, target, allow_short):
    if not m['chords'] and not m['rests']: return True
    evs, poly = omr3.build_events(S, m, S['fifths'])
    voices = collections.defaultdict(list)
    for e in sorted(evs, key=lambda e: e['x']): voices[e['voice']].append(e)
    order = sorted(voices, key=lambda v: -sum(e['dur'] or 0 for e in voices[v]))
    for i, v in enumerate(order):
        ee = [dict(e) for e in voices[v]]
        durs, ok = solve_voice(ee, target, allow_short if i == 0 else True, True)
        if not ok: return False
        if i and sum(durs) > target + 1e-6: return False
    return True


def repartition(S, target, ms):
    """choose among all candidate bar lines the subset that makes every measure add up (false bar lines come from boxes, stems and brackets)"""
    st = S['st']; sp = S['sp']
    cands = sorted(set(round(b, 1) for b in S['bars'] if S['firstx'] + 2 * sp < b < st['x1'] - 3))
    if len(cands) < 2: return None
    start = S['firstx'] - 2; end = st['x1'] + 1
    edges = [start] + cands + [end]
    n = len(edges)
    INF = 10 ** 9
    best = [INF] * n; prev = [None] * n; best[0] = 0
    memo = {}
    def ok(i, j):
        if (i, j) in memo: return memo[(i, j)]
        m = seg_measure(S, edges[i], edges[j])
        r = seg_ok(S, m, target, i == 0 or j == n - 1)
        memo[(i, j)] = r; return r
    for j in range(1, n):
        for i in range(j):
            if best[i] >= INF: continue
            if edges[j] - edges[i] < 2.5 * sp: continue
            if ok(i, j) and best[i] + 1 < best[j] + 0:  # prefer more, smaller steps only when equal feasibility
                pass
            if ok(i, j):
                c = best[i] + (0 if j - i == 1 else 0.001 * (j - i))
                if c < best[j]: best[j] = c; prev[j] = i
    if best[n - 1] >= INF: return None
    cuts = []; j = n - 1
    while j is not None and j > 0:
        cuts.append(j); j = prev[j]
    cuts = sorted(cuts); idx = [0] + cuts
    out = []
    for i, j in zip(idx, idx[1:]):
        m = seg_measure(S, edges[i], edges[j])
        if m['chords'] or m['rests']: out.append(m)
    return out


def search_voices(evs, target, sp, allow_short, maxv=3, flex=False):
    """assign events to up to maxv voices (and, with flex, nudge durations) so that every voice adds up to the bar"""
    evs = sorted(evs, key=lambda e: (e['x'], -(max([n[2] * 7 + 'CDEFGAB'.index(n[0]) for n in e['notes']] or [0]))))
    n = len(evs)
    if n > (12 if flex else 16) or n < 2: return None
    best = [None]; nodes = [0]
    sums = [0.0] * maxv; lastx = [[] for _ in range(maxv)]
    assign = [0] * n; chosen = [0.0] * n
    def opts(e):
        d = e['dur'] if e['dur'] is not None else target
        if not flex: return [d]
        o = [d, d * 1.5, d * 0.5, d * 2, d / 1.5]
        return [x for x in dict.fromkeys(o) if 0.125 <= x <= target]
    def rec(i, used, cost):
        if best[0] is not None and best[0][2] <= cost: return
        nodes[0] += 1
        if nodes[0] > 300000: return
        if i == n:
            for v in range(used):
                if abs(sums[v] - target) > 1e-6 and not (allow_short and v == 0 and sums[v] < target): return
            best[0] = (list(assign), list(chosen), cost); return
        e = evs[i]
        for v in range(min(used + 1, maxv)):
            if any(abs(e['x'] - x) < 1.2 * sp for x in lastx[v]): continue
            for d in opts(e):
                if sums[v] + d > target + 1e-6: continue
                base = e['dur'] if e['dur'] is not None else target
                c = cost + (0 if abs(d - base) < 1e-6 else 1)
                sums[v] += d; lastx[v].append(e['x']); assign[i] = v; chosen[i] = d
                rec(i + 1, max(used, v + 1), c)
                sums[v] -= d; lastx[v].pop()
    rec(0, 0, 0)
    if best[0] is None: return None
    return [(e, v + 1, d) for e, v, d in zip(evs, best[0][0], best[0][1])]


def listing(evs):
    return sorted(evs, key=lambda e: (e['x'], -(max([n[2] * 7 + 'CDEFGAB'.index(n[0]) for n in e['notes']] or [0]))))


def figure_xml(title, systems, page=None, time_default=(4, 4), overrides=None):
    nstaff = max(len(s) for s in systems)
    parts = [[] for _ in range(nstaff)]
    report = dict(measures=0, ok=0, bad=0, notes=0)
    labels = collect_labels(page, systems) if page else []
    lyrics = collect_lyrics(page, systems) if page else []
    time = None
    for si, sysm in enumerate(systems):
        for S in sysm:
            if S['time']: time = S['time']
        for k in range(nstaff):
            if k >= len(sysm): continue
            S = sysm[k]
            ms = omr3.measures_of(S)
            _t = S['time'] or time
            if _t:
                _target = _t[0] * 4 / _t[1]
                _bad = [mi for mi, m in enumerate(ms) if not seg_ok(S, m, _target, mi == 0 or mi == len(ms) - 1)]
                if _bad:
                    alt = repartition(S, _target, ms)
                    if alt is not None: ms = alt
            unmetered = not (S['time'] or time)
            tsig = S['time'] or time or time_default
            target = tsig[0] * 4 / tsig[1]
            for mi, m in enumerate(ms):
                evs, poly = omr3.build_events(S, m, S['fifths'])
                voices = collections.defaultdict(list)
                for e in sorted(evs, key=lambda e: e['x']): voices[e['voice']].append(e)
                first = (si == 0 and mi == 0)
                last = (mi == len(ms) - 1)
                okm = True
                _ov = (overrides or {}).get((si, k, mi))
                if _ov:
                    _L = listing(evs)
                    voices = collections.defaultdict(list)
                    for _v, _items in _ov.items():
                        _pos = 0.0
                        for _it in _items:
                            if _it[0] == 'r':
                                _e = dict(x=_pos, voice=_v, dur=_it[1], notes=[], rest='q', stem=None)
                            else:
                                _e = dict(_L[_it[0]]); _e['voice'] = _v; _e['dur'] = _it[1]
                            _e['start'] = _pos; _pos += _e['dur']; voices[_v].append(_e)
                    parts_ov = True
                else: parts_ov = False
                if not _ov and not unmetered and not poly and len(voices) == 1:
                    _only = list(voices.values())[0]
                    _d, _ok = solve_voice([dict(e) for e in _only], target, first or last, True)
                    if not _ok:
                        _r = search_voices(list(_only), target, S['sp'], first or last) or search_voices(list(_only), target, S['sp'], first or last, flex=True)
                        if _r and len(set(v for _, v, _ in _r)) > 1:
                            poly = True
                            voices = collections.defaultdict(list)
                            for _e, _v, _dd in _r: _e['voice'] = _v; _e['dur'] = _dd; voices[_v].append(_e)
                            for _v in voices: voices[_v].sort(key=lambda e: e['x'])
                if not _ov and not unmetered and poly:
                    _o = sorted(voices, key=lambda v: -sum(e['dur'] or 0 for e in voices[v]))
                    _bad = False
                    for _i, _v in enumerate(_o):
                        _d, _ok = solve_voice([dict(e) for e in voices[_v]], target, (first or last) if _i == 0 else True, True)
                        if not _ok or (_i and sum(_d) > target + 1e-6): _bad = True
                    if _bad:
                        _r = search_voices([e for ee in voices.values() for e in ee], target, S['sp'], first or last) or search_voices([e for ee in voices.values() for e in ee], target, S['sp'], first or last, flex=True)
                        if _r:
                            voices = collections.defaultdict(list)
                            for _e, _v, _d in _r: _e['voice'] = _v; _e['dur'] = _d; voices[_v].append(_e)
                            for _v in voices: voices[_v].sort(key=lambda e: e['x'])
                order = sorted(voices, key=lambda v: -sum(e['dur'] or 0 for e in voices[v]))
                master = order[0] if (order and not _ov) else None
                for v in ([] if _ov else order):
                    ee = voices[v]
                    base_ = [e['dur'] for e in ee]
                    ismaster = (v == master)
                    durs, ok = solve_voice(ee, target, (first or last) if ismaster else True, True)
                    if not ok and not unmetered: report.setdefault('fails', []).append(dict(staff=k, m=mi, v=v, target=target, sum=round(sum(b for b in base_ if b), 3), poly=poly, ev=[(round(e['x']), b, e['stem'], len(e['notes']), e.get('rest')) for e, b in zip(ee, base_)]))
                    for e, dd in zip(ee, durs): e['dur'] = dd
                    okm = okm and ok
                # start times: the master voice sets the clock, the others are placed by their x position
                if master is not None:
                    tm = []; cur = 0.0
                    for e in sorted(voices[master], key=lambda e: e['x']):
                        e['start'] = cur; tm.append((e['x'], cur, e['dur'])); cur += e['dur']
                    for v in order[1:]:
                        pos = 0.0
                        for e in sorted(voices[v], key=lambda e: e['x']):
                            st_ = None
                            for i2, (x2, t2, d2) in enumerate(tm):
                                nx = tm[i2 + 1][0] if i2 + 1 < len(tm) else x2 + 40
                                if x2 - 2 <= e['x'] < nx - 2:
                                    st_ = t2 + (0 if abs(e['x'] - x2) < 3 else (e['x'] - x2) / max(nx - x2, 1) * d2)
                                    break
                            if st_ is None: st_ = pos
                            st_ = round(st_ * 4) / 4
                            if st_ < pos - 1e-6: st_ = pos; okm = okm and unmetered
                            e['start'] = st_; pos = st_ + e['dur']
                        if pos > target + 1e-6 and not unmetered: okm = False
                ws = [l for l in labels if l['si'] == si and l['k'] == k and (m['a'] - 1 if mi else 0) <= l['x'] < m['b']]
                ly = [l for l in lyrics if l['si'] == si and l['k'] == k and (m['a'] - 1 if mi else 0) <= l['x'] < m['b']]
                v1 = voices.get(1) or (list(voices.values())[0] if voices else [])
                for l in ws:
                    if v1: min(v1, key=lambda e: abs(e['x'] - l['x'])).setdefault('words', []).append(l)
                for l in ly:
                    cand = [e for e in v1 if e['notes']]
                    if cand: min(cand, key=lambda e: abs(e['x'] - l['x']))['lyric'] = l
                msig = tsig
                if unmetered:
                    okm = True
                    ln = max([sum(e['dur'] for e in ee if e['dur'] is not None) for ee in voices.values()] or [target])
                    n8 = max(1, int(round(ln * 2)))
                    msig = (n8, 8)
                if not okm:
                    report.setdefault('badlist', []).append(dict(key=(si, k, mi), target=target, clef=S['cname'], ev=[(i, round(e['x']), ' '.join('%s%s%d' % (n[0], {1: '#', -1: 'b', 0: '', 2: 'x'}.get(n[1], ''), n[2]) for n in e['notes']) or 'rest', e['stem'], e['dur'], e.get('rest')) for i, e in enumerate(listing(evs))]))
                parts[k].append(dict(voices=dict(voices), ok=okm, fifths=S['fifths'], tsig=msig, clef=S['cname']))
                report['measures'] += 1
                report['ok' if okm else 'bad'] += 1
                report['notes'] += len(evs)
    out = ['<?xml version="1.0" encoding="UTF-8"?>\n<score-partwise version="3.1"><work><work-title>%s</work-title></work><part-list>' % xml_escape(title)]
    for k in range(nstaff): out.append('<score-part id="P%d"><part-name>Staff %d</part-name></score-part>' % (k + 1, k + 1))
    out.append('</part-list>')
    for k in range(nstaff):
        out.append('<part id="P%d">' % (k + 1))
        pk = pt = pc = None
        for i, pm in enumerate(parts[k]):
            out.append('<measure number="%d">' % (i + 1))
            if i == 0 or pm['fifths'] != pk or pm['tsig'] != pt or pm['clef'] != pc:
                a_ = '<attributes><divisions>%d</divisions>' % DIV
                if i == 0 or pm['fifths'] != pk: a_ += '<key><fifths>%d</fifths></key>' % pm['fifths']
                if i == 0 or pm['tsig'] != pt: a_ += '<time><beats>%d</beats><beat-type>%d</beat-type></time>' % pm['tsig']
                if i == 0 or pm['clef'] != pc: a_ += '<clef><sign>%s</sign><line>%d</line></clef>' % (('G', 2) if pm['clef'] == 'treble' else ('F', 4))
                out.append(a_ + '</attributes>')
            pk, pt, pc = pm['fifths'], pm['tsig'], pm['clef']
            vlist = sorted(pm['voices'])
            for vi, v in enumerate(vlist):
                ee = pm['voices'][v]
                if vi > 0:
                    pe = pm['voices'][vlist[vi - 1]]
                    out.append('<backup><duration>%d</duration></backup>' % int(round((pe[-1].get('start', 0) + pe[-1]['dur']) * DIV)) if pe else '')
                run = 0
                pos = 0.0
                for e in ee:
                    gap = e.get('start', pos) - pos
                    if gap > 1e-6:
                        out.append('<note print-object="no"><rest/><duration>%d</duration><voice>%d</voice></note>' % (int(round(gap * DIV)), v))
                        pos += gap
                    pos += e['dur']
                    for w in e.get('words', []): out.append(words_xml(w['text'], w['place']))
                    d_ = e['dur']
                    trip = None
                    if type_of(d_)[2]:
                        run += 1
                        trip = 'start' if run % 3 == 1 else 'stop' if run % 3 == 0 else None
                    else: run = 0
                    if e['notes']:
                        for j, n in enumerate(e['notes']):
                            xml = note_xml(n, d_, v, j > 0, trip if j == 0 else None)
                            if j == 0 and e.get('lyric'): xml = xml.replace('</note>', lyric_xml(e['lyric']['text'], e['lyric']['syl']) + '</note>')
                            out.append(xml)
                    else:
                        out.append(rest_xml(d_, v))
            out.append('</measure>')
        out.append('</part>')
    out.append('</score-partwise>')
    return ''.join(out), report
