<div align="center">

# Cardboard Kingdom

**A cozy adventure about a burnt-out civil engineering student, a fridge box that turns out to be a door, and a kingdom made of cardboard that needs an engineer.**

[![Play in your browser](docs/media/buttons/play.svg)](https://normansrule.github.io/cardboard-kingdom/play.html) [![Play any version](docs/media/buttons/versions.svg)](https://normansrule.github.io/cardboard-kingdom/versions.html)

[The website](https://normansrule.github.io/cardboard-kingdom/) · [Download](https://github.com/Normansrule/cardboard-kingdom/releases/latest) · [Changelog](CHANGELOG.md) · [The story](docs/STORY.md)

![A walk through the Kingdom](docs/media/readme/hero.gif)

</div>

## What it is

Cardboard Kingdom is a short, wholesome role-playing game in the spirit of Costume Quest. You play Sam, a college student who has stopped enjoying their civil engineering degree, until a glowing fridge box drops them into a kingdom of cardboard animals whose homes keep washing away. You explore four seasons of villages, turn homemade costumes into giant battle forms, and fix each place by actually engineering something (dams, flood gates, bridges, rain gardens) with puzzles where the water is simulated, so you watch your design hold or fail. It's made for anyone who likes cozy games, from kids playing with a parent to adults who need a gentle reminder of why they liked building things. It runs in any browser, alone or with a friend on the same keyboard, with nothing to install.

## Key features

- **Costume Quest-style battles.** Act, Guard, Help and Inspect, plus a Special for each of 12 costumes. Timed button presses make a hit stronger but never decide whether it lands.
- **Engineering puzzles with a Test button.** 13 of them, from a check dam to live water valves. Build, test, watch the water, revise. Grandma's Blueprint is there if you're stuck.
- **A full story.** A prologue, 14 chapters and an epilogue, with twists that are kinder than you'd expect. ([Spoilers here.](docs/STORY.md))
- **All four seasons, day and night.** Cherry blossoms in spring, beaches in summer, falling leaves in autumn, snow in winter. Days are bright and cute; nights are darker and cozy.
- **Two-player co-op** on one keyboard. Player 2 is Jules, with real turns in battle.
- **Repairs that stay fixed.** Neighbors thank you, postcards show places before and after, and one street gets its colour back.
- **A kingdom worth wandering.** Every place is laid out by a small world generator: lusher and drier patches, wildflower meadows, reed beds, hedges, front yards with mailboxes, signposts at the crossroads, and landmarks off the beaten path (picnic spots, wells, lookouts, cairns, snow forts) with stepping-stone trails leading to them. It's seeded, so each place looks the same every time you visit.
- **Things to do between chapters.** 20 critters to sketch for the Field Guide, 30 paper cranes hidden across ten places, 20 buried treasures with hand-drawn maps, Odd Jobs from the neighbours, and 19 challenges with bronze, silver and gold tiers. All of it lives in the Kingdom Book (pause menu).
- **Neighbors who become friends.** Nine villagers (Clover, Robin, Mayor Mossworth, Dabble, Nib, Ember, Bristle, Professor Hoot and Mama Burrow) each have hearts, things they love, and three heart stories about an ordinary worry and how it turns out. At five hearts they give you a keepsake hat. Pause → Neighbors shows who everyone is.
- **A Kingdom that lives together.** Neighbors ask small favours that send you all over the Kingdom, go about their own little lives on the map, and gather for a Neighborhood Picnic with a group photo once you've got to know them.
- **A patch of your own.** Grandma Rosie's old garden in Blossom Hollow is yours to decorate with 31 garden pieces. Critters you've sketched come to visit when there's something they like, and night critters visit at night.
- **Skins earned by playing.** The Catalogue has 20 paint patterns for costumes and giants and 28 hats, bought with bottle caps that you only get by playing. Some can't be bought at all: they're gold-tier challenge rewards, buried treasure or keepsakes from friends.
- **Fair play, no microtransactions.** No real money, no ads, no daily streaks, no timers, nothing that expires. An optional break reminder (off, 30, 45, 60 or 90 minutes) suggests a stretch. More in [docs/PLAYTIME.md](docs/PLAYTIME.md).
- **Cozy extras.** Fishing (14 kinds), fruit trees to shake, the Kingdom Post, Patchwork Hall, and Rivet, a bottle-cap beetle who digs up buttons.
- **Easy Play settings.** Story Mode, auto-timed hits, a goal marker, text speed, always run, and a Reduce motion switch that follows your computer's own setting.
- **A website you can play with.** The project page is a postcard from the Kingdom, and its centerpiece is a real (tiny) check dam: build it, press Test, and watch the water hold or leak.
- **No dependencies.** A custom engine in plain JavaScript on an HTML (HyperText Markup Language) canvas. Every sprite is drawn in code, so the whole game fits in one 1.2 MB (megabyte) file.

## Screenshots

Version 2.17 redesigned the game's interface and the website around one idea, the **Kingdom Post** (more in [Design](#design)).

**The website.** A postcard from Blossom Hollow, with the first job of the game playable on the back of it:

| Day desk | Night desk | Phone |
|---|---|---|
| ![The website: a postcard reading "Wish you were here. Bring a hard hat."](docs/media/readme/post/site-hero.png) | ![The same postcard on the navy night desk](docs/media/readme/post/site-dark.png) | ![The website at phone width](docs/media/readme/post/site-phone.png) |

![The postcard dam: a leaky first try, then a triangle that holds, and the card flips to the real puzzle](docs/media/readme/post/site-dam.gif)

**The cast.** Version 2.18 made everyone livelier. Eyes look around and follow you, villagers wave as you walk up, happy friends cheer and hop, and every step kicks up a little dust. Since 2.19 they are bigger on the map, villagers greet you with a little emote bubble, and Sam cheers when something good happens. Since 2.20 you can see who's inside each battle costume, and their faces react to every hit and win. Since 2.21 villagers potter about and hum to themselves:

![Sam walking with dust puffs, Jules glancing around, Sir Corrugate cheering, Clover the bunny waving and Pip flapping](docs/media/readme/post/cast-motion.gif)

**The game.** Letters, stamps and postmarks, in day paper and night paper:

![Dialogue as an airmail letter, a stamped reward, and the pause menu as a letter at night](docs/media/readme/post/game-post.gif)

| Title | Dialogue | A choice |
|---|---|---|
| ![Title screen with the menu on an airmail card](docs/media/readme/post/title.png) | ![Sir Corrugate's portrait as a stamp on an airmail letter](docs/media/readme/post/dialogue.png) | ![A question card with its answers stacked above it](docs/media/readme/post/choice.png) |
| **Pause (day paper)** | **Pause (night paper)** | **Settings** |
| ![The pause menu written as a letter: Dear Sam, Paused](docs/media/readme/post/pause.png) | ![The same letter in night paper](docs/media/readme/post/night-pause.png) | ![Settings as a postcard form, with the new Menu paper option](docs/media/readme/post/settings.png) |
| **A reward** | **A puzzle that held** | **Battle** |
| ![New costume: Kite Courier, on a stamp with a Kingdom Post postmark](docs/media/readme/post/reward.png) | ![The dam holds, with a HELD postmark](docs/media/readme/post/puzzle-held.png) | ![Battle command menu](docs/media/readme/post/battle.png) |
| **Workbench** | **Journal** | |
| ![The Cardboard Workbench on an airmail card](docs/media/readme/post/workbench.png) | ![Sam's Journal on ruled notebook paper](docs/media/readme/post/journal.png) | |

And every place in the game, recorded from the current build:

<table>
<tr>
<td align="center" width="33%"><img src="docs/media/readme/campus.gif" alt="Riverside University"><br><b>Riverside University</b><br><sub>The real world: grey until Sam finds their way back.</sub></td>
<td align="center" width="33%"><img src="docs/media/readme/spring.gif" alt="Blossom Hollow"><br><b>Ch. 1 · Blossom Hollow</b> (spring)<br><sub>Cherry blossoms and a cardboard dam.</sub></td>
<td align="center" width="33%"><img src="docs/media/readme/summer.gif" alt="Sunpatch Shores"><br><b>Ch. 2 · Sunpatch Shores</b> (summer)<br><sub>Beaches and flood gates.</sub></td>
</tr>
<tr>
<td align="center"><img src="docs/media/readme/fall.gif" alt="Amberleaf Woods at night"><br><b>Ch. 3 · Amberleaf Woods</b> (autumn)<br><sub>Falling leaves and a truss bridge.</sub></td>
<td align="center"><img src="docs/media/readme/winter.gif" alt="Frostfold Peak"><br><b>Ch. 4 · Frostfold Peak</b> (winter)<br><sub>Snow and Grandma's Summit Dam.</sub></td>
<td align="center"><img src="docs/media/readme/riverbend.gif" alt="Riverbend"><br><b>Ch. 7 · Riverbend</b><br><sub>Grandma's cottage and a stone arch.</sub></td>
</tr>
<tr>
<td align="center"><img src="docs/media/readme/lanternmere.gif" alt="Lanternmere"><br><b>Ch. 8 · Lanternmere</b><br><sub>Light the path, not the sky.</sub></td>
<td align="center"><img src="docs/media/readme/gullpoint.gif" alt="Gull Point"><br><b>Ch. 9 · Gull Point</b><br><sub>A leaning lighthouse and a living shoreline.</sub></td>
<td align="center"><img src="docs/media/readme/longbridge.gif" alt="The Great Gorge"><br><b>Ch. 10 · The Long Bridge</b><br><sub>Kites and a suspension bridge.</sub></td>
</tr>
<tr>
<td align="center"><img src="docs/media/readme/patchwork.gif" alt="Patchwork Hall"><br><b>Patchwork Hall</b> (the hub)<br><sub>The Postcard Wall and the Costume Parade.</sub></td>
<td align="center"><img src="docs/media/readme/ferryyard.gif" alt="The Ferryyard"><br><b>Ch. 11 · The Ferryyard</b><br><sub>A ramp everyone can use.</sub></td>
<td align="center"><img src="docs/media/readme/marsh.gif" alt="Reedwhistle Marsh"><br><b>Ch. 12 · Reedwhistle Marsh</b><br><sub>Fishing and putting the bends back in a brook.</sub></td>
</tr>
<tr>
<td align="center"><img src="docs/media/readme/thimble.gif" alt="Thimble Row"><br><b>Ch. 14 · Thimble Row</b><br><sub>Giant teacups, live valves, a festival.</sub></td>
<td align="center"><img src="docs/media/readme/battle.gif" alt="A battle"><br><b>Battles</b><br><sub>Everyday costumes become giant battle forms.</sub></td>
<td align="center"><img src="docs/media/readme/rivet.gif" alt="Rivet"><br><b>Rivet</b><br><sub>A companion who digs up buried buttons.</sub></td>
</tr>
</table>

The engineering puzzles in motion:

| Spillway (Ch. 4) | Festival lights (Ch. 8) | Accessible ramp (Ch. 11) |
|---|---|---|
| ![Spillway test](docs/media/current/gif/puzzle_spillway_test.gif) | ![Festival lights](docs/media/current/gif/puzzle_festival_lights.gif) | ![Ramp test](docs/media/process/v2.10/ramp_test.gif) |
| **Give the bends back (Ch. 12)** | **The model bridge (Ch. 13)** | **Live valves and the colour bloom (Ch. 14)** |
| ![Bends puzzle](docs/media/process/v2.12/bends_puzzle.gif) | ![Model bridge](docs/media/process/v2.13/model_bridge.gif) | ![Colour bloom](docs/media/process/v2.14/colour_bloom.gif) |

More pictures: the [cast](docs/media/cast.png), the [costumes](docs/media/costumes.png), the [full reference set](docs/media/current/README.md) of every place, boss and puzzle, and [how each version was built](docs/media/process/README.md).

## Where it's at

![Progress tracker](docs/media/readme/tracker.svg)

<details>
<summary><b>The checklist behind the bars</b></summary>

| Area | Status | Notes |
|---|---|---|
| Main story: prologue, Chapters 1 to 14, epilogue | Done | All playable start to finish, solo or two-player co-op. |
| Four seasons, day and night | Done | Spring, summer, autumn and winter chapters, each with a night version. |
| Costume Quest battles (Act, Guard, Help, Inspect, Specials) | Done | 12 costumes, each with a battle form; timing helps but never gates. |
| Engineering puzzles with a Test button | Done | 13 puzzles, from dams to live valves; Grandma's Blueprint if you're stuck. |
| Repairs stay visible | Done | Postcards before/after, the Neighbor Round, the Thimble Row colour bloom. |
| Easy Play (Story Mode, goal marker, text speed, Reduce motion) | Done | |
| Cozy extras: fishing, fruit trees, the Post, Patchwork Hall | Done | |
| Things to do: critters, paper cranes, Odd Jobs, challenges, Catalogue | Done | 2.22. Caps are earned only by playing. |
| Your patch and buried treasure | Done | 2.23. 20 treasure maps, 31 garden pieces, critter visitors. |
| Neighbor friendships | Done | 2.24. 9 villagers, hearts and presents, 27 heart stories, 9 keepsake hats. |
| Favours, picnic, little lives | Done | 2.25. 9 favours, the Neighborhood Picnic and group photo, idle activities. |
| Companions who follow you | 1 of 3 | Rivet (2.15). Two more planned. |
| Walk-in interiors | Some | Patchwork Hall, the engineering studio, inside the Teapot. Houses are knock-and-talk. |
| Destinations from the design direction | 2 of 16 | The Ferryyard and Reedwhistle Marsh so far. |
| Atlas prototypes (festival neighborhood, a place that improves, three-room puzzle) | Done | Thimble Row covers all three. |
| Atlas prototypes (delivery kart, giant repair machine) | Planned | |
| Toon-shaded 3D renderer | Not planned | The game is a 2.5D canvas engine on purpose. |

</details>

## Setup and usage

**Play online:** [normansrule.github.io/cardboard-kingdom/play.html](https://normansrule.github.io/cardboard-kingdom/play.html), or start at [the website](https://normansrule.github.io/cardboard-kingdom/) and press Play. Your progress saves in the browser.

**Play offline:**
1. Download `cardboard-kingdom-<version>.zip` from the [latest release](https://github.com/Normansrule/cardboard-kingdom/releases/latest) and unzip it.
2. Double-click the launcher for your computer: `play.bat` on Windows, `play.command` on macOS (the first time, right-click it and choose **Open**), or `play.sh` on Linux.
3. Or just open `cardboard-kingdom-single-file.html` in any browser. That one file is the whole game.

**Run from source:** clone the repo and open `play.html` for the game (`index.html` is the website). There's no build step. If your browser is fussy about local files, serve the folder instead:

```bash
git clone https://github.com/Normansrule/cardboard-kingdom.git
cd cardboard-kingdom
python3 -m http.server 8000      # then visit http://localhost:8000 (website) or /play.html (game)
```

### Controls

| Action | Solo | Player 1 (co-op) | Player 2 (co-op) |
|---|---|---|---|
| Move | Arrows / WASD / click | WASD | Arrow keys |
| Talk / confirm | Z, Space, Enter | Space, Z, E, F | Enter, `.`, `/`, Right Shift, Numpad 0 |
| Back | X, Esc | X, Q, Esc | Backspace, `,` |
| Menu | Esc | Esc | Esc |
| Run | Shift | Left Shift | `'` (quote) |
| Sound | M | M | M |

In co-op battles, Player 1 controls **Sam and Sir Corrugate** and Player 2 controls **Jules and Pip**. On a touch screen, tap where to walk.

### Developer notes

```bash
for f in js/*.js js/*/*.js; do node --check "$f"; done   # every script parses
python3 tools/build_single.py                            # dist/cardboard-kingdom.html
bash tools/package.sh                                    # dist/cardboard-kingdom-<VERSION>.zip
```

Handy in the browser console: `CK.debug.chapter('summer')` jumps to a chapter, `CK.startPuzzle('rain_garden')` opens a puzzle (also `willow_arch`, `festival_lights`, `living_shore`, `long_bridge`), and `CK.autoSkip = true` fast-forwards dialogue. `CK.debugPost.stamps()`, `.letters()` and `.deliverAll()` shortcut the Kingdom Post.

## Project structure

```
cardboard-kingdom/
├── index.html              # the website (GitHub Pages landing page)
├── play.html               # the play page: loads the scripts in order, plus loading and error cards
├── css/post.css            # shared design tokens (colour, type, spacing, motion) for both pages
├── fonts/                  # Bagel Fat One and Nunito (SIL Open Font License), served locally
├── site/                   # the website's styles, script (dam puzzle, night desk, stamp viewer) and images
├── js/
│   ├── main.js             # boot + debug helpers
│   ├── engine/
│   │   ├── core.js         # fixed 60 Hz loop, scene stack, input, tweens and easing, coroutines, toasts
│   │   ├── audio.js        # synthesized music and sound effects (Web Audio, no files)
│   │   ├── draw.js         # the drawing kit: day/night paper tokens, postcards, stamps, postmarks, buttons, 2.5D shading
│   │   └── chars.js        # every character, costume, battle form and monster, drawn in code
│   └── game/
│       ├── data.js         # party, costumes, enemies, builds, shop, seasons
│       ├── state.js        # new game, save and load (browser storage)
│       ├── script.js       # dialogue box, choices, pop-ups and the tiny cutscene language
│       ├── maps.js         # the four seasonal maps
│       ├── overworld.js    # exploring, weather, field powers, the on-screen status panels
│       ├── battle.js       # turn-based battles, soak, building, timed hits
│       ├── puzzles.js      # engineering puzzles + Grandma's Blueprint
│       ├── assist.js       # Easy Play: settings, Story Mode, goal marker, Reduce motion
│       ├── menus.js        # title, pause, party, workbench, journal, ending, credits
│       ├── story.js        # Chapters 1 to 5
│       ├── campus.js, storm.js, riverbend.js, lanternmere.js, gullpoint.js, longbridge.js
│       │                   # the real world and Chapters 6 to 10
│       ├── ferryyard.js, marsh.js, home.js, thimble.js
│       │                   # Chapters 11 to 14
│       ├── friends.js      # campfire talks, bonds, banter, the Friends page
│       ├── post.js         # the Kingdom Post, Lost Letters, Battle Stamps
│       ├── neighbors.js    # the Neighbor Round after each repair
│       ├── patchwork.js    # Patchwork Hall and the before/after postcards
│       ├── costumes.js     # costume pieces, the Costume Parade, the transformation flash
│       ├── cozy.js         # foamy water, shakeable fruit trees, name tags
│       └── rivet.js        # Rivet the companion
├── tools/
│   ├── build_single.py     # inlines everything into one HTML file
│   └── package.sh          # builds the download zip
├── docs/
│   ├── STORY.md            # the whole plot (spoilers)
│   ├── CHARACTERS.md       # the character bible
│   ├── DESIGN_DIRECTION.md # the long-form design direction
│   └── media/              # readme/ (screens and clips), current/, process/ (each version's captures)
├── DESIGN.md               # the Kingdom Post design system
├── play.sh / play.command / play.bat / PLAY.txt
└── .github/workflows/      # check.yml (syntax check), pages.yml (GitHub Pages), release.yml (tagged zips)
```

Everything shares one global `CK` namespace. Scenes (overworld, dialogue, battle, puzzle) stack on top of each other, cutscenes are generator-based coroutines, and all the art is vector drawing on the canvas, so there are no image files in the game itself.

## Design

**The look.** Costume Quest meets Animal Crossing, built out of a craft drawer: corrugated card, masking tape, marker outlines and soft volume shading on a 2.5D canvas. Days are bright and candy-coloured, nights go deep blue with warm windows and lanterns, and each season has its own palette. The long version is in [DESIGN_DIRECTION.md](docs/DESIGN_DIRECTION.md).

**The interface is the Kingdom Post.** The game is about fixing other people's homes, and the Kingdom already runs a post office, so the interface treats everything as mail between you and the Kingdom. Words arrive on postcards, pictures arrive on stamps, and things that *happened* get a postmark. Version 2.17 rebuilt both the game's menus and the website around that idea. The full system is in [DESIGN.md](DESIGN.md).

- **A cast you want to hug.** Big heads, small bodies, chunky shoes and soft blush. The kids have Costume Quest eyes (whites and big pupils that look around), and the animals have shiny Animal Crossing eyes. Each main character has one thing you'd spot across the map: Sam's airmail-striped scarf, Jules's workshop goggles, Sir Corrugate's violet cape, and Pip's mail satchel.
- **Characters act, not just stand.** Every mood has a pose: happy friends cheer, grown-ups wave, a fright throws the arms out, sadness droops, and cross means fists. Idle characters breathe, glance around and hop now and then, walkers lean into the step, whoever is talking moves their mouth, and villagers turn, watch you and wave as you pass with a little emote bubble. On the map everyone is drawn a size up so faces read at a glance. In battle you can see the kid inside each costume, who winces at a hit and beams at a win, and monsters squeeze their eyes shut when a hit lands. Villagers potter about and hum to themselves when you're not with them. With Reduce motion on, the poses stay and the bouncing stops.
- **One colour system, two lights.** An airmail-blue desk, cream postcards, deep violet-navy ink (never pure black), a violet postmark and the red-and-blue airmail edge. At night the desk goes navy and the paper stays warm, like post read under a lamp. The website follows your computer's light or dark setting (or the Night desk switch), and the game's new **Menu paper** setting follows the in-game time of day, or you can pin it to Day or Night.
- **Two typefaces with clear jobs.** Bagel Fat One, a chunky rounded display face, for headings, names and stamps. Nunito, a soft rounded sans, for everything you read. Both are bundled, so the game looks the same offline.
- **A spacing scale.** Everything sits on a 4-pixel rhythm (4, 8, 12, 16, 24, 32, 48), with two big steps (72 and 112) to separate sections on the website. Type sizes on the website scale smoothly between phone and desktop.
- **Shapes that mean something.** Postcards hold messages (dialogue, questions, the title menu). Letters hold lists you work through (the pause menu opens "Dear Sam," and ends with your goal as a P.S.). Stamps hold pictures (portraits, rewards, chapter screenshots). Postmarks only appear when something is done: a costume earned, a dam that held, a game saved.
- **Motion with weight.** One ease-out curve for everything: quick to respond, soft to land. Buttons are ink pads that sink when pressed. The big moments are physical: a postmark lands with a little press, and the website's dam card flips over to show the real puzzle. Menu cursor moves don't animate at all.
- **Reduce motion is a real alternative, not an off switch.** With it on (it follows your computer's setting), the postmark appears without the press, the dam card cross-fades instead of flipping, and the drifting, bobbing and screen shake stop. Everything still changes state; it just stops travelling.
- **Every state is designed.** The play page has a "Sorting the post..." loading card, a "The post got soggy" error card with a Try again button, and a message for browsers without JavaScript. The journal, the stamp book and the dam all say what goes there when they're empty.
- **Accessible by default.** Text is at least 4.5:1 contrast against its background, the bar set by WCAG (the Web Content Accessibility Guidelines). The website's dam is fully playable from the keyboard (arrow keys move, 1 to 3 place cardboard, 0 clears), results are read out to screen readers, and an automated axe-core check finds no issues in light, dark or phone layouts. The layout holds down to a 390-pixel-wide phone with no sideways scrolling.

How it got here: the three concepts Alek chose between (Model Shop, Pop-up Book and Kingdom Post) and the build captures are in [docs/media/process/v2.17](docs/media/process/v2.17/).

## Versions

Every version can be played in the browser from the [versions page](https://normansrule.github.io/cardboard-kingdom/versions.html), and every release on GitHub has its own Play button. See [CHANGELOG.md](CHANGELOG.md). Each version's before, work-in-progress and final captures are in [docs/media/process](docs/media/process/README.md).

---

Made with cardboard, tape, and a lot of love.
