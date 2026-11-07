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
- **Screens fit the window:** the page never scrolls. A bottom bar moves between home, road, games, practice, screening (or continue session), report and therapist mode; it is hidden during a game or a direction, which have their own exit. Game pieces scale to the space left (container query units), the road lays its 12 stations out in rows that fit, and short landscape phones show directions in two columns. Only the report and the comparison table scroll, inside their own area.
- **Therapist mode:** the key icon in the bottom bar asks for the therapist code (013). It opens every road day and every step on this device until it is turned off with the same button.
- **Dashboard:** greeting and today's workout.
- **Daily plan and road (`assets/program.js`):** 12 days, one skill per day from easiest to hardest (one step, objects, colour and size, quantity, use of objects, position, two steps, order, two steps in play, if…, three steps), then a review day. Each day is a warm-up game from yesterday's skill, five practice directions (least-practised first) and the day's game, about 5–10 minutes. Like Fluency Flow, one new day opens per calendar date; behind the parent gate, «فتح اليوم (للأهل)» opens a locked day and «إقفال هذا اليوم مرة أخرى» undoes it until it is started. A practice step counts only when all five directions are scored; ending early saves a partial report and leaves the step open.
- **Mini-games (`assets/game-bank.js`, `assets/games.js`):** one game per skill that practises the idea of the skill, not the screening items. Ten rounds per play (each game has at least ten different rounds), tap or drag; every drag also works as tap-the-toy-then-tap-the-place, for keyboards and motor access. Placement games are a small room: toys on a shelf, the box and chair on the floor. Drop targets are invisible; a toy dropped anywhere on an object lands in the part it is over (inside or on the box, on or under the chair, beside either) and is drawn there, peeking out of the box or behind the chair legs. Games are recorded only as play (rounds and first-try rounds), never in screening or practice percentages or the comparison table.
- **Picture cards (`assets/pictures.js`):** for spoken directions, the picture icon shows one numbered card per step, and "if" directions show each condition beside its action. Showing them records help for that item, in screening and practice alike, because they are a cue. `tests/pictures.cjs` fails if any direction in the bank cannot be drawn.
- **Parent guide:** the info icon explains how to use the app, gives tips and lists every icon's meaning.
- **Report:** overview (road days, practice directions, independent practice rate, games), a skill profile (latest screen as dots, last 10 practice responses, recent sessions, status), the chosen session's detail and chart, and the practice plan with a home suggestion. The session picker is a styled dropdown.

Recordings: directions are `assets/audio/001–253.mp3`; mini-game prompts are `301–412.mp3` (rounds added later are numbered after 386, so earlier numbers never change). All are listed in `assets/audio/MAPPING.txt`. Add the files and rebuild; nothing else changes.

## Comparison table

Inside Accounts (behind the parent calculation), «جدول المقارنة» opens a table of every child on this device: gender, birth date, age, skills checked in the latest completed screen, independent rate in that screen and in all practice, practice directions, road days and games. Filter by gender and age group, sort by age, rates or name, and print it. Gender and birth date are optional when adding a child and can be edited in the table. A second table averages each age group (whole years) by boys, girls and everyone; each child counts once, and an unrecorded gender appears only under everyone. These are descriptive comparisons for follow-up, not age norms.

There is no import, export or backup: accounts and progress stay in this browser on this device.
