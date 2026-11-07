---
name: Cardboard Kingdom
description: The Kingdom Post. Everything is mail between you and a kingdom that needs an engineer.
colors:
  desk: "#2c56a3"
  desk-deep: "#21447f"
  desk-night: "#141d3d"
  desk-soft: "#dfe8fb"
  card: "#fbf3e2"
  card-2: "#f4e8cf"
  stamp-paper: "#f7f1e6"
  line: "#e3d3b4"
  ink: "#2a2140"
  ink-soft: "#5a5070"
  violet: "#5b3fa0"
  violet-deep: "#3d2875"
  label: "#b8322a"
  air-red: "#e2483a"
  air-blue: "#2c56a3"
  brook: "#2f8fd0"
  ok: "#2f7d4a"
  night-sheet: "#26335f"
  night-text: "#f6ecd6"
  night-accent: "#b9a4ff"
typography:
  display:
    fontFamily: "Bagel Fat One, Arial Rounded MT Bold, Trebuchet MS, sans-serif"
    fontSize: "clamp(2.6rem, 1.9rem + 3.4vw, 4.6rem)"
    fontWeight: 400
    lineHeight: 1.02
  h2:
    fontFamily: "Bagel Fat One, Arial Rounded MT Bold, sans-serif"
    fontSize: "clamp(2rem, 1.6rem + 2vw, 3.25rem)"
    fontWeight: 400
    lineHeight: 1.02
  h3:
    fontFamily: "Bagel Fat One, Arial Rounded MT Bold, sans-serif"
    fontSize: "clamp(1.3rem, 1.2rem + 0.5vw, 1.6rem)"
    fontWeight: 400
  lead:
    fontFamily: "Nunito, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(1.125rem, 1.05rem + 0.4vw, 1.3rem)"
    fontWeight: 600
    lineHeight: 1.55
  body:
    fontFamily: "Nunito, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(1rem, 0.96rem + 0.2vw, 1.125rem)"
    fontWeight: 600
    lineHeight: 1.55
  small:
    fontFamily: "Nunito, Segoe UI, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 800
rounded:
  card: "6px"
  control: "12px"
  pill: "999px"
spacing:
  s1: "4px"
  s2: "8px"
  s3: "12px"
  s4: "16px"
  s5: "24px"
  s6: "32px"
  s7: "48px"
  s8: "72px"
  s9: "112px"
components:
  button-primary:
    backgroundColor: "{colors.violet}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "14px 24px 16px"
  button-quiet:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "14px 24px 16px"
  postcard:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
  stamp:
    backgroundColor: "{colors.stamp-paper}"
    padding: "8px"
---

# Design System: Cardboard Kingdom

## Overview

**The Kingdom Post.** The game is about fixing other people's homes, and the Kingdom already runs a post office, so the interface treats everything as mail between you and the Kingdom: words arrive on postcards, pictures on stamps, and things that happened get a postmark. It sits on top of the game's world art (Costume Quest meets Animal Crossing, built from a craft drawer) and never competes with it.

The same system runs in two places. The website (`index.html`, `site/`) is CSS (Cascading Style Sheets) built on `css/post.css`. The game (`play.html`) draws its interface on a canvas with `js/engine/draw.js`, which mirrors those tokens as `D.C` and the day/night `PAPER` palettes.

## Colors

