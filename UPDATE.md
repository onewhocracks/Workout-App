# Workout flexibility update

The black-and-yellow design, four-day split, six strength slots per day, original exercise definitions, and three prescribed sets per slot are retained. Lower A and Lower B have no exercise substitutions.

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
- `README.txt` and `UPDATE.md`: usage, validation, and deployment instructions.

`workouts.js`, existing tests, icons, manifest identity, and lower-body exercise definitions are unchanged.

## Validation

Run from the repository root:

```sh
node --test --test-isolation=none tests/core.test.cjs tests/flex.test.cjs tests/pwa.test.cjs
node --check app.js
node --check core.js
node --check sw.js
```

All **26 automated tests** passed. Browser QA checked all five alternatives, swapping back to recover inputs, mobile and desktop move controls, completing later exercises/rounds first, reloading reordered progress, three complete superset rounds, warm-up, completed/skipped cool-down, actual-exercise history, unchanged Lower A/Lower B, and backup export. Reload and saving were also tested after the local HTTP server was stopped. The automated PWA check verifies every HTML asset is cached under both `/` and `/Workout-App/` and can be served offline.

Physical iPhone/Android home-screen installation has not been tested; responsive browser and PWA asset checks were used.

## Deployment

GitHub Pages serves the root of `main` at https://onewhocracks.github.io/Workout-App/. No dependency installation or build step is required.

1. Commit the modified files above to `main`, preserving the existing icons, manifest and `workouts.js`.
2. Wait for **pages build and deployment** in GitHub Actions to finish successfully.
3. Open the app online and refresh. Assets use release `4.5`, and the service worker revalidates online files while keeping an offline copy.
4. If the app was open during deployment, refresh it after the deployment completes. Do not clear site data to update.

For local preview, run `node preview.cjs` and open http://127.0.0.1:4173.
