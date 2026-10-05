"""Build the lesson scores (lessons/*.musicxml) and the course list (lessons/lessons.json).

Run:  python tools/make_lessons.py

Notes are written as tokens:  <pitch><duration>[.][:finger]
  pitch     C4, F#4, Bb3 ... or r for a rest; a chord joins pitches with +  (C4+E4+G4)
  duration  w whole, h half, q quarter, e eighth; a trailing . adds a dot
  finger    1-5, one per chord note joined with +  (C4+E4+G4h:1+3+5)
Bars are separated by |.  An empty hand gets whole-bar rests.
"""
import json, os, re
from xml.sax.saxutils import escape

DIV = 4                                   # divisions per quarter note
DUR = {'w': 16, 'h': 8, 'q': 4, 'e': 2}
TYPE = {'w': 'whole', 'h': 'half', 'q': 'quarter', 'e': 'eighth'}
TOKEN = re.compile(r'^(?P<p>r|[A-G][#b]?\d(?:\+[A-G][#b]?\d)*)(?P<d>[whqe])(?P<dot>\.)?(?::(?P<f>[1-5](?:\+[1-5])*))?$')


def notes_xml(bar, staff, voice, beats):
    out, total = [], 0
    if not bar.strip():
        return [f'<note><rest measure="yes"/><duration>{beats * DIV}</duration><voice>{voice}</voice><staff>{staff}</staff></note>'], beats * DIV
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
            tech = f'<notations><technical><fingering placement="{place}">{f}</fingering></technical></notations>' if f else ''
            chord = '<chord/>' if k else ''
            out.append(f'<note>{chord}<pitch><step>{step}</step>{alter}<octave>{octave}</octave></pitch><duration>{d}</duration>'
                       f'<voice>{voice}</voice><type>{TYPE[m["d"]]}</type>{dot}<staff>{staff}</staff>{tech}</note>')
    return out, total


def score(title, rh, lh, bpm, time=(4, 4), fifths=0, composer='Traditional'):
    rbars, lbars = [b.strip() for b in rh.split('|')], [b.strip() for b in lh.split('|')]
    n = max(len(rbars), len(lbars))
    rbars += [''] * (n - len(rbars)); lbars += [''] * (n - len(lbars))
    beats = time[0] * 4 // time[1]
    measures = []
    for i, (r, l) in enumerate(zip(rbars, lbars)):
        rx, rt = notes_xml(r, 1, 1, beats)
        lx, lt = notes_xml(l, 2, 5, beats)
        assert rt == beats * DIV, f'{title}: bar {i + 1} right hand has {rt / DIV} beats'
        assert lt == beats * DIV, f'{title}: bar {i + 1} left hand has {lt / DIV} beats'
        attrs = ''
        if i == 0:
            attrs = (f'<attributes><divisions>{DIV}</divisions><key><fifths>{fifths}</fifths></key>'
                     f'<time><beats>{time[0]}</beats><beat-type>{time[1]}</beat-type></time><staves>2</staves>'
                     '<clef number="1"><sign>G</sign><line>2</line></clef><clef number="2"><sign>F</sign><line>4</line></clef></attributes>'
                     f'<direction placement="above"><direction-type><metronome><beat-unit>quarter</beat-unit><per-minute>{bpm}</per-minute>'
                     f'</metronome></direction-type><staff>1</staff><sound tempo="{bpm}"/></direction>')
        end = '<barline location="right"><bar-style>light-heavy</bar-style></barline>' if i == n - 1 else ''
        measures.append(f'<measure number="{i + 1}">{attrs}{"".join(rx)}<backup><duration>{beats * DIV}</duration></backup>{"".join(lx)}{end}</measure>')
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
C_ARP, G_ARP = up8('C3 G3 E3 G3 C3 G3 E3 G3', '5 1 3 1 5 1 3 1'), up8('B2 G3 D3 G3 B2 G3 D3 G3', '5 1 3 1 5 1 3 1')

LEVELS = ['First steps', 'Left hand and rhythm', 'Hands together', 'Scales and the thumb', 'Chords and accompaniment']

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
]

if __name__ == '__main__':
    root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'lessons')
    os.makedirs(root, exist_ok=True)
    course = {'levels': LEVELS, 'lessons': []}
    for n, L in enumerate(LESSONS, 1):
        fname = f'{n:02d}-{L["id"]}.musicxml'
        xml = score(L['title'], L['rh'], L['lh'], L['bpm'], fifths=L.get('fifths', 0), composer=L.get('composer', 'Traditional'))
        with open(os.path.join(root, fname), 'w', encoding='utf-8', newline='\n') as f:
            f.write(xml)
        course['lessons'].append({k: L[k] for k in ('id', 'level', 'title', 'hands', 'bpm', 'wait', 'learn', 'tips')} | {'file': fname})
    with open(os.path.join(root, 'lessons.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(course, f, ensure_ascii=False, indent=1)
    print(f'{len(LESSONS)} lessons written to {os.path.normpath(root)}')
