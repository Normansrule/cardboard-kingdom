# Changelog

## 2.15.0 — Rivet, and the road so far (2026-10-18)

How it was built: [docs/media/process/v2.15](docs/media/process/v2.15/README.md).

**Rivet, a companion who follows you**
- After the Thimble Row festival, a bottle-cap beetle waits by the fountain. Pim explains that bottle-cap beetles pick one person. Bring it along (or not yet), and name it **Rivet**.
- Rivet follows the party through every place in the Kingdom, and waits on the Kingdom side of the box when Sam goes home.
- **Rivet can smell buried buttons.** Two are hidden in every place. Get close and Rivet runs to the spot, wiggles, and a **!** pops up; only then does the mound appear. Dig for a giant button and 8 scraps. Rivet reacts every time, and at five buttons Pim has something to say.

**A new home on GitHub, with a README that shows the progress**
- An animated **progress tracker** (bars for the story, the design direction, the atlas prototypes, companions and destinations, plus counters for everything in the game), with the checklist behind it.
- The README opens with a reel of the Kingdom, an **animated progress map** (a cardboard road through the prologue, all 14 chapters and the epilogue, with a little box travelling it), and a grid of **15 clips recorded from this build**, one for every place, plus a battle and Rivet.
- Below that: the engineering puzzles in motion, the cast and costumes, and a table of every version with a picture of what it added.
- The story section now covers Chapters 11 to 14. The story maps and diagrams are back in the repo.
- Publishing instructions for a brand-new `cardboard-kingdom` repo in [GIT_SETUP.md](GIT_SETUP.md).

## 2.14.0 — Thimble Row (2026-10-18)

Chapter 14, a "festival neighborhood" vertical slice built from Alek's inspiration atlas, with a small reference stack: Costume Quest for the loop, Tinykin for scale, and Okami for visible restoration. Design notes, test report and asset manifest: [docs/SLICE_v2.14.md](docs/SLICE_v2.14.md). How it was built: [docs/media/process/v2.14](docs/media/process/v2.14/README.md).

**Story: Chapter 14, Thimble Row** (after Chapter 13; on the fold-out map)
- A tiny neighborhood on an island, where everyone lives in a giant everyday object: the **Teacup House**, **Bodkin's Spool Shop**, **The Sardine Tin**, **The Boot**, a matchbox swap shop and a thimble cottage. The festival is Saturday, but the **Teapot** water tower overflows down the street, and everything has gone grey.
- Why: the old Waterkeeper retired, and "everybody thought somebody else knew how" to work the valves.
- **New costume: the Spanner Beetle**, sewn by Mrs. Thimbleton from three residents' pieces (a sardine-tin shell, Bodkin's paperclip wrench horn, Pim's pink pipe-cleaner feelers). In the field it turns rusted valves (the Teapot's wheel won't move without it). In battle, **Tighten Up** gives one foe a big wrench twist and seals every leak (dries the party, blocks the next 2 water attacks).
- **Boss: Old Whistle**, the Teapot's pressure kettle, whistling for help all year.
- **New puzzle: three rooms of live valves inside the Teapot.** Water moves the instant you turn a valve. Room 1: water goes where open pipes lead, and open ends spray. Room 2: every outlet only takes so much, so too little room makes the fountain overflow. Room 3: connected pipes share water both ways. Shut-all reset, Tuppence's notes, and your room is saved if you leave.
- **The colour comes back.** After the repair, colour blooms out of the fountain across the whole street, and it stays: puddles gone, fountain running, festival stalls up, lanterns lit. Your party keeps its colour the whole time.
- **Festival night:** the costume parade, **Rule Twelve: start with your own street**, and treat-or-treat at every door (once each).
- Thimble Row joins the Postcard Wall (12 postcards).

**Engine**
- Chapters can draw world effects over the map (`worldFx`), used here for the colour drain and bloom.

**Docs**
- [docs/SLICE_v2.14.md](docs/SLICE_v2.14.md): the reference stack, controls, test report, implemented/partial/planned lists, and an asset manifest.
- New process folder [docs/media/process/v2.14](docs/media/process/v2.14/README.md) (35 captures and 2 GIFs). Thimble Row's residents in the character bible.

## 2.13.0 — Home Again (2026-10-17)

Chapter 13 takes place back on campus, and plays out the ending from the design direction: the model is still imperfect, the degree is still a decision, and Sam repairs one corner, answers a friend, and takes one manageable next step. How it was built: [docs/media/process/v2.13](docs/media/process/v2.13/README.md).

