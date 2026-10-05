# piano

**Piano Reader** — open a MusicXML score, see it as sheet music, and practise with your digital piano.

**Open it:** https://profguclass.github.io/piano/

## Install on a tablet (Samsung / Android)
1. Open the link above in **Chrome**.
2. Tap **⋯ → Install app** (or Chrome menu → *Add to home screen → Install*).
3. Start it from the home-screen icon: it opens full screen, keeps the screen awake, and works offline.
The installed app and the web page are the same code — every update to this repo reaches both.

## Connect the piano
Plug the piano's **USB to Host** port into the tablet (USB-B → USB-C cable, or an OTG adapter), tap **Connect piano** once and allow MIDI.
After that the app reconnects by itself.
The notes the app plays (the other hand, Listen mode) then sound **on the piano itself**. To use the tablet speaker instead: ⋯ → *Sound from: Tablet*.

## Lessons
Tap **Lessons** for a 109-lesson course. Its levels and the parts of each level follow the
[RCM Piano Syllabus, 2022 edition](https://www.rcmusic.com/syllabi) (with its September 2026 errata), from **Preparatory A** to **Level 4**:

| | Technique | Pieces | Ear tests | Sight reading |
|---|---|---|---|---|
| **Preparatory A** | pentascales C, G, D, A minor (legato, staccato); triad sequence in C | Middle C, five-finger position, *Mary Had a Little Lamb*, left hand, *Hot Cross Buns*, *Au clair de la lune* | clapback, chords, playback | rhythm; two four-note melodies |
| **Preparatory B** | pentascales D, A, F, E minor, D minor; one-octave scales C, G, A minor; contrary motion; tonic triads | *Ode to Joy*, *Twinkle Twinkle*, *When the Saints*, *Row Your Boat*, *London Bridge*, *Jingle Bells* | clapback, chords, playback | rhythm; melody shared between the hands |
| **Level 1** | two-octave scales C, G, F; A, E, D minor (natural, harmonic); contrary motion 2 octaves; chromatic from C; tonic triads broken and solid | three chords, broken-chord *Ode to Joy*, *Happy Birthday*, *Silent Night*, *Greensleeves* | clapback, intervals (m3, M3), chords, playback | rhythm; four-bar melody in C, G, F, A minor |
| **Level 2** | two-octave scales G, F, B♭; E, D, G minor (harmonic, melodic); chromatic from G; tonic triads broken and solid | chord progression study, Pachelbel's *Canon*, *Eine kleine Nachtmusik*, *Für Elise* (opening) | clapback, intervals (m3, M3, P5), chords, playback | rhythm with rests; four-bar melody beyond five-finger position |
| **Level 3** | scales hands together D, F, B♭; B, D, G minor (harmonic, melodic); formula pattern D; chromatic from D; tonic triads two octaves broken and solid | Petzold *Minuet in G*, Sonatina in C (Classical style, Alberti bass) | clapback, intervals (m3, M3, P4, P5), chords, chord notes (root/third/fifth), playback | four-bar rhythm; four-bar passage hands together |
| **Level 4** | scales hands together D, A, B♭, E♭; B, G, C minor (harmonic, melodic); formula pattern C minor; chromatic from C; tonic triads hands together; arpeggios D, A, B♭, E♭, B, G, C minor | Bach *Prelude in C* (opening), Little Waltz in A minor | clapback, intervals (+ octave), chords, chord notes, playback (6–8 notes) | rhythm of a four-bar melody; four-bar passage hands together |

- **Technique and pieces**: three steps — **Listen**, **Wait for me**, **Play along** at the target tempo (90% correct, 70% on time).
  Technique tempos are the syllabus metronome marks. In the exam technique is played from memory: practise with ⋯ → *Hide the notes*.
- The formula pattern is one common form (similar motion up, contrary out and in, similar down); check the exact shape with your syllabus book.
- **Ear tests** (the app plays, you answer or play back on the piano): 10 questions per test, 8 correct passes it.
  In the exam, Levels 1–4 weight playback (4 marks) above clapback (2 marks); here each test simply has to be passed.
- **Sight reading**: every exercise is newly generated to the level's rules; pass 3 rhythm and 3 playing exercises (80% correct).
- Technical exercises are generated exactly from the syllabus keys and patterns with standard fingering. The pieces are this course's own
  traditional or public-domain arrangements — the syllabus's own repertoire books are not reproduced.

Lesson scores are in [`lessons/`](lessons/) and are built by [`tools/make_lessons.py`](tools/make_lessons.py) (`python tools/make_lessons.py`).

## Classical repertoire and credits
Besides the course's own arrangements, each level has classical pieces from the [Mutopia Project](https://www.mutopiaproject.org),
converted from Mutopia's MIDI files ([`tools/sources/mutopia/`](tools/sources/mutopia/)) by [`tools/midi_to_musicxml.py`](tools/midi_to_musicxml.py).
Ornaments shorter than a 32nd note are left out, repeats are played through once, and finger numbers are suggested by the app.
The Schumann pieces are licensed CC BY-SA (2.5/3.0) by their Mutopia typesetters; our MusicXML versions of them are shared under the same licence.
The others are public domain.

| Level | Piece | Composer | Licence | Source |
|---|---|---|---|---|
| Level 1 | Minuet in F (BWV Anh. 113) | Notebook for Anna Magdalena Bach | Public Domain | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=74) |
| Level 1 | Minuet in A minor (BWV Anh. 120) | Notebook for Anna Magdalena Bach | Public Domain | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1612) |
| Level 2 | Minuet in G (BWV Anh. 114) | Christian Petzold (Notebook for Anna Magdalena Bach) | Public Domain | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=75) |
| Level 2 | Minuet in G minor (BWV Anh. 115) | Christian Petzold (Notebook for Anna Magdalena Bach) | Public Domain | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=76) |
| Level 2 | Aria in D minor (BWV 515) | Notebook for Anna Magdalena Bach | Public Domain | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=78) |
| Level 2 | Melody, Op. 68 No. 1 | Robert Schumann (Album for the Young) | CC BY-SA 2.5 | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=647) |
| Level 2 | Soldier's March, Op. 68 No. 2 | Robert Schumann (Album for the Young) | CC BY-SA 2.5 | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=650) |
| Level 3 | Minuet in G (BWV Anh. 116) | Notebook for Anna Magdalena Bach | Public Domain | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=77) |
| Level 3 | Minuet in B♭ (BWV Anh. 118) | Notebook for Anna Magdalena Bach | Public Domain | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1014) |
| Level 3 | Minuet in C minor (BWV Anh. 121) | Notebook for Anna Magdalena Bach | Public Domain | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1613) |
| Level 3 | Polonaise in F (BWV Anh. 117a) | Notebook for Anna Magdalena Bach | Public Domain | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1013) |
| Level 3 | Humming Song, Op. 68 No. 3 | Robert Schumann (Album for the Young) | CC BY-SA 3.0 | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=651) |
| Level 3 | Chorale, Op. 68 No. 4 | Robert Schumann (Album for the Young) | CC BY-SA 2.5 | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=782) |
| Level 3 | Little Piece, Op. 68 No. 5 | Robert Schumann (Album for the Young) | CC BY-SA 2.5 | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=653) |
| Level 3 | Morning Prayer, Op. 39 No. 1 | Pyotr Ilyich Tchaikovsky (Album for the Young) | Public Domain | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=2032) |
| Level 4 | Poor Orphan Child, Op. 68 No. 6 | Robert Schumann (Album for the Young) | CC BY-SA 2.5 | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=687) |
| Level 4 | The Wild Horseman, Op. 68 No. 8 | Robert Schumann (Album for the Young) | CC BY-SA 2.5 | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=655) |
| Level 4 | The Happy Farmer, Op. 68 No. 10 | Robert Schumann (Album for the Young) | CC BY-SA 2.5 | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=659) |
| Level 4 | Old French Song, Op. 39 No. 16 | Pyotr Ilyich Tchaikovsky (Album for the Young) | Public Domain | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=2080) |
| Level 4 | Sonatina in B♭ (HWV 585) | George Frideric Handel | Public Domain | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=98) |
| Level 4 | Candour (La Candeur), Op. 100 No. 1 | Friedrich Burgmüller (25 Easy Studies) | Public Domain | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=202) |
| Level 4 | Arabesque, Op. 100 No. 2 | Friedrich Burgmüller (25 Easy Studies) | Public Domain | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=203) |
| Level 4 | Pastorale, Op. 100 No. 3 | Friedrich Burgmüller (25 Easy Studies) | Public Domain | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=218) |
| Level 4 | Sonatina in C, Op. 36 No. 1: I. Spiritoso | Muzio Clementi | Public Domain | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=804) |
| Level 4 | Sonatina in C, Op. 36 No. 1: II. Andante | Muzio Clementi | Public Domain | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=804) |
| Level 4 | Sonatina in C, Op. 36 No. 1: III. Vivace | Muzio Clementi | Public Domain | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=804) |

