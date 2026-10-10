"""Free MusicXML scores (tools/sources/musicxml/), added to the course as they are.

They are public-domain music supplied as MusicXML by their arrangers (mostly MuseScore.com users, who share them freely).
Scores with extra empty staves are reduced to two by tools/mxl_import.py; titles and composers are set here.
"""

MS = 'Public domain music; free MusicXML arrangement from MuseScore.com'
SAO = 'Public domain music; free MusicXML from the Sao Mai Center for the Blind'
PETZOLD = 'Christian Petzold (Notebook for Anna Magdalena Bach)'


def score_file(id, mxl, level, title, composer, bpm, wait, license, learn, tips, hands='both', mode='auto'):
    return dict(id=id, mxl=mxl, level=level, kind='piece', title=title, composer=composer, hands=hands, bpm=bpm, wait=wait,
                license=license, learn=learn, tips=tips, mode=mode)


MUSESCORE = [
    score_file('telemann-andante', 'telemann-andante-gm.mxl', 2, 'Andante in G minor', 'Georg Philipp Telemann', 68, 45, SAO,
               'A calm Baroque andante in G minor (two flats) in 2/4: a singing right hand over a steady left hand.',
               ['Two flats: B♭ and E♭.', 'Keep the left hand quiet so the tune sings.']),
    score_file('anh114-b', 'anh114-b.mxl', 3, 'Minuet in G (BWV Anh. 114), second edition', PETZOLD, 100, 60, MS,
               'Another edition of the famous Minuet in G. Compare it with the first one: notes, phrasing and bass are slightly different.',
               ['Shape each four-bar phrase.', 'Count one gentle beat per bar.']),
    score_file('anh114-c', 'anh114-c.mxl', 3, 'Minuet in G (BWV Anh. 114), third edition', PETZOLD, 100, 60, MS,
               'A third edition of the Minuet in G, a good one to play after the other two.',
               ['Keep the left hand lighter than the right.', 'Lift a little between phrases.']),
    score_file('anh115-b', 'anh115-b.mxl', 3, 'Minuet in G minor (BWV Anh. 115), with fingering', PETZOLD, 100, 60, MS,
               "The G minor minuet, in an edition with finger numbers written in. Follow them and compare with the app's suggestions.",
               ['Two flats: B♭ and E♭.', 'Play the minor-key tune smoothly.']),
    score_file('greensleeves-easy', 'greensleeves-easy.mxl', 3, 'Greensleeves (easy arrangement)', 'Traditional (English)', 100, 60, MS,
               'A longer arrangement of the old English tune in 3/4, with fingering.',
               ['Feel the swing of three beats in a bar.', 'Follow the fingering written in the score.']),
    score_file('canon-easy', 'canon-easy.mxl', 4, 'Canon in D (easy)', 'Johann Pachelbel', 72, 50, MS,
               'The famous Pachelbel progression in an easy version, with fingering. The bass pattern repeats while the melody grows.',
               ['Two sharps: F♯ and C♯.', 'Listen for the bass pattern that repeats all the time.']),
    score_file('fur-elise-beginner', 'fur-elise-beginner.mxl', 4, 'Für Elise (beginner version)', 'Ludwig van Beethoven', 60, 40, MS,
               "A longer version of Beethoven's Für Elise in 3/8, simplified for beginners.",
               ['Rock gently between E and D♯ with fingers 5 and 4.', 'Practise the hand changes slowly in Wait for me.']),
    score_file('swan-lake', 'swan-lake.mxl', 4, 'Swan Lake theme', 'Pyotr Ilyich Tchaikovsky', 80, 55, MS,
               'The sweeping main theme from the ballet, in D major (F♯ and C♯).',
               ['Make the long notes sing.', 'Let the left-hand chords support the tune without covering it.']),
    score_file('clair-de-lune-easy', 'clair-de-lune-easy.mxl', 5, 'Clair de lune (easy)', 'Claude Debussy', 60, 40, MS,
               "The opening of Debussy's gentle piece, in 9/8: three groups of three eighth notes in every bar.",
               ['Count "1-2-3, 2-2-3, 3-2-3".', 'Play softly and let the notes flow.']),
    score_file('beethoven-5', 'beethoven-5.mxl', 5, 'Symphony No. 5 (easy piano)', 'Ludwig van Beethoven', 100, 60, MS,
               'The most famous four notes in music, in an easy piano arrangement. Play the short-short-short-long motif with power.',
               ['The famous opening: three short notes and one long.', 'Pay attention to the rests: they are part of the rhythm.']),
    score_file('blue-danube', 'blue-danube.mxl', 5, 'The Blue Danube', 'Johann Strauss II', 100, 60, MS,
               'The best-known waltz of Johann Strauss, with fingering. A strong beat 1 and two light beats in each bar.',
               ['Play the bass note firmly and the chords lightly: "oom-pah-pah".', 'Follow the fingering written in the score.']),
    score_file('gymnopedie-1', 'gymnopedie-1.mxl', 6, 'Gymnopédie No. 1', 'Erik Satie', 60, 40, MS,
               'A slow, floating waltz in D major (2 sharps). The left hand alternates a low bass with a chord; the right hand sings above it.',
               ['Play the bass note, then the chord, evenly.', 'Keep it quiet and unhurried.']),
    score_file('le-cygne', 'le-cygne.mxl', 6, 'The Swan (Le Cygne)', 'Camille Saint-Saëns', 80, 50, MS,
               'The cello solo from The Carnival of the Animals as a piano piece, with fingering: a flowing melody over rolling broken chords.',
               ['Keep the left-hand broken chords smooth and even.', 'Shape the long melody like a singer.']),
    score_file('entertainer', 'entertainer.mxl', 6, 'The Entertainer', 'Scott Joplin', 80, 55, MS,
               "Joplin's ragtime classic, with fingering. The right hand is syncopated over a steady \"oom-pah\" left hand.",
               ['Keep the left hand steady like a metronome.', 'Practise the syncopated right hand alone first.']),
    score_file('chopin-waltz-am', 'chopin-waltz-am.mxl', 6, 'Waltz in A minor (B. 150)', 'Frédéric Chopin', 100, 60, MS,
               'A wistful posthumous waltz by Chopin, with fingering: a singing melody over an "oom-pah-pah" left hand.',
               ['Play beat 1 of the left hand a little stronger.', 'Follow the fingering written in the score.']),
    score_file('chopin-prelude-4', 'chopin-prelude-4.mxl', 7, 'Prelude in E minor, Op. 28 No. 4', 'Frédéric Chopin', 50, 36, MS,
               'A slow, deeply expressive prelude: a mournful melody over repeated chords that slowly change.',
               ['Practise the left-hand chords alone until they are even and quiet.', 'Let the melody breathe above them.']),
    score_file('prelude-846', 'prelude-846.mxl', 7, 'Prelude in C major (BWV 846)', 'Johann Sebastian Bach', 66, 45, MS,
               'The first prelude of the Well-Tempered Clavier: broken chords in an even flow.',
               ['Keep every note the same length and volume.', 'Listen to how the harmony changes bar by bar.']),
    score_file('prelude-999-c', 'prelude-999-c-minor.mxl', 7, 'Prelude in C minor (BWV 999)', 'Johann Sebastian Bach', 66, 45, MS,
               'The lute prelude in its original key, C minor (three flats): steady broken chords in 3/4.',
               ['Three flats: B♭, E♭ and A♭.', 'Keep the broken chords perfectly even.']),
    score_file('passacaglia', 'passacaglia.mxl', 7, 'Passacaglia (Handel-Halvorsen), easy version', 'Georg Friedrich Handel / Johan Halvorsen', 90, 60, MS,
               'A long, brilliant theme-and-variations piece in an easy version. The same harmonic pattern returns again and again with new figures.',
               ['Learn it a few bars at a time with Loop.', 'Notice the repeated pattern underneath.']),
    score_file('ode-kids', 'ode-kids.mxl', 2, 'Ode to Joy (piano for kids)', 'Ludwig van Beethoven', 96, 60, MS,
               'Another easy setting of the Ode to Joy melody, for hands together.',
               ['Practise each hand alone first.', 'Keep the left hand steady while the right hand sings.']),
    score_file('mozart-minuet-k2', 'mozart-minuet-k2.mxl', 3, 'Minuet in F, K. 2', 'Wolfgang Amadeus Mozart', 100, 60, MS,
               'One of the first pieces Mozart wrote, at the age of five. A graceful minuet in F major (one flat, B♭).',
               ['Play it lightly and with a gentle lilt on beat 1.', 'Every B is B♭ in this key.']),
    score_file('first-noel', 'first-noel.mxl', 3, 'The First Noel', 'Traditional (English carol)', 90, 60, MS,
               'The Christmas carol with its words under the melody, in 3/4, with a simple left-hand accompaniment.',
               ['Sing the words as you play to feel the phrases.', 'Count three beats in each bar.']),
    score_file('canon-in-c', 'canon-in-c.mxl', 5, 'Canon in C', 'Johann Pachelbel (arr. Iori Yagami)', 72, 50, MS,
               "Pachelbel's Canon in the key of C: the same eight-chord pattern in the bass while the right hand builds up the melody.",
               ['Listen for the bass pattern that repeats all the time.', 'Learn a few bars at a time with Repeat bars.']),
    score_file('chopin-nocturne-9-2', 'chopin-nocturne-9-2.mxl', 5, 'Nocturne in E-flat, Op. 9 No. 2 (easy)', 'Frédéric Chopin', 60, 40, MS,
               'The most famous nocturne in an easy piano version: a singing right hand over a flowing left hand, in E♭ major (three flats).',
               ['Three flats: B♭, E♭ and A♭.', 'Play the melody like a singer, with a flowing left hand underneath.']),
    score_file('mozart-symphony-40', 'mozart-symphony-40.mxl', 5, 'Symphony No. 40, theme (easy piano)', 'Wolfgang Amadeus Mozart', 100, 60, MS,
               "The restless opening theme of Mozart's great G minor symphony, in an easy piano arrangement (two flats).",
               ['Two flats: B♭ and E♭.', 'Keep the left-hand chords light and steady.']),
    score_file('chopin-prelude-7', 'chopin-prelude-7.mxl', 6, 'Prelude in A major, Op. 28 No. 7', 'Frédéric Chopin', 66, 45, MS,
               'A tiny gem of 16 bars in A major (three sharps): a dance-like melody in dotted rhythm.',
               ['Three sharps: F♯, C♯ and G♯.', 'Play the dotted rhythms lightly and exactly.']),
]


