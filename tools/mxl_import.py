"""Read a MusicXML file (.mxl or .musicxml) written by notation software and make it fit the course:
a plain two-staff piano score with a proper title, composer and licence note.

- Scores with more than two staves (some exports keep empty staves) are reduced to the two that hold notes.
- Titles, credits and page layout from the original are replaced; fingering, ties, slurs and dynamics are kept.
"""
import re, zipfile
import xml.etree.ElementTree as ET


def read_root(path):
    if path.lower().endswith('.mxl'):
        z = zipfile.ZipFile(path)
        inner = re.search(r'full-path="([^"]+)"', z.read('META-INF/container.xml').decode('utf-8'))[1]
        return ET.fromstring(z.read(inner))
    return ET.parse(path).getroot()


def reduce_staves(root):
    """Keep two staves (treble, bass) when the score has more; the music moves to staves 1 and 2."""
    declared = max([int(s.text) for s in root.iter('staves')] + [1])
    used = sorted({int(n.findtext('staff') or 1) for n in root.iter('note') if n.find('pitch') is not None})
    if declared <= 2:
        return
    keep = used[:2]
    new = {old: i + 1 for i, old in enumerate(keep)}
    for part in root.findall('part'):
        for m in part.findall('measure'):
            t, items = 0, []                     # absolute start of every note, following <backup> and <forward>
            for el in list(m):
                if el.tag == 'note':
                    d = int(el.findtext('duration') or 0)
                    chord = el.find('chord') is not None
                    start = items[-1][1] if chord and items else t
                    items.append((el, start, d))
                    if not chord: t += d
                elif el.tag == 'backup': t -= int(el.findtext('duration'))
                elif el.tag == 'forward': t += int(el.findtext('duration'))
            other = [el for el in m if el.tag not in ('note', 'backup', 'forward')]
            for el in list(m): m.remove(el)
            for el in other:
                st = el.find('staff')
                if el.tag == 'direction' and st is not None:
                    if int(st.text) not in new: continue
                    st.text = str(new[int(st.text)])
                if el.tag == 'attributes':
                    for c in el.findall('clef'):
                        n = int(c.get('number', 1))
                        if n in new: c.set('number', str(new[n]))
                        else: el.remove(c)
                    for s in el.findall('staves'): s.text = '2'
                m.append(el)
            groups = {}
            for el, start, d in items:
                s = int(el.findtext('staff') or 1)
                if s in new: groups.setdefault((new[s], el.findtext('voice') or '1'), []).append((el, start, d))
            end = None
            for (s, v), g in sorted(groups.items()):
                if end is not None:
                    b = ET.SubElement(m, 'backup'); ET.SubElement(b, 'duration').text = str(end)
                t = 0
                for el, start, d in g:
                    chord = el.find('chord') is not None
                    if not chord and start > t:
                        f = ET.SubElement(m, 'forward'); ET.SubElement(f, 'duration').text = str(start - t); t = start
                    st = el.find('staff')
                    if st is not None: st.text = str(s)
                    m.append(el)
                    if not chord: t = start + d
                end = t


M = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}


def _midi(n):
    p = n.find('pitch')
    return (int(p.findtext('octave')) + 1) * 12 + M[p.findtext('step')] + int(p.findtext('alter') or 0)


def voices_to_staves(root):
    """A single staff that holds both hands as voice 1 (right) and voice 2 (left) becomes a piano grand staff;
    each bar gets the clef that suits its notes."""
    if any(int(s.text) > 1 for s in root.iter('staves')): return
    voices = {n.findtext('voice') for n in root.iter('note') if n.find('pitch') is not None}
    if not {'1', '2'} <= voices: return
    last = {1: None, 2: None}
    for part in root.findall('part'):
        for m in part.findall('measure'):
            low = {1: [], 2: []}
            for n in m.findall('note'):
                v = int(n.findtext('voice') or 1)
                if v not in (1, 2): v = 2
                if n.find('pitch') is not None: low[v].append(_midi(n))
                st = n.find('staff')
                if st is None:
                    st = ET.Element('staff')
                    idx = max([i for i, c in enumerate(n) if c.tag in ('voice', 'type', 'dot', 'accidental', 'time-modification', 'stem', 'notehead')] + [0])
                    n.insert(idx + 1, st)
                st.text = str(v)
            attrs = m.find('attributes')
            clefs = {v: ('G' if low[v] and min(low[v]) >= 60 else 'F') if low[v] else last[v] or 'F' for v in (1, 2)}
            changed = [v for v in (1, 2) if clefs[v] != last[v]]
            if changed:
                if attrs is None:
                    attrs = ET.Element('attributes'); m.insert(next((i for i, c in enumerate(m) if c.tag in ('note', 'backup', 'forward')), len(m)), attrs)
                for c in attrs.findall('clef'): attrs.remove(c)
                if last[1] is None:
                    ET.SubElement(attrs, 'staves').text = '2'
                for v in changed:
                    c = ET.SubElement(attrs, 'clef', {'number': str(v)})
                    ET.SubElement(c, 'sign').text = clefs[v]; ET.SubElement(c, 'line').text = '2' if clefs[v] == 'G' else '4'
                last.update(clefs)


