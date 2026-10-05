"""Build the lesson scores (lessons/*.musicxml) and the course list (lessons/lessons.json).

Run:  python tools/make_lessons.py

Notes are written as tokens:  <pitch><duration>[.][:finger]
  pitch     C4, F#4, Bb3 ... or r for a rest; a chord joins pitches with +  (C4+E4+G4)
  duration  w whole, h half, q quarter, e eighth, s sixteenth; a trailing . adds a dot
  finger    1-5, one per chord note joined with +  (C4+E4+G4h:1+3+5)
  a trailing ! makes the note staccato  (C4q:1!)
Bars are separated by |.  An empty hand gets whole-bar rests.
A bar may start with [k=N] to change the key signature to N sharps (negative = flats).
With pickup=True the first bar is a shorter opening (anacrusis) bar.
"""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from midi_to_musicxml import convert
from repertoire import REPERTOIRE
from xml.sax.saxutils import escape

DIV = 4                                   # divisions per quarter note
DUR = {'w': 16, 'h': 8, 'q': 4, 'e': 2, 's': 1}
TYPE = {'w': 'whole', 'h': 'half', 'q': 'quarter', 'e': 'eighth', 's': '16th'}
TOKEN = re.compile(r'^(?P<p>r|[A-G][#b]?\d(?:\+[A-G][#b]?\d)*)(?P<d>[whqes])(?P<dot>\.)?(?::(?P<f>[1-5](?:\+[1-5])*))?(?P<st>!)?$')
KEYMARK = re.compile(r'^\s*\[k=(-?\d)\]\s*')


