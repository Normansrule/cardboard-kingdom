# How v2.14 "Thimble Row" was built

Every image is a capture from the real game while it was being built, in order. The design notes, test report and asset manifest for this round are in [docs/SLICE_v2.14.md](../../../SLICE_v2.14.md).

**This round:** a "festival neighborhood" vertical slice, built from Alek's inspiration atlas with a deliberately small reference stack:

- **Gameplay: Costume Quest.** Meet the residents, put a costume together from pieces they give you, and use it twice: in the field (it turns rusted valves) and in battle (Tighten Up).
- **Visual: Tinykin.** Tiny residents living in giant everyday objects, an island ringed by water, and a warm, lamplit interior.
- **Supporting: Okami.** The street is drained of colour until you fix it, then the colour blooms back out of the fountain and stays.

| The repair brings the colour back | Festival night |
|---|---|
| ![bloom](colour_bloom.gif) | ![festival](festival_walk.gif) |

---

## 1. Before

| | |
|---|---|
| ![](01_before_houses_at_character_scale.jpg) | ![](02_map_new_chapter.jpg) |
| Every neighborhood so far was built at character scale: houses about two heads taller than the people in them. | After Chapter 13, the fold-out map offers a new chapter. |

## 2. Blocking out Thimble Row (Tinykin scale)

| First pass | Scale pass |
|---|---|
| ![](03_first_pass_street.jpg) | ![](04_scale_pass_bigger_houses.jpg) |
| Houses made of giant objects (a teacup, a thread spool, a matchbox, a thimble) on an island ringed by water. They read as "cute props", not "you are tiny". | Every house is now drawn about a third bigger than its footprint, and the street spacing opened up to match. The residents are now crumb-sized next to their homes. |

![](05_the_teapot_overflowing.jpg)

The **Teapot**: the Row's water tower, a giant teapot on stilts, overflowing from its lid and spout. The overflow runs down the street in long puddles, and everything is grey.

## 3. The residents, and a costume made of their pieces

| | | |
|---|---|---|
| ![](06_meet_mrs_thimbleton.jpg) | ![](07_everybody_thought_somebody_else.jpg) | ![](08_bodkin_horn_piece.jpg) |
| **Mrs. Thimbleton** (a mouse seamstress, Teacup House) explains: the old Waterkeeper retired, and the Teapot has overfilled ever since. | "Everybody thought somebody else knew how." | **Bodkin** (hedgehog, spool shop) bends a paperclip into a wrench horn. |
| ![](09_pim_feelers_piece.jpg) | ![](10_sewing_the_costume.jpg) | |
| **Pim** (a robin kid who lives in the Boot) gives pink pipe-cleaner feelers. "Pink is the bravest colour." | Mrs. Thimbleton sews the **Spanner Beetle**: a sardine-tin shell, the horn, the feelers. | |

## 4. The costume matters in the field

| First pass | Final |
|---|---|
| ![](11_first_pass_party_grey_too.jpg) | ![](13_wheel_with_spanner_beetle.jpg) |
| The grey drained the party too, so the new costume was hard to read. | The party keeps its colour (they're the ones who bring it back). The prompt says **Turn the wheel!** only while you're wearing the Spanner Beetle. |

![](12_wheel_rusted_without_costume.jpg)

Without the costume: "The wheel is rusted solid." Corry: "We need more leverage. A great deal more leverage."

## 5. The encounter, and the costume in battle

| | | |
|---|---|---|
| ![](14_inside_old_whistle.jpg) | ![](15_battle_old_whistle.jpg) | ![](16_tighten_up.jpg) |
| Inside, a dented copper kettle is wedged on the overflow pipe, whistling. "It's the pressure whistle. It's been screaming for help all year." | **Old Whistle** and two Splashlings. The battle form is a big teal beetle with a spanner horn. | **Tighten Up**: a big wrench twist on one foe, and every leak sealed (dries the party, blocks the next 2 water attacks). |

## 6. The repair: three rooms of live valves (inside the Teapot)

Water moves the moment you turn a valve, so each rule is something you watch happen rather than read. Every failure shows itself where it happens (spray from a crack, a fountain overflowing), and turning the valve back fixes it.

**Room 1: open water goes where the pipes lead, and an open end sprays.**

| | | |
|---|---|---|
| ![](17_room1_shut.jpg) | ![](18_room1_spray.jpg) | ![](19_room1_fountain.jpg) |
| Everything shut; Old Whistle frowns. | Wrong valve: spray over the Teacup House. | Right valve: the fountain fills. |

**Room 2: outlets have a capacity.**

| | | |
|---|---|---|
| ![](20_room2_overflow.jpg) | ![](21_room2_leak.jpg) | ![](22_room2_fixed.jpg) |
| 3 cups a second, room for 1: the fountain overflows and the street floods anyway. | The leaky pipe takes water too, but onto the street. | Fountain plus harbor drain: 3 in, 3 out. |

**Room 3: put them together; water flows both ways through connected pipes.**

| First layout | Final layout |
|---|---|
| ![](23_room3_first_layout_tangled.jpg) | ![](24_room3_backflow_spray.jpg) |
| Valves overlapped and the garden was hidden under the message box. Worse, an exhaustive check of all 64 valve combinations showed the drain connected the two routes, so water could sneak backwards to the crack in a way the layout didn't show. | Hand-placed pipe routes. The backflow is now the point of the room: the garden route connects to the drain, so the crack sprays unless its own valve is shut. |
| ![](25_room3_tuppences_notes.jpg) | ![](26_room3_fixed.jpg) |
| Stuck? **Tuppence's notes** (H) explain the room. | 4 in: fountain 1, drain 2, rain garden 1. |

Leaving mid-way keeps your room; there's a **Shut all** reset, and any order of valve turns works.

## 7. A place that improves (and you can see it)

| | | |
|---|---|---|
| ![](27_bloom_before.jpg) | ![](28_bloom_1.jpg) | ![](29_bloom_2.jpg) |
| Coming out of the Teapot: still grey. | The colour blooms out of the fountain in a widening ring, with paper petals at its edge... | ...over the stalls, the lanterns, the houses... |
| ![](30_bloom_3.jpg) | ![](31_bloom_done.jpg) | |
| | The puddles are gone, the fountain runs, the festival stalls are up. It stays this way. | |

## 8. Festival night

| | | |
|---|---|---|
| ![](32_festival_night.jpg) | ![](33_rule_twelve.jpg) | ![](34_festival_street_night.jpg) |
| The Thimble Row Festival happens after all, and the Spanner Beetle leads the costume parade. | **Rule Twelve: start with your own street.** | Lanterns lit down the street. |

![](35_treat_or_treat.jpg)

On festival night every door gives a treat (scraps and a juice box), once each.