BEATS = [4, 3, 2, 1.5, 1, 0.75, 0.5, 0.375, 0.25, 0.125]            # note values in quarter notes (dotted ones included)
TYPES = {4: ('whole', 0), 3: ('half', 1), 2: ('half', 0), 1.5: ('quarter', 1), 1: ('quarter', 0), 0.75: ('eighth', 1), 0.5: ('eighth', 0),
         0.375: ('16th', 1), 0.25: ('16th', 0), 0.125: ('32nd', 0)}


def rest_notes(dur, div, staff, voice):
    """Rests that add up to `dur` divisions, as <note> elements."""
    out, left = [], dur
    for b in BEATS:
        d = b * div
        while d == int(d) and d > 0 and left >= d:
            n = ET.Element('note'); ET.SubElement(n, 'rest')
            ET.SubElement(n, 'duration').text = str(int(d)); ET.SubElement(n, 'voice').text = str(voice)
            t, dots = TYPES[b]; ET.SubElement(n, 'type').text = t
            for _ in range(dots): ET.SubElement(n, 'dot')
            ET.SubElement(n, 'staff').text = str(staff)
            out.append(n); left -= int(d)
    if left > 0:                                                    # a remainder no note value can show
        n = ET.Element('note'); ET.SubElement(n, 'rest'); ET.SubElement(n, 'duration').text = str(left)
        ET.SubElement(n, 'voice').text = str(voice); ET.SubElement(n, 'staff').text = str(staff); out.append(n)
    return out


def _timeline(m):
    """Every <note> of a measure with its start and length in divisions (following <backup>/<forward>), the bar's length and where the bar's last element ends."""
    t, items, end = 0, [], 0
    for el in list(m):
        if el.tag == 'note':
            d = int(el.findtext('duration') or 0); chord = el.find('chord') is not None
            start = items[-1][1] if chord and items else t
            items.append((el, start, d))
            if not chord: t += d
            end = max(end, start + d)
        elif el.tag == 'backup': t -= int(el.findtext('duration'))
        elif el.tag == 'forward': t += int(el.findtext('duration')); end = max(end, t)
    return items, end, t


def _clean(n):
    for tag in ('beam', 'stem'):
        for e in n.findall(tag): n.remove(e)


def _set(n, staff, voice):
    for tag, v in (('voice', voice), ('staff', staff)):
        e = n.find(tag)
        if e is None:
            e = ET.Element(tag)
            idx = max([i for i, c in enumerate(n) if c.tag in ('duration', 'voice', 'type', 'dot', 'accidental', 'time-modification', 'stem', 'notehead')] + [0])
            n.insert(idx + 1, e)
        e.text = str(v)


def _grand_staff_attributes(root):
    first = True
    for part in root.findall('part'):
        for m in part.findall('measure'):
            a = m.find('attributes')
            if first:
                if a is None:
                    a = ET.Element('attributes'); m.insert(0, a)
                for c in a.findall('clef') + a.findall('staves'): a.remove(c)
                ET.SubElement(a, 'staves').text = '2'
                for num, sign, line in ((1, 'G', 2), (2, 'F', 4)):
                    c = ET.SubElement(a, 'clef', {'number': str(num)}); ET.SubElement(c, 'sign').text = sign; ET.SubElement(c, 'line').text = str(line)
                first = False
            elif a is not None:
                for c in a.findall('clef'): a.remove(c)


