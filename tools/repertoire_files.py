"""Free MusicXML scores (tools/sources/musicxml/), added to the course as they are.

They are public-domain music supplied as MusicXML by their arrangers (mostly MuseScore.com users, who share them freely).
Scores with extra empty staves are reduced to two by tools/mxl_import.py; titles and composers are set here.
"""

MS = 'Public domain music; free MusicXML arrangement from MuseScore.com'
SAO = 'Public domain music; free MusicXML from the Sao Mai Center for the Blind'
PETZOLD = 'Christian Petzold (Notebook for Anna Magdalena Bach)'


def score_file(id, mxl, level, title, composer, bpm, wait, license, learn, tips):
    return dict(id=id, mxl=mxl, level=level, kind='piece', title=title, composer=composer, hands='both', bpm=bpm, wait=wait,
                license=license, learn=learn, tips=tips)


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
]