**Story: Chapter 13, Home Again** (after Reedwhistle Marsh; the fold-out map marks "Home (campus)" as a new chapter)
- **Sam's phone:** a three-week-old message from **Ren**, a classmate from studio: "hey, want to team up for the bridge crit? no pressure :)". Seen. Never answered. Crit Day is tomorrow, and Sam's model bridge got flattened by a desk lamp. Jules: "Messages don't expire. They just get heavier." Answer it (two ways, both fine).
- **The engineering studio**, a new interior in Brennan Engineering: corkboard crit notes, windows onto the fall trees, other students' models, and Sam's desk with the crushed model and a notebook with more red pen than pencil. Day, dusk and late-night versions.
- **New puzzle: the model bridge.** A small balsa truss with Ren (6 x 2 dots, 25 scraps). Squares fold; triangles hold. Deliberately forgiving.
- **Crit Day:** "It's not the strongest bridge in the room. But it's the best one either of you has made, and you can both tell me exactly why it stands."
- **The next step, with Dr. Okafor.** Three choices, all good: a lighter load plus the stream-restoration lab, a gap semester building a rain garden with Grandma in Riverbend, or a river independent study with Jules. "You're allowed to change it later. That's not failing. That's iterating."
- **Grandma video-calls** from her garden, and reacts to your choice.
- Late at night, Sam glues **one corner** of the old crushed model back together and keeps it on the shelf. **Rule Eleven: take the next step, not every step.**
- Afterwards campus is a free-time place: Ren and Dr. Okafor have new lines depending on your choice, and the kept model stays on the studio shelf.

**Docs**
- New process folder [docs/media/process/v2.13](docs/media/process/v2.13/README.md) (23 captures and a GIF). Ren in the character bible.

## 2.12.0 — Reedwhistle Marsh (2026-10-16)

Fishing, Animal Crossing style, and Chapter 12. How it was built: [docs/media/process/v2.12](docs/media/process/v2.12/README.md).

**Fishing**
- Once Fen gives you a cardboard rod, face any open water in the game and press Z. A round close-up shows the bobber and a fish shadow circling. Nibbles don't count; press when it really goes under. Story Mode widens the window, and auto-timed hits also catch fish for you.
- **14 kinds of paper fish**, living in different places: Blossom Minnows in spring, Lantern Eels at Lanternmere, Tin-Can Cod at Gull Point, a Spoonbill Sucker at the Ferryyard (Mallow will lose their mind), Reyes Pond Koi on campus, and more. A rare one appears in the marsh after the chapter.
- **Jules names every fish** ("That one's Gus") and has something to say about each kind. New kinds give 5 scraps.
- **Aquarium** in Patchwork Hall: every kind you've caught swims there, with your Fish Count.

**Story: Chapter 12, Reedwhistle Marsh** (after the Ferryyard)
- **Fen**, a frog ranger in a bucket hat who counts fish every morning, writes for help: eleven kinds used to live in Reedwhistle Brook, now there's one. The Silver Quill straightened it into a canal "for efficient drainage", so the water rushes, there are no slow pools, and Lilypad Row floods every rain.
- Help Fen with a three-fish survey (the fishing tutorial).
- **The Gulp**, a paper catfish the size of a rowboat, is jammed panicking against the Society's culvert grate. Boss fight, then free it.
- **New puzzle: give the brook its bends back.** Choose where the brook runs in each row: at least 4 bends, through both deep pools, around the houses, out at the outlet. Testing a straight brook shows it rushing through and flooding Lilypad Row.
- **The overworld brook is rebuilt from the exact path you drew**, with pools at every bend.
- Jules works out what they want to do (rivers), and Sam: "Maybe mine doesn't have to be straight either." **Rule Ten: give it room to wander.**
- The marsh joins the Postcard Wall (11 postcards; the wall switches to smaller cards above 10).

**Docs**
- New process folder [docs/media/process/v2.12](docs/media/process/v2.12/README.md) (23 captures and 2 GIFs). Fen and The Gulp in the character bible.

## 2.11.0 — The Costume Parade (2026-10-14)

Costumes as the main progression, from the [design direction](docs/DESIGN_DIRECTION.md): two new costumes built from pieces your friends give you, sewn by Tansy, and a parade to show them off. How it was built: [docs/media/process/v2.11](docs/media/process/v2.11/README.md).

**Two new costumes (11 in all)**
- **Lantern Moth**: paper wings, a glowing lampshade hat and felt antennae. Battle form: a great soft moth with a lampshade head. Special **Moonbeam**: every foe shows its next move and gets a weak spot (next 2 hits +40%), and the party mends a little. Field power: glows like the Lighthouse (brighter nights, finds hidden boxes).
- **Reed Warden**: a woven reed skirt, a heron-feather cap and a cattail staff. Battle form: a tall warden of river reeds with a basket helmet. Special **Reed Wall**: soaks up the next 3 water attacks, dries everyone, mends a little. Field power: wade through shallow water.