# Technical studies: Hanon's exercises 1-30, condensed (the first and the last bar of each exercise, each hand an octave apart).
HANON = score_file('hanon-1-30', 'hanon-1-30.mxl', 4, 'Hanon exercises 1-30 (condensed)', 'Charles-Louis Hanon', 80, 50, MS,
                   'The first and last bar of the "Virtuoso Pianist" exercises by Hanon, 1-30: the same finger patterns move up the keyboard. Both hands play together, an octave apart. Practise slowly and evenly, then speed up gradually.',
                   ['Curve your fingers and keep the hand still: only the fingers move.', 'Start slowly with Wait for me, then build up the tempo.', 'Each bar of sixteenth notes should sound perfectly even.'])
HANON['kind'] = 'technique'
MUSESCORE.append(HANON)


# ---------- more free scores: chants, a folk song and Chopin nocturnes ----------
FREE = 'Public domain music; free MusicXML score'
CPDL = 'Public domain music; edition freely distributable (Choral Public Domain Library, cpdl.org)'
CPDL_BY = "Public domain music; edition CC BY 4.0, (c) 2019 Freshman Chorus of St. John's College of Annapolis, via the Choral Public Domain Library (cpdl.org)"
CHANT = 'Gregorian chant'
CHANT_TIPS = ['Chant has no strict beat: let the notes flow in a gentle, even pace.', 'Play legato, as if singing one long breath.']

