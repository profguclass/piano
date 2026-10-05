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

## Practise
- **Listen** — the app plays both hands.
- **Play along** — you play your hand at the set tempo; the app plays the other hand.
- **Wait for me** — the music keeps its tempo and rhythm, but when one of your notes is due and you haven't played it yet, it waits for you; when you play it, the other hand joins your note and the music carries on.
- **Left / Both / Right** — the hand(s) you play. Choose Right and the app plays the left hand, and vice versa.
- Every key you press is shown on the score at the current note, with its name (e.g. C4) above the staff: green ✓ = right note, red ✗ = wrong note.
- **Tap the score** to move the cursor to that note; **⏮ Start** goes back to the beginning (both keep playing if the music is playing).
- **Timing**: each note is judged *on time* (within about ±15% of a beat), *early* or *late* (and *missed* in Play along).
- **Progress** is saved on the device for each piece: a summary after every run, and the **Progress** button shows
  your results over time, the bars that need practice (one tap repeats that bar) and recent sessions.
  Practised bars are colored on the score: ✓ green = good, ! yellow = some trouble, ✗ red = needs work.
- ⋯ menu: open a score, note size, repeat bars, show/hide the on-screen keyboard, full screen.

Opens `.musicxml`, `.xml` and `.mxl` files. Try [`ode-to-joy-sample.musicxml`](ode-to-joy-sample.musicxml).
Built on [OpenSheetMusicDisplay](https://github.com/opensheetmusicdisplay/opensheetmusicdisplay) (BSD-3-Clause), included as `opensheetmusicdisplay.min.js`.
All app code is in `index.html`.
