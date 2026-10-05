"""Classical pieces taken from the Mutopia Project (https://www.mutopiaproject.org), converted from its MIDI files
(tools/sources/mutopia/) by midi_to_musicxml.py. Ornaments shorter than a 32nd note are left out and repeats
are played through once, as in the MIDI. Licences are those of the Mutopia editions: Public Domain, or
Creative Commons Attribution-ShareAlike for the Schumann pieces (our MusicXML versions keep that licence).
"""

MUTOPIA = 'https://www.mutopiaproject.org/cgibin/piece-info.cgi?id='
PD = 'Public Domain'
BYSA25, BYSA30 = 'CC BY-SA 2.5', 'CC BY-SA 3.0'
ANNA = 'Notebook for Anna Magdalena Bach'


def piece(id, src, level, title, composer, bpm, wait, license, learn, tips, pickup=0.0):
    return dict(id=id, src=src, level=level, kind='piece', title=title, composer=composer, hands='both', bpm=bpm, wait=wait,
                pickup=pickup, license=license, url=MUTOPIA + src.split('-')[0], learn=learn, tips=tips)


REPERTOIRE = [
    # ---------- Level 1 ----------
    piece('anh113', '74-0.mid', 2, 'Minuet in F (BWV Anh. 113)', ANNA, 100, 60, PD,
          'A short Baroque minuet from the notebook J. S. Bach kept for his wife, Anna Magdalena. Two independent lines: the left hand is a real bass melody, not just accompaniment.',
          ['Learn each hand alone first: both are melodies.', 'Feel the minuet in one gentle beat per bar.']),
    piece('anh120', '1612-0.mid', 2, 'Minuet in A minor (BWV Anh. 120)', ANNA, 90, 55, PD,
          'A minor-key minuet from the Anna Magdalena notebook. It begins with a pickup on beat 3.',
          ['Count "3 | 1 2 3" to start.', 'Keep the eighth notes even and light.'], pickup=1.0),
    # ---------- Level 2 ----------
    piece('anh114', '75-0.mid', 3, 'Minuet in G (BWV Anh. 114)', 'Christian Petzold (Notebook for Anna Magdalena Bach)', 110, 60, PD,
          'The famous Minuet in G, complete with its original left hand. Long a favourite first "real" classical piece.',
          ['The left hand moves in long notes under the dancing right hand.', 'Shape each four-bar phrase like a sentence.']),
    piece('anh115', '76-0.mid', 3, 'Minuet in G minor (BWV Anh. 115)', 'Christian Petzold (Notebook for Anna Magdalena Bach)', 110, 60, PD,
          'The companion piece to the Minuet in G: the same dance in a darker minor key.',
          ['Watch for F♯, the raised 7th of G minor.', 'Play the quarter notes slightly detached, the eighth notes smoothly.']),
    piece('aria-515', '78-0.mid', 3, 'Aria in D minor (BWV 515)', ANNA, 90, 55, PD,
          'A short, songlike aria from the Anna Magdalena notebook.',
          ['Sing the melody in your head as you play it.', 'Let the bass support without covering the tune.']),
    piece('melody-68-1', '647-0.mid', 3, 'Melody, Op. 68 No. 1', 'Robert Schumann (Album for the Young)', 70, 45, BYSA25,
          'The first piece of Schumann\'s Album for the Young: a singing melody over a flowing left hand.',
          ['Bring out the top line; keep the accompaniment soft.', 'Join the melody notes smoothly (legato).']),
    piece('march-68-2', '650-0.mid', 3, "Soldier's March, Op. 68 No. 2", 'Robert Schumann (Album for the Young)', 100, 60, BYSA25,
          'A crisp little march with chords in both hands. A steady beat is everything here.',
          ['Play the chords short and bright, exactly together.', 'March: never rush.']),
    # ---------- Level 3 ----------
    piece('anh116', '77-0.mid', 4, 'Minuet in G (BWV Anh. 116)', ANNA, 110, 60, PD,
          'Another minuet from the Anna Magdalena notebook, longer and more varied.',
          ['Practise the left hand alone until it is secure.', 'A few ornaments are left out; you can add them later.']),
    piece('anh118', '1014-0.mid', 4, 'Minuet in B♭ (BWV Anh. 118)', ANNA, 100, 60, PD,
          'A minuet in B♭ major (two flats).', ['B♭ and E♭ throughout.', 'Keep both hands equally clear.']),
    piece('anh121', '1613-0.mid', 4, 'Minuet in C minor (BWV Anh. 121)', ANNA, 100, 60, PD,
          'A serious, expressive minuet in C minor (three flats).', ['Watch for B♮, the raised 7th.', 'Let the bass line lead the harmony.']),
    piece('polonaise-117a', '1013-0.mid', 4, 'Polonaise in F (BWV Anh. 117a)', ANNA, 80, 50, PD,
          'A stately Polish dance in 3/4. Short ornaments are left out.', ['A polonaise is proud and steady, not fast.']),
    piece('humming-68-3', '651-0.mid', 4, 'Humming Song, Op. 68 No. 3', 'Robert Schumann (Album for the Young)', 60, 40, BYSA30,
          'A gentle song in which the melody passes between the hands.', ['Follow the tune as it moves from hand to hand.']),
    piece('chorale-68-4', '782-0.mid', 4, 'Chorale, Op. 68 No. 4', 'Robert Schumann (Album for the Young)', 80, 50, BYSA25,
          'A hymn in four parts: practise playing full chords smoothly and evenly.', ['Listen for the top voice in every chord.', 'Connect the chords without blurring them.']),
    piece('little-piece-68-5', '653-0.mid', 4, 'Little Piece, Op. 68 No. 5', 'Robert Schumann (Album for the Young)', 68, 45, BYSA25,
          'A short, flowing piece with a melody over steady accompaniment.', ['It starts with a long pickup: count it carefully.'], pickup=3.0),
    piece('morning-prayer', '2032-0.mid', 4, 'Morning Prayer, Op. 39 No. 1', 'Pyotr Ilyich Tchaikovsky (Album for the Young)', 60, 40, PD,
          'The opening piece of Tchaikovsky\'s Album for the Young: a quiet chorale in G major.', ['Play softly and very legato.', 'Hold every note its full length.']),
    # ---------- Level 4 ----------
    piece('orphan-68-6', '687-0.mid', 5, 'Poor Orphan Child, Op. 68 No. 6', 'Robert Schumann (Album for the Young)', 50, 35, BYSA25,
          'A sad little melody in A minor over chords.', ['Make the melody sing above the chords.'], pickup=0.5),
    piece('horseman-68-8', '655-0.mid', 5, 'The Wild Horseman, Op. 68 No. 8', 'Robert Schumann (Album for the Young)', 130, 70, BYSA25,
          'A galloping piece in 6/8 where the melody jumps from the right hand to the left.', ['Keep the gallop steady: "long-short".', 'Play the accompanying chords lightly.'], pickup=0.5),
    piece('farmer-68-10', '659-0.mid', 5, 'The Happy Farmer, Op. 68 No. 10', 'Robert Schumann (Album for the Young)', 90, 55, BYSA25,
          'The melody is in the left hand while the right hand plays chords: a classic for training the left hand to sing.', ['Bring out the left-hand tune.', 'Keep the right-hand chords short and soft.'], pickup=0.5),
    piece('old-french-song', '2080-0.mid', 5, 'Old French Song, Op. 39 No. 16', 'Pyotr Ilyich Tchaikovsky (Album for the Young)', 70, 45, PD,
          'A wistful melody in G minor over a smooth accompaniment.', ['Shape the long phrases.', 'Use the tied notes to let the melody breathe.'], pickup=0.5),
    piece('handel-sonatina', '98-0.mid', 5, 'Sonatina in B♭ (HWV 585)', 'George Frideric Handel', 100, 60, PD,
          'A lively Baroque sonatina with busy lines in both hands.', ['Practise slowly and hands separately first.', 'Aim for crisp, even sixteenths.']),
    piece('candeur', '202-0.mid', 5, 'Candour (La Candeur), Op. 100 No. 1', 'Friedrich Burgmüller (25 Easy Studies)', 120, 70, PD,
          'The first of Burgmüller\'s 25 Easy Studies: a smooth melody over gentle broken chords.', ['Keep the melody legato and singing.']),
    piece('arabesque', '203-0.mid', 5, 'Arabesque, Op. 100 No. 2', 'Friedrich Burgmüller (25 Easy Studies)', 120, 70, PD,
          'A favourite study with quick five-note runs in A minor.', ['Practise the runs slowly; keep the fingers close to the keys.']),
    piece('pastorale', '218-0.mid', 5, 'Pastorale, Op. 100 No. 3', 'Friedrich Burgmüller (25 Easy Studies)', 90, 55, PD,
          'A peaceful country scene in 6/8. Short ornaments are left out.', ['Rock gently in two beats per bar.']),
    piece('clementi-36-1-i', '804-2.mid', 5, 'Sonatina in C, Op. 36 No. 1: I. Spiritoso', 'Muzio Clementi', 120, 70, PD,
          'The first movement of perhaps the most famous sonatina of all: scales, broken chords and a bright, clear style.', ['Play the scales evenly and crisply.', 'Feel the music in two big beats per bar.']),
    piece('clementi-36-1-ii', '804-0.mid', 5, 'Sonatina in C, Op. 36 No. 1: II. Andante', 'Muzio Clementi', 70, 45, PD,
          'The slow middle movement, in F major: a gentle, singing melody. Short ornaments are left out.', ['Make the melody sing; keep the left hand quiet.']),
    piece('clementi-36-1-iii', '804-1.mid', 5, 'Sonatina in C, Op. 36 No. 1: III. Vivace', 'Muzio Clementi', 100, 60, PD,
          'The lively finale in 3/8.', ['Feel one beat per bar once it is secure.', 'Keep the repeated notes light.']),
]
