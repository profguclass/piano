"""Where each piece sits in the course, based on the RCM Piano Syllabus, 2022 Edition (piano-syllabus-2022-edition.pdf).

1. SYLLABUS: pieces that the syllabus itself lists, at the level of the list they are on (repertoire Lists A-C, "Complete
   Repertoire" and etudes). The level follows the syllabus exactly.
2. COMPARISON: pieces the syllabus does not list. They are placed next to listed pieces of similar difficulty (the same composer's
   or collection's pieces, or pieces of the same kind), using the estimate in tools/difficulty.py as a second opinion.
   The reason is given for each.

Level numbers used by the course: 0 Preparatory A, 1 Preparatory B, 2 Level 1 ... 11 Level 10.
Inside a level, make_lessons.py orders the pieces from the easiest to the hardest by the same estimate.
"""
LEVEL_INDEX = {'Preparatory A': 0, 'Preparatory B': 1, 'Level 1': 2, 'Level 2': 3, 'Level 3': 4, 'Level 4': 5, 'Level 5': 6, 'Level 6': 7, 'Level 7': 8, 'Level 8': 9, 'Level 9': 10, 'Level 10': 11}

# id: (level the syllabus gives it, where in the syllabus)
SYLLABUS = {
    'minuet-f-lmozart': ('Preparatory B', 'List A: Minuet in F Major, attr. L. Mozart (Notebook for Nannerl)'),
    'hassler-minuet': ('Level 1', 'List A: Minuet in C Major, op. 38, no. 4 (Hässler)'),
    'telemann-andante': ('Level 1', 'List A: Andante in G Minor (Telemann)'),
    'chorale-514': ('Level 1', 'Complete list: Chorale, BWV 514 (Notenbuch der Anna Magdalena Bach)'),
    'aria-f-131': ('Level 1', 'Complete list: Aria in F Major, BWV Anh. 131'),
    'mozart-minuet-k2': ('Level 1', 'Complete list: Minuet in F Major, K 2 (W.A. Mozart)'),
    'aria-515': ('Level 2', 'Complete list: Aria in D Minor, BWV 515'),
    'march-68-2': ('Level 2', 'List B: Soldier\'s March, op. 68, no. 2 (Schumann)'),
    'anh114': ('Level 3', 'List A: Minuet in G Major, BWV Anh. 114 (Petzold)'),
    'anh114-b': ('Level 3', 'List A: Minuet in G Major, BWV Anh. 114 (Petzold)'),
    'anh114-c': ('Level 3', 'List A: Minuet in G Major, BWV Anh. 114 (Petzold)'),
    'anh115': ('Level 3', 'List A: Minuet in G Minor, BWV Anh. 115 (Petzold)'),
    'anh115-b': ('Level 3', 'List A: Minuet in G Minor, BWV Anh. 115 (Petzold)'),
    'melody-68-1': ('Level 3', 'Complete list: Melody, op. 68, no. 1 (Schumann)'),
    'morning-prayer': ('Level 3', 'Complete list: Morning Prayer, op. 39, no. 1 (Tchaikovsky)'),
    'clementi-36-1-i': ('Level 3', 'List B: Sonatina in C Major, op. 36, no. 1: I (Clementi)'),
    'arabesque': ('Level 3', 'Etudes: Arabesque, op. 100, no. 2 (Burgmüller)'),
    'anh113': ('Level 4', 'Complete list: Minuet in F Major, BWV Anh. 113'),
    'anh116': ('Level 4', 'Complete list: Minuet in G Major, BWV Anh. 116'),
    'anh120': ('Level 4', 'Complete list: Minuet in A Minor, BWV Anh. 120'),
    'anh121': ('Level 4', 'Complete list: Minuet in C Minor, BWV Anh. 121'),
    'farmer-68-10': ('Level 4', 'List C: The Happy Farmer, op. 68, no. 10 (Schumann)'),
    'horseman-68-8': ('Level 4', 'Complete list: The Wild Horseman, op. 68, no. 8 (Schumann)'),
    'petite-etude-68-14': ('Level 4', 'Complete list: Little Study, op. 68, no. 14 (Schumann)'),
    'first-loss-68-16': ('Level 4', 'Complete list: The First Loss, op. 68, no. 16 (Schumann)'),
    'old-french-song': ('Level 4', 'Complete list: Old French Song, op. 39, no. 16 (Tchaikovsky)'),
    'ballade-burgmuller': ('Level 4', 'Etudes: Ballade, op. 100, no. 15 (Burgmüller)'),
    'handel-sonatina': ('Level 5', 'Complete list: Sonatina in B flat Major, HWV 585 (Handel)'),
    'chopin-waltz-am': ('Level 6', 'List C: Waltz in A Minor, op. posth., B 150 (Chopin)'),
    'prelude-999': ('Level 6', 'Complete list: Prelude in C Minor, BWV 999 (Bach; this edition is in D minor)'),
    'prelude-999-c': ('Level 6', 'Complete list: Prelude in C Minor, BWV 999 (Bach)'),
    'schumann-68-7': ('Level 5', 'Complete list: Hunting Song (no. 7), op. 68 (Schumann)'),
    'schumann-68-9': ('Level 5', 'Complete list: Little Folk Song (no. 9), op. 68 (Schumann)'),
    'schumann-68-11': ('Level 5', 'Complete list: Siciliano (no. 11), op. 68 (Schumann)'),
    'kuhlau-20-1-i': ('Level 6', 'Complete list: Sonatina in C Major, op. 20, no. 1: 1st movement (Kuhlau)'),
    'invention-1': ('Level 7', 'Complete list: Two-part Invention No. 1 in C Major, BWV 772'),
    'invention-4': ('Level 7', 'Complete list: Two-part Invention No. 4 in D Minor, BWV 775'),
    'invention-8': ('Level 7', 'Complete list: Two-part Invention No. 8 in F Major, BWV 779'),
    'grieg-album-leaf': ('Level 7', 'List C: Album Leaf, op. 12, no. 7 (Grieg)'),
    'invention-2': ('Level 8', 'Complete list: Two-part Invention No. 2 in C Minor, BWV 773'),
    'invention-3': ('Level 8', 'Complete list: Two-part Invention No. 3 in D Major, BWV 774'),
    'invention-5': ('Level 8', 'Complete list: Two-part Invention No. 5 in E flat Major, BWV 776'),
    'invention-6': ('Level 8', 'Complete list: Two-part Invention No. 6 in E Major, BWV 777'),
    'invention-7': ('Level 8', 'Complete list: Two-part Invention No. 7 in E Minor, BWV 778'),
    'invention-9': ('Level 8', 'Complete list: Two-part Invention No. 9 in F Minor, BWV 780'),
    'invention-10': ('Level 8', 'Complete list: Two-part Invention No. 10 in G Major, BWV 781'),
    'invention-11': ('Level 8', 'Complete list: Two-part Invention No. 11 in G Minor, BWV 782'),
    'duetto-f': ('Level 8', 'Complete list: Duetto in F Major, BWV 803'),
    'chopin-prelude-6': ('Level 8', 'Complete list: Prelude in B Minor, op. 28, no. 6 (Chopin)'),
    'chopin-prelude-9': ('Level 8', 'Complete list: Prelude in E Major, op. 28, no. 9 (Chopin)'),
    'gnossienne-3': ('Level 8', 'Complete list: Gnossienne No. 3 (Satie)'),
    'sinfonia-1': ('Level 9', 'Complete list: Sinfonia No. 1 in C Major, BWV 787'),
    'sinfonia-2': ('Level 9', 'Complete list: Sinfonia No. 2 in C Minor, BWV 788'),
    'sinfonia-3': ('Level 9', 'Complete list: Sinfonia No. 3 in D Major, BWV 789'),
    'sinfonia-4': ('Level 9', 'Complete list: Sinfonia No. 4 in D Minor, BWV 790'),
    'sinfonia-5': ('Level 9', 'Complete list: Sinfonia No. 5 in E flat Major, BWV 791'),
    'sinfonia-6': ('Level 9', 'Complete list: Sinfonia No. 6 in E Major, BWV 792'),
    'chopin-prelude-13': ('Level 9', 'Complete list: Prelude in F sharp Major, op. 28, no. 13 (Chopin)'),
    'chopin-prelude-15': ('Level 9', 'Complete list: Prelude in D flat Major, op. 28, no. 15 (Chopin)'),
    'chopin-mazurka-6-1': ('Level 9', 'Complete list: Mazurka in F sharp Minor, op. 6, no. 1 (Chopin)'),
    'chopin-nocturne-9-2-full': ('Level 9', 'Complete list: Nocturne in E flat Major, op. 9, no. 2 (Chopin)'),
    'wtc-fugue-1': ('Level 10', 'Complete list: Prelude and Fugue in C Major, BWV 846 (the fugue)'),
    'chopin-prelude-17': ('Level 10', 'Complete list: Prelude in A flat Major, op. 28, no. 17 (Chopin)'),
    'chopin-nocturne-9-1': ('Level 10', 'Complete list: Nocturne in B flat Minor, op. 9, no. 1 (Chopin)'),
    'clair-de-lune': ('Level 10', 'Complete list: Suite bergamasque, Clair de lune (no. 3) (Debussy)'),
    'troldhaugen': ('Level 10', 'Complete list: Wedding Day at Troldhaugen (no. 6), Lyric Pieces, op. 65 (Grieg)'),
    'humming-68-3': ('Level 6', 'Complete list: Trällerliedchen (Humming Song) (no. 3), op. 68 (Schumann)'),
    'foreign-lands': ('Level 6', 'List C: Of Foreign Lands and Peoples, op. 15, no. 1 (Schumann)'),
    'chopin-prelude-4': ('Level 7', 'Complete list: Prelude in E Minor, op. 28, no. 4 (Chopin)'),
    'chopin-nocturne-20-reminiscence': ('Level 9', 'Complete list: Nocturne in C sharp Minor, op. posth., B 49 (Chopin); this edition is arranged in D minor'),
    'prelude-846': ('Level 10', 'Complete list: Prelude and Fugue in C Major, BWV 846 (the prelude)'),
}

