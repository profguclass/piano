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
Tap **Lessons** for a 208-lesson course. Its levels and the parts of each level follow the
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

- **Order and levels**: the levels follow the RCM Piano Syllabus, 2022 edition. A piece that the syllabus lists (a repertoire list, the complete repertoire or the etudes) is in the level of that list, and its lesson says where it is listed (for example *Level 3 · List A* for the Petzold minuets). Pieces the syllabus does not list are placed next to listed pieces of similar difficulty, and the lesson says which ones; an estimate made from the notes ([`tools/difficulty.py`](tools/difficulty.py)) is only a second opinion. Every decision and its reason is in [`tools/levels.py`](tools/levels.py). Inside a level the pieces run from the easiest to the hardest by the same estimate.
- **The syllabus's own repertoire books** are not reproduced; this course uses public-domain editions of the pieces.
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

## Practice tools
- **Today:** your practice streak (days in a row with at least a minute of practice), minutes today against a daily goal you can change, the last 7 days, and a plan: go on with the course, fix a weak spot, drill it, an ear test and a sight-reading exercise.
- **Metronome and count-in** (in the ⋯ menu): a click on every beat while the music plays (not in Wait for me, where the tempo is yours) and one bar of clicks before it starts.
- **Speed up when clean:** with **Repeat bars** on, every pass that is 90% correct raises the tempo by the step you choose, up to a goal tempo (the piece's own tempo unless you set one).
- **Next keys:** the keys of the notes you play next are outlined on the keyboard before they are due.
- **Drill my weak spots** (Progress window or end-of-run card): your three weakest bars, each hand alone and slowly first, then both hands, moving on after a pass that is 90% correct.
- **Dynamics and pedal:** the dynamics (p, mf, f ...) and pedal marks in a MusicXML score are read: pedal marks are shown under the bass staff (*Ped.* and ✱), the piano's velocity and sustain pedal are tracked, and the end-of-run card says whether your loud parts were louder than your soft ones and how much of the pedal you used as marked.
- **Share a report** (Today or Progress): the last 30 days as text (share, copy) and as a CSV file, for a teacher.
- **Back up / Restore** (⋯ menu): saves progress, settings and **My scores** in one file; restoring replaces what is on the device.
- **Theme** (⋯ menu): Auto (follows the device), Light or Dark. The score always stays on light paper.

## Library: practise a piece as a whole
Tap **Library** to practise any piece from the first bar to the last, outside the lesson steps. It lists every piece in the course (searchable by title or composer, grouped by level) and a **My scores** shelf: use **Add a score** (or **Open score**) to open your own MusicXML file (`.musicxml`, `.xml`, `.mxl`) and it stays on the device in the browser's own storage (IndexedDB), ready for next time. Listen, Play along, Wait for me, the hands, the tempo, Repeat bars and Progress all work as usual; the app returns to the piece you were practising when you reopen it.

## Classical repertoire and credits
Besides the course's own arrangements, each level has classical pieces from the [Mutopia Project](https://www.mutopiaproject.org),
converted from Mutopia's MIDI files ([`tools/sources/mutopia/`](tools/sources/mutopia/)) by [`tools/midi_to_musicxml.py`](tools/midi_to_musicxml.py).
Ornaments shorter than a 32nd note are left out, repeats are played through once, and finger numbers are suggested by the app.
The Schumann pieces are licensed CC BY-SA (2.5/3.0) by their Mutopia typesetters; our MusicXML versions of them are shared under the same licence.
The others are public domain.

Johann Wilhelm Hässler's *Minuet in C*, Op. 38 No. 4 (Level 1), is public domain; it was transcribed by hand from the free [Pianocoda](https://pianocoda.com) edition, with its fingering.
The same goes for *Away with Melancholy* (Mozart), *Ode to Joy* (Beethoven, with left-hand chords), the *Minuet in F* attributed to Leopold Mozart, the *Aria in F* (BWV Anh. 131) and the *Chorale* BWV 514 (Bach): public-domain music, transcribed by hand from the free Pianocoda editions with their fingering. Repeats are played through once.

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
- When a step has two or more notes (a chord, or both hands), it counts only when **all of them are played correctly together** — within 0.3 s of the first. In Wait for me the music moves on only then (otherwise the chord is played again); in Play along a chord with a wrong, missing or late note counts as missed.
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

## Free MusicXML scores
These public-domain pieces were supplied as MusicXML by their arrangers (mostly on [MuseScore.com](https://musescore.com), where they are free to download) and are used as they are, with titles and credits added by [`tools/mxl_import.py`](tools/mxl_import.py); the files are in [`tools/sources/musicxml/`](tools/sources/musicxml/). Scores with extra empty staves are reduced to two, a single staff holding both hands (Hanon) becomes a piano grand staff, a single melodic line (the chants) gets an empty second staff, and a staff of chord stacks (Chopin Op. 48 No. 1) is split between the hands at middle C. *Veni Sancte Spiritus* is licensed CC BY 4.0 by its editors (see the table); *Our Father* comes from the Choral Public Domain Library, whose edition may be freely distributed.

| Level | Piece | Composer | Source |
|---|---|---|---|
| Preparatory B | Veni Creator Spiritus (Gregorian chant) | Gregorian chant (words: Rabanus Maurus) | free MusicXML |
| Preparatory B | Regina caeli (Gregorian chant) | Gregorian chant | free MusicXML |
| Level 1 | Veni Sancte Spiritus (Gregorian chant) | Stephen Langton (d. 1228), chant melody | Choral Public Domain Library (CC BY 4.0, St. John's College Freshman Chorus) |
| Level 1 | Adoro te devote (Gregorian chant) | Gregorian chant (words: Thomas Aquinas) | free MusicXML |
| Level 1 | Ave verum corpus (Gregorian chant) | Gregorian chant | free MusicXML |
| Level 1 | Our Father (Gregorian chant, left hand) | Anonymous chant | Choral Public Domain Library (freely distributable) |
| Level 1 | Ode to Joy (piano for kids) | Ludwig van Beethoven | [MuseScore](https://www.musescore.com/score/182061) |
| Level 2 | Sanctus (Kyriale XVII, Gregorian chant) | Gregorian chant | free MusicXML |
| Level 2 | Arirang (Korean folk song, easy piano) | Traditional Korean (arr. Eugene Sia) | free MusicXML |
| Level 2 | Greensleeves (easy arrangement) | Traditional (English) | free MusicXML |
| Level 2 | The First Noel | Traditional (English carol) | [MuseScore](https://musescore.com/user/25721336/scores/4820621) |
| Level 2 | Minuet in F, K. 2 | Wolfgang Amadeus Mozart | free MusicXML |
| Level 2 | Andante in G minor | Georg Philipp Telemann | Sao Mai Center for the Blind |
| Level 3 | Hanon exercises 1-30 (condensed) | Charles-Louis Hanon | MuseScore (CC0 / public domain) |
| Level 3 | Swan Lake theme | Pyotr Ilyich Tchaikovsky | free MusicXML |
| Level 3 | Minuet in G (BWV Anh. 114), second edition | Christian Petzold (Notebook for Anna Magdalena Bach) | [MuseScore](https://api.musescore.com/score/2086106) |
| Level 3 | Minuet in G (BWV Anh. 114), third edition | Christian Petzold (Notebook for Anna Magdalena Bach) | [MuseScore](https://musescore.com/classicman/scores/62312) |
| Level 3 | Minuet in G minor (BWV Anh. 115), with fingering | Christian Petzold (Notebook for Anna Magdalena Bach) | [MuseScore](https://api.musescore.com/score/2086136) |
| Level 3 | Canon in D (easy) | Johann Pachelbel | [MuseScore](https://musescore.com/score/1376056) |
| Level 4 | Clair de lune (easy) | Claude Debussy | [MuseScore](https://musescore.com/user/31902283/scores/10568761) |
| Level 4 | Nocturne in E-flat, Op. 9 No. 2 (easy, with pedal marks) | Frédéric Chopin | free MusicXML |
| Level 4 | The Blue Danube | Johann Strauss II | [MuseScore](https://musescore.com/user/27824718/scores/4941073) |
| Level 4 | Canon in C | Johann Pachelbel (arr. Iori Yagami) | [MuseScore](https://musescore.com/user/17067096/scores/4809537) |
| Level 4 | Nocturne in E minor (file title: Nocturne No. 15) | Frédéric Chopin | free MusicXML |
| Level 4 | The Entertainer | Scott Joplin | [MuseScore](https://api.musescore.com/score/1352881) |
| Level 4 | Symphony No. 5 (easy piano) | Ludwig van Beethoven | [MuseScore](https://musescore.com/user/29460332/scores/5869298) |
| Level 4 | Symphony No. 40, theme (easy piano) | Wolfgang Amadeus Mozart | free MusicXML |
| Level 4 | Nocturne in E-flat, Op. 9 No. 2 (easy) | Frédéric Chopin | free MusicXML |
| Level 4 | Für Elise (beginner version) | Ludwig van Beethoven | [MuseScore](https://musescore.com/classicman/scores/33816) |
| Level 5 | Passacaglia (Handel-Halvorsen), easy version | Georg Friedrich Handel / Johan Halvorsen | [MuseScore](https://musescore.com/user/37309912/scores/6790392) |
| Level 5 | The Swan (Le Cygne) | Camille Saint-Saëns | [MuseScore](https://musescore.com/user/27524722/scores/4901201) |
| Level 5 | Nocturne No. 20 in C-sharp minor, melody | Frédéric Chopin | free MusicXML |
| Level 5 | Prelude in A major, Op. 28 No. 7 | Frédéric Chopin | [MuseScore](https://musescore.com/user/19710/scores/60121) |
| Level 5 | Nocturne in E-flat, Op. 9 No. 2 (fuller version) | Frédéric Chopin | free MusicXML |
| Level 5 | Waltz in A minor (B. 150) | Frédéric Chopin | [MuseScore](https://musescore.com/score/1749181) |
| Level 5 | Gymnopédie No. 1 | Erik Satie | [MuseScore](https://musescore.com/user/19710/scores/4766391) |
| Level 6 | Prelude in C major (BWV 846) | Johann Sebastian Bach | [MuseScore](https://musescore.com/user/101554/scores/117279) |
| Level 6 | Nocturne No. 20, "Reminiscence" (arranged in D minor) | Frédéric Chopin | free MusicXML |
| Level 6 | Prelude in E minor, Op. 28 No. 4 | Frédéric Chopin | free MusicXML |
| Level 6 | Prelude in C minor (BWV 999) | Johann Sebastian Bach | [MuseScore](https://musescore.com/score/4526) |
| Level 6 | Nocturne in C minor, Op. 48 No. 1 | Frédéric Chopin (arr. G. Lees) | free MusicXML |
