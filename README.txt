GYM COMPANION

https://onewhocracks.github.io/Workout-App/

Four-day upper/lower tracker with the existing black-and-yellow design.
Upper A, Lower A, Upper B, Lower B: six strength slots, three sets each.

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
node --test --test-isolation=none tests/core.test.cjs tests/flex.test.cjs tests/pwa.test.cjs

GitHub Pages serves main / root. Keep .nojekyll and all app assets together.
The 26 automated tests pass. Mobile/desktop and offline browser checks passed.
Physical phone installation has not been tested.