MUSESCORE += [
    score_file('regina-coeli', 'regina-coeli.mxl', 1, 'Regina caeli (Gregorian chant)', CHANT, 60, 45, FREE,
               'The Easter antiphon "Regina caeli, laetare, alleluia": a short chant line for the right hand, with the words under the notes.',
               CHANT_TIPS, hands='right', mode='melody'),
    score_file('veni-creator', 'veni-creator.mxl', 1, 'Veni Creator Spiritus (Gregorian chant)', 'Gregorian chant (words: Rabanus Maurus)', 60, 45, FREE,
               'The Pentecost hymn in its chant melody (mode 7, Mixolydian): a flowing line over a small range, right hand alone.',
               CHANT_TIPS, hands='right', mode='melody'),
    score_file('ave-verum', 'ave-verum.mxl', 2, 'Ave verum corpus (Gregorian chant)', CHANT, 65, 45, FREE,
               'The Eucharistic hymn as a chant melody, for the right hand, with the Latin words under the notes.',
               CHANT_TIPS, hands='right', mode='melody'),
    score_file('veni-sancte', 'veni-sancte.mxl', 2, 'Veni Sancte Spiritus (Gregorian chant)', 'Stephen Langton (d. 1228), chant melody', 60, 45, CPDL_BY,
               'The "Golden Sequence" of Pentecost in the Dorian mode: a long right-hand line, several notes to a syllable.',
               CHANT_TIPS, hands='right', mode='melody'),
    score_file('our-father', 'our-father.mxl', 2, 'Our Father (Gregorian chant, left hand)', 'Anonymous chant', 60, 45, CPDL,
               'A chant in A major (three sharps) for the left hand alone, in the bass clef: a good way to read the lower staff.',
               ['Three sharps: F♯, C♯ and G♯.', 'Left hand: the thumb (1) is on the highest note.'] + CHANT_TIPS[:1], hands='left', mode='melody'),
    score_file('adoro-te', 'adoro-te.mxl', 2, 'Adoro te devote (Gregorian chant)', 'Gregorian chant (words: Thomas Aquinas)', 70, 50, FREE,
               'The hymn of St Thomas Aquinas as a chant: a longer right-hand melody with the Latin words, in long bars of eight beats.',
               ['Count in quarter notes; the bars are long (8 beats).'] + CHANT_TIPS, hands='right', mode='melody'),
    score_file('arirang', 'arirang.mxl', 3, 'Arirang (Korean folk song, easy piano)', 'Traditional Korean (arr. Eugene Sia)', 80, 55, FREE,
               'The best-loved Korean folk song, in 3/4 with a gentle left-hand accompaniment and the words under the melody.',
               ['One sharp: F♯.', 'Sing "Arirang, arirang, arariyo" as you play to feel the phrases.']),
    score_file('sanctus', 'sanctus.mxl', 4, 'Sanctus (Kyriale XVII, Gregorian chant)', 'Gregorian chant', 80, 55, FREE,
               'The Sanctus of Mass XVII for the right hand in E major (four sharps), with the Latin words under the notes.',
               ['Four sharps: F♯, C♯, G♯ and D♯.', 'Chant has no strict beat: keep the notes flowing evenly.'], hands='right'),
    score_file('chopin-nocturne-9-2-pedal', 'chopin-nocturne-9-2-pedal.mxl', 5, 'Nocturne in E-flat, Op. 9 No. 2 (easy, with pedal marks)', 'Frédéric Chopin', 60, 40, FREE,
               'Another easy arrangement of the famous nocturne, with the dynamics and the pedal marks written in (Ped. and ✱ under the bass staff).',
               ['Press the pedal where "Ped." is shown and lift at ✱.', 'Three flats: B♭, E♭ and A♭.']),
    score_file('chopin-nocturne-9-2-fuller', 'chopin-nocturne-9-2-fuller.mxl', 7, 'Nocturne in E-flat, Op. 9 No. 2 (fuller version)', 'Frédéric Chopin', 60, 40, FREE,
               'A fuller, easier-than-the-original version of the whole nocturne: 65 bars with the ornamented return of the tune.',
               ['Practise the left-hand broken chords alone until they are smooth.', 'Let the melody sing above them.']),
    score_file('chopin-nocturne-15', 'chopin-nocturne-15.mxl', 6, 'Nocturne in E minor (file title: Nocturne No. 15)', 'Frédéric Chopin', 60, 40, FREE,
               'A slow, plaintive nocturne in E minor (one sharp): a simple melody over a repeating left-hand pattern.',
               ['One sharp: F♯.', 'Keep the left-hand chords soft and even.']),
    score_file('chopin-nocturne-20-melody', 'chopin-nocturne-20-melody.mxl', 6, 'Nocturne No. 20 in C-sharp minor, melody', 'Frédéric Chopin', 65, 45, FREE,
               'The melody of the posthumous nocturne ("Lento con gran espressione") for the right hand alone, with its dynamics, runs and ornaments.',
               ['Practise the fast runs slowly in Wait for me first.', 'Shape the long phrases with the dynamics in the score.'], hands='right', mode='melody'),
    score_file('chopin-nocturne-20-reminiscence', 'chopin-nocturne-20-reminiscence.mxl', 7, 'Nocturne No. 20, "Reminiscence" (arranged in D minor)', 'Frédéric Chopin', 50, 36, FREE,
               'The posthumous nocturne for two hands, in a transposition to D minor (one flat), with its dynamics.',
               ['One flat: B♭.', 'Learn each hand alone before putting them together.']),
    score_file('chopin-nocturne-13', 'chopin-nocturne-13.mxl', 7, 'Nocturne in C minor, Op. 48 No. 1', 'Frédéric Chopin (arr. G. Lees)', 52, 36, FREE,
               'A dramatic nocturne in C minor (three flats) as a lead sheet: the melody, with chords in a few places, and chord symbols above the staff. The notes from middle C up are for the right hand, the lower ones for the left.',
               ['Three flats: B♭, E♭ and A♭.', 'Add your own left-hand chords from the chord symbols once the melody is secure.'], mode='pitch'),
]