### Primary
- **Violet ink** (`violet` #5b3fa0, pressed edge `violet-deep` #3d2875): the one action colour. Play buttons, the selected row, postmarks, the name tab on dialogue.

### Secondary
- **Airmail red and blue** (`air-red` #e2483a, `air-blue` #2c56a3): only ever together, as the diagonal airmail edge on postcards that carry a message.
- **Label red** (`label` #b8322a): small uppercase field labels ("To", "Cardboard", "Goal") and failure messages.

### Neutral
- **The desk** (`desk` #2c56a3 by day, `desk-night` #141d3d at night): the ground everything is posted on, with a faint dot texture.
- **Paper** (`card` #fbf3e2, `card-2`, `stamp-paper`, `line` #e3d3b4): postcards, stamps and ruled lines. Paper stays warm at night, like post read under a lamp.
- **Ink** (`ink` #2a2140, `ink-soft` #5a5070): a violet-navy, never pure black.

### Named Rules
- **Night is the desk, not the paper.** On the website, dark mode changes the desk and keeps the paper cream. In the game, the night `PAPER` palette (`night-sheet`, `night-text`, `night-accent`) is used only by menus, dialogue, HUD and buttons. Chapter art keeps its own colours.
- **Contrast floor 4.5:1** for anything you read, in both lights.

## Typography

Bagel Fat One for headings, names, stamps and button labels on the web. Nunito (variable, 400 to 800) for everything you read. Both are bundled in `fonts/` (SIL Open Font License) so offline copies match.

### Hierarchy
- Website: display (hero headline) > h2 (section) > h3 (card heading) > lead > body > small, all fluid between phone and desktop.
- Game (960×540 canvas): `D.T` 70 / 30 / 24 / 20 / 17 / 14. Nothing readable goes below 14. `D.font` switches to the display face at 26px and 700 weight or above.

### Named Rules
- **Display face is for names, not sentences.** Paragraphs, prompts and button text in the game stay Nunito.

## Layout

A 4px rhythm (`s1` to `s7`), with two big steps (`s8` 72, `s9` 112) between website sections. Content max-width is 1240px with a 16 to 56px side gutter. The website holds to 390px wide with no sideways scrolling. Objects on the desk sit at small, deliberate tilts (0.5 to 3 degrees); controls inside a postcard never tilt.

## Elevation & Depth

Post lies on a desk, so depth is one soft shadow: `0 22px 44px rgb(0 0 0 / .4)` for postcards and the slip, and smaller drop-shadows for stamps and tags. Buttons are ink pads: a solid lip under the key, plus a soft blurred shadow on the desk.

## Shapes

- **Postcard**: 6px corners. The airmail edge appears only when the card carries a message.
- **Stamp**: a perforated edge, made from radial-gradient holes in the colour of whatever the stamp sits on (`.perf` with `--holes`; `D.stamp` in the game).
- **Postmark**: a double ring with optional wavy cancellation lines (`.postmark`, `D.postmark`).
- **Luggage tag**: notched corners and an eyelet, used for the download options.

## Components

### Buttons
`.btn` is a violet ink pad. It lifts 2px on hover and sinks 4px when pressed (120ms). `.btn.quiet` is paper with an ink outline. In the game, `D.button` follows the same pattern: paper by default, violet when selected, sinking when held, and dashed and flat when disabled.

### Cards / Containers
- **Postcard**: dialogue, choice questions, the title menu, rewards, chapter cards, puzzle results.
- **Letter**: ruled paper for lists you work through (the pause menu opens "Dear Sam," and ends with "P.S. <goal>"; the journal is a ruled notebook page).
- **Packing slip**: a table with a torn bottom edge, used for "what's in the box".

### Navigation
Text links on the desk, with an airmail-red underline on hover. The Night desk switch is a pill with a drawn sun or moon and `aria-pressed`.

### The postcard dam (signature component)
The website's centerpiece is Chapter 1's check dam on the back of a postcard. It is a 3×4 grid of buttons with roving focus: arrows move, 1 to 3 place cardboard, 0 clears. Rows push 1 to 4, the budget is 12 scraps, and nothing may float. Press Test and the water rises a row at a time. A leak names the row and the numbers. A hold stamps "Tested, Held" and flips the card to the real in-game screenshot. Results go to an `aria-live` region.

## Motion

One curve everywhere: `cubic-bezier(.23, 1, .32, 1)`. Durations are 120ms (press), 200ms (small changes) and 560ms (card flip and arrival). Big moments are physical, like the postmark pressing in and the card flipping. Cursor moves never animate. With Reduce motion on (the computer's setting, or the game's own setting), the press becomes an appearance, the flip becomes a cross-fade, and drift, bob and shake stop. State still changes.

## Do's and Don'ts

### Do:
- Put words on postcards, pictures on stamps, and a postmark on anything that is finished.
- Use real screenshots in stamps and say they are real.
- Give every empty, loading and error state its own sentence in the Kingdom's voice.

### Don't:
- Use the airmail edge as decoration on things that aren't messages.
- Add eyebrow labels above headings, or a grid of same-size feature cards.
- Use pure black, or colour without a token.
- Invent reviews, player counts or awards.