**Costume pieces come from friends** (no random drops)
- Six pieces, each handed over by someone whose place you've saved: Elder Dusk, Ibis and Tansy (Lantern Moth); Mallow, Mr. Lux and Old Tin (Reed Warden). Each one has a line about where it came from.
- A sparkle bubble with the piece in it floats over whoever has one for you. The piece pop-up shows the costume's three slots.
- Bring all three to **Tansy** at Patchwork Hall and she sews the costume.

**The Costume Parade**
- After the first new costume, Tansy throws a parade at Patchwork Hall that night: bunting, porch lanterns, confetti, a cheering crowd, and everyone you've met marching past, with Brindle's flower float (BEST FLOAT, self-awarded) at the end. Best costume: everyone.

**Brighter transformation**
- Every battle's "Cardboard up!" now has a pop of light, a ring of stars in each costume's colors, and the costume's name over each hero.

**Docs**
- New process folder [docs/media/process/v2.11](docs/media/process/v2.11/README.md) (15 captures and 2 GIFs).

## 2.11.0 — The Costume Parade (2026-10-14)

Costumes as the main progression, from the [design direction](docs/DESIGN_DIRECTION.md): two new costumes built from pieces your friends give you, sewn by Tansy, and a parade to show them off. How it was built: [docs/media/process/v2.11](docs/media/process/v2.11/README.md).

**Two new costumes (11 in all)**
- **Lantern Moth**: paper wings, a glowing lampshade hat and felt antennae. Battle form: a great soft moth with a lampshade head. Special **Moonbeam**: every foe shows its next move and gets a weak spot (next 2 hits +40%), and the party mends a little. Field power: glows like the Lighthouse (brighter nights, finds hidden boxes).
- **Reed Warden**: a woven reed skirt, a heron-feather cap and a cattail staff. Battle form: a tall warden of river reeds with a basket helmet. Special **Reed Wall**: soaks up the next 3 water attacks, dries everyone, mends a little. Field power: wade through shallow water.

**Costume pieces come from friends** (no random drops)
- Six pieces, each handed over by someone whose place you've saved: Elder Dusk, Ibis and Tansy (Lantern Moth); Mallow, Mr. Lux and Old Tin (Reed Warden). Each one has a line about where it came from.
- A sparkle bubble with the piece in it floats over whoever has one for you. The piece pop-up shows the costume's three slots.
- Bring all three to **Tansy** at Patchwork Hall and she sews the costume.

**The Costume Parade**
- After the first new costume, Tansy throws a parade at Patchwork Hall that night: bunting, porch lanterns, confetti, a cheering crowd, and everyone you've met marching past, with Brindle's flower float (BEST FLOAT, self-awarded) at the end. Best costume: everyone.

**Brighter transformation**
- Every battle's "Cardboard up!" now has a pop of light, a ring of stars in each costume's colors, and the costume's name over each hero.

**Docs**
- New process folder [docs/media/process/v2.11](docs/media/process/v2.11/README.md) (15 captures and 2 GIFs).

## 2.10.0 — The Ferryyard (2026-10-13)

A cozy graphics pass in the new style direction (Costume Quest + Animal Crossing), and Chapter 11 with two more friends from the [design direction](docs/DESIGN_DIRECTION.md). How it was built: [docs/media/process/v2.10](docs/media/process/v2.10/README.md).

**Cozy pass (every map)**
- **Livelier water**: white foam where water meets the bank, gently breathing in and out, and sparkles that blink across open water.
- **Fruit trees you can shake**: about a third of the leafy trees inside a map grow fruit (cherries, apples, peaches, oranges). Face a tree and press Z to shake it. Fruit drops once per tree and becomes a juice box; other trees sometimes hide scraps or a bug who says excuse me.
- **Name tags**: the talk prompt says who you're talking to ("Talk to Ember").

**Story: Chapter 11, The Ferryyard** (after the Kingdom Fair, from the fold-out map)
- **Tin-Lid Ferryyard**, a riverside town of stilt houses with washing lines, flower beds and a cooking pot, that was never put on the Royal Map. "Not on the Royal Map. Here anyway."
- **Mallow**, a gentle horned ferryperson, one of the "monster folk" from the flooded Brinemarsh. Collects terrible souvenir spoons.
- **The Approval Engine**, a Silver Quill machine left running for twenty years, stamping DENIED on every door because the houses are "on sticks". New boss fight with walking Form Folds.
- **Ibis**, the Society's old archivist (a magpie in a cardigan; "I don't peck. I file."). She drew the "Approved Neighborhoods" map that left the Ferryyard off, and the Society sent floodwater wherever the map was blank. She kept the real map.
- **New minigame, The Archive**: compare the official map with Ibis's real survey and find the three differences.
- **New puzzle, the accessible ramp**: build a way up from the dock that Grandpa Wick (in a cardboard wheelchair) and Mallow's cart can use. Gentle ramps only, a landing after every two, no stairs or steep bits, on a budget. Stairs are cheap, and useless for wheels.
- Finale: supper by the pot, the Ferryyard drawn onto the map, the Approval Engine now stamps WELCOME, every stilt house gets a number, and Mallow gives Sam a terrible spoon shaped like a ramp. **Rule Nine: ask who needs to use it.**
- The Ferryyard joins the Postcard Wall in Patchwork Hall (10 postcards).