def melody_to_grand(root):
    """One staff holding a single line (a chant, a melody): the music stays on the treble or the bass staff, by its clef, and the other staff rests."""
    if any(int(s.text) > 1 for s in root.iter('staves')): return
    clef = root.find('.//attributes/clef/sign'); bass = clef is not None and clef.text == 'F'
    mine, other = (2, 1) if bass else (1, 2)
    div = 1
    for part in root.findall('part'):
        for m in part.findall('measure'):
            a = m.find('attributes')
            if a is not None and a.find('divisions') is not None: div = int(a.findtext('divisions'))
            items, end, tend = _timeline(m)
            for el, start, d in items: _set(el, mine, 1)
            b = ET.SubElement(m, 'backup'); ET.SubElement(b, 'duration').text = str(tend)
            for r in rest_notes(end, div, other, 5): m.append(r)
    _grand_staff_attributes(root)


def split_by_pitch(root, split=60):
    """One staff with chord stacks (melody and harmony together): the notes from middle C up go to the right hand, the lower ones to the left."""
    if any(int(s.text) > 1 for s in root.iter('staves')): return
    div = 1
    for part in root.findall('part'):
        for m in part.findall('measure'):
            a = m.find('attributes')
            if a is not None and a.find('divisions') is not None: div = int(a.findtext('divisions'))
            items, end, _ = _timeline(m)
            other = [el for el in m if el.tag not in ('note', 'backup', 'forward')]
            for el in list(m): m.remove(el)
            for el in other: m.append(el)
            stacks, cur = [], {}                                    # [voice, start, length, notes] in score order
            for el, start, d in items:
                v = el.findtext('voice') or '1'
                if el.find('chord') is None:
                    cur[v] = [v, start, d, [el]]; stacks.append(cur[v])
                else: cur[v][3].append(el)
            parts = {(1, '1'): [], (2, '5'): [], (2, '6'): []}
            for v, start, d, notes in stacks:
                pit = [n for n in notes if n.find('pitch') is not None]
                if not pit: continue
                if v != '1': parts[(2, '6')].append([start, d, pit]); continue
                hi = [n for n in pit if _midi(n) >= split]; lo = [n for n in pit if _midi(n) < split]
                if hi: parts[(1, '1')].append([start, d, hi])
                if lo: parts[(2, '5')].append([start, d, lo])
            first = True
            for (staff, voice), sts in parts.items():
                if not sts and voice == '6': continue
                if not first:
                    b = ET.SubElement(m, 'backup'); ET.SubElement(b, 'duration').text = str(end)
                first = False
                t = 0
                for start, d, notes in sorted(sts, key=lambda x: x[0]):
                    if start > t:
                        for r in rest_notes(start - t, div, staff, voice): m.append(r)
                    for i, n in enumerate(sorted(notes, key=_midi)):
                        _clean(n)
                        for c in n.findall('chord'): n.remove(c)
                        _set(n, staff, voice)
                        if i: n.insert(0, ET.Element('chord'))
                        m.append(n)
                    t = max(t, start + d)
                if t < end:
                    for r in rest_notes(end - t, div, staff, voice): m.append(r)
    _grand_staff_attributes(root)


def tidy(root, title, composer, rights):
    for tag in ('credit', 'defaults', 'movement-title', 'movement-number'):
        for el in root.findall(tag): root.remove(el)
    work = root.find('work')
    if work is None:
        work = ET.Element('work'); root.insert(0, work)
    wt = work.find('work-title')
    if wt is None: wt = ET.SubElement(work, 'work-title')
    wt.text = title
    ident = root.find('identification')
    if ident is None:
        ident = ET.Element('identification'); root.insert(list(root).index(work) + 1, ident)
    for c in ident.findall('creator'): ident.remove(c)
    cr = ET.Element('creator', {'type': 'composer'}); cr.text = composer
    ident.insert(0, cr)
    for r in ident.findall('rights'): ident.remove(r)
    ri = ET.Element('rights'); ri.text = rights
    ident.insert(1, ri)


def convert_mxl(path, title, composer, rights, mode='auto'):
    """mode: 'auto' (extra empty staves or two voices on one staff are fixed), 'melody' (a single line gets an empty second staff),
    'pitch' (one staff of chord stacks is split between the hands at middle C)."""
    root = read_root(path)
    if mode == 'melody': melody_to_grand(root)
    elif mode == 'pitch': split_by_pitch(root)
    else:
        reduce_staves(root)
        voices_to_staves(root)
    tidy(root, title, composer, rights)
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + ET.tostring(root, encoding='unicode') + '\n'
