"""Turn a piano MIDI file (as written by LilyPond, e.g. from the Mutopia Project) into MusicXML for the app.

The notes and rhythms in such files are exact, so nothing is guessed except:
  - which staff a track belongs to (by its average pitch: right hand above, left hand below),
  - the spelling of black keys (from the key signature; raised 6th/7th in minor keys as sharps),
  - the opening pickup bar, which MIDI does not record (pass `pickup` in quarter notes).
"""
import struct
from math import gcd
from xml.sax.saxutils import escape


def read_midi(path):
    data = open(path, 'rb').read()
    assert data[:4] == b'MThd'
    fmt, ntr, tpq = struct.unpack('>HHH', data[8:14])
    pos, tracks = 14, []
    while pos < len(data) and len(tracks) < ntr:
        assert data[pos:pos + 4] == b'MTrk', 'bad track'
        length = struct.unpack('>I', data[pos + 4:pos + 8])[0]
        tracks.append(read_track(data[pos + 8:pos + 8 + length]))
        pos += 8 + length
    return tpq, tracks


def read_track(d):
    i, t, status, ev = 0, 0, 0, []

    def vlq():
        nonlocal i
        v = 0
        while True:
            b = d[i]; i += 1
            v = (v << 7) | (b & 0x7f)
            if b < 0x80:
                return v
    while i < len(d):
        t += vlq()
        b = d[i]
        if b == 0xff:
            typ, i = d[i + 1], i + 2
            n = vlq()
            ev.append((t, 'meta', typ, d[i:i + n])); i += n
        elif b in (0xf0, 0xf7):
            i += 1; n = vlq(); i += n
        else:
            if b & 0x80:
                status = b; i += 1
            kind = status & 0xf0
            if kind in (0xc0, 0xd0):
                a = d[i]; i += 1; ev.append((t, kind, a, 0))
            else:
                a, c = d[i], d[i + 1]; i += 2; ev.append((t, kind, a, c))
    return ev


def notes_of(track):
    on, out = {}, []
    for t, kind, a, c in track:
        if kind == 0x90 and c > 0:
            on.setdefault(a, []).append(t)
        elif kind == 0x80 or (kind == 0x90 and c == 0):
            if on.get(a):
                s = on[a].pop(0)
                if t > s:
                    out.append((s, t - s, a))
    return out


SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
ORDER_SHARPS, ORDER_FLATS = 'FCGDAEB', 'BEADGCF'


def speller(fifths, minor):
    """Name for each pitch class in this key: the scale notes, the raised 6th and 7th in minor, otherwise
    sharps in sharp keys and flats in flat keys."""
    acc = {}
    for k in range(abs(fifths)):
        acc[(ORDER_SHARPS if fifths > 0 else ORDER_FLATS)[k]] = '#' if fifths > 0 else 'b'
    names = {}
    for letter, pc in zip('CDEFGAB', (0, 2, 4, 5, 7, 9, 11)):
        a = acc.get(letter, '')
        names[(pc + (1 if a == '#' else -1 if a == 'b' else 0)) % 12] = letter + a
    if minor:
        tonic = (fifths * 7 + 9) % 12
        for natural in (8, 10):            # 6th and 7th degrees, raised by a semitone
            n = names[(tonic + natural) % 12]
            names.setdefault((tonic + natural + 1) % 12, n[:-1] if n.endswith('b') else n + '#')
    for pc in range(12):
        names.setdefault(pc, (FLAT if fifths < 0 else SHARP)[pc])
    return names


TYPES = [(4, 'whole', 0), (3, 'half', 1), (2, 'half', 0), (1.5, 'quarter', 1), (1, 'quarter', 0), (0.75, 'eighth', 1),
         (0.5, 'eighth', 0), (0.375, '16th', 1), (0.25, '16th', 0), (0.125, '32nd', 0)]


def split_value(q):                        # a length in quarters → note values that add up to it (largest first)
    out = []
    while q > 1e-9:
        for v, name, dot in TYPES:
            if v <= q + 1e-9:
                out.append((v, name, dot)); q -= v; break
        else:
            raise ValueError(f'cannot notate length {q}')
    return out


