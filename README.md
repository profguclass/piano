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
Tap **Lessons** for a 161-lesson course. Its levels and the parts of each level follow the
[RCM Piano Syllabus, 2022 edition](https://www.rcmusic.com/syllabi) (with its September 2026 errata), from **Preparatory A** to **Level 6**:

| | Technique | Pieces | Ear tests | Sight reading |
|---|---|---|---|---|
| **Preparatory A** | pentascales C, G, D, A minor (legato, staccato); triad sequence in C | Middle C, five-finger position, *Mary Had a Little Lamb*, left hand, *Hot Cross Buns*, *Au clair de la lune* | clapback, chords, playback | rhythm; two four-note melodies |
| **Preparatory B** | pentascales D, A, F, E minor, D minor; one-octave scales C, G, A minor; contrary motion; tonic triads | *Ode to Joy*, *Twinkle Twinkle*, *When the Saints*, *Row Your Boat*, *London Bridge*, *Jingle Bells* | clapback, chords, playback | rhythm; melody shared between the hands |
| **Level 1** | two-octave scales C, G, F; A, E, D minor (natural, harmonic); contrary motion 2 octaves; chromatic from C; tonic triads broken and solid | three chords, broken-chord *Ode to Joy*, *Happy Birthday*, *Silent Night*, *Greensleeves* | clapback, intervals (m3, M3), chords, playback | rhythm; four-bar melody in C, G, F, A minor |
| **Level 2** | two-octave scales G, F, B♭; E, D, G minor (harmonic, melodic); chromatic from G; tonic triads broken and solid | chord progression study, Pachelbel's *Canon*, *Eine kleine Nachtmusik*, *Für Elise* (opening) | clapback, intervals (m3, M3, P5), chords, playback | rhythm with rests; four-bar melody beyond five-finger position |
| **Level 3** | scales hands together D, F, B♭; B, D, G minor (harmonic, melodic); formula pattern D; chromatic from D; tonic triads two octaves broken and solid | Petzold *Minuet in G*, Sonatina in C (Classical style, Alberti bass) | clapback, intervals (m3, M3, P4, P5), chords, chord notes (root/third/fifth), playback | four-bar rhythm; four-bar passage hands together |
| **Level 4** | scales hands together D, A, B♭, E♭; B, G, C minor (harmonic, melodic); formula pattern C minor; chromatic from C; tonic triads hands together; arpeggios D, A, B♭, E♭, B, G, C minor | Bach *Prelude in C* (opening), Little Waltz in A minor | clapback, intervals (+ octave), chords, chord notes, playback (6–8 notes) | rhythm of a four-bar melody; four-bar passage hands together |
| **Level 5** | scales hands together A, E, F, A♭; A, E, F minor; formula patterns A major / A minor; chromatic hands together from A and F; tonic triads with I–V–I; dominant 7th chords; arpeggios | Burgmüller Op. 100 Nos. 4–8, 10, 11; Schumann *Little Study*; Tchaikovsky *March of the Wooden Soldiers*; Bach *Polonaise* Anh. 117b | intervals (melodic then harmonic, up to the octave), chords (incl. dominant 7th), progressions I–IV–I / I–V–I, playback up to 8 notes | rhythm of a melody; eight-bar passage hands together, or a lead sheet |
| **Level 6** | scales hands together G, E, B, D♭; G, E, B, C♯ minor; formula patterns E major / E minor; chromatic two octaves from E and D♭; tonic triads with I–V–I; dominant and diminished 7th chords; tonic, dominant 7th and diminished 7th arpeggios | Burgmüller Op. 100 Nos. 9, 12, 13, 15–18; Schumann *May, Dear May*, *First Loss*, *Reaper's Song*, *Of Foreign Lands and Peoples*; Bach Little Preludes BWV 928, 924, Prelude BWV 999 | intervals from minor 2nd to octave, chords (incl. diminished 7th), progressions in major and minor, playback over the whole scale | rhythm of a melody; eight-bar passage (up to three sharps/flats), or a lead sheet |

- **Technique and pieces**: three steps — **Listen**, **Wait for me**, **Play along** at the target tempo (90% correct, 70% on time).
  Technique tempos are the syllabus metronome marks. In the exam technique is played from memory: practise with ⋯ → *Hide the notes*.
- The formula pattern is one common form (similar motion up, contrary out and in, similar down); check the exact shape with your syllabus book.
- **Ear tests** (the app plays, you answer or play back on the piano): 10 questions per test, 8 correct passes it.
  In the exam, Levels 1–4 weight playback (4 marks) above clapback (2 marks); here each test simply has to be passed.
- **Sight reading**: every exercise is newly generated to the level's rules; pass 3 rhythm and 3 playing exercises (80% correct).
  From Level 5 a **lead sheet** (melody with chord symbols) can replace the playing exercise: your left-hand notes are checked against the chord of each bar.
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
| Level 5 | The Little Party (La Petite Réunion), Op. 100 No. 4 | Friedrich Burgmüller (25 Easy Studies) | Public Domain | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=219) |
| Level 5 | Innocence, Op. 100 No. 5 | Friedrich Burgmüller (25 Easy Studies) | Public Domain | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=214) |
| Level 5 | Progress (Progrès), Op. 100 No. 6 | Friedrich Burgmüller (25 Easy Studies) | Public Domain | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=215) |
| Level 5 | The Limpid Stream (Le Courant Limpide), Op. 100 No. 7 | Friedrich Burgmüller (25 Easy Studies) | Public Domain | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=216) |
| Level 5 | The Graceful One (La Gracieuse), Op. 100 No. 8 | Friedrich Burgmüller (25 Easy Studies) | Public Domain | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=217) |
| Level 5 | Tender Flower (Tendre Fleur), Op. 100 No. 10 | Friedrich Burgmüller (25 Easy Studies) | Public Domain | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=221) |
| Level 5 | The Wagtail (La Bergeronnette), Op. 100 No. 11 | Friedrich Burgmüller (25 Easy Studies) | Public Domain | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=222) |
| Level 5 | Little Study, Op. 68 No. 14 | Robert Schumann (Album for the Young) | CC BY-SA 2.5 | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=786) |
| Level 5 | March of the Wooden Soldiers, Op. 39 No. 5 | Pyotr Ilyich Tchaikovsky (Album for the Young) | Public Domain | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1806) |
| Level 5 | Polonaise in F (BWV Anh. 117b) | Notebook for Anna Magdalena Bach | Public Domain | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1015) |
| Level 6 | The Hunt (La Chasse), Op. 100 No. 9 | Friedrich Burgmüller (25 Easy Studies) | Public Domain | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=220) |
| Level 6 | Farewell (L'Adieu), Op. 100 No. 12 | Friedrich Burgmüller (25 Easy Studies) | Public Domain | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=223) |
| Level 6 | Consolation, Op. 100 No. 13 | Friedrich Burgmüller (25 Easy Studies) | Public Domain | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=224) |
| Level 6 | Ballade, Op. 100 No. 15 | Friedrich Burgmüller (25 Easy Studies) | Public Domain | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=227) |
| Level 6 | Gentle Lament (Douce Plainte), Op. 100 No. 16 | Friedrich Burgmüller (25 Easy Studies) | Public Domain | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=228) |
| Level 6 | The Chatterbox (La Babillarde), Op. 100 No. 17 | Friedrich Burgmüller (25 Easy Studies) | Public Domain | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=229) |
| Level 6 | Restlessness (Inquiétude), Op. 100 No. 18 | Friedrich Burgmüller (25 Easy Studies) | Public Domain | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=230) |
| Level 6 | May, Dear May, Op. 68 No. 13 | Robert Schumann (Album for the Young) | CC BY-SA 2.5 | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=662) |
| Level 6 | First Loss, Op. 68 No. 16 | Robert Schumann (Album for the Young) | CC BY-SA 2.5 | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=676) |
| Level 6 | Reaper's Song, Op. 68 No. 18 | Robert Schumann (Album for the Young) | CC BY-SA 2.5 | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=663) |
| Level 6 | Of Foreign Lands and Peoples, Op. 15 No. 1 | Robert Schumann (Scenes from Childhood) | Public Domain | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=354) |
| Level 6 | Little Prelude in F (BWV 928) | Johann Sebastian Bach | Public Domain | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=493) |
| Level 6 | Little Prelude in C (BWV 924) | Johann Sebastian Bach | CC BY-SA 3.0 | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=978) |
| Level 6 | Prelude in D minor (BWV 999) | Johann Sebastian Bach | Public Domain | [Mutopia](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=60) |

## Finger numbers
1 = thumb, 2 = index, 3 = middle, 4 = ring, 5 = little finger. The finger for the current note is shown above (right hand) and
below (left hand) the cursor and on the on-screen keys. Fingering written in a MusicXML file is used; for scores without it the app
suggests one (dashed circles). Turn them off in ⋯ → *Finger numbers*.

## Practise
- **Listen** — the app plays both hands.
- **Play along** — you play your hand at the set tempo; the app plays the other hand.
- **Wait for me** — the music follows you: each note is due one note-length after you correctly played the previous one (early or late, the music goes on from that moment); when you're not there yet, it waits, and the other hand joins your note.
- **Play along** timing runs on a steady beat from your first note.
- When a step has two or more notes (a chord, or both hands), Wait for me moves on only when **all of them are played correctly together** — within 0.3 s of the first. A wrong key, or notes too far apart, counts as wrong and the chord is played again.
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