**Docs**
- New process folder [docs/media/process/v2.10](docs/media/process/v2.10/README.md) (27 captures and 2 GIFs). Mallow, Ibis and Grandpa Wick in [docs/CHARACTERS.md](docs/CHARACTERS.md). Style direction added to the design doc.

## 2.9.0 — Patchwork Hall (2026-10-13)

The next piece of the [design direction](docs/DESIGN_DIRECTION.md): a recurring workshop hub, two new friends, and a scrapbook of everything you've rebuilt. How it was built, step by step with in-progress captures: [docs/media/process/v2.9](docs/media/process/v2.9/README.md).

**Patchwork Hall**
- The Kingdom's old makers' hall, reopened. It has a quilted roof, bunting, a dress form and a lumber pile out front. Travel there from any workbench's fold-out map once Blossom Hollow is safe.
- **The Postcard Wall** inside: one postcard for every place you've rebuilt (9 in all). Each one is a real before/after picture rendered from the game's own map with the story rolled back and forward. Press Z to flip a card between before and after.
- **Thank-you shelf**: the things you returned on Neighbor Round errands end up here (a trowel, a beach umbrella, a lantern, mittens, a star chart, a bucket). Delivered letters stack at the end of the shelf.
- Workbench and campfire outside, so it works as a home base.

**New friends (not party members)**
- **Tansy**, a dormouse costume maker with a fluffy tail and a measuring-tape scarf. "If you're only allowed to make good things, you stop making things." She asks Sam to make something just because: a tiny hat for Pip, a cape for Corry, or a paper boat folded from a corrected problem set. It's lopsided. It works. It goes on the **Just Because** shelf.
- **Brindle**, a badger carpenter in a canvas apron with a pencil behind his ear. He fixed the roof twice, and the second time it stayed. He is very confident about keystones. ("The keystone was excellent." / "It had nowhere sensible to put its confidence.") He is also entering the Spring Flower Show again.
- Sam finally says it out loud: "I used to make things because I wanted to see them work."

**Fixes**
- Long choice lists (the fold-out map late in the game has 9+ places) now switch to two columns, so they no longer run off the top of the screen.

**Docs**
- New process folder: [docs/media/process/v2.9](docs/media/process/v2.9/README.md), with 18 in-progress and final captures and a GIF tour.
- Tansy and Brindle in [docs/CHARACTERS.md](docs/CHARACTERS.md). The design direction's status table is updated.

## 2.8.0 — Act, Guard, Help, Inspect (2026-10-12)

