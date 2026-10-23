# Workout flexibility update

The black-and-yellow design, four-day split, six strength slots per day, original exercise definitions, and three prescribed sets per slot are retained. Lower A and Lower B have no exercise substitutions.

## Plate calculator — release 4.7

- Each numeric load has a compact **＋ Plates** button. Add or remove **2.5, 5, 10, 25 and 45 lb** plates, counting one side doubled or all plates once. The live equation makes the selected counting method explicit.
- A small expandable **Machine / bar starting weight** option adds the stated resistance once. Blank means zero; a base is never guessed. The calculator can reconstruct exact plate combinations from an existing numeric load.
- **Use weight** writes the total directly into that set. An optional checkbox also fills the other unfinished sets for the same exercise. Completed sets and completed alternative slots are protected from the bulk fill. Reps, ratings and completion flags are retained.
- Plate breakdowns and the entered base survive reload, history, backups, exercise swaps and previous-workout autofill. Manual weight edits discard stale plate metadata; BW remains a simple number-free mode.
- App assets and the offline cache are versioned 4.7. All 39 tests passed, including calculator arithmetic, malformed input rejection, alternative ownership, previous-session metadata and PWA coverage. Phone-width browser checks verified input, both counting modes, base validation, cancel, bulk fill, completed-set protection, reload and saved history.

## Cardio and previous workout references — release 4.6

- A separate **Cardio** workout offers **Walkpad Walking**, **Elliptical**, and **Treadmill Running**. Log one or more activities with duration and speed, mark them complete, and save them to the same calendar with moods, difficulty and notes.
- Speed covers **0.0–10.0 in 0.1 steps**, with **3.0** as the initial default. Speed follows the machine display; no universal mph/kph assumption is made. Each activity keeps its own values when switching. New cardio sessions can prefill their previous logged settings.
- Cardio minutes are tracked separately from strength sets. Cardio does not advance the Upper A → Lower A → Upper B → Lower B suggestion or count toward the four-strength-day indicator.
- New strength sessions prefill previous completed-set **weights and reps** for the same exercise, preferring that routine's history. Missing prior sets keep empty rep fields. Actual previous dates and exercise difficulty are shown, with the last routine's overall difficulty and before/after moods above the workout. Today's checks, moods and difficulty start fresh.
- **BW** displays directly as a load button with no numeric weight field. Numeric loads also have a BW shortcut; switching back restores the entered numeric load. Bodyweight sets still use reps or seconds. History shows BW without appending pound units.
- Existing drafts, saved records, alternatives, supersets, order, routine definitions, and version-4 backups remain supported. Cardio is an additional validated record type under the existing storage key; old history is not rewritten.

## Assigned swaps

| Routine / slot | Existing primary | Only alternative |
| --- | --- | --- |
| Upper A / 01 | Supine / Chest Press Machine | Flat Dumbbell Bench Press |
| Upper A / 03 | Seated Dumbbell Shoulder Press | Plate-Loaded Shoulder Press Machine |
| Upper A / 04 | Cable Lateral Raise | Machine Lateral Raise |
| Upper B / 01 | Incline Dumbbell Press | Plate-Loaded Incline Chest Press Machine |
| Upper B / 04 | Machine Lateral Raise | Cable Lateral Raise |

The row and all other slots have no Swap control. Dumbbell Lateral Raise is readable in old records but is not a selectable option. Alternatives use the slot's original numeric rep range; unilateral cable work is labeled per arm. Machine plate weights are labeled total plates, and dumbbell loads remain per dumbbell.

Choose **Swap** on a supported card. Each option retains its own inputs and difficulty rating. If a set was already completed with another option, that row shows the actual exercise and its recorded values. Tap its checkmark to undo before redoing that prescribed set with another exercise. This prevents counting a prescribed set twice. Unfinished alternative inputs remain recoverable by switching back, even after saving and editing a session.

## Order and supersets

Use the up/down buttons to change today's order. Jump to an exercise opens any card without a prerequisite. Order persists with the session and appears in its history; a new workout starts in the prescribed order.

Upper A links **Dumbbell Curl + Cable Triceps Pushdown**. Upper B links **Hammer Curl + Overhead Rope Triceps Extension**. Each block contains three rounds, each with independent weight, reps and completion for both exercises. A round is complete only after both sets are checked. Automatic rest starts after the pair, and the pair always moves as one block.

## Walking

Every workout begins with **Treadmill Walking — 5 minutes** and **Warm-Up Complete**. It ends with optional **Walking — 5 minutes**, with **Complete** and **Skip**. Walking never changes the 18-strength-set target or blocks saving. Both statuses are included in history; older sessions show Not recorded.

## Data preservation

- The existing `gymCompanion_v4` storage key and version-4 backups are supported.
- Canonical exercise arrays stay in their original slots. A separate `exerciseOrder` array controls display order; changing it cannot reassign exercise data.
- Optional `variants` retain each allowed exercise's inputs. History and previous-weight lookup include the actual performed variant.
- Optional walking/order fields are added to drafts only as needed. Existing saved sessions are not rewritten when viewed.
- Before the first updated save, the previous local record is copied to `gymCompanion_before_flex_v1`. **More → Export pre-update safety backup** downloads it. It stays on your device.
- Exported workout backups include variants, order, walking statuses, history, and drafts. Import continues merging by stable session ID.

## Modified files

- `app.js`: scoped swap dialog, linked round UI, move/jump controls, walking statuses, history, and safety backup export.
- `core.js`: assigned alternatives, independent variant records, stable ordering, superset completion, and backward-compatible validation.
- `styles.css`: small controls and panels using the existing theme.
- `index.html`: swap dialog and versioned asset references.
- `sw.js`: new offline cache revision and versioned assets.
- `tests/flex.test.cjs`: new flexibility, preservation, validation, and routine regression checks.
- `tests/pwa.test.cjs`: offline asset and GitHub Pages subpath checks.
- `tests/cardio.test.cjs`: cardio boundaries, history/backups, prefill, previous feelings, and BW checks. Existing core tests now expect rep autofill.
- `README.txt` and `UPDATE.md`: usage, validation, and deployment instructions.

`workouts.js`, existing tests, icons, manifest identity, and lower-body exercise definitions are unchanged.

## Validation

Run from the repository root:

```sh
node --test --test-isolation=none tests/core.test.cjs tests/flex.test.cjs tests/pwa.test.cjs tests/cardio.test.cjs
node --check app.js
node --check core.js
node --check sw.js
```

All **34 automated tests** passed. Existing flexibility checks remain in the suite. The cardio update's browser checks cover all three activities, inclusive speed endpoints, invalid speed rejection, separate values, resume, saving/calendar history, previous weights/reps/difficulty/moods, and BW-only completion. Offline and physical-device limits are noted below. The automated PWA check verifies every HTML asset is cached under both `/` and `/Workout-App/` and can be served offline.

Physical iPhone/Android home-screen installation has not been tested; responsive browser and PWA asset checks were used.

## Deployment

GitHub Pages serves the root of `main` at https://onewhocracks.github.io/Workout-App/. No dependency installation or build step is required.

1. Commit the modified files above to `main`, preserving the existing icons, manifest and `workouts.js`.
2. Wait for **pages build and deployment** in GitHub Actions to finish successfully.
3. Open the app online and refresh. Assets use release `4.6`, and the service worker revalidates online files while keeping an offline copy.
4. If the app was open during deployment, refresh it after the deployment completes. Do not clear site data to update.

For local preview, run `node preview.cjs` and open http://127.0.0.1:4173.