# id: (level, reason). Not listed in the syllabus's levels 1-6: placed by comparison with listed pieces.
COMPARISON = {
    # Schumann, Album for the Young: Melody (no. 1) is Level 3, Soldier's March (no. 2) Level 2, Happy Farmer (no. 10) Level 4
    'chorale-68-4': (4, 'next to Schumann Melody (no. 1), Level 3: slow four-part chords'),
    'little-piece-68-5': (4, 'next to Schumann Melody (no. 1), Level 3'),
    'orphan-68-6': (4, 'next to Schumann Melody (no. 1), Level 3: slow, with wide chords'),
    'reapers-song-68-18': (5, 'next to Schumann Wild Horseman (no. 8), Level 4: a lively march-like piece'),
    'may-68-13': (6, 'next to Schumann Hunting Song (no. 7), Level 5'),
    # Tchaikovsky, Album for the Young: Morning Prayer Level 3, Old French Song and Doll's Funeral Level 4, Polka Level 5
    'wooden-soldiers': (6, 'next to Tchaikovsky Polka (no. 10), Level 5: a march with chords in both hands'),
    # Bach, Notebook for Anna Magdalena Bach: the minuets Anh. 113, 116, 120, 121 and the Polonaise Anh. 128 are Level 4
    'anh118': (5, 'next to the Anh. 113, 116, 120, 121 minuets, Level 4'),
    'polonaise-117a': (5, 'next to the Polonaise in D minor, BWV Anh. 128, Level 4'),
    'polonaise-117b': (5, 'next to the Polonaise in D minor, BWV Anh. 128, Level 4'),
    # Bach, Little Preludes: BWV 939 is Level 5, BWV 926, 934 and 941 are Level 6
    'prelude-924': (6, 'next to Little Prelude BWV 939, Level 5'),
    'prelude-928': (6, 'next to Little Prelude BWV 939, Level 5'),
    # Clementi, Sonatina op. 36 no. 1: only the first movement is on the list (Level 3)
    'clementi-36-1-ii': (5, 'the slow movement after the Level 3 first movement'),
    'clementi-36-1-iii': (6, 'the fast finale of the same sonatina; the finales of nos. 2 and 3 are Levels 4 and 5'),
    # Burgmüller, 25 Easy Studies op. 100: Arabesque (no. 2) is Level 3, Ballade (no. 15) Level 4, no. 21 Level 5
    'candeur': (4, 'next to Burgmüller Arabesque, Level 3: a flowing study with simple harmony'),
    'innocence': (4, 'next to Burgmüller Arabesque, Level 3: a flowing study with broken chords'),
    'progres': (5, 'a fast study of five-finger patterns, between Arabesque (Level 3) and Ballade (Level 4)'),
    'petite-reunion': (5, 'next to Burgmüller Ballade, Level 4'),
    'pastorale': (5, 'next to Burgmüller Ballade, Level 4: chords in 6/8'),
    'tendre-fleur': (5, 'next to Burgmüller Ballade, Level 4: a lyrical study'),
    'consolation': (5, 'next to Burgmüller Ballade, Level 4: arpeggios in the left hand'),
    'courant-limpide': (6, 'a fast, even study: more than Ballade (Level 4), near Harmony of the Angels (no. 21), Level 5'),
    'gracieuse': (6, 'near Burgmüller no. 21, Level 5: ornaments and light chords'),
    'bergeronnette': (6, 'near Burgmüller no. 21, Level 5: repeated notes at speed'),
    'adieu': (6, 'near Burgmüller no. 21, Level 5'),
    'douce-plainte': (6, 'near Burgmüller no. 21, Level 5: a lyrical study with chords'),
    'babillarde': (6, 'near Burgmüller no. 21, Level 5: fast and chattering'),
    'la-chasse': (6, 'near Burgmüller no. 21, Level 5: a lively hunting piece'),
    'inquietude': (7, 'the hardest of the set: a fast, restless study'),
    # simplified arrangements of famous pieces
    'swan-lake': (4, 'a simple tune over chords in two sharps'),
    'sonatina-c': (4, 'a short classical-style piece like the Level 3 sonatina movements'),
    'fur-elise': (4, 'the opening only, but fast sixteenth notes and hand changes'),
    'fur-elise-beginner': (5, 'the whole piece, simplified'),
    'canon-easy': (5, 'a repeating bass pattern under a growing melody'),
    'canon-in-c': (5, 'a repeating bass pattern under a growing melody'),
    'clair-de-lune-easy': (5, 'slow 9/8 in an easy version'),
    'blue-danube': (5, 'a waltz tune with an oom-pah-pah left hand'),
    'beethoven-5': (5, 'a short motif repeated in an easy arrangement'),
    'mozart-symphony-40': (5, 'a well-known theme in an easy arrangement'),
    'entertainer': (6, 'syncopation over a steady left hand, in an easy version'),
    'le-cygne': (6, 'a melody over rolling broken chords'),
    'chopin-nocturne-15': (6, 'slow, with a repeating left-hand pattern'),
    'chopin-nocturne-20-melody': (6, 'a single line, with fast runs and ornaments'),
    'chopin-nocturne-9-2': (6, 'an easy version of a famous nocturne (the original is above Level 6)'),
    'chopin-nocturne-9-2-pedal': (6, 'an easy version of a famous nocturne (the original is above Level 6)'),
    'passacaglia': (6, 'a long piece, but an easy version'),
    # beyond the Level 6 lists
    'chopin-prelude-7': (8, 'next to Prelude op. 28 no. 4 (Level 7): chords and dotted rhythms'),
    'chopin-nocturne-9-2-fuller': (8, 'an easier version of the Level 9 nocturne (op. 9, no. 2)'),
    'gymnopedie-1': (9, 'next to Satie Gnossienne no. 3 (Level 8): slow, but long, with wide chords and unusual harmony'),
    'chopin-nocturne-13': (10, 'not on the syllabus lists: a lead sheet of a dramatic nocturne with fast ornaments'),
    'kuhlau-20-1-ii': (7, 'the slow movement of the Level 6 sonatina'),
    'kuhlau-20-1-iii': (8, 'the rondo finale of the same sonatina, a step above its Level 6 first movement'),
    'greensleeves-easy': (3, 'a slow tune in 3/4 with a simple left hand'),
    'arirang': (3, 'a folk tune with a light accompaniment'),
    'first-noel': (3, 'a carol tune with a simple left hand'),
    'sanctus': (3, 'a single chant line, but in four sharps'),
    'waltz-am': (3, 'only eight bars of a simple oom-pah-pah waltz'),
    'nachtmusik': (3, 'short opening theme with simple chords'),
}

MOVES = {i: (LEVEL_INDEX[lv], 'RCM syllabus 2022, ' + lv + ': ' + where) for i, (lv, where) in SYLLABUS.items()}
MOVES |= {i: (lv, 'placed by comparison: ' + why) for i, (lv, why) in COMPARISON.items()}