def convert(path, title, composer, pickup=0.0, max_bars=None, transpose=0, rights=''):
    tpq, tracks = read_midi(path)
    metas = [e for tr in tracks for e in tr if e[1] == 'meta']
    ts = next(((e[3][0], 2 ** e[3][1]) for e in sorted(metas) if e[2] == 0x58), (4, 4))
    ks = next(((struct.unpack('b', e[3][:1])[0], e[3][1]) for e in sorted(metas) if e[2] == 0x59), (0, 0))
    tempo = next((60000000 / int.from_bytes(e[3], 'big') for e in sorted(metas) if e[2] == 0x51), 100)
    note_tracks = [notes_of(tr) for tr in tracks]
    note_tracks = [n for n in note_tracks if n]
    avg = [sum(p for _, _, p in n) / len(n) for n in note_tracks]
    hi = max(avg)
    staff_of = [1 if a >= 60 or a == hi else 2 for a in avg]
    if 2 not in staff_of and len(note_tracks) > 1:
        staff_of[avg.index(min(avg))] = 2
    names = speller(ks[0], ks[1] == 1)
    q = lambda ticks: ticks / tpq          # ticks → quarters
    bar = ts[0] * 4 / ts[1]
    notes = {1: [], 2: []}
    GRID = 8                               # snap to 32nd notes; ornaments and grace notes (shorter) are left out
    moved, dropped = 0.0, 0
    for n, s in zip(note_tracks, staff_of):
        for t, d, p in n:
            st, en = round(q(t) * GRID) / GRID, round(q(t + d) * GRID) / GRID
            if en - st < 1 / GRID:
                dropped += 1; continue
            moved = max(moved, abs(st - q(t)), abs(en - q(t + d)))
            notes[s].append((st, en - st, p + transpose))
    end = max(t + d for s in notes for t, d, p in notes[s])
    if pickup == 'auto':                   # the opening pickup that makes the fewest notes cross a bar line
        def crossings(pu):
            return sum(1 for s in notes for t, d, p in notes[s]
                       if int(round((t - pu) / bar * 1e6)) // 1000000 != int(round((t + d - pu - 1e-6) / bar * 1e6)) // 1000000)
        cands = [k / 8 for k in range(int(bar * 8))]
        pickup = min(cands, key=lambda pu: (crossings(pu), pu))
    # bar boundaries (the first bar may be a short pickup)
    bounds = [0.0] + ([pickup] if pickup else [])
    while bounds[-1] < end - 1e-9:
        bounds.append(bounds[-1] + bar)
    nbars = len(bounds) - 1
    if max_bars:
        nbars = min(nbars, max_bars)
    # chords: same start and length within a staff; then voices so nothing overlaps within a voice
    voices = {}
    for s in (1, 2):
        chords = {}
        for t, d, p in sorted(notes[s]):
            chords.setdefault((round(t, 6), round(d, 6)), []).append(p)
        vs = []                            # each voice: list of (start, length, [pitches]), and when it is free again
        for (t, d), ps in sorted(chords.items()):
            for v in vs:
                if v['free'] <= t + 1e-9:
                    v['ev'].append((t, d, sorted(ps))); v['free'] = t + d; break
            else:
                vs.append({'free': t + d, 'ev': [(t, d, sorted(ps))]})
        voices[s] = [v['ev'] for v in vs[:2]]   # at most two voices per staff (more are folded into the second)
        for extra in vs[2:]:
            voices[s][-1] = sorted(voices[s][-1] + extra['ev'])
    DIV = 96                               # divisions per quarter: covers 32nds and dotted values
    xml_m = []
    for b in range(nbars):
        b0, b1 = bounds[b], bounds[b + 1]
        parts, length = [], round((b1 - b0) * DIV)
        first_voice = True
        for s in (1, 2):
            vlist = voices[s] or [[]]
            for vi, vv in enumerate(vlist):
                if not first_voice:
                    parts.append(f'<backup><duration>{length}</duration></backup>')
                first_voice = False
                voice_no = (1 if s == 1 else 5) + vi
                cur = b0
                evs = [(t, d, ps) for t, d, ps in vv if t < b1 - 1e-9 and t + d > b0 + 1e-9]
                if not evs and vi > 0:
                    parts.append(f'<forward><duration>{length}</duration><voice>{voice_no}</voice><staff>{s}</staff></forward>')
                    continue
                if not evs:
                    parts.append(f'<note><rest measure="yes"/><duration>{length}</duration><voice>{voice_no}</voice><staff>{s}</staff></note>')
                    continue
                for t, d, ps in evs:
                    st, en = max(t, b0), min(t + d, b1)
                    if st > cur + 1e-9:
                        parts += rest_xml(st - cur, voice_no, s, DIV)
                    tie_in, tie_out = t < b0 - 1e-9, t + d > b1 + 1e-9
                    pieces = split_value(round((en - st) * 96) / 96)
                    for k, (v, name, dot) in enumerate(pieces):
                        tin = tie_in or k > 0
                        tout = tie_out or k < len(pieces) - 1
                        for j, p in enumerate(ps):
                            parts.append(note_xml(p, names, v, name, dot, voice_no, s, j > 0, tin, tout, DIV))
                    cur = en
                if cur < b1 - 1e-9:
                    parts += rest_xml(b1 - cur, voice_no, s, DIV)
        attrs = ''
        if b == 0:
            attrs = (f'<attributes><divisions>{DIV}</divisions><key><fifths>{ks[0]}</fifths><mode>{"minor" if ks[1] else "major"}</mode></key>'
                     f'<time><beats>{ts[0]}</beats><beat-type>{ts[1]}</beat-type></time><staves>2</staves>'
                     '<clef number="1"><sign>G</sign><line>2</line></clef><clef number="2"><sign>F</sign><line>4</line></clef></attributes>'
                     f'<direction placement="above"><direction-type><metronome><beat-unit>quarter</beat-unit><per-minute>{round(tempo)}</per-minute>'
                     f'</metronome></direction-type><staff>1</staff><sound tempo="{round(tempo)}"/></direction>')
        num = 'number="0" implicit="yes"' if pickup and b == 0 else f'number="{b if pickup else b + 1}"'
        end_bar = '<barline location="right"><bar-style>light-heavy</bar-style></barline>' if b == nbars - 1 else ''
        xml_m.append(f'<measure {num}>{attrs}{"".join(parts)}{end_bar}</measure>')
    count = sum(len(ps) for s in (1, 2) for vv in voices[s] for _, _, ps in vv)
    xml = ('<?xml version="1.0" encoding="UTF-8"?>\n'
           '<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">\n'
           f'<score-partwise version="3.1"><work><work-title>{escape(title)}</work-title></work>'
           f'<identification><creator type="composer">{escape(composer)}</creator>{f"<rights>{escape(rights)}</rights>" if rights else ""}</identification>'
           '<part-list><score-part id="P1"><part-name>Piano</part-name></score-part></part-list>'
           f'<part id="P1">{"".join(xml_m)}</part></score-partwise>\n')
    return xml, {'pickup': pickup, 'bars': nbars, 'notes': count, 'tempo': round(tempo), 'time': ts, 'key': ks, 'tracks': len(note_tracks),
                 'moved': round(moved, 4), 'dropped': dropped}


def rest_xml(q, voice, staff, DIV):
    return [f'<note><rest/><duration>{round(v * DIV)}</duration><voice>{voice}</voice><type>{name}</type>{"<dot/>" if dot else ""}<staff>{staff}</staff></note>'
            for v, name, dot in split_value(round(q * 96) / 96)]


def note_xml(p, names, v, name, dot, voice, staff, chord, tie_in, tie_out, DIV):
    n = names[p % 12]
    octave = p // 12 - 1 - (1 if n == 'B#' else 0) + (1 if n == 'Cb' else 0)
    alter = {'#': 1, 'b': -1}.get(n[1:2], 0)
    ties = (('<tie type="stop"/>' if tie_in else '') + ('<tie type="start"/>' if tie_out else ''))
    tied = (('<tied type="stop"/>' if tie_in else '') + ('<tied type="start"/>' if tie_out else ''))
    return (f'<note>{"<chord/>" if chord else ""}<pitch><step>{n[0]}</step>{f"<alter>{alter}</alter>" if alter else ""}<octave>{octave}</octave></pitch>'
            f'<duration>{round(v * DIV)}</duration>{ties}<voice>{voice}</voice><type>{name}</type>{"<dot/>" if dot else ""}<staff>{staff}</staff>'
            f'{f"<notations>{tied}</notations>" if tied else ""}</note>')
