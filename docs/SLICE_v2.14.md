# Thimble Row: design notes, test report and asset manifest (v2.14.0)

Chapter 14 is a "festival neighborhood" vertical slice built from Alek's inspiration atlas. How it was built, with screenshots: [docs/media/process/v2.14](media/process/v2.14/README.md).

## Reference stack

| Role | Reference | The principle studied | How Thimble Row differs |
|---|---|---|---|
| Gameplay | Costume Quest | Exploring, meeting people, assembling a costume, and the costume transforming you in battle all serve one premise. | The premise is repair, not trick-or-treating. The costume (the Spanner Beetle) is sewn from three pieces that residents give you, and it is the key to the repair in the field (it turns rusted valves) as well as a battle form with a leak-sealing special. The trick-or-treat beat comes only after the repair, as a festival-night reward. |
| Visual | Tinykin (scale), plus the supplied warm-interior and water-ringed references | Tiny people in a world of giant household objects, warm lamplight indoors, readable silhouettes. | Houses are original giant objects (teacup, thread spool, sardine tin, rain boot, matchbox, thimble, a teapot water tower), drawn in the game's existing cardboard, ink-outline style. The island is ringed by water, the theme of the whole game. |
| Supporting | Okami (restoration) | A repair is felt when the world visibly changes, not when a popup says so. | The street is drained of colour (a real saturation pass over the world) until the Teapot is fixed. Then the colour spreads outward from the fountain in a ring, and the change stays: puddles gone, fountain running, stalls up, lanterns lit. |

Nothing is copied: no characters, maps, music, dialogue or art from those games. All visuals are drawn in code.

## The slice

1. Arrive by the fold-out map (unlocked after Chapter 13). The street is grey and flooded; the Teapot overflows.
2. Meet Mrs. Thimbleton, who explains the problem (the Waterkeeper retired; "everybody thought somebody else knew how").
3. Collect the horn (Bodkin) and the feelers (Pim); Mrs. Thimbleton sews the Spanner Beetle and Sam puts it on.
4. The Teapot's wheel only turns while you wear the Spanner Beetle. Inside: a boss encounter with Old Whistle, the panicking pressure kettle.
5. Three valve rooms. Rules: water goes wherever open pipes lead, and open ends spray; outlets have capacity, so too little room makes the fountain overflow; connected pipes share water both ways.
6. Colour blooms back out of the fountain. Walk into the plaza for the festival, the costume parade, and Rule Twelve: start with your own street.
7. Festival night: knock on the six doors for treats (once each).

## Controls

| Action | Keys |
|---|---|
| Walk | Arrows / WASD (or click to walk) |
| Talk, knock, turn the wheel | Z / Space |
| Menu (Party & Costumes to change costume) | Esc |
| Valve rooms | Click a valve, or Left/Right to pick and Z to turn. R: shut all. H: Tuppence's notes. Esc or Leave: exit (progress kept). |
| Battle | Same as the rest of the game (Act / costume special / Guard / Help / Inspect / Juice Box / Build) |

## Test report

- **Build:** 2.14.0, both `index.html` (served by `python -m http.server`) and the single-file `dist/cardboard-kingdom.html`.
- **Platform:** Windows 11 Home, the Claude desktop app's built-in Chromium browser pane, keyboard and mouse input simulated through the game's own input object (`CK.Input`). The pane was hidden, so the game was stepped with `CK.step()` and frames were captured from the canvas.
- **Observed results:**
  - Full keyboard play-through from the dock: walked to each resident and talked with Z; pieces collected in order Bodkin, Pim; Mrs. Thimbleton sewed and equipped the costume; the objective line updated at every step.
  - Without the costume the wheel stays shut (prompt reads "Wheel (rusted)"); with it the prompt reads "Turn the wheel!" and the door opens.
  - Old Whistle battle won with auto-battle; Tighten Up dealt 36 damage to Old Whistle in a direct test and set the 2-hit water block.
  - Valve rooms driven with mouse clicks on the valve wheels: every failure state appeared (shut, spray, dry, overflow) and recovered by turning valves back. Leaving mid-way at room 3 and re-entering resumed at room 3.
  - An exhaustive check of every valve combination (2, 16 and 64 combinations): room 1 has 1 solution, room 2 has 1, room 3 has 5. Every other combination produces a visible failure.
  - The colour bloom played after the repair and the street stayed in colour after the map was rebuilt; the festival started on walking into the plaza; night lighting and lantern glows worked; a treat was given once per door.
  - The Postcard Wall shows the new Thimble Row card (12 cards).
  - No console errors in either build.
- **Not tested:** touch/mobile controls, co-op (two players) in this chapter, audio (the pane was hidden), frame rate on slower machines.
- **Known issues:**
  - The bloom's "done" flag is set by the renderer; a game that never draws a frame (only possible in headless tests) would replay the bloom next time.
  - The festival trigger fires when you walk into the plaza; if you teleport in (debug only) it won't, because triggers fire on entering.

## Implemented, partial, planned

**Implemented (playable and tested)**
- Thimble Row map, six giant-object houses, the Teapot water tower, bottle-cap fountain, lantern strings, festival stalls.
- Five residents with dialogue that changes before and after the repair; Old Whistle as an NPC afterwards.
- The Spanner Beetle costume: three pieces, sewing scene, walking outfit, battle form, Tighten Up special, field power (turning the rusted wheel).
- Old Whistle boss battle.
- Three-room live valve puzzle with failure states, reset, notes, and saved progress per room.
- Okami-style colour drain and bloom, with persistent world changes.
- Festival night, costume parade, Rule Twelve, treat-or-treat at every door.
- Postcard Wall card, journal entries, objectives, saving.

**Partial**
- Warm interiors: only the inside of the Teapot (as the puzzle backdrop). The residents' houses are knock-and-talk, not walk-in rooms.
- The costume's field power has one use (the Teapot wheel). The atlas's "costume abilities change gameplay" would be stronger with a second valve elsewhere.

**Planned (not built)**
- A companion who follows you (the atlas's Pokemon card): for example, a bottle-cap beetle from Thimble Row who helps with valves.
- Walk-in interiors for the Teacup House and the Boot.
- More uses for the Spanner Beetle in older chapters (stuck sluice gates, Society valves).

## Asset manifest

Everything is drawn with canvas code at runtime; there are no image, audio or font files added this round.

| Asset | Where it lives |
|---|---|
| Giant-object houses (teacup, spool, sardine tin, boot, matchbox, thimble, teapot tower) | `js/game/thimble.js`, `CK.BuildingDraw.th_*` |
| Fountain, lantern strings, stalls, giant pencil, button stepping stones | `js/game/thimble.js`, `CK.DecoDraw.th_*` |
| Spanner Beetle walking outfit and battle form | `js/game/thimble.js`, `D.costumeBody` / `D.costumeHat` / `D.giant` overrides |
| Old Whistle (enemy and NPC) | `js/game/thimble.js`, `drawKettle` |
| Residents | the engine's existing `critter` character with new colours and accessories |
| Valve rooms (Teapot interior, pipes, valves, outlets) | `js/game/thimble.js`, `ValveScene` |
| Colour drain and bloom | `js/game/thimble.js`, `worldFx` (a hook added to `js/game/overworld.js`) |
| Sound | the engine's existing synthesized effects (`js/engine/audio.js`) |
