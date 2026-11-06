# Follow Direction · اتبع التعليمات

Published at https://hamada013.github.io/follow-direction/.

Open `index.html` through HTTPS or a localhost web server. Arabic is the default. No npm install, API key or backend is needed. Accounts/progress stay on this device. The app works independently when its directory is hosted as a unit.

```sh
node scripts/build-pwa.cjs
npm test
node scripts/stage-site.cjs
node tests/one-way-links.cjs
npm install            # only for the browser checks
node tests/browser.cjs
node tests/updates.cjs
node tests/games-browser.cjs   # APP_ENGINE=webkit, APP_VIEWPORT=390x844 for phone
```

Pushing to `main` publishes the site through GitHub Actions (Settings → Pages → Source: GitHub Actions). The app stands alone: other sites link here, and it never links back to them.

The browser checks use Playwright from `npm install` (or set `APP_PLAYWRIGHT` to another install); `APP_ENGINE=webkit` selects Safari's engine. See `ADAPTATION.md` for clinical/content decisions and scoring behavior. Use the header download icon for offline status. A complete hashed release installs before updates are offered; «لاحقًا» keeps the old release active. Accepting updates refreshes open windows. Every response is saved before an update or navigation.

`ASSETS.txt` and the numbered mapping files describe optional images and audio. Add them, rebuild, and publish; no source edits are needed for the numbered files. The release generator includes all supplied numbered media and built-in drawings.

To replace the logo, save the supplied artwork as `assets/logo.webp` (convert format without changing the artwork), and regenerate `icon-192.png`, `icon-512.png`, and `icon-maskable.png`. Keep the important part inside the maskable icon's central 80%. Then rebuild. The source book and child records are not part of the public app bundle.

WebKit offline verification makes the test server unreachable while keeping service-worker execution enabled; Playwright’s WebKit offline-emulation toggle itself produces an internal navigation error in this runtime. Chromium also passes with browser offline mode enabled.

## What the child and family see

- **Start-up:** the logo animates and greets the child (about two seconds; tap to skip; shorter with reduced motion). Automatic update reloads skip it.
- **Dashboard:** today's workout, then four tiles: screening (or continue session), road, games, practice.
- **Daily plan and road (`assets/program.js`):** 12 days, one skill per day from easiest to hardest (one step, objects, colour and size, quantity, use of objects, position, two steps, order, two steps in play, if…, three steps), then a review day. Each day is a warm-up game from yesterday's skill, five practice directions (least-practised first) and the day's game, about 5–10 minutes. Like Fluency Flow, one new day opens per calendar date; behind the parent gate, «فتح اليوم (للأهل)» opens a locked day and «إقفال هذا اليوم مرة أخرى» undoes it until it is started. A practice step counts only when all five directions are scored; ending early saves a partial report and leaves the step open.
- **Mini-games (`assets/game-bank.js`, `assets/games.js`):** one game per skill that practises the idea of the skill, not the screening items. Five rounds per play, tap or drag; every drag also works as tap-the-toy-then-tap-the-place, for keyboards and motor access. Games are recorded only as play (rounds and first-try rounds), never in screening or practice percentages or the research workbook.
- **Picture cards (`assets/pictures.js`):** for spoken directions, the picture icon shows one numbered card per step, and "if" directions show each condition beside its action. Showing them records help for that item, in screening and practice alike, because they are a cue. `tests/pictures.cjs` fails if any direction in the bank cannot be drawn.
- **Parent guide:** the info icon explains how to use the app, gives tips and lists every icon's meaning.
- **Report:** overview (road days, practice directions, independent practice rate, games), a skill profile (latest screen as dots, last 10 practice responses, recent sessions, status), the chosen session's detail and chart, and the practice plan with a home suggestion. The session picker is a styled dropdown.

Recordings: directions are `assets/audio/001–253.mp3`; mini-game prompts are `301–386.mp3`. All are listed in `assets/audio/MAPPING.txt`. Add the files and rebuild; nothing else changes.

## Research workbook

Inside Accounts, the spreadsheet icon downloads `follow-direction-research-YYYY-MM-DD.xlsx`. Each export automatically collects all saved child profiles and sessions in the current browser. It creates a fresh cumulative snapshot, not an appended duplicate. The workbook contains Dashboard, Cases, Sessions, Skills, Records, and Dictionary; grouped screening/practice charts and a monthly independent-response trend are native editable Excel charts. The report page retains its PDF/print control. JSON backup/restore stays separate in Accounts.

Numeric `case_id` values persist through future exports and backups and are not reused after deletion. `child_uuid` remains the cross-file join key; case numbers are local to the dataset. Child names appear in Cases. Hamada/admin is excluded. Missing demographic or consent data is not inferred. Downloaded workbooks stay on the device; there is no Google/Drive/Sheets connection. Each click includes the latest saved observations, including partial sessions.

The PWA uses the checked-in `assets/workbook-template.js` and needs no library download or local server for export. `scripts/build-workbook-template.mjs` authors that template with Artifact Tool when changing its layout; it requires the bundled `@oai/artifact-tool` runtime or `ARTIFACT_NODE_MODULES`. Normal PWA/publication builds use the existing template. Rebuild the PWA after template changes.