def notes_xml(bar, staff, voice, length):
    out, total = [], 0
    if not bar.strip():
        return [f'<note><rest measure="yes"/><duration>{length}</duration><voice>{voice}</voice><staff>{staff}</staff></note>'], length
    for tok in bar.split():
        m = TOKEN.match(tok)
        assert m, f'bad token {tok!r}'
        d = DUR[m['d']] + (DUR[m['d']] // 2 if m['dot'] else 0)
        total += d
        dot = '<dot/>' if m['dot'] else ''
        if m['p'] == 'r':
            out.append(f'<note><rest/><duration>{d}</duration><voice>{voice}</voice><type>{TYPE[m["d"]]}</type>{dot}<staff>{staff}</staff></note>')
            continue
        pitches = m['p'].split('+')
        fingers = m['f'].split('+') if m['f'] else [None] * len(pitches)
        assert len(fingers) == len(pitches), f'fingers do not match notes in {tok!r}'
        for k, (p, f) in enumerate(zip(pitches, fingers)):
            step, acc, octave = p[0], p[1:-1], p[-1]
            alter = {'#': '<alter>1</alter>', 'b': '<alter>-1</alter>'}.get(acc, '')
            place = 'above' if staff == 1 else 'below'
            tech = f'<technical><fingering placement="{place}">{f}</fingering></technical>' if f else ''
            stac = '<articulations><staccato/></articulations>' if m['st'] and k == 0 else ''
            tech = f'<notations>{tech}{stac}</notations>' if tech or stac else ''
            chord = '<chord/>' if k else ''
            out.append(f'<note>{chord}<pitch><step>{step}</step>{alter}<octave>{octave}</octave></pitch><duration>{d}</duration>'
                       f'<voice>{voice}</voice><type>{TYPE[m["d"]]}</type>{dot}<staff>{staff}</staff>{tech}</note>')
    return out, total


def score(title, rh, lh, bpm, time=(4, 4), fifths=0, composer='Traditional', pickup=False):
    rbars, lbars = [b.strip() for b in rh.split('|')], [b.strip() for b in lh.split('|')]
    n = max(len(rbars), len(lbars))
    rbars += [''] * (n - len(rbars)); lbars += [''] * (n - len(lbars))
    full = time[0] * 4 * DIV // time[1]                  # one bar, in divisions
    measures = []
    for i, (r, l) in enumerate(zip(rbars, lbars)):
        key = None                                        # [k=N] at the start of a bar changes the key
        for which, bar in (('r', r), ('l', l)):
            km = KEYMARK.match(bar)
            if km:
                key = int(km[1])
                if which == 'r': r = bar[km.end():]
                else: l = bar[km.end():]
        length = full
        if pickup and i == 0:                             # the opening bar is only as long as its notes
            length = notes_xml(r, 1, 1, 0)[1]
        rx, rt = notes_xml(r, 1, 1, length)
        lx, lt = notes_xml(l, 2, 5, length)
        assert rt == length, f'{title}: bar {i + 1} right hand has {rt} of {length} sixteenths'
        assert lt == length, f'{title}: bar {i + 1} left hand has {lt} of {length} sixteenths'
        attrs = ''
        if i == 0:
            attrs = (f'<attributes><divisions>{DIV}</divisions><key><fifths>{key if key is not None else fifths}</fifths></key>'
                     f'<time><beats>{time[0]}</beats><beat-type>{time[1]}</beat-type></time><staves>2</staves>'
                     '<clef number="1"><sign>G</sign><line>2</line></clef><clef number="2"><sign>F</sign><line>4</line></clef></attributes>'
                     f'<direction placement="above"><direction-type><metronome><beat-unit>quarter</beat-unit><per-minute>{bpm}</per-minute>'
                     f'</metronome></direction-type><staff>1</staff><sound tempo="{bpm}"/></direction>')
        if key is not None and i > 0:
            attrs = f'<attributes><key><fifths>{key}</fifths></key></attributes>'
        end = '<barline location="right"><bar-style>light-heavy</bar-style></barline>' if i == n - 1 else ''
        num = f'number="0" implicit="yes"' if pickup and i == 0 else f'number="{i if pickup else i + 1}"'
        measures.append(f'<measure {num}>{attrs}{"".join(rx)}<backup><duration>{length}</duration></backup>{"".join(lx)}{end}</measure>')
    return ('<?xml version="1.0" encoding="UTF-8"?>\n'
            '<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">\n'
            f'<score-partwise version="3.1"><work><work-title>{escape(title)}</work-title></work>'
            f'<identification><creator type="composer">{escape(composer)}</creator></identification>'
            '<part-list><score-part id="P1"><part-name>Piano</part-name></score-part></part-list>'
            f'<part id="P1">{"".join(measures)}</part></score-partwise>\n')


def up8(notes, fingers):                  # a run of eighth notes as tokens
    return ' '.join(f'{n}e:{f}' for n, f in zip(notes.split(), fingers.split()))


C_UP, C_DN = 'C4 D4 E4 F4 G4 A4 B4 C5', 'C5 B4 A4 G4 F4 E4 D4 C4'
RH_UP, RH_DN = '1 2 3 1 2 3 4 5', '5 4 3 2 1 3 2 1'
LC_UP, LC_DN = 'C3 D3 E3 F3 G3 A3 B3 C4', 'C4 B3 A3 G3 F3 E3 D3 C3'
LH_UP, LH_DN = '5 4 3 2 1 3 2 1', '1 2 3 1 2 3 4 5'
ODE_RH = ('E4q:3 E4q:3 F4q:4 G4q:5 | G4q:5 F4q:4 E4q:3 D4q:2 | C4q:1 C4q:1 D4q:2 E4q:3 | E4q.:3 D4e:2 D4h:2 | '
          'E4q:3 E4q:3 F4q:4 G4q:5 | G4q:5 F4q:4 E4q:3 D4q:2 | C4q:1 C4q:1 D4q:2 E4q:3 | D4q.:2 C4e:1 C4h:1')
PRELUDE = [('C4', 'E4', 'G4', 'C5', 'E5', '1 3 5'), ('C4', 'D4', 'A4', 'D5', 'F5', '1 3 5'), ('B3', 'D4', 'G4', 'D5', 'F5', '1 4 5'),
           ('C4', 'E4', 'G4', 'C5', 'E5', '1 3 5'), ('C4', 'E4', 'A4', 'E5', 'A5', '1 3 5'), ('C4', 'D4', 'F#4', 'A4', 'D5', '1 2 4'),
           ('B3', 'D4', 'G4', 'D5', 'G5', '1 3 5'), ('B3', 'C4', 'E4', 'G4', 'C5', '1 2 5'), ('A3', 'C4', 'E4', 'G4', 'C5', '1 2 5'),
           ('D3', 'A3', 'D4', 'F#4', 'C5', '1 2 5'), ('G3', 'B3', 'D4', 'G4', 'B4', '1 3 5')]


def prelude_bar(n1, n2, a, b, c, f):      # Bach's pattern: two low notes, then the upper three twice, every half bar
    f = f.split()
    gap = (midi(n2) - midi(n1))
    f2 = 4 if gap <= 2 else 3 if gap <= 4 else 2
    lh = f'{n1}s:5 {n2}s:{f2} rq.'
    rh = f'rs rs {a}s:{f[0]} {b}s:{f[1]} {c}s:{f[2]} {a}s:{f[0]} {b}s:{f[1]} {c}s:{f[2]}'
    return f'{rh} {rh}', f'{lh} {lh}'


def midi(n):
    return (int(n[-1]) + 1) * 12 + 'C D EF G A B'.index(n[0]) + n[1:-1].count('#') - n[1:-1].count('b')


MINUET_A = ('D5q:5 G4e:1 A4e:2 B4e:3 C5e:4 | D5q:5 G4q:1 G4q:1 | E5q:3 C5e:1 D5e:2 E5e:3 F#5e:4 | G5q:5 G4q:1 G4q:1 | '
            'C5q:4 D5e:5 C5e:4 B4e:3 A4e:2 | B4q:3 C5e:4 B4e:3 A4e:2 G4e:1 | ')

C_ARP, G_ARP = up8('C3 G3 E3 G3 C3 G3 E3 G3', '5 1 3 1 5 1 3 1'), up8('B2 G3 D3 G3 B2 G3 D3 G3', '5 1 3 1 5 1 3 1')


LESSONS = [
    dict(id='middle-c', level=0, title='Middle C and friends', hands='right', bpm=80, wait=60,
         learn='Find middle C (the C nearest the middle of the keyboard, just left of the two black keys) and play C, D and E with fingers 1, 2 and 3 of your right hand.',
         tips=['Thumb = 1, pointer = 2, middle = 3, ring = 4, little finger = 5.', 'Curve your fingers as if holding a ball; play with the fingertips.', 'Keep your thumb resting on middle C between notes.'],
         rh='C4q:1 D4q:2 E4q:3 D4q:2 | C4h:1 E4h:3 | E4q:3 D4q:2 C4q:1 D4q:2 | E4w:3 | C4q:1 C4q:1 D4q:2 D4q:2 | E4q:3 E4q:3 D4h:2 | E4q:3 D4q:2 C4q:1 D4q:2 | C4w:1',
         lh=''),
    dict(id='five-fingers', level=0, title='Five-finger position', hands='right', bpm=80, wait=60,
         learn='Put one finger on each key from C to G. This "C position" lets you play five notes without moving your hand.',
         tips=['Each finger stays over its own key: C=1, D=2, E=3, F=4, G=5.', 'Let the 4th and 5th fingers play as clearly as the others; go slowly.'],
         rh='C4q:1 D4q:2 E4q:3 F4q:4 | G4q:5 F4q:4 E4q:3 D4q:2 | C4q:1 E4q:3 G4h:5 | G4q:5 E4q:3 C4h:1 | C4q:1 D4q:2 E4q:3 F4q:4 | G4q:5 G4q:5 G4h:5 | G4q:5 F4q:4 E4q:3 D4q:2 | C4w:1',
         lh=''),
    dict(id='mary', level=0, title='Mary Had a Little Lamb', hands='right', bpm=90, wait=70,
         learn='Your first song, all in C position. Notice the half notes (2 beats) and the whole note at the end (4 beats).',
         tips=['Count "1 2 3 4" in every bar.', 'Hold half and whole notes for their full length.'],
         rh='E4q:3 D4q:2 C4q:1 D4q:2 | E4q:3 E4q:3 E4h:3 | D4q:2 D4q:2 D4h:2 | E4q:3 G4q:5 G4h:5 | E4q:3 D4q:2 C4q:1 D4q:2 | E4q:3 E4q:3 E4q:3 E4q:3 | D4q:2 D4q:2 E4q:3 D4q:2 | C4w:1',
         lh=''),
    dict(id='left-five', level=1, title='Left hand five fingers', hands='left', bpm=80, wait=60,
         learn='The left hand uses the same numbers, but its thumb is on the right. In C position below middle C: C=5, D=4, E=3, F=2, G=1.',
         tips=['Read the bass clef: the line between the two dots is F.', 'Your left thumb sits on the G just below middle C.'],
         rh='',
         lh='C3q:5 D3q:4 E3q:3 F3q:2 | G3q:1 F3q:2 E3q:3 D3q:4 | C3q:5 E3q:3 G3h:1 | G3q:1 E3q:3 C3h:5 | C3q:5 D3q:4 E3q:3 F3q:2 | G3q:1 G3q:1 G3h:1 | G3q:1 F3q:2 E3q:3 D3q:4 | C3w:5'),
    dict(id='hot-cross-buns', level=1, title='Hot Cross Buns', hands='left', bpm=90, wait=70,
         learn='A left-hand song that introduces eighth notes: two of them fit in one beat.',
         tips=['Say "1-and 2-and" for the eighth notes.', 'Keep the eighth notes even, like a ticking clock.'],
         rh='',
         lh=('E3q:3 D3q:4 C3h:5 | E3q:3 D3q:4 C3h:5 | ' + up8('C3 C3 C3 C3 D3 D3 D3 D3', '5 5 5 5 4 4 4 4') + ' | E3q:3 D3q:4 C3h:5 | '
             'E3q:3 D3q:4 C3h:5 | E3q:3 D3q:4 C3h:5 | ' + up8('C3 C3 C3 C3 D3 D3 D3 D3', '5 5 5 5 4 4 4 4') + ' | E3q:3 D3q:4 C3h:5')),
    dict(id='au-clair', level=1, title='Au clair de la lune', hands='right', bpm=90, wait=70,
         learn='A French folk song with quarter, half and whole notes. Feel the long notes without rushing.',
         tips=['Hold the half notes for two full beats.', 'Try Play along to feel the steady beat.'],
         rh='C4q:1 C4q:1 C4q:1 D4q:2 | E4h:3 D4h:2 | C4q:1 E4q:3 D4q:2 D4q:2 | C4w:1 | C4q:1 C4q:1 C4q:1 D4q:2 | E4h:3 D4h:2 | C4q:1 E4q:3 D4q:2 D4q:2 | C4w:1',
         lh=''),
    dict(id='ode-together', level=2, title='Ode to Joy, hands together', hands='both', bpm=100, wait=60, composer='Ludwig van Beethoven',
         learn='Play the melody with the right hand while the left hand holds long notes. Start with one hand at a time (choose Right or Left), then Both.',
         tips=['Practise each hand alone first.', 'The left hand only changes at the start of each bar.', 'The dotted quarter is 1½ beats: "1 2-and".'],
         rh=ODE_RH,
         lh='C3w:1 | G2w:5 | C3w:1 | G2w:5 | C3w:1 | G2w:5 | C3w:1 | G2h:5 C3h:1'),
    dict(id='twinkle', level=2, title='Twinkle Twinkle Little Star', hands='both', bpm=90, wait=60,
         learn='The melody goes beyond five notes, so the right hand shifts: after the first C, finger 4 takes G and 5 takes A.',
         tips=['Watch the finger numbers where the hand moves.', 'The left hand plays C, F and G; keep it in place with the thumb on C.'],
         rh=('C4q:1 C4q:1 G4q:4 G4q:4 | A4q:5 A4q:5 G4h:4 | F4q:4 F4q:4 E4q:3 E4q:3 | D4q:2 D4q:2 C4h:1 | '
             'G4q:5 G4q:5 F4q:4 F4q:4 | E4q:3 E4q:3 D4h:2 | G4q:5 G4q:5 F4q:4 F4q:4 | E4q:3 E4q:3 D4h:2 | '
             'C4q:1 C4q:1 G4q:4 G4q:4 | A4q:5 A4q:5 G4h:4 | F4q:4 F4q:4 E4q:3 E4q:3 | D4q:2 D4q:2 C4h:1'),
         lh=('C3w:1 | F2h:5 C3h:1 | F2h:5 C3h:1 | G2h:4 C3h:1 | C3h:1 F2h:5 | C3h:1 G2h:4 | C3h:1 F2h:5 | C3h:1 G2h:4 | '
             'C3w:1 | F2h:5 C3h:1 | F2h:5 C3h:1 | G2h:4 C3h:1')),
    dict(id='saints', level=2, title='When the Saints Go Marching In', hands='both', bpm=100, wait=60,
         learn='Each phrase starts after a rest. Feel the rest on beat 1, then come in on beat 2.',
         tips=['Count the rest out loud: "(1) 2 3 4".', 'The left hand holds whole notes: C, then G or F where the harmony changes.'],
         rh=('rq C4q:1 E4q:3 F4q:4 | G4w:5 | rq C4q:1 E4q:3 F4q:4 | G4w:5 | rq C4q:1 E4q:3 F4q:4 | G4h:5 E4h:3 | C4h:1 E4h:3 | D4w:2 | '
             'rq E4q:3 E4q:3 D4q:2 | C4h.:1 C4q:1 | E4h:3 G4h:5 | G4q:5 F4h.:4 | rq C4q:1 E4q:3 F4q:4 | G4h:5 E4h:3 | C4h:1 D4h:2 | C4w:1'),
         lh='C3w:1 | C3w:1 | C3w:1 | C3w:1 | C3w:1 | C3w:1 | C3w:1 | G2w:4 | C3w:1 | C3w:1 | C3w:1 | F2w:5 | C3w:1 | C3w:1 | G2w:4 | C3w:1'),
    dict(id='c-scale-rh', level=3, title='C major scale, right hand', hands='right', bpm=80, wait=50,
         learn='Play eight notes in a row by passing the thumb under: after E (finger 3), the thumb plays F. Coming down, finger 3 crosses over the thumb onto E.',
         tips=['Move the thumb under early, while finger 3 plays.', 'Keep the wrist level; do not twist it.', 'Then try the eighth notes in bars 5-6.'],
         rh=('C4q:1 D4q:2 E4q:3 F4q:1 | G4q:2 A4q:3 B4q:4 C5q:5 | C5q:5 B4q:4 A4q:3 G4q:2 | F4q:1 E4q:3 D4q:2 C4q:1 | '
             + up8(C_UP, RH_UP) + ' | ' + up8(C_DN, RH_DN) + ' | C4q:1 E4q:3 G4h:5 | C4w:1'),
         lh=''),
    dict(id='c-scale-lh', level=3, title='C major scale, left hand', hands='left', bpm=80, wait=50,
         learn='For the left hand the crossing happens going up: after G (thumb), finger 3 crosses over onto A. Coming down, the thumb passes under after A.',
         tips=['Fingering up: 5 4 3 2 1, 3 2 1.', 'Fingering down: 1 2 3, 1 2 3 4 5.'],
         rh='',
         lh=('C3q:5 D3q:4 E3q:3 F3q:2 | G3q:1 A3q:3 B3q:2 C4q:1 | C4q:1 B3q:2 A3q:3 G3q:1 | F3q:2 E3q:3 D3q:4 C3q:5 | '
             + up8(LC_UP, LH_UP) + ' | ' + up8(LC_DN, LH_DN) + ' | C3q:5 E3q:3 G3h:1 | C3w:5')),
    dict(id='g-scale', level=3, title='G major scale: your first sharp', hands='right', bpm=80, wait=50,
         learn='The key signature has one sharp (F♯), so every F is played on the black key just right of F. The fingering is the same as the C scale.',
         tips=['Finger 4 plays F♯.', 'Look at the key signature at the start of every new piece.'],
         fifths=1,
         rh=('G4q:1 A4q:2 B4q:3 C5q:1 | D5q:2 E5q:3 F#5q:4 G5q:5 | G5q:5 F#5q:4 E5q:3 D5q:2 | C5q:1 B4q:3 A4q:2 G4q:1 | '
             + up8('G4 A4 B4 C5 D5 E5 F#5 G5', RH_UP) + ' | ' + up8('G5 F#5 E5 D5 C5 B4 A4 G4', RH_DN) + ' | G4q:1 B4q:3 D5h:5 | G4w:1'),
         lh=''),
    dict(id='scale-together', level=3, title='C scale, hands together', hands='both', bpm=72, wait=40,
         learn='Both hands play the C scale together, an octave apart. The thumbs cross at different moments, which is the real challenge.',
         tips=['Practise slowly with Wait for me.', 'Right thumb crosses on F; left finger 3 crosses on A going up.'],
         rh=('C4q:1 D4q:2 E4q:3 F4q:1 | G4q:2 A4q:3 B4q:4 C5q:5 | C5q:5 B4q:4 A4q:3 G4q:2 | F4q:1 E4q:3 D4q:2 C4q:1 | '
             + up8(C_UP, RH_UP) + ' | ' + up8(C_DN, RH_DN) + ' | C4q:1 E4q:3 G4h:5 | C4w:1'),
         lh=('C3q:5 D3q:4 E3q:3 F3q:2 | G3q:1 A3q:3 B3q:2 C4q:1 | C4q:1 B3q:2 A3q:3 G3q:1 | F3q:2 E3q:3 D3q:4 C3q:5 | '
             + up8(LC_UP, LH_UP) + ' | ' + up8(LC_DN, LH_DN) + ' | C3q:5 E3q:3 G3h:1 | C3w:5')),
    dict(id='three-chords', level=4, title='Three chords: C, F and G', hands='both', bpm=70, wait=50,
         learn='Most simple songs use three chords. Keep the right thumb on C: C chord = C E G (1 3 5), F chord = C F A (1 4 5), G chord = B D G (1 2 5).',
         tips=['Press all chord notes at exactly the same time.', 'Move as few fingers as possible between chords.', 'The left hand plays the chord name: C, F or G.'],
         rh=('C4+E4+G4h:1+3+5 C4+E4+G4h:1+3+5 | C4+F4+A4h:1+4+5 C4+F4+A4h:1+4+5 | C4+E4+G4h:1+3+5 C4+E4+G4h:1+3+5 | B3+D4+G4h:1+2+5 B3+D4+G4h:1+2+5 | '
             'C4+E4+G4q:1+3+5 C4+E4+G4q:1+3+5 C4+E4+G4q:1+3+5 C4+E4+G4q:1+3+5 | C4+F4+A4q:1+4+5 C4+F4+A4q:1+4+5 C4+F4+A4q:1+4+5 C4+F4+A4q:1+4+5 | '
             'B3+D4+G4q:1+2+5 B3+D4+G4q:1+2+5 B3+D4+G4q:1+2+5 B3+D4+G4q:1+2+5 | C4+E4+G4w:1+3+5'),
         lh='C3w:1 | F2w:5 | C3w:1 | G2w:4 | C3w:1 | F2w:5 | G2w:4 | C3w:1'),
    dict(id='broken-chords', level=4, title='Ode to Joy with broken chords', hands='both', bpm=72, wait=40, composer='Ludwig van Beethoven',
         learn='The left hand now plays its chord one note at a time (a broken chord), which makes the music flow. This kind of pattern is used in lots of classical pieces.',
         tips=['Learn the left-hand pattern alone first: 5 1 3 1.', 'Keep the left hand quieter than the melody.'],
         rh=ODE_RH,
         lh=' | '.join([C_ARP, G_ARP, C_ARP, G_ARP, C_ARP, G_ARP, C_ARP, up8('B2 G3 D3 G3', '5 1 3 1') + ' C3h:5'])),
    dict(id='contrary', level=4, title='Contrary motion scale', hands='both', bpm=72, wait=40,
         learn='The hands move in opposite directions, mirroring each other. Both use the same fingers at the same time, which makes it easier than the parallel scale.',
         tips=['Both thumbs cross under at the same moment.', 'Listen for the hands to sound exactly together.'],
         rh=('C4q:1 D4q:2 E4q:3 F4q:1 | G4q:2 A4q:3 B4q:4 C5q:5 | C5q:5 B4q:4 A4q:3 G4q:2 | F4q:1 E4q:3 D4q:2 C4q:1 | '
             + up8(C_UP, RH_UP) + ' | ' + up8(C_DN, RH_DN) + ' | C4+E4+G4w:1+3+5'),
         lh=('C3q:1 B2q:2 A2q:3 G2q:1 | F2q:2 E2q:3 D2q:4 C2q:5 | C2q:5 D2q:4 E2q:3 F2q:2 | G2q:1 A2q:3 B2q:2 C3q:1 | '
             + up8('C3 B2 A2 G2 F2 E2 D2 C2', RH_UP) + ' | ' + up8('C2 D2 E2 F2 G2 A2 B2 C3', RH_DN) + ' | C2+G2+C3w:5+2+1')),
    dict(id='progression', level=4, title='Chord progression study', hands='both', bpm=80, wait=50, composer='Piano Reader',
         learn='The famous I–V–vi–IV progression (C, G, A minor, F) with flowing right-hand arpeggios. Hundreds of pop songs use these four chords.',
         tips=['Each right-hand bar uses one chord shape: 1 2 3 5, back down.', 'Say the chord names as you play: C, G, A minor, F.'],
         rh=' | '.join([up8('C4 E4 G4 C5 G4 E4 C4 E4', '1 2 3 5 3 2 1 2'), up8('B3 D4 G4 B4 G4 D4 B3 D4', '1 2 4 5 4 2 1 2'),
                        up8('A3 C4 E4 A4 E4 C4 A3 C4', '1 2 3 5 3 2 1 2'), up8('A3 C4 F4 A4 F4 C4 A3 C4', '1 2 4 5 4 2 1 2')] * 2
                       + ['C4+E4+G4+C5w:1+2+3+5']),
         lh='C3w:1 | G2w:4 | A2w:3 | F2w:5 | C3w:1 | G2w:4 | A2w:3 | F2w:5 | C3w:1'),
    # ---------- Level 6: popular songs (traditional / public domain) ----------
    dict(id='row-your-boat', level=5, title='Row, Row, Row Your Boat', hands='both', bpm=96, wait=60, time=(6, 8),
         learn='A round in 6/8 time: each bar has two big beats, each split into three. The "merrily" bar uses a stretched hand from C to the C above.',
         tips=['Count "1-2-3 4-5-6" with the stress on 1 and 4.', 'In bar 5 the hand opens to an octave: C (5), G (3), E (2), C (1).'],
         rh=('C4q.:1 C4q.:1 | C4q:1 D4e:2 E4q.:3 | E4q:3 D4e:2 E4q:3 F4e:4 | G4h.:5 | '
             'C5e:5 C5e:5 C5e:5 G4e:3 G4e:3 G4e:3 | E4e:2 E4e:2 E4e:2 C4e:1 C4e:1 C4e:1 | G4q:5 F4e:4 E4q:3 D4e:2 | C4h.:1'),
         lh='C3h.:1 | C3h.:1 | C3h.:1 | C3h.:1 | C3h.:1 | C3h.:1 | G2h.:4 | C3h.:1'),
    dict(id='london-bridge', level=5, title='London Bridge', hands='both', bpm=100, wait=70,
         learn='The melody uses six notes, so the right hand sits one key higher than C position: thumb on D, little finger on A.',
         tips=['The dotted quarter and eighth sound "long-short".', 'At the end the thumb moves down from D to C.'],
         rh=('G4q.:4 A4e:5 G4q:4 F4q:3 | E4q:2 F4q:3 G4h:4 | D4q:1 E4q:2 F4h:3 | E4q:2 F4q:3 G4h:4 | '
             'G4q.:4 A4e:5 G4q:4 F4q:3 | E4q:2 F4q:3 G4h:4 | D4h:1 G4h:4 | E4q:2 C4h.:1'),
         lh='C3w:1 | C3w:1 | G2w:4 | C3w:1 | C3w:1 | C3w:1 | G2w:4 | C3w:1'),
    dict(id='jingle-bells', level=5, title='Jingle Bells', hands='both', bpm=110, wait=70, composer='James Lord Pierpont',
         learn='The famous chorus, all in C position. Repeated notes need a light, bouncy touch.',
         tips=['Keep finger 3 on E for the opening "jingle bells".', 'The left hand changes to F in bar 5 and G in bars 7–8.'],
         rh=('E4q:3 E4q:3 E4h:3 | E4q:3 E4q:3 E4h:3 | E4q:3 G4q:5 C4q.:1 D4e:2 | E4w:3 | '
             'F4q:4 F4q:4 F4q.:4 F4e:4 | F4q:4 E4q:3 E4q:3 E4e:3 E4e:3 | E4q:3 D4q:2 D4q:2 E4q:3 | D4h:2 G4h:5 | '
             'E4q:3 E4q:3 E4h:3 | E4q:3 E4q:3 E4h:3 | E4q:3 G4q:5 C4q.:1 D4e:2 | E4w:3 | '
             'F4q:4 F4q:4 F4q:4 F4q:4 | F4q:4 E4q:3 E4q:3 E4e:3 E4e:3 | G4q:5 G4q:5 F4q:4 D4q:2 | C4w:1'),
         lh='C3w:1 | C3w:1 | C3w:1 | C3w:1 | F2w:5 | C3w:1 | G2w:4 | G2w:4 | C3w:1 | C3w:1 | C3w:1 | C3w:1 | F2w:5 | C3w:1 | G2w:4 | C3w:1'),
    dict(id='happy-birthday', level=5, title='Happy Birthday', hands='both', bpm=100, wait=60, time=(3, 4), fifths=-1, pickup=True,
         composer='Mildred and Patty Hill',
         learn='In 3/4 time with a pickup: the song starts before the first full bar. It is in F major, so every B is played as B♭.',
         tips=['Count "3 | 1 2 3": the two short opening notes come on beat 3.', 'In bar 5 the hand leaps up to the high C with finger 5.'],
         rh=('C4e:1 C4e:1 | D4q:2 C4q:1 F4q:4 | E4h:3 C4e:1 C4e:1 | D4q:2 C4q:1 G4q:5 | F4h:4 C4e:1 C4e:1 | '
             'C5q:5 A4q:4 F4q:3 | E4q:2 D4q:1 Bb4e:5 Bb4e:5 | A4q:4 F4q:2 G4q:3 | F4h.:2'),
         lh='rq | F2h.:5 | C3h.:1 | C3h.:1 | F2h.:5 | F2h.:5 | Bb2h.:2 | C3h.:1 | F2h.:5'),
    dict(id='silent-night', level=5, title='Silent Night', hands='both', bpm=90, wait=60, time=(6, 8), composer='Franz Xaver Gruber',
         learn='A gentle carol in 6/8 that moves around the keyboard. Look ahead to the finger number at each new phrase: the hand moves to a new position.',
         tips=['Play smoothly, joining the notes (legato).', 'The left hand plays just C, F and G.'],
         rh=('G4q.:2 A4e:3 G4q:2 | E4h.:1 | G4q.:2 A4e:3 G4q:2 | E4h.:1 | D5h:5 D5q:5 | B4h.:3 | C5h:4 C5q:4 | G4h.:1 | '
             'A4h:3 A4q:3 | C5q.:5 B4e:4 A4q:3 | G4q.:2 A4e:3 G4q:2 | E4h.:1 | A4h:3 A4q:3 | C5q.:5 B4e:4 A4q:3 | G4q.:2 A4e:3 G4q:2 | E4h.:1 | '
             'D5h:3 D5q:3 | F5q.:5 D5e:3 B4q:1 | C5h.:2 | E5h.:4 | C5q.:2 G4e:1 E4q:3 | G4q.:5 F4e:4 D4q:2 | C4h.:1'),
         lh=('C3h.:1 | C3h.:1 | C3h.:1 | C3h.:1 | G2h.:4 | G2h.:4 | C3h.:1 | C3h.:1 | F2h.:5 | F2h.:5 | C3h.:1 | C3h.:1 | '
             'F2h.:5 | F2h.:5 | C3h.:1 | C3h.:1 | G2h.:4 | G2h.:4 | C3h.:1 | C3h.:1 | C3h.:1 | G2h.:4 | C3h.:1')),
    # ---------- Level 7: famous classics (public domain) ----------
    dict(id='greensleeves', level=6, title='Greensleeves', hands='both', bpm=100, wait=60, time=(3, 4), pickup=True, composer='English folk song',
         learn='A minor-key melody in 3/4 with a pickup. Watch for the sharps (F♯ and G♯) that give it its old, haunting sound.',
         tips=['The rhythm "long-short-long" (dotted quarter, eighth, quarter) repeats through the song.', 'Finger 3 crosses over the thumb in bar 8.'],
         rh=('A4q:1 | C5h:2 D5q:3 | E5q.:4 F#5e:5 E5q:4 | D5h:3 B4q:2 | G4q.:1 A4e:2 B4q:3 | C5h:4 A4q:2 | A4q.:2 G#4e:1 A4q:2 | B4h:3 G#4q:1 | E4h:2 A4q:1 | '
             'C5h:2 D5q:3 | E5q.:4 F#5e:5 E5q:4 | D5h:3 B4q:2 | G4q.:1 A4e:2 B4q:3 | C5q.:5 B4e:4 A4q:3 | G#4q.:2 F#4e:1 G#4q:2 | A4h.:3 | A4h.:3'),
         lh='rq | A2h.:1 | G2h.:2 | E2h.:5 | G2h.:2 | A2h.:1 | E2h.:5 | E2h.:5 | E2h.:5 | A2h.:1 | G2h.:2 | E2h.:5 | G2h.:2 | A2h.:1 | E2h.:5 | A2h.:1 | A2h.:1'),
    dict(id='canon', level=6, title='Canon (Pachelbel), simplified', hands='both', bpm=72, wait=50, composer='Johann Pachelbel',
         learn='The famous Canon, in C major and in slow half notes. The left hand repeats the same eight-note bass line, the melody walks down above it.',
         tips=['Going down, finger 3 crosses over the thumb.', 'Let each half note ring for its full two beats.'],
         rh=('E5h:3 D5h:2 | C5h:1 B4h:3 | A4h:2 G4h:1 | A4h:2 B4h:3 | C5h:4 B4h:3 | A4h:2 G4h:1 | F4h:3 E4h:2 | F4h:3 D4h:1 | C4+E4+G4w:1+3+5'),
         lh='C3h:1 G2h:4 | A2h:3 E2h:5 | F2h:4 C2h:5 | F2h:3 G2h:2 | C3h:1 G2h:4 | A2h:3 E2h:5 | F2h:4 C2h:5 | F2h:3 G2h:2 | C3w:1'),
    dict(id='nachtmusik', level=6, title='Eine kleine Nachtmusik', hands='both', bpm=100, wait=60, fifths=1, composer='Wolfgang Amadeus Mozart',
         learn="The opening of Mozart's serenade in G major. Short rests between the notes make it crisp; the second phrase uses F♯.",
         tips=['Lift the hand during the eighth rests.', 'Play the quarter notes short and bright.'],
         rh=('G4q:3 re D4e:1 G4q:3 re D4e:1 | G4e:3 D4e:1 G4e:3 B4e:4 D5h:5 | C5q:5 re A4e:4 C5q:5 re A4e:4 | C5e:5 A4e:4 F#4e:2 A4e:4 D4h:1 | G4+B4+D5w:1+3+5'),
         lh='G2w:5 | G2w:5 | D3w:1 | D3w:1 | G2w:5'),
    dict(id='fur-elise', level=6, title='Für Elise (opening)', hands='both', bpm=60, wait=40, time=(3, 8), pickup=True, composer='Ludwig van Beethoven',
         learn="The first part of Beethoven's Für Elise, in 3/8 with sixteenth notes. The hands take turns: the left hand plays a broken chord, then the right hand answers.",
         tips=['Rock gently between E and D♯ with fingers 5 and 4.', 'Practise the hand changes slowly with Wait for me.', 'Use the pedal later; first make the notes even.'],
         rh=('E5s:5 D#5s:4 | E5s:5 D#5s:4 E5s:5 B4s:2 D5s:4 C5s:3 | A4e:1 rs C4s:1 E4s:2 A4s:4 | B4e:5 rs E4s:1 G#4s:3 B4s:4 | C5e:5 rs E4s:1 E5s:5 D#5s:4 | '
             'E5s:5 D#5s:4 E5s:5 B4s:2 D5s:4 C5s:3 | A4e:1 rs C4s:1 E4s:2 A4s:4 | B4e:5 rs E4s:1 C5s:4 B4s:3 | A4q.:2'),
         lh=('re | | A2s:5 E3s:2 A3s:1 re. | E2s:5 E3s:2 G#3s:1 re. | A2s:5 E3s:2 A3s:1 re. | | A2s:5 E3s:2 A3s:1 re. | E2s:5 E3s:2 G#3s:1 re. | A2s:5 E3s:2 A3s:1 re.')),

    dict(id='hassler-minuet', level=2, title='Minuet in C, Op. 38 No. 4', hands='both', bpm=100, wait=60, time=(3, 4), composer='Johann Wilhelm Hässler',
         learn="A short classical minuet from Hässler's 50 Pieces for Beginners. The right hand sings; the left hand has long notes and little eighth-note turns. Look for the answering phrases: bars 1-4 and 9-12 are nearly the same.",
         tips=['Learn each hand alone first, then together.', 'Bar 6 has a G♯ and bar 7 a C♯: watch the accidentals.', 'Play the last-bar chords together, then lift the hands for the final C.', 'Keep it light and graceful: one beat per quarter, a gentle lilt on beat 1.'],
         rh=('C5q:2 E5q:4 C5q | G4h. | D5q:3 F5q D5q | G4h. | E5e:2 C5e:1 F5e:3 C5e G5e:4 C5e | G#5e:4 A5e G5e F5e E5e D5e | C#5e:2 D5e:3 E5e F5e A4e:1 D5e:4 | C5h:3 B4q | '
             'C5q:3 E5e:5 C5e B4e C5e | G4h. | D5q:3 F5e:5 D5e C#5e D5e | G4h. | E5e:2 C5e F5e C5e G5e C5e | G#5e:4 A5e G5e F5e E5e D5e | C5+E5q:2+4 B4+D5+F5q:1+3+5 B4+D5q:1+3 | C5q:2 rq rq'),
         lh=('C4h.:2 | C4q E4q:1 C4q | G3h.:5 | G3q F4q:1 D4q:2 | C4q:1 A3q:2 E3q:3 | F3h.:2 | F3q D3q F3q | G3q G2q G3q | '
             'C4h.:2 | C4q E4e:1 C4e:2 B3e C4e | G3h.:5 | G3q F4e:1 D4e:2 B3e:3 G3e:5 | C4q:1! A3q:2! E3q:3! | F3h:2 F3q | G3q:1 G2q G3q | C3q:5 C4q rq')),

    # ---------- more folk tunes (Preparatory levels) ----------
    dict(id='lightly-row', title='Lightly Row', hands='right', bpm=100, wait=70,
         learn='A cheerful German folk tune ("Hänschen klein") that stays in C position from start to finish.',
         tips=['The melody often steps down; keep each finger over its own key.', 'In the middle part, play the repeated notes evenly.'],
         rh=('G4q:5 E4q:3 E4h:3 | F4q:4 D4q:2 D4h:2 | C4q:1 D4q:2 E4q:3 F4q:4 | G4q:5 G4q:5 G4h:5 | '
             'G4q:5 E4q:3 E4h:3 | F4q:4 D4q:2 D4h:2 | C4q:1 E4q:3 G4q:5 G4q:5 | C4w:1 | '
             'D4q:2 D4q:2 D4q:2 D4q:2 | D4q:2 E4q:3 F4h:4 | E4q:3 E4q:3 E4q:3 E4q:3 | E4q:3 F4q:4 G4h:5 | '
             'G4q:5 E4q:3 E4h:3 | F4q:4 D4q:2 D4h:2 | C4q:1 E4q:3 G4q:5 G4q:5 | C4w:1'), lh=''),
    dict(id='old-macdonald', title='Old MacDonald Had a Farm', hands='right', bpm=100, wait=70, fifths=-1,
         learn='A song in F major. The thumb sits on C below F, and finger 3 plays F, so you skip the E.',
         tips=['Right hand: C 1, D 2, F 3, G 4, A 5.', 'Hold the whole note for four full beats.'],
         rh=('F4q:3 F4q:3 F4q:3 C4q:1 | D4q:2 D4q:2 C4h:1 | A4q:5 A4q:5 G4q:4 G4q:4 | F4w:3 | '
             'F4q:3 F4q:3 F4q:3 C4q:1 | D4q:2 D4q:2 C4h:1 | A4q:5 A4q:5 G4q:4 G4q:4 | F4w:3'), lh=''),
    dict(id='frere-jacques', title='Frère Jacques', hands='both', bpm=100, wait=60,
         learn='The famous round, with the left hand holding a drone (C and G together) underneath: your first steady accompaniment.',
         tips=['The left hand just holds; let the right hand lead.', 'In bars 7–8 the right hand dips down to the G below middle C.'],
         rh=('C4q:1 D4q:2 E4q:3 C4q:1 | C4q:1 D4q:2 E4q:3 C4q:1 | E4q:3 F4q:4 G4h:5 | E4q:3 F4q:4 G4h:5 | '
             'G4e:4 A4e:5 G4e:4 F4e:3 E4q:2 C4q:1 | G4e:4 A4e:5 G4e:4 F4e:3 E4q:2 C4q:1 | C4q:2 G3q:1 C4h:2 | C4q:2 G3q:1 C4h:2'),
         lh='C3+G3w:5+1 | C3+G3w:5+1 | C3+G3w:5+1 | C3+G3w:5+1 | C3+G3w:5+1 | C3+G3w:5+1 | C3w:5 | C3w:5'),
    # ---------- Levels 3 and 4 ----------
    dict(id='sonatina-c', title='Sonatina in C (Classical style)', hands='both', bpm=100, wait=60, composer='Piano Reader',
         learn='An original piece in the Classical style: a clear melody over an "Alberti bass", the broken-chord pattern (low, high, middle, high) used by Mozart and Clementi.',
         tips=['Keep the Alberti bass soft and even; the melody sings above it.', 'Left hand pattern: 5 1 3 1.'],
         rh=('E5h:3 G5q:5 E5q:3 | D5q:2 F5q:4 D5q:2 B4q:1 | C5q:1 E5q:3 G5q:5 E5q:3 | D5h.:2 rq | '
             'E5q:3 E5e:3 F5e:4 G5q:5 E5q:3 | F5q:4 A5q:5 F5q:4 C5q:1 | F5q:4 D5q:2 B4q:1 D5q:2 | C5w:1'),
         lh=' | '.join([up8('C3 G3 E3 G3 C3 G3 E3 G3', '5 1 3 1 5 1 3 1'), up8('B2 G3 F3 G3 B2 G3 F3 G3', '5 1 2 1 5 1 2 1'),
                        up8('C3 G3 E3 G3 C3 G3 E3 G3', '5 1 3 1 5 1 3 1'), up8('B2 G3 D3 G3 B2 G3 D3 G3', '5 1 3 1 5 1 3 1'),
                        up8('C3 G3 E3 G3 C3 G3 E3 G3', '5 1 3 1 5 1 3 1'), up8('C3 A3 F3 A3 C3 A3 F3 A3', '5 1 3 1 5 1 3 1'),
                        up8('B2 G3 F3 G3 B2 G3 F3 G3', '5 1 2 1 5 1 2 1'), 'C3+G3+C4w:5+2+1'])),
    dict(id='prelude-c', title='Prelude in C (opening)', hands='both', bpm=60, wait=40, composer='Johann Sebastian Bach, BWV 846, arranged',
         learn="The first bars of the Prelude in C from Bach's Well-Tempered Clavier. Every half bar repeats one chord pattern; the music is in the slowly changing harmony.",
         tips=['The left hand plays the two low notes; the right hand the three upper notes, twice.', 'Play very evenly and let the harmony change be the expression.'],
         rh=' | '.join(prelude_bar(*b)[0] for b in PRELUDE) + ' | E4+G4+C5w:1+2+5',
         lh=' | '.join(prelude_bar(*b)[1] for b in PRELUDE) + ' | C3+G3+C4w:5+2+1'),
    dict(id='waltz-am', title='Little Waltz in A minor', hands='both', bpm=120, wait=70, time=(3, 4), composer='Piano Reader',
         learn='An original Romantic-style waltz. The left hand plays the classic waltz accompaniment: a low bass note on beat 1, a chord on beats 2 and 3.',
         tips=['Make beat 1 of the left hand a little deeper; keep the chords on 2 and 3 light.', 'Shape the melody: grow toward bar 6 and relax at the end.'],
         rh=('E5q:5 C5q:3 A4q:1 | B4q:2 C5q:3 D5q:4 | D5h:4 C5e:3 B4e:2 | C5h.:3 | '
             'B4q:3 G#4q:1 B4q:3 | D5h:5 C5e:4 B4e:3 | C5h:4 B4q:3 | A4h.:2'),
         lh=('A2q:5 C3+E3q:3+1 C3+E3q:3+1 | A2q:5 C3+E3q:3+1 C3+E3q:3+1 | D3q:5 F3+A3q:3+1 F3+A3q:3+1 | A2q:5 C3+E3q:3+1 C3+E3q:3+1 | '
             'E2q:5 B2+E3q:2+1 B2+E3q:2+1 | E2q:5 B2+D3q:2+1 B2+D3q:2+1 | A2q:5 C3+E3q:3+1 C3+E3q:3+1 | A2+E3h.:5+1')),
]

# =====================================================================================================
# Course structure following the RCM Piano Syllabus, 2022 edition (rcmusic.com/syllabi):
# Preparatory A, Preparatory B, Level 1 and Level 2, each with technique, pieces, ear tests and sight
# reading. Technical exercises are generated below from the keys, patterns and metronome marks the
# syllabus lists for each level; the pieces are this course's own public-domain arrangements.
# =====================================================================================================
LEVELS = ['Preparatory A', 'Preparatory B', 'Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6']

LETTERS = 'CDEFGAB'
KEYS = {'C': ('C D E F G A B', 0), 'G': ('G A B C D E F#', 1), 'D': ('D E F# G A B C#', 2), 'A': ('A B C# D E F# G#', 3),
        'F': ('F G A Bb C D E', -1), 'Bb': ('Bb C D Eb F G A', -2),
        'Eb': ('Eb F G Ab Bb C D', -3), 'Ab': ('Ab Bb C Db Eb F G', -4), 'Db': ('Db Eb F Gb Ab Bb C', -5),
        'E': ('E F# G# A B C# D#', 4), 'B': ('B C# D# E F# G# A#', 5),
        'Fm': ('F G Ab Bb C Db Eb', -4), 'C#m': ('C# D# E F# G# A B', 4),
        'Am': ('A B C D E F G', 0), 'Em': ('E F# G A B C D', 1), 'Dm': ('D E F G A Bb C', -1), 'Gm': ('G A Bb C D Eb F', -2),
        'Bm': ('B C# D E F# G A', 2), 'Cm': ('C D Eb F G Ab Bb', -3)}
NAMES = {'C': 'C major', 'G': 'G major', 'D': 'D major', 'A': 'A major', 'F': 'F major', 'Bb': 'B♭ major',
         'Eb': 'E♭ major', 'Ab': 'A♭ major', 'Db': 'D♭ major', 'E': 'E major', 'B': 'B major', 'Fm': 'F minor', 'C#m': 'C♯ minor', 'Am': 'A minor', 'Em': 'E minor', 'Dm': 'D minor', 'Gm': 'G minor', 'Bm': 'B minor', 'Cm': 'C minor'}
TOKDUR = {1: 's', 2: 'e', 3: 'e.', 4: 'q', 6: 'q.', 8: 'h', 12: 'h.', 16: 'w'}


def raised(n):                            # a semitone higher, keeping the letter: G→G#, Bb→B
    return n[:-1] if n.endswith('b') else n + '#'


def scale_names(key, form='natural'):
    names = KEYS[key][0].split()
    if form in ('harmonic', 'melodic'):
        names[6] = raised(names[6])
    if form == 'melodic':
        names[5] = raised(names[5])
    return names


def place(names, octave, count):          # `count` ascending pitches from the tonic, with octave numbers
    out, prev = [], None
    for i in range(count):
        n = names[i % 7]
        li = LETTERS.index(n[0])
        if prev is not None and li <= prev:
            octave += 1
        out.append(f'{n}{octave}')
        prev = li
    return out


def start_octave(key, hand, octaves=1):  # keep scales near the middle of the keyboard
    letter = key[0]
    if hand == 'R':
        return 4 if (octaves == 1 and letter not in 'AB') or letter in 'CDEF' else 3
    return 3 if octaves == 1 and letter in 'CDEFG' else 2


def scale_fingers(key, hand, octaves):   # standard fingering, ascending, tonic to tonic
    k = key.rstrip('m') if key.endswith('m') else key
    if hand == 'R':
        group = {'F': [1, 2, 3, 4, 1, 2, 3], 'Bb': [4, 1, 2, 3, 1, 2, 3], 'Eb': [3, 1, 2, 3, 4, 1, 2], 'Ab': [3, 4, 1, 2, 3, 1, 2],
                 'Db': [2, 3, 1, 2, 3, 4, 1], 'C#': [3, 4, 1, 2, 3, 1, 2]}.get(k, [1, 2, 3, 1, 2, 3, 4])
        top = {'F': 4, 'Bb': 4, 'Eb': 3, 'Ab': 3, 'Db': 2, 'C#': 3}.get(k, 5)
        return (group * octaves) + [top]
    flat_lh = [3, 2, 1, 4, 3, 2, 1]
    group = {'Bb': flat_lh, 'Eb': flat_lh, 'Ab': flat_lh, 'Db': flat_lh, 'C#': flat_lh, 'B': [4, 3, 2, 1, 4, 3, 2]}.get(k, [5, 4, 3, 2, 1, 3, 2])
    top = 3 if k in ('Bb', 'Eb', 'Ab', 'Db', 'C#') else 1
    return group + ([top] + group[1:]) * (octaves - 1) + [top]


def to_bars(seq, bar=16, unit=2):         # [(pitch, finger)] → bar strings; the last note fills its bar
    bars, cur, pos = [], [], 0
    for i, (p, f) in enumerate(seq):
        d = unit if i < len(seq) - 1 else bar - pos % bar
        cur.append(f'{p}{TOKDUR[d]}:{f}')
        pos += d
        if pos % bar == 0:
            bars.append(' '.join(cur)); cur = []
    assert not cur
    return bars


def keyed(bars, key):                     # mark the key signature at the start of a section
    return [f'[k={KEYS[key][1]}] ' + bars[0]] + bars[1:]


def hs(sections):                         # hands separately: [(rh_bars, lh_bars)] → (rh string, lh string)
    rh, lh = [], []
    for r, l in sections:
        rh += r + [''] * len(l)
        lh += [''] * len(r) + l
    return ' | '.join(rh), ' | '.join(lh)


def pentascale(key, hand, unit, staccato=False):
    p = place(scale_names(key), 4 if hand == 'R' else 3, 5)
    f = [1, 2, 3, 4, 5] if hand == 'R' else [5, 4, 3, 2, 1]
    st = '!' if staccato else ''
    seq = [(p[i], f[i]) for i in (0, 1, 2, 3, 4, 3, 2, 1)]
    triad = f'{p[0]}+{p[2]}+{p[4]}'
    tf = '1+3+5' if hand == 'R' else '5+3+1'
    if unit == 4:                         # quarter notes: up | down | tonic + solid triad
        notes = [f'{x}q:{y}{st}' for x, y in seq]
        bars = [' '.join(notes[:4]), ' '.join(notes[4:]), f'{p[0]}h:{f[0]}{st} {triad}h:{tf}']
    else:                                 # eighth notes: up and down | tonic + solid triad
        bars = [' '.join(f'{x}e:{y}{st}' for x, y in seq), f'{p[0]}q:{f[0]}{st} {triad}q:{tf} rh']
    return keyed(bars, key)


def scale(key, hand, octaves, form='natural'):
    o = start_octave(key, hand, octaves)
    n = 7 * octaves + 1
    up = place(scale_names(key, form), o, n)
    down = place(scale_names(key, 'natural' if form == 'melodic' else form), o, n)[::-1]
    f = scale_fingers(key, hand, octaves)
    seq = list(zip(up, f)) + list(zip(down[1:], f[::-1][1:]))
    return keyed(to_bars(seq), key)


def contrary(octaves):                    # C major from middle C, hands moving apart and back together
    n = 7 * octaves + 1
    rh = place(scale_names('C'), 4, n)
    lh = place(scale_names('C'), 4 - octaves, n)[::-1]          # both hands start on middle C (unison)
    rf, lf = scale_fingers('C', 'R', octaves), scale_fingers('C', 'L', octaves)[::-1]
    r = list(zip(rh, rf)) + list(zip(rh[::-1][1:], rf[::-1][1:]))
    l = list(zip(lh, lf)) + list(zip(lh[::-1][1:], lf[::-1][1:]))
    return ' | '.join(to_bars(r)), ' | '.join(to_bars(l))


SHARP = 'C C# D D# E F F# G G# A A# B'.split()
FLAT = 'C Db D Eb E F Gb G Ab A Bb B'.split()


def chromatic(start, hand, octaves=1):
    o = 4 if hand == 'R' else 3
    s = SHARP.index(start) if start in SHARP else FLAT.index(start)
    n = 12 * octaves + 1
    pcs = [(s + i) % 12 for i in range(n)]
    octs = [o + (s + i) // 12 for i in range(n)]

    def finger(pc, lowest, highest):     # black keys 3; whites 1, but 2 next to E–F / B–C
        if '#' in SHARP[pc]:
            return 3
        if hand == 'R':
            return 2 if pc in (0, 5) and not lowest else 1
        return 2 if pc in (4, 11) and not highest else 1
    first = start if start not in SHARP else SHARP[s]
    up = [(f'{first if i == 0 else SHARP[pc]}{oc}', finger(pc, i == 0, i == n - 1)) for i, (pc, oc) in enumerate(zip(pcs, octs))]
    down = [(f'{first if i == 0 else FLAT[pc]}{oc}', finger(pc, i == 0, i == n - 1)) for i, (pc, oc) in enumerate(zip(pcs, octs))][::-1]
    return to_bars(up + down[1:])


def chromatic_ht(start, octaves):          # hands together, an octave apart
    return chromatic(start, 'R', octaves), chromatic(start, 'L', octaves)


def triad_sequence(key, hand):            # triads on every degree, ascending: broken (3/4 eighths) then solid
    p = place(scale_names(key), 4 if hand == 'R' else 3, 12)
    f = [1, 3, 5] if hand == 'R' else [5, 3, 1]
    tri = [(p[i], p[i + 2], p[i + 4]) for i in range(8)]
    broken = [' '.join(f'{n}e:{f[j]}' for t in tri[b:b + 2] for j, n in enumerate(t)) for b in range(0, 8, 2)]
    ch = [f'{"+".join(t)}q:{"+".join(map(str, f))}' for t in tri]
    solid = [' '.join(ch[0:3]), ' '.join(ch[3:6]), ' '.join(ch[6:8]) + ' rq']
    return keyed(broken + solid, key)


INV_R = [[1, 3, 5], [1, 2, 5], [1, 3, 5], [1, 3, 5]]  # root, 1st inversion, 2nd inversion, root an octave up
INV_L = [[5, 3, 1], [5, 3, 1], [5, 2, 1], [5, 3, 1]]


def triad_positions(key, hand, octaves=1, octave=None):   # root, 1st and 2nd inversion per octave, then the top root
    o = octave if octave is not None else (start_octave(key, hand) if octaves == 1 else start_octave(key, 'R', 2) - (hand == 'L'))
    p = place(scale_names(key), o, 7 * octaves + 5)
    pos = []
    for k in range(octaves):
        b = 7 * k
        pos += [(p[b], p[b + 2], p[b + 4]), (p[b + 2], p[b + 4], p[b + 7]), (p[b + 4], p[b + 7], p[b + 9])]
    t = 7 * octaves
    pos.append((p[t], p[t + 2], p[t + 4]))
    fs = [(INV_R if hand == 'R' else INV_L)[i % 3] for i in range(len(pos))]
    return pos, fs


def triads_broken(key, hand, octaves=1):  # 3/4, eighths: two positions a bar up, back down, then the solid chord
    pos, fs = triad_positions(key, hand, octaves)
    n = len(pos)
    up = [(x, fs[k][j]) for k in range(n) for j, x in enumerate(pos[k])]
    down = [(x, fs[k][j]) for k in reversed(range(n)) for j, x in reversed(list(enumerate(pos[k])))]
    bars = to_bars(up + down, bar=12)
    bars.append(f'{"+".join(pos[0])}h.:{"+".join(map(str, fs[0]))}')
    return keyed(bars, key)


def triads_solid(key, hand, octaves=1):   # 4/4: each position as a chord with a rest, up and back down
    pos, fs = triad_positions(key, hand, octaves)
    order = list(range(len(pos))) + list(range(len(pos) - 2, -1, -1))
    c = [f'{"+".join(pos[k])}q:{"+".join(map(str, fs[k]))} rq' for k in order]
    if len(c) % 2:
        c.append('rh')
    return keyed([' '.join(c[i:i + 2]) for i in range(0, len(c), 2)], key)


def together(fn, key, *args):             # the same exercise for both hands at once (hands together)
    r, l = fn(key, 'R', *args), fn(key, 'L', *args)
    return r, [b.replace(f'[k={KEYS[key][1]}] ', '') for b in l]


def scale_ht(key, form='natural'):        # two octaves, hands together an octave apart
    o = start_octave(key, 'R', 2)
    out = []
    for hand, oc in (('R', o), ('L', o - 1)):
        up = place(scale_names(key, form), oc, 15)
        down = place(scale_names(key, 'natural' if form == 'melodic' else form), oc, 15)[::-1]
        f = scale_fingers(key, hand, 2)
        out.append(to_bars(list(zip(up, f)) + list(zip(down[1:], f[::-1][1:]))))
    return keyed(out[0], key), out[1]


def formula(key, form='natural'):         # similar motion up, contrary motion out and back in, similar motion down
    o = start_octave(key, 'R', 2)
    rp, rf = place(scale_names(key, form), o, 15), scale_fingers(key, 'R', 2)
    lp, lf = place(scale_names(key, form), o - 1, 8), scale_fingers(key, 'L', 1)
    r_idx = list(range(0, 8)) + list(range(8, 15)) + list(range(13, 6, -1)) + list(range(6, -1, -1))
    l_idx = list(range(0, 8)) + list(range(6, -1, -1)) + list(range(1, 8)) + list(range(6, -1, -1))
    return (keyed(to_bars([(rp[i], rf[i]) for i in r_idx]), key), to_bars([(lp[i], lf[i]) for i in l_idx]))


def arp_fingers(key, hand):               # tonic arpeggio, root position, two octaves, ascending
    k = key.rstrip('m') if key.endswith('m') else key
    if hand == 'R':
        if k in ('Bb', 'Eb', 'Ab', 'Db'):
            return [2, 1, 2, 4, 1, 2, 4]
        return [4, 1, 2, 4, 1, 2, 4] if k == 'C#' else [1, 2, 3, 1, 2, 3, 5]
    if k == 'Bb':
        return [3, 2, 1, 3, 2, 1, 3]
    if k in ('Eb', 'Ab', 'Db', 'C#'):
        return [2, 1, 4, 2, 1, 4, 2]
    if k == 'B':
        return [4, 2, 1, 4, 2, 1, 4]
    third = scale_names(key)[2]
    x = 3 if '#' in third or 'b' in third else 4    # finger 3 when the third is a black key
    return [5, x, 2, 1, x, 2, 1]


def arpeggio(key, hand):
    o = start_octave(key, 'R', 2) - (hand == 'L')
    p = place(scale_names(key), o, 15)
    notes = [p[i] for i in (0, 2, 4, 7, 9, 11, 14)]
    f = arp_fingers(key, hand)
    return keyed(to_bars(list(zip(notes, f)) + list(zip(notes[::-1][1:], f[::-1][1:]))), key)


def cadence(key, hand):                   # I–V–I in keyboard style: right-hand chords, left-hand bass (3/4)
    minor = key.endswith('m')
    nm = scale_names(key, 'harmonic' if minor else 'natural')
    if hand == 'R':
        o = start_octave(key, 'R', 2)
        p = place(nm, o, 8)
        lt = place(nm, o - 1, 8)[6]
        return f'{p[0]}+{p[2]}+{p[4]}q:1+3+5 {lt}+{p[1]}+{p[4]}q:1+2+5 {p[0]}+{p[2]}+{p[4]}q:1+3+5'
    o = start_octave(key, 'R', 2) - 1
    t, d = place(nm, o, 5)[0], place(nm, o - 1, 5)[4]
    return f'{t}q:1 {d}q:5 {t}q:1'


def triads_cadence(key):                  # broken tonic triads hands together, ending with I–V–I
    r, l = together(triads_broken, key, 2)
    return r[:-1] + [cadence(key, 'R')], l[:-1] + [cadence(key, 'L')]


V7_R = [[1, 2, 3, 5], [1, 2, 4, 5], [1, 2, 3, 5], [1, 2, 3, 5]]   # root, 1st, 2nd, 3rd inversion
V7_L = [[5, 3, 2, 1], [5, 4, 2, 1], [5, 3, 2, 1], [5, 4, 2, 1]]


def seventh_positions(key, hand, kind, octaves):
    """Four-note chord in root position and every inversion, up to the root `octaves` higher.
    kind 'V7': dominant 7th of a major key (degrees 5-7-2-4); 'dim7': leading-tone diminished 7th of a
    minor key (raised 7th, 2, 4, 6 of the harmonic minor)."""
    nm = scale_names(key, 'harmonic' if kind == 'dim7' else 'natural')
    o = start_octave(key, 'R', 2) - (1 if octaves == 2 else 0) - (hand == 'L')
    p = place(nm, o, 7 * (octaves + 2) + 8)
    base = 4 if kind == 'V7' else 6
    tones = [p[base + 2 * j + 7 * k] for k in range(octaves + 1) for j in range(4)]
    pos = [tuple(tones[i:i + 4]) for i in range(4 * octaves + 1)]
    fs = [(V7_R if hand == 'R' else V7_L)[i % 4] for i in range(len(pos))]
    return pos, fs


def sevenths_broken(key, hand, kind, octaves=1):   # 4/4 eighths: each position up and down
    pos, fs = seventh_positions(key, hand, kind, octaves)
    n = len(pos)
    up = [(x, fs[k][j]) for k in range(n) for j, x in enumerate(pos[k])]
    down = [(x, fs[k][j]) for k in reversed(range(n)) for j, x in reversed(list(enumerate(pos[k])))]
    bars = to_bars(up + down)
    bars.append(f'{"+".join(pos[0])}w:{"+".join(map(str, fs[0]))}')
    return keyed(bars, key)


def sevenths_solid(key, hand, kind, octaves=1):
    pos, fs = seventh_positions(key, hand, kind, octaves)
    order = list(range(len(pos))) + list(range(len(pos) - 2, -1, -1))
    c = [f'{"+".join(pos[k])}q:{"+".join(map(str, fs[k]))} rq' for k in order]
    if len(c) % 2:
        c.append('rh')
    return keyed([' '.join(c[i:i + 2]) for i in range(0, len(c), 2)], key)


def seventh_arpeggio(key, hand, kind):     # four-note arpeggio, root position, two octaves
    nm = scale_names(key, 'harmonic' if kind == 'dim7' else 'natural')
    o = start_octave(key, 'R', 2) - (hand == 'L')
    p = place(nm, o, 30)
    base = 4 if kind == 'V7' else 6
    notes = [p[base + 2 * j + 7 * k] for k in range(2) for j in range(4)] + [p[base + 14]]
    f = [1, 2, 3, 4, 1, 2, 3, 4, 5] if hand == 'R' else [5, 4, 3, 2, 1, 4, 3, 2, 1]
    return keyed(to_bars(list(zip(notes, f)) + list(zip(notes[::-1][1:], f[::-1][1:]))), key)


def tech(id, level, title, learn, tips, sections, bpm, wait, time=(4, 4), together=None, ht=None):
    if ht:                                # hands together: [(rh_bars, lh_bars)] played in turn
        rh = ' | '.join(b for r, l in ht for b in r); lh = ' | '.join(b for r, l in ht for b in l)
    else:
        rh, lh = together if together else hs(sections)
    return dict(id=id, level=level, kind='technique', title=title, hands='both', bpm=bpm, wait=wait, time=time,
                learn=learn, tips=tips, rh=rh, lh=lh, composer='Technique')


HS_TIP = 'Hands separately: the right hand plays first, then the left hand.'
MEMORY_TIP = 'In the exam technique is played from memory: when it feels easy, turn on ⋯ → Hide the notes.'

TECHNIQUE = [
    # ---------- Preparatory A ----------
    tech('pentascales-a1', 0, 'Pentascales: C and G major',
         'A pentascale is the first five notes of a scale, up and down, ending with the tonic triad played as a chord. Play legato: join each note smoothly to the next.',
         [HS_TIP, 'Right hand 1 2 3 4 5, left hand 5 4 3 2 1 going up.', MEMORY_TIP],
         [(pentascale(k, 'R', 4), pentascale(k, 'L', 4)) for k in ('C', 'G')], 100, 70),
    tech('pentascales-a2', 0, 'Pentascales: D major and A minor',
         'D major has two sharps (F♯ and C♯); in its pentascale you meet F♯. A minor uses only white keys, and its triad sounds darker than a major one.',
         [HS_TIP, 'Listen to the difference between the major and minor triads at the end.', MEMORY_TIP],
         [(pentascale(k, 'R', 4), pentascale(k, 'L', 4)) for k in ('D', 'Am')], 100, 70),
    tech('staccato-pentascales-a', 0, 'Staccato pentascales',
         'The same pentascales played staccato: short and detached, bouncing off each key (the dots above or below the notes).',
         [HS_TIP, 'Let the hand bounce lightly from the wrist; keep the fingers close to the keys.'],
         [(pentascale(k, 'R', 4, True), pentascale(k, 'L', 4, True)) for k in ('C', 'G', 'D', 'Am')], 100, 70),
    tech('triad-sequence-a', 0, 'Triad sequence in C major',
         'Build a triad (three notes a third apart) on every note of the C major scale, going up: first broken, one note at a time, then solid, all together.',
         [HS_TIP, 'Keep the same hand shape (1 3 5 in the right hand, 5 3 1 in the left) and move it up one key at a time.'],
         [(triad_sequence('C', 'R'), triad_sequence('C', 'L'))], 60, 45, time=(3, 4)),
    # ---------- Preparatory B ----------
    tech('pentascales-b1', 1, 'Pentascales: D, A and F major',
         'Pentascales in eighth notes. A major has F♯ and C♯ in its first five notes; F major has none (its B♭ is the 4th note of the scale, beyond the pentascale).',
         [HS_TIP, 'Two notes per beat: count "1 and 2 and".', MEMORY_TIP],
         [(pentascale(k, 'R', 2), pentascale(k, 'L', 2)) for k in ('D', 'A', 'F')], 60, 45),
    tech('pentascales-b2', 1, 'Pentascales: E and D minor',
         'Minor pentascales in eighth notes, legato. Then try them staccato too.',
         [HS_TIP, 'E minor has F♯; D minor uses only white keys in its first five notes.', MEMORY_TIP],
         [(pentascale(k, 'R', 2), pentascale(k, 'L', 2)) for k in ('Em', 'Dm')], 60, 45),
    tech('octave-scales-b', 1, 'One-octave scales: C, G major and A minor',
         'Full one-octave scales hands separately, with the thumb passing under. A minor here is the natural minor (all white keys).',
         [HS_TIP, 'Right hand 1 2 3 1 2 3 4 5; left hand 5 4 3 2 1 3 2 1.', MEMORY_TIP],
         [(scale(k, 'R', 1), scale(k, 'L', 1)) for k in ('C', 'G', 'Am')], 60, 45),
    tech('tonic-triads-b', 1, 'Tonic triads: C, G major and A minor',
         'The tonic triad in root position, first inversion and second inversion, broken, going up and back down, ending with the solid chord.',
         [HS_TIP, 'Right hand fingering: root 1 3 5, first inversion 1 2 5, second inversion 1 3 5.', 'Left hand: root 5 3 1, first inversion 5 3 1, second inversion 5 2 1.'],
         [(triads_broken(k, 'R'), triads_broken(k, 'L')) for k in ('C', 'G', 'Am')], 50, 35, time=(3, 4)),
    # ---------- Level 1 ----------
    tech('scales-1-major', 2, 'Two-octave scales: C, G and F major',
         'Two-octave scales hands separately. The thumb passes under twice on the way up. F major has B♭ and its own right-hand fingering: 1 2 3 4, 1 2 3, 1 2 3 4.',
         [HS_TIP, 'All scales are legato.', MEMORY_TIP],
         [(scale(k, 'R', 2), scale(k, 'L', 2)) for k in ('C', 'G', 'F')], 69, 50),
    tech('scales-1-minor', 2, 'Minor scales: A, E and D (natural and harmonic)',
         'Each minor key twice: first the natural minor, then the harmonic minor, which raises the 7th note (G♯ in A minor, D♯ in E minor, C♯ in D minor).',
         [HS_TIP, 'Listen for the raised 7th: it pulls strongly back to the tonic.', MEMORY_TIP],
         [(scale(k, 'R', 2, f), scale(k, 'L', 2, f)) for k in ('Am', 'Em', 'Dm') for f in ('natural', 'harmonic')], 69, 50),
    tech('contrary-1', 2, 'Contrary motion, two octaves',
         'C major in contrary motion over two octaves, hands together: the hands move away from each other and back, using the same finger numbers at the same time.',
         ['Both thumbs pass under at the same moment.', MEMORY_TIP], [], 69, 45, together=contrary(2)),
    tech('chromatic-1', 2, 'Chromatic scale from C',
         'Every key, black and white, for one octave. Black keys use finger 3, white keys the thumb, except where two white keys sit together (E–F, B–C), which use 1–2.',
         [HS_TIP, 'Keep the hand close to the black keys; the thumb and finger 3 do most of the work.'],
         [(chromatic('C', 'R'), chromatic('C', 'L'))], 69, 50),
    tech('tonic-triads-1', 2, 'Tonic triads: C, G and F major (broken)',
         'Broken tonic triads through root position and both inversions, up and down, ending with the solid chord.',
         [HS_TIP, 'Keep the wrist level as the hand moves to each inversion.'],
         [(triads_broken(k, 'R'), triads_broken(k, 'L')) for k in ('C', 'G', 'F')], 50, 35, time=(3, 4)),
    tech('tonic-triads-1m', 2, 'Tonic triads: A, E and D minor (broken)',
         'The minor tonic triads, broken, through all inversions.',
         [HS_TIP, 'The minor triad has a minor third (3 half steps) at the bottom.'],
         [(triads_broken(k, 'R'), triads_broken(k, 'L')) for k in ('Am', 'Em', 'Dm')], 50, 35, time=(3, 4)),
    tech('solid-triads-1', 2, 'Solid tonic triads: C, G, F, A, E and D',
         'The same triads played solid (all notes together), with a rest after each chord.',
         [HS_TIP, 'Press the three notes exactly together and release them together on the rest.'],
         [(triads_solid(k, 'R'), triads_solid(k, 'L')) for k in ('C', 'G', 'F', 'Am', 'Em', 'Dm')], 100, 70),
    # ---------- Level 2 ----------
    tech('scales-2-major', 3, 'Two-octave scales: G, F and B♭ major',
         'B♭ major starts on a black key, so its fingering begins with finger 4 in the right hand and 3 in the left: the thumbs land on C and F.',
         [HS_TIP, 'B♭ major, right hand: 4 1 2 3 1 2 3 4; left hand: 3 2 1 4 3 2 1 3.', MEMORY_TIP],
         [(scale(k, 'R', 2), scale(k, 'L', 2)) for k in ('G', 'F', 'Bb')], 80, 55),
    tech('scales-2-harmonic', 3, 'Harmonic minor scales: E, D and G',
         'Harmonic minor raises the 7th note going up and down: D♯ in E minor, C♯ in D minor, F♯ in G minor.',
         [HS_TIP, MEMORY_TIP], [(scale(k, 'R', 2, 'harmonic'), scale(k, 'L', 2, 'harmonic')) for k in ('Em', 'Dm', 'Gm')], 80, 55),
    tech('scales-2-melodic', 3, 'Melodic minor scales: E, D and G',
         'Melodic minor raises the 6th and 7th notes going up and comes down as the natural minor.',
         [HS_TIP, 'Going up it sounds almost like major; coming down it is minor again.', MEMORY_TIP],
         [(scale(k, 'R', 2, 'melodic'), scale(k, 'L', 2, 'melodic')) for k in ('Em', 'Dm', 'Gm')], 80, 55),
    tech('chromatic-2', 3, 'Chromatic scale from G',
         'The chromatic scale starting on G. The same rule: black keys 3, white keys 1, and 1–2 where two white keys meet.',
         [HS_TIP], [(chromatic('G', 'R'), chromatic('G', 'L'))], 80, 55),
    tech('tonic-triads-2', 3, 'Tonic triads: G, F, B♭ major and E, D, G minor (broken)',
         'Broken tonic triads in the Level 2 keys, through all inversions.',
         [HS_TIP], [(triads_broken(k, 'R'), triads_broken(k, 'L')) for k in ('G', 'F', 'Bb', 'Em', 'Dm', 'Gm')], 60, 40, time=(3, 4)),
    tech('solid-triads-2', 3, 'Solid tonic triads: G, F, B♭ major and E, D, G minor',
         'The Level 2 tonic triads played solid with rests, up and down.',
         [HS_TIP], [(triads_solid(k, 'R'), triads_solid(k, 'L')) for k in ('G', 'F', 'Bb', 'Em', 'Dm', 'Gm')], 112, 80),
    # ---------- Level 3 ----------
    tech('scales-3-major', 4, 'Two-octave scales hands together: D, F and B♭ major',
         'From Level 3 the scales are played hands together, an octave apart. Each hand keeps its own fingering, so the thumbs cross at different moments.',
         ['Practise each hand alone first, then together slowly with Wait for me.', 'Watch where each thumb goes: in D major the right thumb plays D and G, the left thumb A and D.', MEMORY_TIP],
         [], 80, 50, ht=[scale_ht(k) for k in ('D', 'F', 'Bb')]),
    tech('scales-3-harmonic', 4, 'Harmonic minor scales hands together: B, D and G',
         'B minor has two sharps (F♯, C♯) and raises A to A♯; D minor raises C to C♯; G minor raises F to F♯. In B minor the left hand starts with finger 4.',
         ['Left hand in B minor: 4 3 2 1, 4 3 2 1.', MEMORY_TIP], [], 80, 50, ht=[scale_ht(k, 'harmonic') for k in ('Bm', 'Dm', 'Gm')]),
    tech('scales-3-melodic', 4, 'Melodic minor scales hands together: B, D and G',
         'Melodic minor, hands together: the 6th and 7th notes are raised going up and natural coming down.',
         [MEMORY_TIP], [], 80, 50, ht=[scale_ht(k, 'melodic') for k in ('Bm', 'Dm', 'Gm')]),
    tech('formula-3', 4, 'Formula pattern in D major',
         'The formula pattern joins similar and contrary motion: both hands go up together, then move apart, come back in, and go down together.',
         ['Check the exact shape with your syllabus book (Technical Requirements for Piano): this is one common form of the pattern.', 'Keep the hands exactly together where they change direction.'],
         [], 80, 50, together=tuple(' | '.join(x) for x in formula('D'))),
    tech('chromatic-3', 4, 'Chromatic scale from D', 'The chromatic scale starting on D, hands separately.',
         [HS_TIP, 'Black keys 3, white keys 1, and 1–2 where two white keys meet.'], [(chromatic('D', 'R'), chromatic('D', 'L'))], 80, 55),
    tech('tonic-triads-3', 4, 'Tonic triads, two octaves: D, F and B♭ major',
         'Broken tonic triads now cover two octaves: root position, first and second inversion, then again an octave higher.',
         [HS_TIP, 'Keep the same fingering pattern in the second octave.'],
         [(triads_broken(k, 'R', 2), triads_broken(k, 'L', 2)) for k in ('D', 'F', 'Bb')], 69, 45, time=(3, 4)),
    tech('tonic-triads-3m', 4, 'Tonic triads, two octaves: B, D and G minor',
         'The minor tonic triads, broken, over two octaves.', [HS_TIP],
         [(triads_broken(k, 'R', 2), triads_broken(k, 'L', 2)) for k in ('Bm', 'Dm', 'Gm')], 69, 45, time=(3, 4)),
    tech('solid-triads-3', 4, 'Solid tonic triads, two octaves (Level 3 keys)',
         'Solid tonic triads in D, F, B♭ major and B, D, G minor, up two octaves and back, with a rest after each chord.',
         [HS_TIP, 'Move to each new position during the rest.'],
         [(triads_solid(k, 'R', 2), triads_solid(k, 'L', 2)) for k in ('D', 'F', 'Bb', 'Bm', 'Dm', 'Gm')], 120, 80),
    # ---------- Level 4 ----------
    tech('scales-4-major', 5, 'Scales hands together: D, A, B♭ and E♭ major',
         'Two-octave scales hands together, now including E♭ major (three flats). In E♭ the right hand starts with finger 3, the left with 3.',
         ['E♭ major, right hand: 3 1 2 3 4 1 2 3; left hand: 3 2 1 4 3 2 1 3.', MEMORY_TIP], [], 92, 60, ht=[scale_ht(k) for k in ('D', 'A', 'Bb', 'Eb')]),
    tech('scales-4-harmonic', 5, 'Harmonic minor scales hands together: B, G and C',
         'C minor has three flats; its harmonic form raises B♭ to B.', [MEMORY_TIP], [], 92, 60, ht=[scale_ht(k, 'harmonic') for k in ('Bm', 'Gm', 'Cm')]),
    tech('scales-4-melodic', 5, 'Melodic minor scales hands together: B, G and C',
         'Melodic minor hands together in B, G and C minor.', [MEMORY_TIP], [], 92, 60, ht=[scale_ht(k, 'melodic') for k in ('Bm', 'Gm', 'Cm')]),
    tech('formula-4', 5, 'Formula pattern in C harmonic minor',
         'The formula pattern in C harmonic minor: up together, apart and back in contrary motion, then down together.',
         ['Check the exact shape with your syllabus book: this is one common form of the pattern.', 'Listen for the raised 7th (B♮) in both hands.'],
         [], 92, 60, together=tuple(' | '.join(x) for x in formula('Cm', 'harmonic'))),
    tech('chromatic-4', 5, 'Chromatic scale from C, faster', 'The chromatic scale from C again, now at a quicker tempo.',
         [HS_TIP, 'Keep the thumb light so the scale stays even.'], [(chromatic('C', 'R'), chromatic('C', 'L'))], 104, 70),
    tech('tonic-triads-4', 5, 'Tonic triads hands together: D, A, B♭ and E♭ major',
         'Broken tonic triads over two octaves, now hands together an octave apart.',
         ['Practise hands separately first; then together slowly.'], [], 60, 40, time=(3, 4),
         ht=[together(triads_broken, k, 2) for k in ('D', 'A', 'Bb', 'Eb')]),
    tech('tonic-triads-4m', 5, 'Tonic triads hands together: B, G and C minor',
         'Minor tonic triads, broken, two octaves, hands together.', [], [], 60, 40, time=(3, 4),
         ht=[together(triads_broken, k, 2) for k in ('Bm', 'Gm', 'Cm')]),
    tech('solid-triads-4', 5, 'Solid tonic triads hands together (Level 4 keys)',
         'Solid tonic triads in all Level 4 keys, hands together, two octaves up and back.', ['Both hands press and release together.'], [], 120, 80,
         ht=[together(triads_solid, k, 2) for k in ('D', 'A', 'Bb', 'Eb', 'Bm', 'Gm', 'Cm')]),
    tech('arpeggios-4', 5, 'Arpeggios: D, A, B♭ and E♭ major',
         'An arpeggio is a broken chord spread over the keyboard: root, third, fifth, root, two octaves up and back. The thumb passes under to reach the next octave.',
         [HS_TIP, 'Let the wrist move sideways smoothly as the thumb passes under.', 'In B♭ and E♭ the right hand starts with finger 2 so the thumb lands on a white key.'],
         [(arpeggio(k, 'R'), arpeggio(k, 'L')) for k in ('D', 'A', 'Bb', 'Eb')], 72, 50),
    tech('arpeggios-4m', 5, 'Arpeggios: B, G and C minor', 'Minor tonic arpeggios, two octaves, hands separately.',
         [HS_TIP, 'Fingering shown is one standard choice; your teacher may prefer another.'],
         [(arpeggio(k, 'R'), arpeggio(k, 'L')) for k in ('Bm', 'Gm', 'Cm')], 72, 50),
    # ---------- Level 5 ----------
    tech('scales-5-major', 6, 'Scales hands together: A, E, F and A♭ major',
         'Two-octave scales hands together at a brisker tempo. A♭ major (four flats) starts with finger 3 in both hands.',
         ['A♭ major, right hand: 3 4 1 2 3 1 2 3; left hand: 3 2 1 4 3 2 1 3.', MEMORY_TIP], [], 104, 65, ht=[scale_ht(k) for k in ('A', 'E', 'F', 'Ab')]),
    tech('scales-5-harmonic', 6, 'Harmonic minor scales hands together: A, E and F',
         'F minor has four flats; its harmonic form raises the 7th note, E♭, to E♮.', [MEMORY_TIP], [], 104, 65,
         ht=[scale_ht(k, 'harmonic') for k in ('Am', 'Em', 'Fm')]),
    tech('scales-5-melodic', 6, 'Melodic minor scales hands together: A, E and F',
         'Melodic minor hands together: 6th and 7th raised going up, natural coming down.', [MEMORY_TIP], [], 104, 65,
         ht=[scale_ht(k, 'melodic') for k in ('Am', 'Em', 'Fm')]),
    tech('formula-5', 6, 'Formula patterns: A major and A harmonic minor',
         'The formula pattern in A major, then A harmonic minor.',
         ['Check the exact shape with your syllabus book: this is one common form of the pattern.'], [], 104, 65,
         ht=[formula('A'), formula('Am', 'harmonic')]),
    tech('chromatic-5', 6, 'Chromatic scales hands together: from A and from F',
         'Chromatic scales now hands together, an octave apart. Both hands use 3 on black keys and the thumb on most white keys, so they match closely.',
         ['Where E–F and B–C meet, the right hand uses 1–2 and the left hand 2–1: listen for evenness there.'], [], 104, 65,
         ht=[chromatic_ht('A', 1), chromatic_ht('F', 1)]),
    tech('tonic-triads-5', 6, 'Tonic triads with I–V–I: A, E, F and A♭ major',
         'Broken tonic triads over two octaves hands together, now ending with a I–V–I cadence: tonic chord, dominant chord, tonic chord.',
         ['In the cadence the right hand moves smoothly: only two notes change for the V chord.'], [], 66, 45, time=(3, 4),
         ht=[triads_cadence(k) for k in ('A', 'E', 'F', 'Ab')]),
    tech('tonic-triads-5m', 6, 'Tonic triads with i–V–i: A, E and F minor',
         'Minor tonic triads hands together, ending with i–V–i. The V chord uses the raised 7th (G♯ in A minor).', [], [], 66, 45, time=(3, 4),
         ht=[triads_cadence(k) for k in ('Am', 'Em', 'Fm')]),
    tech('dominant-7-5', 6, 'Dominant 7th chords: A, E, F and A♭ major',
         'The dominant 7th is a four-note chord on the 5th note of the scale (in A major: E G♯ B D). Play it broken and solid, in root position and all three inversions.',
         [HS_TIP, 'Right hand: root 1 2 3 5, first inversion 1 2 4 5, second and third 1 2 3 5.'],
         [(sevenths_broken(k, 'R', 'V7'), sevenths_broken(k, 'L', 'V7')) for k in ('A', 'E', 'F', 'Ab')], 72, 50),
    tech('dominant-7-5s', 6, 'Dominant 7th chords, solid: A, E, F and A♭ major', 'The dominant 7th chords solid, with a rest after each.',
         [HS_TIP], [(sevenths_solid(k, 'R', 'V7'), sevenths_solid(k, 'L', 'V7')) for k in ('A', 'E', 'F', 'Ab')], 60, 45),
    tech('arpeggios-5', 6, 'Arpeggios: A, E, F and A♭ major', 'Two-octave tonic arpeggios hands separately.',
         [HS_TIP, 'Keep the wrist level and let the thumb pass under smoothly.'], [(arpeggio(k, 'R'), arpeggio(k, 'L')) for k in ('A', 'E', 'F', 'Ab')], 80, 55),
    tech('arpeggios-5m', 6, 'Arpeggios: A, E and F minor', 'Minor tonic arpeggios, two octaves.',
         [HS_TIP], [(arpeggio(k, 'R'), arpeggio(k, 'L')) for k in ('Am', 'Em', 'Fm')], 80, 55),
    # ---------- Level 6 ----------
    tech('scales-6-major', 7, 'Scales hands together: G, E, B and D♭ major',
         'B major (five sharps) and D♭ major (five flats) use the black keys a lot; their fingering puts the thumbs on the white keys.',
         ['B major, left hand: 4 3 2 1, 4 3 2 1. D♭ major, right hand: 2 3 1 2 3 4 1 2.', 'The syllabus tempo is ♩ = 60 in sixteenth notes, the same speed as eighth notes at 120.', MEMORY_TIP], [], 120, 70, ht=[scale_ht(k) for k in ('G', 'E', 'B', 'Db')]),
    tech('scales-6-harmonic', 7, 'Harmonic minor scales hands together: G, E, B and C♯',
         'C♯ minor has four sharps; its harmonic form raises B to B♯.', [MEMORY_TIP], [], 120, 70, ht=[scale_ht(k, 'harmonic') for k in ('Gm', 'Em', 'Bm', 'C#m')]),
    tech('scales-6-melodic', 7, 'Melodic minor scales hands together: G, E, B and C♯', 'Melodic minor hands together in the Level 6 keys.',
         [MEMORY_TIP], [], 120, 70, ht=[scale_ht(k, 'melodic') for k in ('Gm', 'Em', 'Bm', 'C#m')]),
    tech('formula-6', 6 + 1, 'Formula patterns: E major and E harmonic minor', 'The formula pattern in E major and E harmonic minor.',
         ['Check the exact shape with your syllabus book: this is one common form of the pattern.'], [], 120, 70, ht=[formula('E'), formula('Em', 'harmonic')]),
    tech('chromatic-6', 7, 'Chromatic scales hands together, two octaves: from E and from D♭', 'Two-octave chromatic scales hands together.',
         ['Keep the hands exactly together; listen for an even, smooth sound.'], [], 120, 70, ht=[chromatic_ht('E', 2), chromatic_ht('Db', 2)]),
    tech('tonic-triads-6', 7, 'Tonic triads with I–V–I: G, E, B and D♭ major', 'Broken tonic triads hands together over two octaves, ending with I–V–I.',
         [], [], 80, 50, time=(3, 4), ht=[triads_cadence(k) for k in ('G', 'E', 'B', 'Db')]),
    tech('tonic-triads-6m', 7, 'Tonic triads with i–V–i: G, E, B and C♯ minor', 'Minor tonic triads hands together, ending with i–V–i.',
         [], [], 80, 50, time=(3, 4), ht=[triads_cadence(k) for k in ('Gm', 'Em', 'Bm', 'C#m')]),
    tech('dominant-7-6', 7, 'Dominant 7th chords, two octaves: G, E, B and D♭ major', 'Broken dominant 7th chords through all inversions, now over two octaves.',
         [HS_TIP], [(sevenths_broken(k, 'R', 'V7', 2), sevenths_broken(k, 'L', 'V7', 2)) for k in ('G', 'E', 'B', 'Db')], 88, 60),
    tech('diminished-7-6', 7, 'Diminished 7th chords: G, E, B and C♯ minor',
         'The leading-tone diminished 7th is built on the raised 7th of the harmonic minor (in G minor: F♯ A C E♭). All its notes are a minor 3rd apart, so every inversion has the same shape.',
         [HS_TIP, 'The fingering shown is one choice; with black keys you may adjust it so the thumb stays on white keys.'],
         [(sevenths_broken(k, 'R', 'dim7', 2), sevenths_broken(k, 'L', 'dim7', 2)) for k in ('Gm', 'Em', 'Bm', 'C#m')], 88, 60),
    tech('sevenths-6s', 7, 'Dominant and diminished 7ths, solid (Level 6 keys)', 'Solid dominant 7th (major keys) and diminished 7th (minor keys) chords with rests.',
         [HS_TIP], [(sevenths_solid(k, 'R', 'V7'), sevenths_solid(k, 'L', 'V7')) for k in ('G', 'E', 'B', 'Db')] +
         [(sevenths_solid(k, 'R', 'dim7'), sevenths_solid(k, 'L', 'dim7')) for k in ('Gm', 'Em', 'Bm', 'C#m')], 72, 50),
    tech('arpeggios-6', 7, 'Arpeggios: G, E, B and D♭ major', 'Two-octave tonic arpeggios in the Level 6 major keys.',
         [HS_TIP], [(arpeggio(k, 'R'), arpeggio(k, 'L')) for k in ('G', 'E', 'B', 'Db')], 92, 60),
    tech('arpeggios-6m', 7, 'Arpeggios: G, E, B and C♯ minor', 'Two-octave tonic arpeggios in the Level 6 minor keys.',
         [HS_TIP], [(arpeggio(k, 'R'), arpeggio(k, 'L')) for k in ('Gm', 'Em', 'Bm', 'C#m')], 92, 60),
    tech('seventh-arpeggios-6', 7, 'Dominant 7th and diminished 7th arpeggios',
         'Four-note arpeggios over two octaves: dominant 7ths in G, E, B, D♭ major and diminished 7ths in G, E, B, C♯ minor.',
         [HS_TIP, 'Fingering 1 2 3 4 suits white-key chords; with black keys, adjust so the thumb lands on white keys.'],
         [(seventh_arpeggio(k, 'R', 'V7'), seventh_arpeggio(k, 'L', 'V7')) for k in ('G', 'E', 'B', 'Db')] +
         [(seventh_arpeggio(k, 'R', 'dim7'), seventh_arpeggio(k, 'L', 'dim7')) for k in ('Gm', 'Em', 'Bm', 'C#m')], 92, 60),
]

# Where each existing piece belongs in the syllabus levels.
PLACE = {'lightly-row': 0, 'old-macdonald': 0, 'frere-jacques': 1, 'middle-c': 0, 'five-fingers': 0, 'mary': 0, 'left-five': 0, 'hot-cross-buns': 0, 'au-clair': 0,
         'ode-together': 1, 'twinkle': 1, 'saints': 1, 'row-your-boat': 1, 'london-bridge': 1, 'jingle-bells': 1,
         'c-scale-rh': (1, 'technique'), 'c-scale-lh': (1, 'technique'), 'g-scale': (1, 'technique'),
         'scale-together': (1, 'technique'), 'contrary': (1, 'technique'),
         'three-chords': 2, 'broken-chords': 2, 'happy-birthday': 2, 'silent-night': 2, 'greensleeves': 2,
         'hassler-minuet': 2, 'progression': 3, 'canon': 3, 'nachtmusik': 3, 'fur-elise': 3,
         'sonatina-c': 4, 'prelude-c': 5, 'waltz-am': 5}

# Ear tests and sight reading run inside the app; these entries describe each level's requirements.
MUSICIANSHIP = [
    dict(id='ear-a', level=0, kind='ear', title='Ear tests', tests=['clapback', 'chords', 'playback'],
         rhythm={'meters': [[2, 4], [3, 4], [4, 4]], 'values': ['q', 'h'], 'bars': 2},
         chords={'style': 'scale'}, playback={'degrees': 3, 'keys': ['C', 'G'], 'starts': [0, 2], 'length': 4},
         learn='Clap back a rhythm, tell whether a chord is major or minor, and play back a short melody on the first three notes of the scale.'),
    dict(id='sight-a', level=0, kind='sight', title='Sight reading', tests=['rhythm', 'playing'],
         rhythm={'meters': [[2, 4], [3, 4], [4, 4]], 'values': ['q', 'h'], 'bars': 2},
         playing={'style': 'two-hands-apart', 'keys': ['C'], 'length': 4},
         learn='Tap a rhythm at sight, then play two four-note melodies: one in the right hand (treble clef), one in the left (bass clef). They move by step in one direction.'),
    dict(id='ear-b', level=1, kind='ear', title='Ear tests', tests=['clapback', 'chords', 'playback'],
         rhythm={'meters': [[2, 4], [3, 4], [4, 4]], 'values': ['q', 'h', 'h.'], 'bars': 2},
         chords={'style': 'scale'}, playback={'degrees': 3, 'keys': ['C', 'G', 'Am'], 'starts': [0, 2], 'length': 4},
         learn='Clap back a rhythm, tell major from minor, and play back a melody on the first three notes of a major or minor scale.'),
    dict(id='sight-b', level=1, kind='sight', title='Sight reading', tests=['rhythm', 'playing'],
         rhythm={'meters': [[2, 4], [3, 4], [4, 4]], 'values': ['q', 'h', 'h.'], 'bars': 2},
         playing={'style': 'divided', 'keys': ['C'], 'bars': 4, 'values': ['q', 'h']},
         learn='Tap a rhythm at sight, then play a short melody shared between the hands in C position.'),
    dict(id='ear-1', level=2, kind='ear', title='Ear tests', tests=['clapback', 'intervals', 'chords', 'playback'],
         rhythm={'meters': [[2, 4], [3, 4], [4, 4]], 'values': ['q', 'h', 'h.', 'ee'], 'bars': 3},
         intervals=['m3', 'M3'], chords={'style': 'broken-solid'},
         playback={'degrees': 5, 'keys': ['C', 'G', 'Am'], 'starts': [0, 4], 'length': 5},
         learn='Clap back a rhythm, name minor and major thirds, tell major from minor, and play back a five-note melody.'),
    dict(id='sight-1', level=2, kind='sight', title='Sight reading', tests=['rhythm', 'playing'],
         rhythm={'meters': [[2, 4], [3, 4], [4, 4]], 'values': ['q', 'h', 'h.', 'ee'], 'bars': 2},
         playing={'style': 'divided', 'keys': ['C', 'G', 'F', 'Am'], 'bars': 4, 'values': ['q', 'h', 'h.']},
         learn='Tap a rhythm at sight, then play a four-bar melody shared between the hands in C, G, F major or A minor.'),
    dict(id='ear-2', level=3, kind='ear', title='Ear tests', tests=['clapback', 'intervals', 'chords', 'playback'],
         rhythm={'meters': [[2, 4], [3, 4], [4, 4]], 'values': ['q', 'h', 'h.', 'ee', 'q.e'], 'bars': 3},
         intervals=['m3', 'M3', 'P5'], chords={'style': 'solid'},
         playback={'degrees': 5, 'keys': ['G', 'F', 'Dm'], 'starts': [0, 4], 'length': 5},
         learn='Clap back a rhythm, name minor thirds, major thirds and perfect fifths, tell major from minor, and play back a five-note melody.'),
    dict(id='sight-2', level=3, kind='sight', title='Sight reading', tests=['rhythm', 'playing'],
         rhythm={'meters': [[2, 4], [3, 4], [4, 4]], 'values': ['q', 'h', 'h.', 'ee', 'q.e', 'rq'], 'bars': 3},
         playing={'style': 'divided', 'keys': ['C', 'G', 'F', 'Am', 'Dm'], 'bars': 4, 'values': ['q', 'h', 'ee'], 'wide': True},
         learn='Tap a rhythm with rests at sight, then play a four-bar melody shared between the hands that may move beyond the five-finger position.'),
    dict(id='ear-3', level=4, kind='ear', title='Ear tests', tests=['clapback', 'intervals', 'chords', 'members', 'playback'],
         rhythm={'meters': [[2, 4], [3, 4], [4, 4]], 'values': ['q', 'h', 'h.', 'ee', 'q.e'], 'bars': [3, 4]},
         intervals=['m3', 'M3', 'P4', 'P5'], chords={'style': 'solid'},
         playback={'degrees': 5, 'keys': ['D', 'F', 'Dm', 'Gm'], 'starts': [0, 2, 4], 'length': [5, 6]},
         learn='Clap back a longer rhythm; name thirds, fourths and fifths; tell major from minor; say whether a note is the root, third or fifth of a chord; play back a five- or six-note melody.'),
    dict(id='sight-3', level=4, kind='sight', title='Sight reading', tests=['rhythm', 'playing'],
         rhythm={'meters': [[2, 4], [3, 4], [4, 4]], 'values': ['q', 'h', 'h.', 'ee', 'q.e', 'rq'], 'bars': 4},
         playing={'style': 'together', 'keys': ['C', 'G', 'D', 'F', 'Am', 'Dm'], 'bars': 4, 'values': ['q', 'h', 'ee']},
         learn='Tap a four-bar rhythm at sight, then play a four-bar passage with both hands together.'),
    dict(id='ear-4', level=5, kind='ear', title='Ear tests', tests=['clapback', 'intervals', 'chords', 'members', 'playback'],
         rhythm={'meters': [[2, 4], [3, 4], [4, 4]], 'values': ['q', 'h', 'h.', 'ee', 'q.e', 'rq'], 'bars': [2, 3, 4]},
         intervals=['m3', 'M3', 'P4', 'P5', 'P8'], chords={'style': 'solid'},
         playback={'degrees': 5, 'keys': ['D', 'A', 'Gm', 'Cm'], 'starts': [0, 2, 4], 'length': [6, 7, 8]},
         learn='Clap back a rhythm; name thirds, fourths, fifths and octaves; tell major from minor; name a chord note as root, third or fifth; play back a six- to eight-note melody.'),
    dict(id='sight-4', level=5, kind='sight', title='Sight reading', tests=['rhythm', 'playing'],
         rhythm={'meters': [[2, 4], [3, 4], [4, 4]], 'values': ['q', 'h', 'h.', 'ee', 'q.e', 'rq'], 'bars': 4, 'melodic': True},
         playing={'style': 'together', 'keys': ['C', 'G', 'D', 'F', 'Am', 'Em', 'Dm'], 'bars': 4, 'values': ['q', 'h', 'ee', 'q.e']},
         learn='Tap the rhythm of a four-bar melody at sight, then play a four-bar passage hands together.'),
    dict(id='ear-5', level=6, kind='ear', title='Ear tests', tests=['intervals', 'chords', 'progressions', 'playback'],
         intervals=['m3', 'M3', 'P4', 'P5', 'm6', 'M6', 'P8'], intervalStyle='melodic-harmonic', chords={'style': 'solid', 'qualities': ['major', 'minor', 'dom7']},
         progressions={'minor': False}, playback={'pool': [0, 1, 2, 3, 4, 7], 'keys': ['A', 'E', 'Am', 'Em'], 'starts': [0, 2, 4, 7], 'length': [6, 7, 8], 'plays': 3},
         learn='Name intervals up to the octave (heard melodically, then together), tell major, minor and dominant 7th chords apart, recognise I–IV–I and I–V–I, and play back a melody of up to eight notes.'),
    dict(id='sight-5', level=6, kind='sight', title='Sight reading', tests=['rhythm', 'playing', 'leadsheet'],
         rhythm={'meters': [[2, 4], [3, 4], [4, 4]], 'values': ['q', 'h', 'h.', 'ee', 'q.e', 'rq'], 'bars': 4, 'melodic': True},
         playing={'style': 'together', 'keys': ['C', 'G', 'D', 'F', 'Bb', 'Am', 'Em', 'Bm', 'Dm', 'Gm'], 'bars': 8, 'values': ['q', 'h', 'ee', 'q.e']},
         leadsheet={'keys': ['C', 'G', 'D', 'F', 'Bb'], 'bars': 8, 'chords': ['I', 'IV', 'V']},
         learn='Tap the rhythm of a melody, then play an eight-bar passage hands together, or read a lead sheet: play the melody and make up a left-hand accompaniment from the chord symbols.'),
    dict(id='ear-6', level=7, kind='ear', title='Ear tests', tests=['intervals', 'chords', 'progressions', 'playback'],
         intervals=['m2', 'M2', 'm3', 'M3', 'P4', 'P5', 'm6', 'M6', 'P8'], intervalStyle='melodic-harmonic', chords={'style': 'solid', 'qualities': ['major', 'minor', 'dom7', 'dim7']},
         progressions={'minor': True}, playback={'pool': [0, 1, 2, 3, 4, 5, 6, 7], 'keys': ['G', 'E', 'Gm', 'Em'], 'starts': [0, 2, 4, 7], 'length': [7, 8, 9], 'plays': 3},
         learn='Name all intervals from a minor 2nd to the octave, recognise major, minor, dominant 7th and diminished 7th chords, I–IV–I and I–V–I in major and minor, and play back a melody using the whole scale.'),
    dict(id='sight-6', level=7, kind='sight', title='Sight reading', tests=['rhythm', 'playing', 'leadsheet'],
         rhythm={'meters': [[2, 4], [3, 4], [4, 4]], 'values': ['q', 'h', 'h.', 'ee', 'q.e', 'rq'], 'bars': 4, 'melodic': True},
         playing={'style': 'together', 'keys': ['C', 'G', 'D', 'A', 'F', 'Bb', 'Eb', 'Am', 'Em', 'Bm', 'Dm', 'Gm', 'Cm'], 'bars': 8, 'values': ['q', 'h', 'ee', 'q.e']},
         leadsheet={'keys': ['C', 'G', 'D', 'F', 'Bb', 'Am', 'Dm', 'Em'], 'bars': 8, 'chords': ['I', 'IV', 'V', 'V7', 'vi']},
         learn='Tap the rhythm of a melody, then play an eight-bar passage hands together in keys up to three sharps or flats, or read a lead sheet and make up the accompaniment.'),
]
KIND_ORDER = {'technique': 0, 'piece': 1, 'ear': 2, 'sight': 3}

if __name__ == '__main__':
    root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'lessons')
    os.makedirs(root, exist_ok=True)
    for old in os.listdir(root):                           # files are renumbered on every build
        if old.endswith('.musicxml'):
            os.remove(os.path.join(root, old))
    scored = []
    for L in LESSONS:
        where = PLACE[L['id']]
        level, kind = where if isinstance(where, tuple) else (where, 'piece')
        scored.append(L | {'level': level, 'kind': kind})
    scored += TECHNIQUE
    scored += REPERTOIRE
    allx = scored + MUSICIANSHIP
    allx.sort(key=lambda L: (L['level'], KIND_ORDER[L['kind']]))  # stable: keeps the order written above
    course = {'syllabus': 'Structure follows the RCM Piano Syllabus, 2022 edition (rcmusic.com/syllabi)', 'levels': LEVELS, 'lessons': []}
    n = 0
    for L in allx:
        if L['kind'] in ('ear', 'sight'):
            course['lessons'].append(L)
            continue
        n += 1
        fname = f'{n:02d}-{L["id"]}.musicxml'
        if 'src' in L:                    # a classical piece converted from its Mutopia MIDI file
            src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sources', 'mutopia', L['src'])
            xml, info = convert(src, L['title'], L['composer'], pickup=L['pickup'],
                                rights=f"{L['license']}. Edition: Mutopia Project, {L['url']}")
        else:
            xml = score(L['title'], L['rh'], L['lh'], L['bpm'], time=L.get('time', (4, 4)), fifths=L.get('fifths', 0),
                        composer=L.get('composer', 'Traditional'), pickup=L.get('pickup', False))
        with open(os.path.join(root, fname), 'w', encoding='utf-8', newline='\n') as f:
            f.write(xml)
        entry = {k: L[k] for k in ('id', 'level', 'kind', 'title', 'hands', 'bpm', 'wait', 'learn', 'tips')} | {'file': fname}
        if 'src' in L:
            entry |= {'composer': L['composer'], 'license': L['license'], 'source': L['url']}
        course['lessons'].append(entry)
    with open(os.path.join(root, 'lessons.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(course, f, ensure_ascii=False, indent=1)
    print(f'{n} scored lessons and {len(MUSICIANSHIP)} musicianship lessons written to {os.path.normpath(root)}')
