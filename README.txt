GYM COMPANION

A black-and-yellow phone-friendly workout tracker for Upper A, Lower A, Upper B and Lower B.
Upper B exercise 04 uses Machine Lateral Raise (3 sets of 12-15 reps).

OPEN THE APP
https://onewhocracks.github.io/Workout-App/

INSTALL ON YOUR PHONE
iPhone: Open in Safari > Share > Add to Home Screen.
Android: Open in Chrome > menu > Install app / Add to Home screen.
The app works offline after its files are successfully cached on the first visit.

WHAT IT TRACKS
- Three sets per exercise: weight, reps and completed sets.
- Mood before and after each workout.
- Easy / Medium / Hard ratings per exercise and per workout.
- Dated workout history in a monthly calendar.
- Gym-day totals, session notes, and previous logged weights.

QUALITY OF LIFE
Automatic saving and resume, exercise form cues, automatic rest timers with
pause and extra time, editable dates and sessions, partial workout saves,
and JSON backup export/import in More.

YOUR DATA
Workout records stay in this browser on this device. No cloud synchronization.
Export a backup from More before changing devices or clearing browser data.
Import adds new session IDs without replacing existing sessions.

Older v3 entries are preserved and recoverable from More when using the same
browser and website address. The original app did not record dates; choose
the actual workout date before saving recovered entries to the calendar.
Data saved on a different domain, such as the private ChatGPT Site, must be
exported there and imported here. Home-screen apps may have separate storage.

DEVELOPMENT
No build step or dependencies are required to serve this static app.
node preview.cjs
Open http://127.0.0.1:4173
node --test tests/core.test.cjs

DEPLOYMENT
GitHub Pages serves this repository's root. The .nojekyll file keeps the static
assets intact. Keep index.html, app.js, core.js, workouts.js, styles.css,
manifest.json, sw.js and icons/ together.
If an installed older version appears, open online and reload after updating.

VERIFICATION
Thirteen data tests passed. Phone-width browser checks covered saving, resume,
mood/difficulty selection, history, backdating/editing, backup export/import,
and offline reload. Installation has not been tested on a physical phone.