## Finger numbers
1 = thumb, 2 = index, 3 = middle, 4 = ring, 5 = little finger. The finger for the current note is shown above (right hand) and
below (left hand) the cursor and on the on-screen keys. Fingering written in a MusicXML file is used; for scores without it the app
suggests one (dashed circles). Turn them off in ⋯ → *Finger numbers*.

## Practise
- **Listen** — the app plays both hands.
- **Play along** — you play your hand at the set tempo; the app plays the other hand.
- **Wait for me** — the music keeps its tempo and rhythm, but when one of your notes is due and you haven't played it yet, it waits for you; when you play it, the other hand joins your note and the music carries on.
- **Left / Both / Right** — the hand(s) you play. Choose Right and the app plays the left hand, and vice versa.
- Every key you press is shown on the score with its name (e.g. C4) above the staff: green ✓ = right note, red ✗ = wrong note.
  While playing, the mark sits where you played in time: on the note when on time, before it when early, after it when late.
- **Tap the score** to move the cursor to that note; **⏮ Start** goes back to the beginning (both keep playing if the music is playing).
- In Play along and Wait for me the music waits after ▶ Play: **the beat starts with your first note**, which counts as exactly on time.
- **Timing**: each note is judged *on time* (within about ±15% of a beat), *early* or *late* (and *missed* in Play along).
- **Progress** is saved on the device for each piece: a summary after every run, and the **Progress** button shows
  your results over time, the bars that need practice (one tap repeats that bar) and recent sessions.
  Practised bars are colored on the score: ✓ green = good, ! yellow = some trouble, ✗ red = needs work.
- ⋯ menu: open a score, note size, repeat bars, show/hide the on-screen keyboard, finger numbers, hide the notes (play from memory), full screen.

Opens `.musicxml`, `.xml` and `.mxl` files. Try [`ode-to-joy-sample.musicxml`](ode-to-joy-sample.musicxml).
Built on [OpenSheetMusicDisplay](https://github.com/opensheetmusicdisplay/opensheetmusicdisplay) (BSD-3-Clause), included as `opensheetmusicdisplay.min.js`.
All app code is in `index.html`.