Folding in the Costume Quest-led design direction (saved as [docs/DESIGN_DIRECTION.md](docs/DESIGN_DIRECTION.md), with a table of what's in the game so far). The cast and story stay the same.

**Battles: a real choice every turn**
- New commands next to Attack and your costume's Special:
  - **Guard**: stand in front of your friends. Single-target attacks come to you, and land half as hard. +1 special star.
  - **Help a friend**: dry them off, mend them a little and give them a star; their next hit lands 25% harder. If a friend is down, Help gets them back on their feet.
  - **Inspect**: listen first. Find a foe's weak spot (the next 2 hits on it land 40% harder) and see the name of its next move. +1 star.
- **Enemies telegraph their moves.** Every foe shows a "Next:" tag (hit, splash, everyone, drains stars, calls for help), so Guard and the Parasol are real decisions.
- Timing still improves an action and never gates it: a missed ring is a full hit, PERFECT adds 50%.
- Every command has a short explanation next to the menu.

**The Neighbor Round**
- Costume Quest's door-to-door, after the rebuild: once each place's big repair is done (the check dam, the floodgates, the bridge, the spillway, the festival lights, the living shoreline), a heart appears over every door you've knocked on.
- 24 visits show how your repair changed someone's day: floors that go clomp, a parade route past the door, a puddle named Gerald, a grandpa who says you listened to the brook first.
- One errand per place: a borrowed trowel, a braver beach umbrella, a damp lantern, a pair of big mittens, a star chart with a tick by every star, a bucket with a crab in it. Take it home for a few scraps.
- Every three visits earns a hand-cut thank-you stamp.

**4 new Battle Stamps (from the design direction)**
- **Handle with Care**: Guarding blocks 75% and dries you off.
- **Measure Twice**: Inspect marks a bigger weak spot (3 hits at +70%).
- **All Hands**: Help gives 2 special stars.
- **No One Left Behind**: Help brings a downed friend back at 60% health.
- The Stamp Book now fits all 15 stamps and shows your Neighbor Round count.

**Docs**
- New [docs/DESIGN_DIRECTION.md](docs/DESIGN_DIRECTION.md), 3 new screenshots, and the README and character bible are updated.
- New reference set in [docs/media/current](docs/media/current/README.md): 86 screenshots (every chapter by day and night, every battle and boss, every puzzle from start to result, costumes, menus, minigames) and 9 gameplay GIFs, captured straight from the game canvas.

## 2.7.0 — The Kingdom Post (2026-10-12)

**Story: Postmistress Pell and the Lost Letters**
- Meet **Postmistress Pell**, a pelican in a navy postal cap and the Kingdom's only post-bird since 1971. She stands near the start of every place in the Kingdom, with a "!" over her head until you say hello.
- This year's storms burst her dead-letter bag: fifty years of letters nobody could deliver (wrong address, no address, or addressed to somebody who hadn't turned up yet). One washes up in each place once that place is safe and dry.
- **8 Lost Letters**, each a small story about someone you already know:
  - Mayor Mossworth's letter to himself from 1925: did he ever go past the hills? ("Young Builder, that is the whole job.")
  - Captain Bess's mum, eleven summers ago: "Come home when you're ready. The kettle's always on. P.S. Wear a hat."
  - A crayon letter from **Sam, age 8**, to Professor Hoot: "Rivers always go DOWN hill. That is the main thing." He has taught it every autumn since.
  - Corvin's first, never-sent letter to the Queen, written the night he started the Silver Quill.
  - Ike to Grandma Rosie, 51 years late: he built the Gull Point lighthouse in a box she sent him.
  - Mr. Lux's mum: "If you are ever lost in the dark, stand still and listen for the reeds."
  - Ike's goodbye to Old Tin: "If a kid with my nose turns up someday, show them the stairs."
  - Corvin to his old deputy Mortimer Rook: "You have a good eye. One day, build something with it." (Rook stamps it.)
- **Twist:** Pell is who puts things in the box. Ike's frosty postcard from Chapter 9 was addressed "To my grandkid, someday," and she waited 54 years for someday.
- **The last letter:** once all eight are home, Pell hands Sam one more, carried since 1974 and addressed "To whoever builds next." It's from Grandma Rosie, age fourteen, the week her first box went soft. Sam writes one back, for whoever builds after them (three choices).
- Envelope bubbles float over anyone you're carrying a letter for, and talking to Pell tells you where the next one turned up.
- 5 new banter conversations (Corry's Gold Star, "Professor Sam", not reading other people's mail).

**Battle Stamps (Costume Quest style)**
- Each friend wears one Battle Stamp that changes how they fight. Pell gives you the first two (Gold Star and Tape Patch), every delivered letter earns another, and the last letter earns The Next Builder. 11 in all:
  - **Gold Star** hits 15% harder · **Tape Patch** mends 8% HP every turn · **Padded Envelope** +20% max HP
  - **Wax Seal** half as soaked · **First Class** starts battles with 2 special stars · **Return to Sender** PERFECT blocks hit back
  - **Care Package** juice boxes heal 50% more and dry everyone · **Express Post** 30% chance to strike twice · **Bubble Wrap** the first hit each battle does nothing
  - **APPROVED** +50% scraps and XP · **The Next Builder** get back up once per battle at half health, and hit 10% harder
- New stamps press themselves onto a friend who isn't wearing one, so they work straight away.
- Each friend's stamp shows next to their health bar in battle.
- New **Stamps & Letters** page in the pause menu: the Stamp Book (pick a friend, pick a stamp, swap freely) and the Letter Bag, where you can re-read every delivered letter.

**Engine**
- Small hooks in `battle.js` (setup, turn start, hit, guard, rescue, counter, soak, snack, loot) so add-on modules can change how fights work.
- `CK.clearToasts()` for automated screenshots.

**Docs**
- Postmistress Pell and the letters in [docs/CHARACTERS.md](docs/CHARACTERS.md), and 12 new screenshots.

## 2.6.0 — The Long Bridge (2026-10-12)

