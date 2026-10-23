GYM COMPANION

https://onewhocracks.github.io/Workout-App/

Four-day upper/lower tracker with a separate Cardio workout with the existing black-and-yellow design.
Upper A, Lower A, Upper B, Lower B: six strength slots, three sets each.

CARDIO AND PREVIOUS WORKOUTS
Cardio includes Walkpad Walking, Elliptical and Treadmill Running.
Speed controls cover 0.0-10.0 in 0.1 steps, defaulting to 3.0. Log minutes,
mark each performed activity complete, and save to the same gym calendar.
New strength sessions prefill the previous logged weights and reps. Previous
exercise difficulty, overall difficulty and moods are shown as reference.
BW loads show a BW button without a numeric load. Reps/seconds are still logged.

NEW FLEXIBILITY
- Swap only the five specifically assigned upper-body exercise slots.
- Each alternative retains its own inputs; history names the exercise performed.
- Move exercises up/down for today's gym flow or jump to any exercise.
- Curl/triceps supersets stay linked, with three independently tracked rounds.
- Five-minute treadmill warm-up and optional five-minute walking cool-down.
- Existing data, original targets, lower-body routines and history are preserved.

Read UPDATE.md for the exact alternatives, data behavior, tests and deployment.

INSTALL
Open the link on your phone.
iPhone: Safari > Share > Add to Home Screen.
Android: Chrome menu > Install app / Add to Home screen.
Offline access is available after the app files are successfully cached.

DATA
Records stay in this browser on this device. There is no cloud synchronization.
More > Export workout backup keeps a copy or transfers to another device.
Backups include history, active progress, order, variants and walking statuses.
Import merges new session IDs without replacing existing sessions.
More > Export pre-update safety backup retrieves the local copy from before
this flexibility update, once the first updated save has occurred.
Older v3 entries remain recoverable in More on their original domain/browser.
Do not clear browser data to update the app.

DEVELOPMENT
No build step is required for this static app.
node preview.cjs
node --test --test-isolation=none tests/core.test.cjs tests/flex.test.cjs tests/pwa.test.cjs tests/cardio.test.cjs tests/plates.test.cjs

GitHub Pages serves main / root. Keep .nojekyll and all app assets together.
The 39 automated tests pass. Mobile/desktop and offline browser checks passed.
Physical phone installation has not been tested.

PLATE CALCULATOR (4.7)
Tap + Plates beside a numeric weight. Count 2.5, 5, 10, 25 and 45 lb plates
per side x 2 or as a single total. Expand Machine / bar starting weight to
add the stated resistance once. Use weight fills the set; the optional checkbox
also fills other unfinished sets without changing completed ones. Plate details
return with previous-workout autofill and are included in backups and history.
