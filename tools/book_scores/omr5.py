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


def figure_xml(title, systems, page=None, time_default=(4, 4)):
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
            tsig = S['time'] or time or time_default
            target = tsig[0] * 4 / tsig[1]
            for mi, m in enumerate(ms):
                evs, poly = omr3.build_events(S, m, S['fifths'])
                voices = collections.defaultdict(list)
                for e in sorted(evs, key=lambda e: e['x']): voices[e['voice']].append(e)
                first = (si == 0 and mi == 0)
                last = (mi == len(ms) - 1)
                okm = True
                for v, ee in voices.items():
                    durs, ok = solve_voice(ee, target, first or last, True)
                    for e, dd in zip(ee, durs): e['dur'] = dd
                    okm = okm and ok
                ws = [l for l in labels if l['si'] == si and l['k'] == k and (m['a'] - 1 if mi else 0) <= l['x'] < m['b']]
                ly = [l for l in lyrics if l['si'] == si and l['k'] == k and (m['a'] - 1 if mi else 0) <= l['x'] < m['b']]
                v1 = voices.get(1) or (list(voices.values())[0] if voices else [])
                for l in ws:
                    if v1: min(v1, key=lambda e: abs(e['x'] - l['x'])).setdefault('words', []).append(l)
                for l in ly:
                    cand = [e for e in v1 if e['notes']]
                    if cand: min(cand, key=lambda e: abs(e['x'] - l['x']))['lyric'] = l
                parts[k].append(dict(voices=dict(voices), ok=okm, fifths=S['fifths'], tsig=tsig, clef=S['cname']))
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
                if vi > 0: out.append('<backup><duration>%d</duration></backup>' % sum(int(round(e['dur'] * DIV)) for e in pm['voices'][vlist[vi - 1]]))
                run = 0
                for e in ee:
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