**Story: Chapter 10, The Long Bridge (the finale)**
- After Gull Point, a week of spring rain soaks the box. Inside: fairground music. The first Kingdom Fair in a hundred years is on the far side of the Great Gorge, and the old rope bridge washed away in Sam's Endless Storm.
- Inspector Rook (from Riverbend) needs one line across before anyone can build, but something keeps blowing everything into the gorge. Hats. Letters. A small goat (he's fine, he lives down there now).
- New monsters: the **Whirligigs**, paper pinwheels on pencils that can't stop spinning, and the **Little Drizzle**, the last of the Endless Storm. It's the voice at two in the morning that says you'll never finish anything. Sam doesn't beat it. They invite it to rain on the gardens.
- New minigame, **Kite flight**: Pip flies the first line across, like the 1848 kite contest at the Niagara gorge. Hold to climb, let go to glide, ride the updrafts, dodge the geese, and come in high enough to land.
- New puzzle, **The Long Bridge**: design a suspension bridge on a budget. Taller towers let the cables sag more, which means less pull on the cables and anchors. A flat-card deck twists in the wind (Tacoma Narrows, 1940).
- The whole Kingdom builds the bridge in a montage, and you can walk across it to the Fair.
- Finale: at the Fair, Sam starts going soft at the edges. Corry gives Sam his very last gold star. Back on campus the old box folds flat in the rain, Grandma calls ("A door isn't the box, love. It's what you build in it. And who you build it with."), and Sam and Jules fold a new box together, one step at a time (players take turns in co-op). Corry pops straight through: FRONT ROW! Rule Eight: build it together, and build it again.
- New ending credits with all eight Rules and a "Where are they now" for the whole cast.
- Workbench travel now includes the Great Gorge, and the Fair stays open for free roam. Every Fair-goer has something new to say.

**Easy Play: easier to pick up, easier to finish**
- **Goal marker**: a bouncing golden arrow and a ground ring over whatever the story needs next. When it's off screen, an arrow at the edge counts the steps. Works for every objective in every chapter.
- **Story Mode**: enemies hit half as hard, your hits land 30% harder, and the PERFECT timing window is much wider.
- After losing a fight you can now pick **Turn on Story Mode and try again**.
- **Auto-timed hits**: every attack and block lands PERFECT without pressing anything.
- **Run**: hold Shift (Player 2: `'`), or turn on Always run.
- **Text speed**: normal, fast or instant.
- New **Settings** screen (title screen and pause menu) for all of the above, plus screen shake and sound. Settings are saved in your browser.

**Engine**
- New `{goto}` cutscene step that changes chapter and keeps the script going. `{night}` steps can now carry their own caption.

**Docs**
- New GIFs (kite flight, bridge puzzle, the build montage, crossing at night, folding the new box, goal marker, settings) and 17 new screenshots.

## 2.5.0 — Friends (2026-10-12)

**Characters: everyone got a lot more interesting**
- Every friend now has something they want, something ordinary they're scared of, a quirk and a secret. Sam doodles bridges on everything. Sir Corrugate keeps a Ledger of Deeds and hands out gold-star stickers (he only has nine left). Pip counts everything and knows a fact for every occasion. Jules names every animal on sight and has secretly switched to marine biology. Grandma Rosie cheats at gin rummy, badly.
- Jules now has a surname: **Jules Marsh**, grandkid of Isaac "Ike" Marsh, the Keeper of Gull Point.
- New character bible: [docs/CHARACTERS.md](docs/CHARACTERS.md).

**Campfire Talks**
- Rest at a campfire and pick a friend who wants to talk. 16 talks in all (4 each for Corry, Pip, Jules and Grandma) open up in order as the story goes on, in a cozy night scene by a cardboard fire.
- Highlights: Corry's twelve years in a box in the garage, the day Grandma taped Pip's tail, Jules telling their mom about the major, and Grandma admitting she knew who Jules was all along.
- Each talk adds a heart: +4 max HP per heart and +1 attack every two hearts for that friend. All four of Grandma's talks make her Blueprint available after 1 failed test instead of 2.
- A heart floats over campfires when someone has a talk ready. New campfires in Lanternmere and on campus.

**Banter, fidgets and emotes**
- While you explore, the party chats in speech bubbles without stopping the game: about 30 short conversations tied to places and story moments, each played once.
- Stand still for a few seconds and everyone fidgets in character: Pip does loop-the-loops, Corry polishes his helmet, Sam stretches and doodles a bridge in the air, Jules sways and hums.
- Cartoon emotes (!, ?, hearts, sweat drops, music notes, sparkles, anger puffs, a tiny bridge) over heads, in banter bubbles, and on dialogue portraits for big feelings.

**Friends page**
- Pause → Friends: profiles with portraits, hearts, which talks are ready, each friend's bond perk, and their secret once you've shared three talks.

**Docs**
- New GIFs (campfire talk, banter, fidgets, the Friends page) and 15 new screenshots.

## 2.4.0 — The Keeper's Light (2026-10-12)

**Story: Chapter 9, The Keeper's Light**
- After the Lantern Festival, the box frosts over. Inside is a postcard of a lighthouse in Jules's grandpa's handwriting: "Gull Point needs a Keeper."
- Gull Point is the Kingdom's winter coast. Its cardboard lighthouse was built by a boy called Keeper Ike, Jules's grandpa, and now leans over a crumbling cliff.
- Harbormaster Brack (a walrus) wants a nine-foot seawall along the whole beach. He lost his family's cottage to a storm as a pup.
- The Shellbacks (hermit crabs) are raiding the wall site because its rubble buried their tidepools. Old Tin, their elder, has kept Ike's logbook in a jam jar since 1972.
- Twist: Ike and Grandma Rosie were childhood friends who built a reef here together. That's why the box let Jules through.
- New puzzle, the Living Shoreline: protect the cliff and keep the tidepools gently wet using rock breakwaters, oyster reefs and dune grass. Waves bend around the ends of anything in their way. The cheap concrete seawall always fails, because the waves bounce back and scour the beach.
- New minigame, Heave!: pull in rhythm to roll the lighthouse back from the edge on rails and rollers. In co-op, pulling together counts double.
- Finale: Jules finds a pencil mark on the stair wall, "MY GRANDKID, SOMEDAY?", and lights the lamp. Rule Seven: work with the water, not against it.
- Workbench travel now includes Gull Point.

**Art**
- New characters: the Shellbacks, Old Tin in his paint bucket, Keeper Gale the puffin and Harbormaster Brack the walrus.
- New: the striped lighthouse (leaning, then safe, with a sweeping beam at night), the Harbor Office, seawall stub with cones, tidepools that fill back up, dune grass, oyster reefs, a bobbing buoy, snow-dusted sand, and a starry finale on the headland.
- The cast lineup has a new "Grown-ups doing their best" row.

**Docs**
- New GIFs (living-shoreline puzzle, Heave!, the Keeper's light, the Old Tin battle), 14 new screenshots and an updated story map.

## 2.3.0 — The Lantern Festival (2026-10-11)

**Story: Chapter 8, The Lantern Festival**
- After Grandma's bridge, the glowing box on campus brings an invitation to Lanternmere's first Lantern Festival. Jules comes along this time.
- The lanterns are so bright that nobody has seen the moon in a year. The swarming Moth-kin are not attacking; they are lost without the moon.
- Mr. Lux, a heron who sells the Brilliant 3000, was lost on a dark marsh as a chick and never wants anyone to feel that again.
- Jules opens up about their grandpa, a lighthouse keeper: "A lighthouse doesn't light up the whole sky. It points."
- New puzzle, the Festival Lights: light every path square on a budget, keep Moonmeadow dark, and send no glow into the sky. Hooded lanterns, path posts and the glaring Brilliant 3000 each light a different shape.
- Finale: the moon is Grandma's paper lantern from 1971 ("For whoever is lost: look up"). Rule Six: light the path, not the sky.
- Workbench travel now includes Lanternmere.

**Art**
- New: the Moth-kin, Mr. Lux, the Lux Lanterns shop, festival stage and lantern strings, Moonmeadow grass, and a night-sky finale with stars, a rising paper moon and floating lanterns.
- Lanternmere's night switches from an orange glare to a deep starry blue once the lights are fixed.
- Little dust puffs at your feet when you walk, and butterflies by day.

**Docs**
- New GIFs (Lanternmere before and after, the lights puzzle, the festival finale, the Mr. Lux battle), new screenshots, an "After the credits" story map, and an updated cast lineup.

## 2.2.0 — Paper Birds (2026-10-11)

**Story: Chapter 7, Paper Birds**
- After the town meeting, take the bus from campus to Grandma Rosie's house in Riverbend.
- Grandma can see Pip (she taught Sam to fold him). The footbridge to her garden washed out in the storm.
- The attic "monsters" are Dust Bunnies, the dust of Grandma's first cardboard Kingdom from 1971. They were just lonely.
- Corvin comes home: Rosie folded him at age 11, the day her first bridge washed away.
- Mortimer Rook, Corvin's old deputy, wants a toll bridge. He just wants to matter, so he becomes the bridge inspector.
- New puzzle, the Willow Creek Arch: shape a stone arch so the push stays inside the stones. Press C to hang a chain with the same weights and flip its shape.
- Rule Five: an arch stands because every stone leans on the next one.

**Art**
- Characters breathe while idle and squash and stretch on every step.
- Grass tufts lit from the upper left, and paths worn slightly into the ground.
- New: Grandma's cottage (porch swing, dormer, flower boxes), the stone arch bridge, an attic battle stage with rafters and moonlight, Dust Bunnies and Mortimer Rook.

**Docs**
- New GIFs (arch puzzle, Riverbend, attic battle), new screenshots, and an updated cast lineup.

## 2.1.0 — Storm Season (2026-10-11)

**Art: Costume Quest-style 2.5D**
- Every character redrawn: big heads, dot eyes, rosy cheeks and homemade costumes worn right on the map.
- Sir Corrugate is now a teddy bear in fridge-box armor with a pot helmet. Pip, the critters, the Mayor and the Queen got soft volume shading.
- Monsters look a little scary when angry (glowing eyes, toothy grins) and sweet once calm. Magpies and Corvin are normal birds in suits.
- 2.5D world: houses, shops, chests and walls are real boxes with lit tops and shaded sides, soft shadows, recessed water, shaded trees, and a warm diorama light.
- Battle stage rebuilt as a cardboard theater: standing scenery flats, a perspective plank floor and stage lights. Battle costumes are boxy giants with the wearer's face peeking out.
- Characters moved into their own file, `js/engine/chars.js`.

**Story: Chapter 6, Storm Season**
- After the credits, a flyer with a silver quill logo announces a plan to fill in Reyes Pond for a parking garage.
- Meet Mr. Penwright, a polite developer. That night a storm hits campus, and Corry and Pip come through the box into the real world.
- New monsters, the Gutter Gremlins, turn out to be refugees from a flooded storm drain.
- New puzzle: design the Reyes Rain Garden with rain gardens, porous pavers and rain barrels, following the runoff arrows to keep the dorm dry.
- Twist: the silver quill was Grandma Rosie's prize for the best blueprint, and Penwright was her student. Sam's numbers win the town meeting, and Grandma's journal gets Rule Four: Leave room for the rain.

**Docs**
- New cast lineup, costume sheet, Chapter 6 GIFs and screenshots in the README.

## 2.0.0 — Rising Tide (2026-10-11)

**Story**
- New real-world prologue on a grey campus: Jules (roommate), Dr. Okafor, the internship letter, and the glowing recycling box at dusk.
- New twists: the hard hat says ROSIE (Grandma was the first Builder and the Summit Dam is hers), Corvin is a gum-wrapper bird she folded, and the spillway was what her dam was missing.
- New ending: Sam sails a cardboard boat home, the campus gets its color back, Grandma calls, and a regatta rolls the credits.
- Free-roam epilogue after the credits, with knight figures and the fold-out map for travelling back.

**Gameplay**
- 2-player co-op on one keyboard. Player 2 is Jules, who wears the Paper Parasol (Rain Shield).
- Soak meter: water hits soak cardboard, 50%+ soak means extra damage, 100% means floppy for a turn. Rain makes it worse; a dry round helps.
- Build mid-battle: Barricade (blocks 3 water hits) and Gutter (drains everyone).
- Field powers on the map: Bulldozer, Snowplow, Bridge, Lighthouse, Kite, Parasol.
- Weather: rain, storms with lightning and thunder, fog, snow, campus drizzle.
- Cardboard Boat Regatta minigame with three hulls.
- Shops (Rain Ponchos, Wax Crayon Seal, Juice Boxes), lemonade stands, campfires, cats, leaf piles, pumpkins, hidden chests.
- Grandma's Blueprint: after two failed tests a puzzle can show one solution.
- Autosave after every scene.

**Fixes**
- Cutscene `{fn}` steps never ran, so some ending effects were skipped. Fixed.
- Grey prologue no longer freezes browsers (replaced `ctx.filter` with a blend fill).

**Packaging**
- Single-file build (`tools/build_single.py`) and a download-and-play zip (`tools/package.sh`).
- Double-click launchers for Windows, macOS and Linux.
- GitHub Actions: syntax check, GitHub Pages deploy, and automatic Releases from `v*` tags.
- README with GIFs, screenshots and diagrams.

## 1.0.0 — The Cardboard Kingdom

- Custom canvas engine: scenes, tweens, coroutines, synthesized audio, vector-drawn characters.
- Four seasonal chapters (spring, summer, fall, winter) with day and night.
- Costume battles with timed hits; costumes Box Knight, Castle Tower, Paper Kite, Lighthouse, Bulldozer, Suspension Bridge, Snowplow, Hard Hat Engineer.
- Engineering puzzles: check dam, truss bridge, spillway and more.
- Animals and birds vs. misunderstood monsters, with the Silver Quill Society as the real villain.
